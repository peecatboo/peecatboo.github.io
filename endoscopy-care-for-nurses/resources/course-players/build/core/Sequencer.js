/* SCORM 2004 3rd Edition Compatible Sequencer */

var TERMINATION_REQUEST_EXIT = "EXIT";
var TERMINATION_REQUEST_EXIT_ALL = "EXIT ALL";
var TERMINATION_REQUEST_SUSPEND_ALL = "SUSPEND ALL";
var TERMINATION_REQUEST_ABANDON = "ABANDON";
var TERMINATION_REQUEST_ABANDON_ALL = "ABANDON ALL";
var TERMINATION_REQUEST_EXIT_PARENT = "EXIT PARENT";
var TERMINATION_REQUEST_NOT_VALID = "INVALID";

var SEQUENCING_REQUEST_START = "START";
var SEQUENCING_REQUEST_RESUME_ALL = "RESUME ALL";
var SEQUENCING_REQUEST_CONTINUE = "CONTINUE";
var SEQUENCING_REQUEST_PREVIOUS = "PREVIOUS";
var SEQUENCING_REQUEST_CHOICE = "CHOICE";
var SEQUENCING_REQUEST_RETRY = "RETRY";
var SEQUENCING_REQUEST_EXIT = "EXIT";
var SEQUENCING_REQUEST_NOT_VALID = "INVALID";

var RULE_SET_POST_CONDITION = "POST_CONDITION";
var RULE_SET_EXIT = "EXIT";
var RULE_SET_HIDE_FROM_CHOICE = "HIDE_FROM_CHOICE";
var RULE_SET_STOP_FORWARD_TRAVERSAL = "STOP_FORWARD_TRAVERSAL";
var RULE_SET_DISABLED = "DISABLED";
var RULE_SET_SKIPPED = "SKIPPED";

var RULE_SET_SATISFIED = "SATISFIED";
var RULE_SET_NOT_SATISFIED = "NOT_SATISFIED";
var RULE_SET_COMPLETED = "COMPLETED";
var RULE_SET_INCOMPLETE = "INCOMPLETE";

var SEQUENCING_RULE_ACTION_SKIP = "Skip";
var SEQUENCING_RULE_ACTION_DISABLED = "Disabled";
var SEQUENCING_RULE_ACTION_HIDDEN_FROM_CHOICE = "Hidden From Choice";
var SEQUENCING_RULE_ACTION_STOP_FORWARD_TRAVERSAL = "Stop Forward Traversal";
var SEQUENCING_RULE_ACTION_EXIT = "Exit";
var SEQUENCING_RULE_ACTION_EXIT_PARENT = "Exit Parent";
var SEQUENCING_RULE_ACTION_EXIT_ALL = "Exit All";
var SEQUENCING_RULE_ACTION_RETRY = "Retry";
var SEQUENCING_RULE_ACTION_RETRY_ALL = "Retry All";
var SEQUENCING_RULE_ACTION_CONTINUE = "Continue";
var SEQUENCING_RULE_ACTION_PREVIOUS = "Previous";

var FLOW_DIRECTION_FORWARD = "FORWARD";
var FLOW_DIRECTION_BACKWARD = "BACKWARD";

var RULE_CONDITION_OPERATOR_NOT = "Not";

var RULE_CONDITION_COMBINATION_ALL = "All";
var RULE_CONDITION_COMBINATION_ANY = "Any";

var RESULT_UNKNOWN = "unknown";

var SEQUENCING_RULE_CONDITION_SATISFIED = "Satisfied";
var SEQUENCING_RULE_CONDITION_OBJECTIVE_STATUS_KNOWN = "Objective Status Known";
var SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_KNOWN = "Objective Measure Known";
var SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_GREATER_THAN = "Objective Measure Greater Than";
var SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_LESS_THAN = "Objective Measure Less Than";
var SEQUENCING_RULE_CONDITION_COMPLETED = "Completed";
var SEQUENCING_RULE_CONDITION_ACTIVITY_PROGRESS_KNOWN = "Activity Progress Known";
var SEQUENCING_RULE_CONDITION_ATTEMPTED = "Attempted";
var SEQUENCING_RULE_CONDITION_ATTEMPT_LIMIT_EXCEEDED = "Attempt Limit Exceeded";
var SEQUENCING_RULE_CONDITION_ALWAYS = "Always";

var ROLLUP_RULE_ACTION_SATISFIED = "Satisfied";
var ROLLUP_RULE_ACTION_NOT_SATISFIED = "Not Satisfied";
var ROLLUP_RULE_ACTION_COMPLETED = "Completed";
var ROLLUP_RULE_ACTION_INCOMPLETE = "Incomplete";

var CHILD_ACTIVITY_SET_ALL = "All";
var CHILD_ACTIVITY_SET_ANY = "Any";
var CHILD_ACTIVITY_SET_NONE = "None";
var CHILD_ACTIVITY_SET_AT_LEAST_COUNT = "At Least Count";
var CHILD_ACTIVITY_SET_AT_LEAST_PERCENT = "At Least Percent";

var ROLLUP_RULE_CONDITION_SATISFIED = "Satisfied";
var ROLLUP_RULE_CONDITION_OBJECTIVE_STATUS_KNOWN = "Objective Status Known";
var ROLLUP_RULE_CONDITION_OBJECTIVE_MEASURE_KNOWN = "Objective Measure Known";
var ROLLUP_RULE_CONDITION_COMPLETED = "Completed";
var ROLLUP_RULE_CONDITION_ACTIVITY_PROGRESS_KNOWN = "Activity Progress Known";
var ROLLUP_RULE_CONDITION_ATTEMPTED = "Attempted";
var ROLLUP_RULE_CONDITION_ATTEMPT_LIMIT_EXCEEDED = "Attempt Limit Exceeded";
var ROLLUP_RULE_CONDITION_NEVER = "Never";

var ROLLUP_CONSIDERATION_ALWAYS = "Always";
var ROLLUP_CONSIDERATION_IF_NOT_SUSPENDED = "If Not Suspended";
var ROLLUP_CONSIDERATION_IF_ATTEMPTED = "If Attempted";
var ROLLUP_CONSIDERATION_IF_NOT_SKIPPED = "If Not Skipped";

var TIMING_NEVER = "Never";
var TIMING_ONCE = "Once";
var TIMING_ON_EACH_NEW_ATTEMPT = "On Each New Attempt";

//ERROR Conditions under which ADL requires invalid choices to be hidden rather than merely disabled
var CONTROL_CHOICE_EXIT_ERROR_NAV = "NB.2.1-8";
var CONTROL_CHOICE_EXIT_ERROR_CHOICE = "SB.2.9-7";
var PREVENT_ACTIVATION_ERROR = "SB.2.9-6";
var CONSTRAINED_CHOICE_ERROR = "SB.2.9-8";



