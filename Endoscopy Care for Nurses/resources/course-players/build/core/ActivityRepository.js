;
(function() {

    // constructor
    ActivityRepository = function() {
        this.ActivityList = new Array();
        this.ActivityTree = null;
        this.SortedActivityList = new Array(); //list of activities sorted in a pre-order traversal...the likely order for flow delivery
        this.ActivityListByIdentifier = new Array();
    }

    // prototype interface
    ActivityRepository.prototype.InitializeFromRegistration = ActivityRepository_InitializeFromRegistration;
    ActivityRepository.prototype.BuildActivity = ActivityRepository_BuildActivity;
    ActivityRepository.prototype.GetActivityByDatabaseId = ActivityRepository_GetActivityByDatabaseId;
    ActivityRepository.prototype.PreOrderTraversal = ActivityRepository_PreOrderTraversal;
    ActivityRepository.prototype.GetSortedIndexOfActivity = ActivityRepository_GetSortedIndexOfActivity;
    ActivityRepository.prototype.Clone = ActivityRepository_Clone;
    ActivityRepository.prototype.TearDown = ActivityRepository_TearDown;
    ActivityRepository.prototype.SetSequencer = ActivityRepository_SetSequencer;
    ActivityRepository.prototype.GetActivityPath = ActivityRepository_GetActivityPath;
    ActivityRepository.prototype.GetRootActivity = ActivityRepository_GetRootActivity;
    ActivityRepository.prototype.DoesActivityExist = ActivityRepository_DoesActivityExist;
    ActivityRepository.prototype.GetActivityFromIdentifier = ActivityRepository_GetActivityFromIdentifier;
    ActivityRepository.prototype.GetParentActivity = ActivityRepository_GetParentActivity;
    ActivityRepository.prototype.GetNumDeliverableActivities = ActivityRepository_GetNumDeliverableActivities;

    // prototype implementation
    function ActivityRepository_InitializeFromRegistration(registration, queryStringAdditions) {

        //Fully populate the activities by associating them with appropriate learning objects and establishing the
        //hierarchy based on the learning object hierarchy

        //The activity list is simply the list of all activityies from the registration
        this.ActivityList = registration.Activities;

        //Establish the Activity Tree by traversing down the learning object tree, finding and populating each associated activity
        this.ActivityTree = this.BuildActivity(registration, registration.Package.LearningObjects[0], null, 1);

        this.PreOrderTraversal(this.ActivityTree, this.SortedActivityList);

        //add in the querystring override parameters if necessary
        var globalAddition = queryStringAdditions[-1];
        var addition = "";
        for (var i = 0; i < this.ActivityList.length; i++) {

            addition = "";

            var specificAddition = queryStringAdditions[this.ActivityList[i].DatabaseId];

            if (specificAddition !== null && specificAddition !== undefined) {
                addition = specificAddition;
            } else if (globalAddition !== null && globalAddition !== undefined) {
                addition = globalAddition;
            }

            if (addition !== "") {
                this.ActivityList[i].LearningObject.Parameters = MergeQueryStringParameters(addition, this.ActivityList[i].LearningObject.Parameters);
            }

            this.ActivityListByIdentifier[this.ActivityList[i].GetItemIdentifier()] = this.ActivityList[i];
        }
    }


    function ActivityRepository_BuildActivity(registration, learningObject, parentActivity, ordinalFromParent) {

        var thisActivity = registration.FindActivityForThisScormObject(learningObject.DatabaseIdentifier);

        thisActivity.LearningObject = learningObject;

        thisActivity.ParentActivity = parentActivity;

        //an ordinal of 0 indicates that it is not initiated yet. so put it in the default order from the structure
        if (thisActivity.Ordinal == 0) {
            thisActivity.Ordinal = ordinalFromParent;
        }

        //initialize all of the static data for the activity objectives

        var staticActivitiyObjectiveDefinition;
        for (var activityObjective in thisActivity.ActivityObjectives) {
            if (!thisActivity.ActivityObjectives.hasOwnProperty(activityObjective)) {
                continue;
            }

            //get the static definition if it exists
            staticActivitiyObjectiveDefinition = null;
            for (var sequencingObjective in learningObject.SequencingData.Objectives) {
                if (!learningObject.SequencingData.Objectives.hasOwnProperty(sequencingObjective)) {
                    continue;
                }

                if (learningObject.SequencingData.Objectives[sequencingObjective].Id == thisActivity.ActivityObjectives[activityObjective].Identifier) {
                    staticActivitiyObjectiveDefinition = learningObject.SequencingData.Objectives[sequencingObjective];
                    break;
                }
            }

            if (staticActivitiyObjectiveDefinition === null) {

                if (learningObject.SequencingData.PrimaryObjective !== null &&
                    learningObject.SequencingData.PrimaryObjective.Id == thisActivity.ActivityObjectives[activityObjective].Identifier) {

                    staticActivitiyObjectiveDefinition = learningObject.SequencingData.PrimaryObjective;
                }
            }

            //transfer the static data to the object
            if (staticActivitiyObjectiveDefinition !== null) {

                thisActivity.ActivityObjectives[activityObjective].SatisfiedByMeasure = staticActivitiyObjectiveDefinition.SatisfiedByMeasure;
                thisActivity.ActivityObjectives[activityObjective].MinNormalizedMeasure = staticActivitiyObjectiveDefinition.MinNormalizedMeasure;
                thisActivity.ActivityObjectives[activityObjective].Maps = staticActivitiyObjectiveDefinition.Maps;
            }

            //create a runtime objective for this identifier if needed

            identifier = thisActivity.ActivityObjectives[activityObjective].GetIdentifier();

            //if there is an identifier, then the runtime needs access to its latest state

            if (thisActivity.RunTime !== null &&
                identifier !== null &&
                identifier !== undefined &&
                identifier.length > 0) {

                runTimeObjective = thisActivity.RunTime.FindObjectiveWithId(identifier);

                if (runTimeObjective === null) {
                    thisActivity.RunTime.AddObjective();
                    runTimeObjective = thisActivity.RunTime.Objectives[thisActivity.RunTime.Objectives.length - 1];
                    runTimeObjective.Identifier = identifier;
                }

            }

        }

        for (var i = 0; i < learningObject.Children.length; i++) {
            thisActivity.ChildActivities[i] = this.BuildActivity(registration, learningObject.Children[i], thisActivity, (i + 1));
        }

        thisActivity.StringIdentifier = thisActivity.toString();

        return thisActivity;
    }

    function ActivityRepository_GetActivityByDatabaseId(databaseId) {

        if (databaseId === null) {
            return null;
        } else {
            for (var i = 0; i < this.ActivityList.length; i++) {
                if (this.ActivityList[i].DatabaseId == databaseId) {
                    return this.ActivityList[i];
                }
            }
        }

        return null;
    }

    function ActivityRepository_PreOrderTraversal(activity, activityArray) {

        activityArray[activityArray.length] = activity;

        for (var i = 0; i < activity.ChildActivities.length; i++) {
            this.PreOrderTraversal(activity.ChildActivities[i], activityArray);
        }
    }


    function ActivityRepository_GetSortedIndexOfActivity(activity) {
        var result = 0;
        for (var i = 0; i < this.SortedActivityList.length; i++) {
            if (this.SortedActivityList[i].IsALeaf() && this.SortedActivityList[i].IsAvailable()) {
                result++;
            }
            if (this.SortedActivityList[i] == activity) {
                return result;
            }
        }


        return null;
    }

    function ActivityRepository_Clone() {

        var repository = new ActivityRepository();
        var clonedActivity;
        var originalActivity;
        var activityIndex;

        //make a copy of all the activities
        for (activityIndex = 0; activityIndex < this.ActivityList.length; activityIndex++) {

            clonedActivity = this.ActivityList[activityIndex].Clone();
            repository.ActivityList[activityIndex] = clonedActivity;
            repository.ActivityListByIdentifier[clonedActivity.GetItemIdentifier()] = clonedActivity;

            if (this.ActivityList[activityIndex].ParentActivity === null) {
                repository.ActivityTree = repository.ActivityList[activityIndex];
            }
        }

        //now that we have copies, set the pointers to the parents and children
        for (activityIndex = 0; activityIndex < this.ActivityList.length; activityIndex++) {

            originalActivity = this.ActivityList[activityIndex];
            clonedActivity = repository.ActivityList[activityIndex];

            if (originalActivity.ParentActivity === null) {
                clonedActivity.ParentActivity = null;
            } else {
                clonedActivity.ParentActivity = repository.GetActivityFromIdentifier(originalActivity.ParentActivity.GetItemIdentifier());
            }

            for (var childActivity in originalActivity.ChildActivities) {
                if (!originalActivity.ChildActivities.hasOwnProperty(childActivity)) {
                    continue;
                }

                clonedActivity.ChildActivities[childActivity] = repository.GetActivityFromIdentifier(originalActivity.ChildActivities[childActivity].GetItemIdentifier());
            }

            clonedActivity.AvailableChildren = new Array();
            for (var availableChildActivity in originalActivity.AvailableChildren) {
                if (!originalActivity.AvailableChildren.hasOwnProperty(availableChildActivity)) {
                    continue;
                }

                clonedActivity.AvailableChildren[availableChildActivity] = repository.GetActivityFromIdentifier(originalActivity.AvailableChildren[availableChildActivity].GetItemIdentifier());
            }
        }

        repository.PreOrderTraversal(repository.ActivityTree, repository.SortedActivityList);

        return repository;
    }

    function ActivityRepository_TearDown() {

        //clear out all the references in the activities, especially to the sequencer to avoid memory leaks associated with circular references in JavaScript

        for (var activityIndex in this.ActivityList) {
            if (!this.ActivityList.hasOwnProperty(activityIndex)) {
                continue;
            }

            this.ActivityList[activityIndex].TearDown();
            this.ActivityList[activityIndex] = null;
        }

        this.ActivityList = null;
        this.ActivityTree = null;
        this.SortedActivityList = null;
    }

    function ActivityRepository_SetSequencer(sequencer, isLookAhead) {

        for (var activity in this.ActivityList) {
            if (!this.ActivityList.hasOwnProperty(activity)) {
                continue;
            }

            this.ActivityList[activity].SetSequencer(sequencer, isLookAhead);
        }
    }

    function ActivityRepository_GetActivityPath(activity, includeActivity) {

        var aryParentActivities = new Array();
        var index = 0;

        if (includeActivity) {
            aryParentActivities[index] = activity;
            index++;
        }

        while (activity.ParentActivity !== null) {

            activity = activity.ParentActivity;

            aryParentActivities[index] = activity;

            index++;
        }

        return aryParentActivities;
    }


    function ActivityRepository_GetRootActivity() {
        // @TODO optimization, can we just return this.ActivityTree?
        var rootActivity = null;

        for (var i = 0; i < this.SortedActivityList.length; i++) {
            if (this.SortedActivityList[i].ParentActivity === null) {
                rootActivity = this.SortedActivityList[i];
                break;
            }
        }

        return rootActivity;
    }

    function ActivityRepository_DoesActivityExist(identifier) {

        /* eliminated for performance improvement 6-21-05 - MR
    for (var i=0; i < this.ActivityList.length; i++){
        if (this.ActivityList[i].GetItemIdentifier() == identifier){
            return true;
        }
    }
    */

        if (this.ActivityListByIdentifier[identifier] !== null && this.ActivityListByIdentifier[identifier] !== undefined) {
            return true;
        }

        return false;
    }

    function ActivityRepository_GetActivityFromIdentifier(identifier) {

        /* eliminated for performance improvement 6-21-05 - MR
    for (var i=0; i < this.ActivityList.length; i++){
        if (this.ActivityList[i].GetItemIdentifier() == identifier){
            return this.ActivityList[i];
        }
    }
    */
        if (this.ActivityListByIdentifier[identifier] !== null && this.ActivityListByIdentifier[identifier] !== undefined) {
            return this.ActivityListByIdentifier[identifier];
        }

        //MR 6/12/06 - Can't assert an error here because there is a valid case for not finding an activity during a
        //SCO's call to adl.nav.request

        return null;
    }

    function ActivityRepository_GetParentActivity(activity) {
        var parentActivity = null;
        if (activity !== null) {
            parentActivity = activity.ParentActivity;
        }
        return parentActivity;
    }

    function ActivityRepository_GetNumDeliverableActivities() {
        var numDeliverable = 0;

        for (var i = 0; i < this.ActivityList.length; i++) {
            if (this.ActivityList[i].IsDeliverable()) {
                numDeliverable++;
            }
        }

        return numDeliverable;
    }

})();