(function(){
    Sequencer = function(lookAhead, activities){

    this.LookAhead = lookAhead;
    this.Activities = activities;

    this.NavigationRequest = null;
    this.ChoiceTargetIdentifier = null;

    this.SuspendedActivity = null;
    this.CurrentActivity = null;

    this.Exception = null;
    this.ExceptionText = null;

    this.GlobalObjectives = new Array();

    this.ReturnToLmsInvoked = false;
}

//functions required by the Controller
Sequencer.prototype.OverallSequencingProcess = Sequencer_OverallSequencingProcess;
Sequencer.prototype.SetSuspendedActivity = Sequencer_SetSuspendedActivity;
Sequencer.prototype.GetSuspendedActivity = Sequencer_GetSuspendedActivity;
Sequencer.prototype.Start = Sequencer_Start;
Sequencer.prototype.InitialRandomizationAndSelection = Sequencer_InitialRandomizationAndSelection;
Sequencer.prototype.GetCurrentActivity = Sequencer_GetCurrentActivity;
Sequencer.prototype.GetExceptionText = Sequencer_GetExceptionText;
Sequencer.prototype.GetExitAction = Sequencer_GetExitAction;
Sequencer.prototype.EvaluatePossibleNavigationRequests = Sequencer_EvaluatePossibleNavigationRequests;
Sequencer.prototype.InitializePossibleNavigationRequestAbsolutes = Sequencer_InitializePossibleNavigationRequestAbsolutes;
Sequencer.prototype.SetAllDescendentsToDisabled = Sequencer_SetAllDescendentsToDisabled;
Sequencer.prototype.ContentDeliveryEnvironmentActivityDataSubProcess = Sequencer_ContentDeliveryEnvironmentActivityDataSubProcess;

function Sequencer_SetSuspendedActivity(activity){
    this.SuspendedActivity = activity;
}

function Sequencer_GetSuspendedActivity(){
    return this.SuspendActivity;
}

function Sequencer_GetSuspendedActivity(){
    var suspendedActivity = this.SuspendedActivity;

    return suspendedActivity;
}

function Sequencer_Start(){

    if (this.SuspendedActivity === null){

        this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_START, null, "");
    }
    else{
        this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_RESUME_ALL, null, "");
    }

    this.OverallSequencingProcess();
}

function Sequencer_InitialRandomizationAndSelection(isRestored){

    if (!isRestored){
        for (var activity in this.Activities.ActivityList){
            if (!this.Activities.ActivityList.hasOwnProperty(activity)) {
                continue;
            }
            this.SelectChildrenProcess(this.Activities.ActivityList[activity]);
            this.RandomizeChildrenProcess(this.Activities.ActivityList[activity], false);
        }
    }
}


function Sequencer_GetCurrentActivity(){
    return this.CurrentActivity;
}

function Sequencer_GetExceptionText(){
    if (this.ExceptionText !== null && this.ExceptionText !== undefined){
        return this.ExceptionText;
    }
    else{
        return "";
    }
}

function Sequencer_GetExitAction(activity, logEntry){

    return EXIT_ACTION_DISPLAY_MESSAGE;
}



//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//functions private to this sequencer
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

//Core Sequencing Functions
//Sequencer.prototype.OverallSequencingProcess = Sequencer_OverallSequencingProcess;    //set above since required by controller
Sequencer.prototype.NavigationRequestProcess = Sequencer_NavigationRequestProcess;
Sequencer.prototype.SequencingExitActionRulesSubprocess = Sequencer_SequencingExitActionRulesSubprocess;
Sequencer.prototype.SequencingPostConditionRulesSubprocess = Sequencer_SequencingPostConditionRulesSubprocess;
Sequencer.prototype.TerminationRequestProcess = Sequencer_TerminationRequestProcess;
Sequencer.prototype.MeasureRollupProcess = Sequencer_MeasureRollupProcess;
Sequencer.prototype.ObjectiveRollupProcess = Sequencer_ObjectiveRollupProcess;
Sequencer.prototype.ObjectiveRollupUsingDefaultProcess = Sequencer_ObjectiveRollupUsingDefaultProcess;
Sequencer.prototype.ObjectiveRollupUsingMeasureProcess = Sequencer_ObjectiveRollupUsingMeasureProcess;
Sequencer.prototype.ObjectiveRollupUsingRulesProcess = Sequencer_ObjectiveRollupUsingRulesProcess;
Sequencer.prototype.ActivityProgressRollupProcess = Sequencer_ActivityProgressRollupProcess;
Sequencer.prototype.ActivityProgressRollupProcessUsingDefault = Sequencer_ActivityProgressRollupProcessUsingDefault;
Sequencer.prototype.RollupRuleCheckSubprocess = Sequencer_RollupRuleCheckSubprocess;
Sequencer.prototype.EvaluateRollupConditionsSubprocess = Sequencer_EvaluateRollupConditionsSubprocess;
Sequencer.prototype.CheckChildForRollupSubprocess = Sequencer_CheckChildForRollupSubprocess;
Sequencer.prototype.OverallRollupProcess = Sequencer_OverallRollupProcess;
Sequencer.prototype.SelectChildrenProcess = Sequencer_SelectChildrenProcess;
Sequencer.prototype.RandomizeChildrenProcess = Sequencer_RandomizeChildrenProcess;
Sequencer.prototype.FlowTreeTraversalSubprocess = Sequencer_FlowTreeTraversalSubprocess;
Sequencer.prototype.FlowActivityTraversalSubprocess = Sequencer_FlowActivityTraversalSubprocess;
Sequencer.prototype.FlowSubprocess = Sequencer_FlowSubprocess;
Sequencer.prototype.ChoiceActivityTraversalSubprocess = Sequencer_ChoiceActivityTraversalSubprocess;
Sequencer.prototype.StartSequencingRequestProcess = Sequencer_StartSequencingRequestProcess;
Sequencer.prototype.ResumeAllSequencingRequestProcess = Sequencer_ResumeAllSequencingRequestProcess;
Sequencer.prototype.ContinueSequencingRequestProcess = Sequencer_ContinueSequencingRequestProcess;
Sequencer.prototype.PreviousSequencingRequestProcess = Sequencer_PreviousSequencingRequestProcess;
Sequencer.prototype.ChoiceSequencingRequestProcess = Sequencer_ChoiceSequencingRequestProcess;
Sequencer.prototype.ChoiceFlowSubprocess = Sequencer_ChoiceFlowSubprocess;
Sequencer.prototype.ChoiceFlowTreeTraversalSubprocess = Sequencer_ChoiceFlowTreeTraversalSubprocess;
Sequencer.prototype.RetrySequencingRequestProcess = Sequencer_RetrySequencingRequestProcess;
Sequencer.prototype.ExitSequencingRequestProcess = Sequencer_ExitSequencingRequestProcess;
Sequencer.prototype.SequencingRequestProcess = Sequencer_SequencingRequestProcess;
Sequencer.prototype.DeliveryRequestProcess = Sequencer_DeliveryRequestProcess;
Sequencer.prototype.ContentDeliveryEnvironmentProcess = Sequencer_ContentDeliveryEnvironmentProcess;
Sequencer.prototype.ClearSuspendedActivitySubprocess = Sequencer_ClearSuspendedActivitySubprocess;
Sequencer.prototype.LimitConditionsCheckProcess = Sequencer_LimitConditionsCheckProcess;
Sequencer.prototype.SequencingRulesCheckProcess = Sequencer_SequencingRulesCheckProcess;
Sequencer.prototype.SequencingRulesCheckSubprocess = Sequencer_SequencingRulesCheckSubprocess;
Sequencer.prototype.TerminateDescendentAttemptsProcess = Sequencer_TerminateDescendentAttemptsProcess;
Sequencer.prototype.EndAttemptProcess = Sequencer_EndAttemptProcess;
Sequencer.prototype.CheckActivityProcess = Sequencer_CheckActivityProcess;
Sequencer.prototype.EvaluateSequencingRuleCondition = Sequencer_EvaluateSequencingRuleCondition;

//internal functions
Sequencer.prototype.ResetException = Sequencer_ResetException;

Sequencer.prototype.LogSeq = Sequencer_LogSeq;
Sequencer.prototype.LogSeqAudit = Sequencer_LogSeqAudit;
Sequencer.prototype.LogSeqReturn = Sequencer_LogSeqReturn;
Sequencer.prototype.WriteHistoryLog = Sequencer_WriteHistoryLog;
Sequencer.prototype.WriteHistoryReturnValue = Sequencer_WriteHistoryReturnValue;

Sequencer.prototype.SetCurrentActivity = Sequencer_SetCurrentActivity;
Sequencer.prototype.IsCurrentActivityDefined = Sequencer_IsCurrentActivityDefined;


Sequencer.prototype.IsSuspendedActivityDefined = Sequencer_IsSuspendedActivityDefined;
Sequencer.prototype.ClearSuspendedActivity = Sequencer_ClearSuspendedActivity;

Sequencer.prototype.GetRootActivity = Sequencer_GetRootActivity;

Sequencer.prototype.DoesActivityExist = Sequencer_DoesActivityExist;

Sequencer.prototype.GetActivityFromIdentifier = Sequencer_GetActivityFromIdentifier;
Sequencer.prototype.AreActivitiesSiblings = Sequencer_AreActivitiesSiblings;
Sequencer.prototype.FindCommonAncestor = Sequencer_FindCommonAncestor;

Sequencer.prototype.GetActivityPath = Sequencer_GetActivityPath;
Sequencer.prototype.GetPathToAncestorExclusive = Sequencer_GetPathToAncestorExclusive;
Sequencer.prototype.GetPathToAncestorInclusive = Sequencer_GetPathToAncestorInclusive;

Sequencer.prototype.ActivityHasSuspendedChildren = Sequencer_ActivityHasSuspendedChildren;
Sequencer.prototype.CourseIsSingleSco = Sequencer_CourseIsSingleSco;

Sequencer.prototype.TranslateSequencingRuleActionIntoSequencingRequest = Sequencer_TranslateSequencingRuleActionIntoSequencingRequest;
Sequencer.prototype.TranslateSequencingRuleActionIntoTerminationRequest = Sequencer_TranslateSequencingRuleActionIntoTerminationRequest;

Sequencer.prototype.IsActivity1BeforeActivity2 = Sequencer_IsActivity1BeforeActivity2;
Sequencer.prototype.GetOrderedListOfActivities = Sequencer_GetOrderedListOfActivities;
Sequencer.prototype.PreOrderTraversal = Sequencer_PreOrderTraversal;
Sequencer.prototype.IsActivityLastOverall = Sequencer_IsActivityLastOverall;

Sequencer.prototype.GetGlobalObjectiveByIdentifier = Sequencer_GetGlobalObjectiveByIdentifier;
Sequencer.prototype.AddGlobalObjective = Sequencer_AddGlobalObjective;
Sequencer.prototype.ResetGlobalObjectives = Sequencer_ResetGlobalObjectives;
Sequencer.prototype.FindActivitiesAffectedByWriteMaps = Sequencer_FindActivitiesAffectedByWriteMaps;
Sequencer.prototype.FindDistinctParentsOfActivitySet = Sequencer_FindDistinctParentsOfActivitySet;
Sequencer.prototype.FindDistinctAncestorsOfActivitySet = Sequencer_FindDistinctAncestorsOfActivitySet;
Sequencer.prototype.GetMinimalSubsetOfActivitiesToRollup = Sequencer_GetMinimalSubsetOfActivitiesToRollup;

Sequencer.prototype.CheckForRelevantSequencingRules = Sequencer_CheckForRelevantSequencingRules;
Sequencer.prototype.DoesThisActivityHaveSequencingRulesRelevantToChoice = Sequencer_DoesThisActivityHaveSequencingRulesRelevantToChoice;

function Sequencer_ResetException(){
    this.Exception = null;
    this.ExceptionText = null;
}


function Sequencer_LogSeq(str, logEntry){
    // str = str + "";

    // if (this.LookAhead === true){
     // }
    // else{
     // }
}

function Sequencer_LogSeqAudit(str, logEntry){
    // str = str + "";

    // if (this.LookAhead === true){
     // }
    // else{
     // }
}

function Sequencer_LogSeqReturn(str, logEntry){

    // if (logEntry === null || logEntry === undefined){
     // }

    // str = str + "";

    // if (this.LookAhead === true){
    //     return logEntry.setReturn(str);
    // }
    // else{
    //     return logEntry.setReturn(str);
    // }
}

function Sequencer_WriteHistoryLog(str, atts){
    // HistoryLog.WriteEventDetailed(str, atts);
}

function Sequencer_WriteHistoryReturnValue(str, atts){
    // HistoryLog.WriteEventDetailedReturnValue(str, atts);
}

function Sequencer_SetCurrentActivity(activity){
    this.CurrentActivity = activity;
}

function Sequencer_IsCurrentActivityDefined(){
    var currentActivity = this.GetCurrentActivity();
    var currentActivityExists = (currentActivity !== null);

    return currentActivityExists;
}





function Sequencer_IsSuspendedActivityDefined(){
    var suspendedActivity = this.GetSuspendedActivity();
    var suspendedActivityExists = (suspendedActivity !== null);

    return suspendedActivityExists;
}

function Sequencer_ClearSuspendedActivity(){
    this.SuspendedActivity = null;
}


function Sequencer_GetRootActivity(){

    var rootActivity = this.Activities.GetRootActivity();


    return rootActivity;
}

function Sequencer_DoesActivityExist(identifier){

    var exists = this.Activities.DoesActivityExist(identifier);

    return exists;

}

function Sequencer_GetActivityFromIdentifier(identifier){

    var activity = this.Activities.GetActivityFromIdentifier(identifier);

    return activity;

}

function Sequencer_AreActivitiesSiblings(activity1, activity2){

    //needs to be able to accept null arguments
    if (activity1 === null || activity1 === undefined || activity2 === null || activity2 === undefined){
        return false;
    }

    var parent1 = activity1.ParentActivity;
    var parent2 = activity2.ParentActivity;
    var siblings = (parent1 == parent2);

    return siblings;
}

function Sequencer_FindCommonAncestor(activity1, activity2){

    var aryActivity1Parents = new Array();
    var aryActivity2Parents = new Array();

    //MR 12/7/05 Changed to account for one of the activities being the root
    if (activity1 !== null && activity1.IsTheRoot()){

        return activity1;
    }

    if (activity2 !== null && activity2.IsTheRoot()){

        return activity2;
    }

    //MR 5-21-05 changed GetActivityPath to not include the actual activity

    if (activity1 !== null){
        aryActivity1Parents = this.Activities.GetActivityPath(activity1, false);
    }

    if (activity2 !== null){
        aryActivity2Parents = this.Activities.GetActivityPath(activity2, false);
    }

    for (var i=0; i < aryActivity1Parents.length; i++){

        for (var j=0; j < aryActivity2Parents.length; j++){
            if (aryActivity1Parents[i] == aryActivity2Parents[j]){


                return aryActivity1Parents[i];
            }
        }
    }


    return null;
}

function Sequencer_GetActivityPath(activity, includeActivity){
    return this.Activities.GetActivityPath(activity, includeActivity);
}

//TODO: improvement - should we consolidate the PathToAncestorExlusive/Inclusive functions into one function?

//NOTE: inclusive and exclusive refers to the Ancestor, the includeActivity parameter refers to the current activity

function Sequencer_GetPathToAncestorExclusive(activity, ancestorActivity, includeActivity){

    var aryParentActivities = new Array();
    var index = 0;

    if (activity !== null && ancestorActivity !== null && activity !== ancestorActivity){

        if (includeActivity === true){
            aryParentActivities[index] = activity;
            index++;
        }

        while (activity.ParentActivity !== null && activity.ParentActivity !== ancestorActivity){

            activity = activity.ParentActivity;

            aryParentActivities[index] = activity;

            index++;
        }
    }

    return aryParentActivities;
}

function Sequencer_GetPathToAncestorInclusive(activity, ancestorActivity, includeActivity){

    var aryParentActivities = new Array();
    var index = 0;

    if (includeActivity == null || includeActivity == undefined){
        includeActivity === true;
    }


    aryParentActivities[index] = activity;
    index++;

    //MR - 5/21/05 - changed from activity == ancestorActivity to activity != ancestorActivity

    while (activity.ParentActivity !== null && activity != ancestorActivity){

        activity = activity.ParentActivity;

        aryParentActivities[index] = activity;

        index++;
    }

    if (includeActivity === false){
        aryParentActivities.splice(0,1);
    }

    return aryParentActivities;
}

function Sequencer_ActivityHasSuspendedChildren(activity){

    var children = activity.GetChildren();
    var hasSuspended = false;

    for (var i=0; i < children.length; i++){
        if (children[i].IsSuspended()){
            hasSuspended = true;
        }
    }

    return hasSuspended;
}

function Sequencer_CourseIsSingleSco(){
    // if (this.Activities.ActivityList.length <= 2){
    //     return true;
    // }
    // else{
    //     return false;
    // }
    return this.Activities.ActivityList.length <= 2;
}

function Sequencer_TranslateSequencingRuleActionIntoSequencingRequest(ruleAction){

    switch (ruleAction){

        case SEQUENCING_RULE_ACTION_RETRY:
            return SEQUENCING_REQUEST_RETRY;
        //break;

        case SEQUENCING_RULE_ACTION_CONTINUE:
            return SEQUENCING_REQUEST_CONTINUE;
        //break;

        case SEQUENCING_RULE_ACTION_PREVIOUS:
            return SEQUENCING_REQUEST_PREVIOUS;
        //break;

        default:
             return null;
        //break;
    }

}

function Sequencer_TranslateSequencingRuleActionIntoTerminationRequest(ruleAction){

    switch (ruleAction){

        case SEQUENCING_RULE_ACTION_EXIT_PARENT:
            return TERMINATION_REQUEST_EXIT_PARENT;
        //break;

        case SEQUENCING_RULE_ACTION_EXIT_ALL:
            return TERMINATION_REQUEST_EXIT_ALL;
        //break;

        default:
             return null;
        //break;
    }
}

function Sequencer_IsActivity1BeforeActivity2(activity1, activity2){

    var orderedListOfActivities = this.GetOrderedListOfActivities();

    for (var i=0; i < orderedListOfActivities.length; i++){

        if (orderedListOfActivities[i] == activity1){

            return true;
        }

        if (orderedListOfActivities[i] == activity2){

            return false;
        }
    }

     return null;
}

function Sequencer_GetOrderedListOfActivities(){

    var list;
    var root = this.GetRootActivity();

    list = this.PreOrderTraversal(root);

    return list;

}

function Sequencer_PreOrderTraversal(activity){

    //distinct from the sorted list in ActivityRepository which uses all children rather than just available children

    var list = new Array();
    list[0] = activity;

    var children = activity.GetAvailableChildren();
    var nextActivities;

    for (var i=0; i < children.length; i++){
        nextActivities = this.PreOrderTraversal(children[i]);
        list = list.concat(nextActivities);
    }

    return list;
}

function Sequencer_IsActivityLastOverall(activity){

    var orderedListOfActivities = this.GetOrderedListOfActivities();
    var lastAvailableActivity = null;

    for (var i = (orderedListOfActivities.length - 1); i >= 0; i--){
        if (orderedListOfActivities[i].IsAvailable()){
            lastAvailableActivity = orderedListOfActivities[i];
            i = -1;    //break the loop
        }
    }

    if (activity == lastAvailableActivity){

        return true;
    }


    return false;
}

//TODO - improvement - make this more efficient by changing the GlobalObjectives array to an associative array so we can perform the lookup quicker
function Sequencer_GetGlobalObjectiveByIdentifier(identifier){

    for(var obj in this.GlobalObjectives){
        if (!this.GlobalObjectives.hasOwnProperty(obj)) {
            continue;
        }

        if (this.GlobalObjectives[obj].ID == identifier){
            return this.GlobalObjectives[obj];
        }
    }

    return null;
}

function Sequencer_AddGlobalObjective(ID, ObjectiveProgressStatus, SatisfiedStatus, MeasureStatus, NormalizedMeasure){

    var newIndex = this.GlobalObjectives.length;

    var obj = new GlobalObjective(newIndex, ID, ObjectiveProgressStatus, SatisfiedStatus, MeasureStatus, NormalizedMeasure);

    this.GlobalObjectives[newIndex] = obj;
    this.GlobalObjectives[newIndex].SetDirtyData();
}


function Sequencer_ResetGlobalObjectives(){

    var global;
    for (var obj in this.GlobalObjectives){
        if (!this.GlobalObjectives.hasOwnProperty(obj)) {
            continue;
        }
        global = this.GlobalObjectives[obj];
        global.ResetState();
    }
}


function Sequencer_FindActivitiesAffectedByWriteMaps(activity){

    var aryWriteMapTargets = new Array();
    var objMaps;
    var objectives = activity.GetObjectives();

    var affectedActivities = new Array();

    var i;
    var j;

    //find the identifiers of all the objectives this activity writes to
    for (i=0; i < objectives.length; i++){
        objMaps = objectives[i].GetMaps();

        for (j=0; j < objMaps.length; j++){
            if (objMaps[j].WriteSatisfiedStatus === true || objMaps[j].WriteNormalizedMeasure === true){
                aryWriteMapTargets[aryWriteMapTargets.length] = objMaps[j].TargetObjectiveId;
            }
        }
    }

    //if there aren't any write maps, then don't bother searching for targets
    if (aryWriteMapTargets.length === 0){
        return affectedActivities;
    }

    //now find all the activities that read these objectives
    var contentObject;
    var contentObjectObjectives;
    var contentObjectObjectiveMaps;
    var readTarget;

    //search every activity in this course (except the original activity)
    for (var activityToCheck in this.Activities.ActivityList){
        if (!this.Activities.ActivityList.hasOwnProperty(activityToCheck)) {
            continue;
        }

        contentObject = this.Activities.ActivityList[activityToCheck];

        if (contentObject != activity){

            contentObjectObjectives = contentObject.GetObjectives();

            //search each objective in the activity
            for (var objective=0; objective < contentObjectObjectives.length; objective++){

                contentObjectObjectiveMaps = contentObjectObjectives[objective].GetMaps();

                //search all of the objective's objective maps
                for (var map=0; map < contentObjectObjectiveMaps.length; map++){

                    //see if this map reads from a target that is in the list of targets that are written to

                    if (contentObjectObjectiveMaps[map].ReadSatisfiedStatus === true || contentObjectObjectiveMaps[map].ReadNormalizedMeasure === true){
                        readTarget = contentObjectObjectiveMaps[map].TargetObjectiveId;

                        for (var target=0; target < aryWriteMapTargets.length; target++){
                            if (aryWriteMapTargets[target] == readTarget){
                                affectedActivities[affectedActivities.length] = contentObject;
                            }
                        }

                    }
                }
            }
        }
    }

    return affectedActivities;
}

function Sequencer_FindDistinctAncestorsOfActivitySet(activityArray){

      var distinctAncestors = new Array();

      for (var activityIndex=0; activityIndex<activityArray.length; activityIndex++){
            var nextActivity = activityArray[activityIndex];

            if (nextActivity !== null) {
                var activityPath = this.GetActivityPath(nextActivity, true)

                for (var i=0; i < activityPath.length; i++) {

                    var isDistinct = true;
                    for (var j=0; j < distinctAncestors.length; j++) {
                            if (activityPath[i] == distinctAncestors[j]) {
                                isDistinct = false;
                                break;
                            }
                    }
                    if (isDistinct) {
                            distinctAncestors[distinctAncestors.length] = activityPath[i];
                    }
                }
            }
      }

      return distinctAncestors;
}


function Sequencer_FindDistinctParentsOfActivitySet(activityArray){

    var distinctParents = new Array();
    var parent;
    var isDistinct;

    for (var activityIndex in activityArray){
        if (!activityArray.hasOwnProperty(activityIndex)) {
            continue;
        }

        isDistinct = true;

        parent = this.Activities.GetParentActivity(activityArray[activityIndex]);

        if (parent !== null){
            for (var i=0; i < distinctParents.length; i++){
                if (distinctParents[i] == parent){
                    isDistinct = false;
                    break;
                }
            }

            if (isDistinct){
                distinctParents[distinctParents.length] = parent;
            }
        }
    }

    return distinctParents;
}

function Sequencer_GetMinimalSubsetOfActivitiesToRollup(activityArray, alreadyRolledUpActivities){
    /*
    When calling rollup on an activity, all of its parents get rolled up as well.
    So, if we're going to call rollup on a number of activities, we want to make sure
    that one activity isn't a parent of another since this would be redundent.

    alreadyRolledUpActivities allows us to exclude activties that were just recently rolled up
    and that can also be excluded
    */

    //TODO: really test this...make sure it is correct and returns the absolute minimal set (what happens if the order of the activities is such that a parent comes before a child)

    var activitiesThatAreIncluded = new Array();
    var minimalSubset = new Array();

    var parentActivities;
    var currentActivity;
    var alreadyIncluded;

    if (alreadyRolledUpActivities !== null){
        activitiesThatAreIncluded = activitiesThatAreIncluded.concat(alreadyRolledUpActivities);
    }

    for (var activityIndex in activityArray){
        if (!activityArray.hasOwnProperty(activityIndex)) {
            continue;
        }

        currentActivity = activityArray[activityIndex];

        //check to see if this activity is already in the rollup set
        alreadyIncluded = false;
        for (var includedIndex in activitiesThatAreIncluded){
            if (!activitiesThatAreIncluded.hasOwnProperty(includedIndex)) {
                continue;
            }

            if (activitiesThatAreIncluded[includedIndex] == currentActivity){
                alreadyIncluded = true;
                break;
            }
        }

        if (alreadyIncluded === false){
            minimalSubset[minimalSubset.length] = currentActivity;

            parentActivities = this.GetActivityPath(currentActivity, true);
            activitiesThatAreIncluded = activitiesThatAreIncluded.concat(parentActivities);
        }
    }

    return minimalSubset;
}


//TODO: if we have a case there a global objective being satisfied hides a selection from choice, then as soon as the sco that writes that objective
//is entered, the hidden from choice evaluates to true....is this funny? do we need to deal with it?

function Sequencer_EvaluatePossibleNavigationRequests(aryPossibleRequests){




    //for each possible navigation request
        //run the Navigation Request Process
        //set Allowed for the request = the result of the Navigation Request Process

    var navigationRequestResult;
    var terminationRequestResult = null;
    var sequencingRequestResult;
    var deliveryRequestResult;
    var id;


    //clear out the initial state
    for (id in aryPossibleRequests){
        if (!aryPossibleRequests.hasOwnProperty(id)) {
            continue;
        }

        if (aryPossibleRequests[id].WillAlwaysSucceed === true){
            aryPossibleRequests[id].WillSucceed = true;
        }
        else if (aryPossibleRequests[id].WillNeverSucceed === true){
            aryPossibleRequests[id].WillSucceed = false;
            aryPossibleRequests[id].Exception = "NB.2.1-10";
            aryPossibleRequests[id].ExceptionText = IntegrationImplementation.GetString("Your selection is not permitted. Please select 'Next' or 'Previous' to move through '{0}.'");
        }
        else {
            aryPossibleRequests[id].WillSucceed = null;
        }

        aryPossibleRequests[id].Hidden = false;        //reset the hidden state
        aryPossibleRequests[id].Disabled = false;        //reset the disabled state
    }


    for (id in aryPossibleRequests){
        if (!aryPossibleRequests.hasOwnProperty(id)) {
            continue;
        }

        if (aryPossibleRequests[id].WillSucceed === null){

            navigationRequestResult = this.NavigationRequestProcess(aryPossibleRequests[id].NavigationRequest, aryPossibleRequests[id].TargetActivityItemIdentifier);

            if (navigationRequestResult.NavigationRequest == NAVIGATION_REQUEST_NOT_VALID){


                aryPossibleRequests[id].WillSucceed = false;

                //still set the target activity because down below we will evaulate unsuccessful requests further to see if they should be hidden or disabled (MR 07/09/09)
                aryPossibleRequests[id].TargetActivity = this.GetActivityFromIdentifier(aryPossibleRequests[id].TargetActivityItemIdentifier);

                aryPossibleRequests[id].Exception = navigationRequestResult.Exception;
                aryPossibleRequests[id].ExceptionText = navigationRequestResult.ExceptionText;
            }
            else{


                aryPossibleRequests[id].WillSucceed = true;
                aryPossibleRequests[id].TargetActivity = navigationRequestResult.TargetActivity;
                aryPossibleRequests[id].SequencingRequest = navigationRequestResult.SequencingRequest;

                aryPossibleRequests[id].Exception = "";
                aryPossibleRequests[id].ExceptionText = "";

            }
        }
    }

    //if there is a current activity, set the termination request to Exit and run the Termination Request Process (note this won't catch
    //some error conditions with suspend all / exit all request (since those require differnet termination request), but i don't think these
    //are a concern at the moment, besides, we should probably handle them gracefully by just exiting the player)



    var currentActivity = this.GetCurrentActivity();

    if (currentActivity !== null && currentActivity.IsActive() === true){


        terminationRequestResult = this.TerminationRequestProcess(TERMINATION_REQUEST_EXIT);


        if (terminationRequestResult.TerminationRequest == TERMINATION_REQUEST_NOT_VALID){



            if (aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed){
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed = false;
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].Exception = terminationRequestResult.Exception;
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].ExceptionText = terminationRequestResult.ExceptionText;
            }

            if (aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].WillSucceed){
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].WillSucceed = false;
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].Exception = terminationRequestResult.Exception;
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].ExceptionText = terminationRequestResult.ExceptionText;
            }

            if (aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT].WillSucceed){
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT].WillSucceed = false;
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT].Exception = terminationRequestResult.Exception;
                aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT].ExceptionText = terminationRequestResult.ExceptionText;
            }


            for (id=POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE; id < aryPossibleRequests.length; id++){
                if (aryPossibleRequests[id].WillSucceed){
                    aryPossibleRequests[id].WillSucceed = false;
                    aryPossibleRequests[id].Exception = terminationRequestResult.Exception;
                    aryPossibleRequests[id].ExceptionText = terminatonRequestResult.ExceptionText;
                }
                else{
                    aryPossibleRequests[id].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;
                }
            }
        }

        aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;
        aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;
        aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;

        for (id=POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE; id < aryPossibleRequests.length; id++){
            aryPossibleRequests[id].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;
        }
    }

    /*
    -These processes affect the global activity state in a way that causes the evaluations below to fail, so don't run them before


    if (aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL].WillSucceed){


        terminationRequestResult = this.TerminationRequestProcess(TERMINATION_REQUEST_SUSPEND_ALL);

        if (terminationRequestResult.TerminationRequest == TERMINATION_REQUEST_NOT_VALID){
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL].WillSucceed = false;
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL].Exception = terminationRequestResult.Exception;
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL].ExceptionText = terminationRequestResult.ExceptionText;
        }
        else{
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;
        }
    }

    if (aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL].WillSucceed){


        terminationRequestResult = this.TerminationRequestProcess(POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL);

        if (terminationRequestResult.TerminationRequest == TERMINATION_REQUEST_NOT_VALID){
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL].WillSucceed = false;
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL].Exception = terminationRequestResult.Exception;
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL].ExceptionText = terminationRequestResult.ExceptionText;
        }
        else{
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL].TerminationSequencingRequest = terminationRequestResult.SequencingRequest;
        }
    }
    */



    //Explictly check for disabled and limit condition rules on all choice requests. If an activity is disabled or has its attempt limit exceeded, all of its children
    //are not valid for choice. Normally this is done in the DeliveryRequestProcess, but we need to do it earlier to account for the situation where
    //a termination request changes the sequencing request. For example, if after selecting activity A, the termination request returns a retry, then
    //we still want to check activity A's disabled status so we can grey it out. i.e., even if making a request will succeed, that doesn't mean that
    //we should allow the request in the first place.

    /*
    var activitiesThatWillSucceed = new Array();
    for (id in aryPossibleRequests){
        if (!aryPossibleRequests.hasOwnProperty(id)) {
            continue;
        }
        if (id >= POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE &&
            aryPossibleRequests[id].WillSucceed === true &&
            aryPossibleRequests[id].WillAlwaysSucceed === false &&
            aryPossibleRequests[id].WillNeverSucceed === false){

            activitiesThatWillSucceed[activitiesThatWillSucceed.length] = aryPossibleRequests[id].TargetActivity;
        }
    }
    var activitySet = this.FindDistinctAncestorsOfActivitySet(activitiesThatWillSucceed);

    //alert("a");
    // Run CheckActivityProcess on each of these ancestors and set decendents to disabled if activity ancestor is disabled
    for (var i=0; i<activitySet.length; i++) {
        var activityIsNotAllowed = this.CheckActivityProcess(activitySet[i]);
        if (activityIsNotAllowed === true){


            var navRequestForActivity = null;
            for (var j=0; j<aryPossibleRequests.length; j++){
                if (aryPossibleRequests[j].TargetActivityItemIdentifier == activitySet[i].GetItemIdentifier()) {
                    navRequestForActivity = aryPossibleRequests[j];
                    break;
                }
            }

            if (navRequestForActivity !== null) {
                if (this.LookAhead == true)
                    //alert("disabling " + activitySet[i].StringIdentifier + " and children");
                navRequestForActivity.WillSucceed = false;
                navRequestForActivity.Disabled = true;

                this.SetAllDescendentsToDisabled(aryPossibleRequests, activitySet[i]);
            }
        }
    }
    */

    for (id in aryPossibleRequests){
        if (!aryPossibleRequests.hasOwnProperty(id)) {
            continue;
        }
        if (id >= POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE &&
            aryPossibleRequests[id].WillSucceed === true &&
            aryPossibleRequests[id].WillAlwaysSucceed === false &&
            aryPossibleRequests[id].WillNeverSucceed === false){


                var activityIsNotAllowed = this.CheckActivityProcess(aryPossibleRequests[id].TargetActivity);

                if (activityIsNotAllowed === true){


                    aryPossibleRequests[id].WillSucceed = false;
                    aryPossibleRequests[id].Disabled = true;

                    this.SetAllDescendentsToDisabled(aryPossibleRequests, aryPossibleRequests[id].TargetActivity);
                }
        }
    }



    //TODO - (parameter for this functionality) if the termination request process returns a sequencing request,
    //disable all possible navigation requests that aren't equivilant to the sequencing request (only allow navigations
    //that are consistent with what the post conditions will allow)


    var terminationSequencingRequestResult = null;
    for (id in aryPossibleRequests){
        if (!aryPossibleRequests.hasOwnProperty(id)) {
            continue;
        }

        if (aryPossibleRequests[id].WillSucceed === true && aryPossibleRequests[id].WillAlwaysSucceed === false && aryPossibleRequests[id].WillNeverSucceed === false){

            //if there is a sequencing request returned from the termination request process, then that is the sequencing request that needs to be
            //evaluated to determine if the original sequencing request will succeed



            if (aryPossibleRequests[id].TerminationSequencingRequest !== null){



                //in the case where the termination request returns a sequencing result, all the evaluations will be the same so we can just use the cached result
                if (terminationSequencingRequestResult === null){
                    sequencingRequestResult = this.SequencingRequestProcess(aryPossibleRequests[id].TerminationSequencingRequest, null);
                }
                else{
                    sequencingRequestResult = terminationSequencingRequestResult;
                }

                //in the case where we've altered the sequencing request, the preconditions for hidden from choice may not be evaluated
                //on all requests, make sure we still evaluate these
                if (id >= POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE){

                    var sequencingRulesCheckResult = this.SequencingRulesCheckProcess(aryPossibleRequests[id].TargetActivity, RULE_SET_HIDE_FROM_CHOICE);
                    if (sequencingRulesCheckResult !== null){
                        aryPossibleRequests[id].Exception = "SB.2.9-3";
                        aryPossibleRequests[id].ExceptionText = "The activity " + aryPossibleRequests[id].TargetActivity.GetTitle() + " should be hidden and is not a valid selection";
                        aryPossibleRequests[id].Hidden = true;
                    }
                }

            }
            else{


                sequencingRequestResult = this.SequencingRequestProcess(aryPossibleRequests[id].SequencingRequest, aryPossibleRequests[id].TargetActivity);
            }


            if (sequencingRequestResult.Exception !== null || sequencingRequestResult.EndSequencingSession){


                aryPossibleRequests[id].WillSucceed = false;

                aryPossibleRequests[id].Exception = sequencingRequestResult.Exception;
                aryPossibleRequests[id].ExceptionText = sequencingRequestResult.ExceptionText;
                aryPossibleRequests[id].Hidden = sequencingRequestResult.Hidden;
            }
            else if (sequencingRequestResult.DeliveryRequest !== null){
                //TODO - performance optimizatio - can we omit this call since we are evaluating it earler? probably.

                deliveryRequestResult = this.DeliveryRequestProcess(sequencingRequestResult.DeliveryRequest);
                // store possible next/previous request result
                if (id == POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE || id == POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS) {
                    if (aryPossibleRequests[id].WillSucceed && deliveryRequestResult.Valid) {
                        aryPossibleRequests[id].LookAheadResult = sequencingRequestResult.DeliveryRequest;
                    } else {
                        aryPossibleRequests[id].LookAheadResult = null;
                    }
                }


                aryPossibleRequests[id].WillSucceed = deliveryRequestResult.Valid;

            }
        }
    }


    //TODO: put package properties that control the evaluation of these elements that are potential obstcles to usability.
    //note, the API call to nav request valid technically is supposed to use a differnet set of rules (the actual look ahead evaluation) than the UI button
    //might need to change the call to IsContinueRequestValid to look at something else

    //certain sequencing exceptions require that the TOC navigation item be hidden by the new 3rd Edition GUI requirements

    var exceptionNumber;
    for (id in aryPossibleRequests){
        if (!aryPossibleRequests.hasOwnProperty(id)) {
            continue;
        }

        if (id >= POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE){
            if (aryPossibleRequests[id].WillSucceed === false){
                exceptionNumber = aryPossibleRequests[id].Exception;
                if (exceptionNumber == CONTROL_CHOICE_EXIT_ERROR_NAV ||
                    exceptionNumber == CONTROL_CHOICE_EXIT_ERROR_CHOICE ||
                    exceptionNumber == PREVENT_ACTIVATION_ERROR ||
                    exceptionNumber == CONSTRAINED_CHOICE_ERROR){



                    aryPossibleRequests[id].Hidden = true;
                }
            }
        }
    }

    //override the continue request to be in line with the new 3rd Edition GUI requirements that require it to always be enabled for a cluster with flow=true
    // disabled due to PI-131
    /*
    var parentActivity = this.Activities.GetParentActivity(currentActivity);
    if (parentActivity != null){
        if (parentActivity.GetSequencingControlFlow() === true){


            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed = true;
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].Exception = "";
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].ExceptionText = "";
        }
        else{

            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed = false;
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].Exception = "SB.2.2-1";
            aryPossibleRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].ExceptionText = "Parent activity does not allow flow traversal";
        }
    }*/



    return aryPossibleRequests;

}

function Sequencer_SetAllDescendentsToDisabled(aryPossibleRequests, parentActivity){

    for (var i=0; i < parentActivity.ChildActivities.length; i++){

        var possibleNavRequest = Control.FindPossibleChoiceRequestForActivity(parentActivity.ChildActivities[i]);

        possibleNavRequest.WillSucceed = false;
        possibleNavRequest.Disabled = true;

        this.SetAllDescendentsToDisabled(aryPossibleRequests, parentActivity.ChildActivities[i]);
    }
}

function Sequencer_SetAllDescendentsToDisabled(aryPossibleRequests, parentActivity){

    for (var i=0; i < parentActivity.ChildActivities.length; i++){

        var possibleNavRequest = Control.FindPossibleChoiceRequestForActivity(parentActivity.ChildActivities[i]);

        possibleNavRequest.WillSucceed = false;
        possibleNavRequest.Disabled = true;

        this.SetAllDescendentsToDisabled(aryPossibleRequests, parentActivity.ChildActivities[i]);
    }
}

function Sequencer_InitializePossibleNavigationRequestAbsolutes(aryPossibleRequests, activityTree, activityList){

    //go through the activity tree and populate the WillAlwaysSucceed and WillNeverSucceed values for all Choice requests
    //this will optimize the execution of the EvaluatePossibleNavigationRequests function which is a performance bottleneck in large courses
    //note, this optimization will only help courses that don't use complex choice sequencing rules

    //if sequencing control choice = false, set will never succeed to true for all children

    //There are a limited set of rules that can cause an activity to not be available for choice.
    //If none of these rules are available, then a choice request for an activity will always succeed.
    //Check for the presense of these rules by recursing down the tree, if an activity has no pertenent rules,
    //then it will always succeed.

    //The relevant rules that can prevent choice from succeeding are:
        //Hidden From Choice
        //Stop Forward Traversal
        //Forward Only
        //Prevent Activitation
        //Constrain Choice
        //Control Choice Exit

    /*
    Control Choice Exit needs to be handled seperately, the other rules are top down, they prevent a child from being selected
    Control Choice Exit operates bottom up, it prevents you from leaving an activity. Thus, if any activity has Control Choice Exit,
    Will Always Succeed can never be true, since when that activity is active, all other activities will be disabled.
    */



    this.CheckForRelevantSequencingRules(activityTree, false);

    var activity;
    var possibleNavRequest;
    var controlChoiceExitIsUsed = false;

    for (var identifier in activityList){
        if (!activityList.hasOwnProperty(identifier)) {
            continue;
        }

        activity = activityList[identifier];


        if (activity.GetSequencingControlChoice() === false){




            for (var i=0; i < activity.ChildActivities.length; i++){

                possibleNavRequest = Control.FindPossibleChoiceRequestForActivity(activity.ChildActivities[i]);
                possibleNavRequest.WillNeverSucceed = true;

            }

        }

        controlChoiceExitIsUsed = controlChoiceExitIsUsed || (activity.GetSequencingControlChoiceExit() === true);


        possibleNavRequest = Control.FindPossibleChoiceRequestForActivity(activity);

        //if flow is disabled, you can't choose a parent
        if (activity.IsDeliverable() === false && activity.GetSequencingControlFlow() === false){

            possibleNavRequest.WillNeverSucceed = true;
        }

        //if you can't flow to any children, a choice request will never succeed
        if (activity.HasChildActivitiesDeliverableViaFlow === false){

            possibleNavRequest.WillNeverSucceed = true;
        }

        if (activity.HasSeqRulesRelevantToChoice === false && possibleNavRequest.WillNeverSucceed === false){

            possibleNavRequest.WillAlwaysSucceed = true;
        }
        else{

            possibleNavRequest.WillAlwaysSucceed = false;
        }


    }

    if (controlChoiceExitIsUsed === true){

        for (var id in aryPossibleRequests){
            if (!aryPossibleRequests.hasOwnProperty(id)) {
                continue;
            }
            aryPossibleRequests[id].WillAlwaysSucceed = false;
        }
    }
}

function Sequencer_CheckForRelevantSequencingRules(activity, parentHasRelevantRules){

    if (parentHasRelevantRules === true){
        activity.HasSeqRulesRelevantToChoice = true;
    }
    else {
        if (this.DoesThisActivityHaveSequencingRulesRelevantToChoice(activity)){
            activity.HasSeqRulesRelevantToChoice = true;
        }
        else{
            activity.HasSeqRulesRelevantToChoice = false;
        }
    }

    var aChildHasChildActivitiesDeliverableViaFlow = false;

    for (var i=0; i < activity.ChildActivities.length; i++){

        this.CheckForRelevantSequencingRules(activity.ChildActivities[i], activity.HasSeqRulesRelevantToChoice);

        aChildHasChildActivitiesDeliverableViaFlow = (aChildHasChildActivitiesDeliverableViaFlow || activity.ChildActivities[i].HasChildActivitiesDeliverableViaFlow);
    }

    activity.HasChildActivitiesDeliverableViaFlow = (activity.IsDeliverable() ||
                                                     (activity.GetSequencingControlFlow() && aChildHasChildActivitiesDeliverableViaFlow)
                                                    );
}

function Sequencer_DoesThisActivityHaveSequencingRulesRelevantToChoice(activity){

    //Forward Only
    if (activity.GetSequencingControlForwardOnly() === true){
        return true;
    }

    //Prevent Activitation
    if (activity.GetPreventActivation() === true){
        return true;
    }

    //Constrain Choice
    if (activity.GetConstrainedChoice() === true){
        return true;
    }

    //Control Choice Exit
    if (activity.GetSequencingControlChoiceExit() === false){
        return true;
    }

    //Hidden From Choice
    //Stop Forward Traversal

    var preConditionRules = activity.GetPreConditionRules();

    for (var i=0; i < preConditionRules.length; i++){

        if (
            preConditionRules[i].Action == SEQUENCING_RULE_ACTION_DISABLED ||
            preConditionRules[i].Action == SEQUENCING_RULE_ACTION_HIDDEN_FROM_CHOICE ||
            preConditionRules[i].Action == SEQUENCING_RULE_ACTION_STOP_FORWARD_TRAVERSAL){
            return true;
        }

    }

    return false;
}
})();
