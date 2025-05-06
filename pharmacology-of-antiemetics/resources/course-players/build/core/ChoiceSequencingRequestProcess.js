//****************************************************************************************************************
//Choice Sequencing Request Process [SB.2.9]
//For a target activity; may return a delivery request; may change the Current Activity; may return an exception code

//Reference:
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Available Children AM.1.1
//Check Activity Process UP.5
//Choice Activity Traversal Subprocess SB.2.4
//Current Activity AM.1.2
//End Attempt Process UP.4
//Flow Subprocess SB.2.3
//Sequencing Control Mode Choice SM.1
//Sequencing Control Choice Exit SM.1
//Sequencing Rules Check Process UP.2
//Terminate Descendent Attempts Process UP.3
//adlseq:constrainedChoice SCORM SN
//adlseq:preventActivation SCORM SN
//Choice Flow Subprocess SB.2.9.1

function Sequencer_ChoiceSequencingRequestProcess(targetActivity, callingLog) {

    var parentActivity = null;
    var activityPath;
    var sequencingRulesCheckResult = null;
    var commonAncestor = null;
    var currentActivity = null;
    var traversalDirection = null;
    var choiceActivityTraversalResult;

    var i;
    var returnValue;

    if (targetActivity === null) {

        returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-1", IntegrationImplementation.GetString("Your selection is not permitted.  Please select an available menu item to continue."), false);
        return returnValue;
    }

    activityPath = this.GetActivityPath(targetActivity, true);

    for (i = (activityPath.length - 1); i >= 0; i--) {

        if (activityPath[i].IsTheRoot() == false) {

            if (activityPath[i].IsAvailable === false) {

                returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-2", "The activity " + targetActivity.GetTitle() + " should not be available and is not a valid selection", true);
                return returnValue;

            }
        }

        sequencingRulesCheckResult = this.SequencingRulesCheckProcess(activityPath[i], RULE_SET_HIDE_FROM_CHOICE);

        if (sequencingRulesCheckResult !== null) {

            returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-3", "The activity " + targetActivity.GetTitle() + " should be hidden and is not a valid selection", true);
            return returnValue;
        }
    }

    if (!targetActivity.IsTheRoot()) {

        parentActivity = this.Activities.GetParentActivity(targetActivity);

        if (parentActivity.GetSequencingControlChoice() === false) {

            returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-4", IntegrationImplementation.GetString("The activity '{0}' should be hidden and is not a valid selection.", parentActivity.GetTitle()), false);
            return returnValue;
        }
    }

    if (this.IsCurrentActivityDefined()) {

        currentActivity = this.GetCurrentActivity();
        commonAncestor = this.FindCommonAncestor(currentActivity, targetActivity);
    } else {

        commonAncestor = this.GetRootActivity();
    }

    if (currentActivity !== null && currentActivity.LearningObject.ItemIdentifier == targetActivity.LearningObject.ItemIdentifier) { //not moving
    } else if (this.AreActivitiesSiblings(currentActivity, targetActivity)) { //going across

        var activityList = parentActivity.GetActivityListBetweenChildren(currentActivity, targetActivity, false);

        if (activityList.length === 0) {

            returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-5", IntegrationImplementation.GetString("Nothing to open"), false);
            return returnValue;
        }

        //we know the activities are siblings, so their ordinal will tell us which comes first
        if (targetActivity.Ordinal > currentActivity.Ordinal) {

            traversalDirection = FLOW_DIRECTION_FORWARD;

        } else {

            traversalDirection = FLOW_DIRECTION_BACKWARD;

            //reverse the array for the next step
            activityList.reverse();
        }

        for (i = 0; i < activityList.length; i++) {

            choiceActivityTraversalResult = this.ChoiceActivityTraversalSubprocess(activityList[i], traversalDirection);

            if (choiceActivityTraversalResult.Reachable === false) {

                returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, choiceActivityTraversalResult.Exception, "", false);
                return returnValue;
            }
        }

    } else if (currentActivity === null || currentActivity.LearningObject.ItemIdentifier == commonAncestor.LearningObject.ItemIdentifier) { //going down

        activityPath = this.GetPathToAncestorInclusive(targetActivity, commonAncestor);

        if (activityPath.length === 0) {

            returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-5", IntegrationImplementation.GetString("Nothing to open"), false);
            return returnValue;
        }

        for (i = activityPath.length - 1; i >= 0; i--) { //traverse backwards to achieve the proper order

            choiceActivityTraversalResult = this.ChoiceActivityTraversalSubprocess(activityPath[i], FLOW_DIRECTION_FORWARD);

            if (choiceActivityTraversalResult.Reachable === false) {

                returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, choiceActivityTraversalResult.Exception, choiceActivityTraversalResult.ExceptionText, false);
                return returnValue;
            }

            if (activityPath[i].IsActive() === false &&
                activityPath[i].LearningObject.ItemIdentifier != commonAncestor.LearningObject.ItemIdentifier &&
                activityPath[i].GetPreventActivation() === true) {

                returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, PREVENT_ACTIVATION_ERROR, IntegrationImplementation.GetString("You cannot select '{0}' at this time.  Please select another menu item to continue with '{0}.'", activityPath[i].GetTitle()), false);
                return returnValue;
            }
        }

    } else if (targetActivity.LearningObject.ItemIdentifier == commonAncestor.LearningObject.ItemIdentifier) { //going up

        activityPath = this.GetPathToAncestorInclusive(currentActivity, commonAncestor);

        if (activityPath.length === 0) {
            returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-5", IntegrationImplementation.GetString("Nothing to deliver"), false);
            return returnValue;
        }

        for (i = 0; i < activityPath.length; i++) {
            if (i != (activityPath.length - 1)) {

                if (activityPath[i].GetSequencingControlChoiceExit() === false) {
                    returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, CONTROL_CHOICE_EXIT_ERROR_CHOICE, IntegrationImplementation.GetString("Your selection is not permitted.  Please select 'Next' or 'Previous' to move through '{0}'.", activityPath[i]), false);
                    return returnValue;
                }
            }
        }

    } else { //jumping to a cousin (we don't need to evaluate a condition here - the condition is "is target a descendent activity of the common ancestor...well of course it is, otherwise the common ancestor, wouldn't be common to the current and target activities)

        //MR - 11/5/06 - changed to not include the current activity. Control Choice Exit and Constrain Choice only apply to clusters
        //(or actually the parent, if you are on an activity, you can leave it) - needed for Test Case CM-07d, need to be able to jump from activity 13 to activity 15
        //MR - 11/5/06 - also changed to exclude the common ancestor. We are not leaving that activity so we don't need to evaluate constrained choice and control choice exit

        activityPath = this.GetPathToAncestorExclusive(currentActivity, commonAncestor, false);

        //MR - 11/5/06 - had to remove this condition because empty paths are valid when you exclude the current activity and common ancestor
        /*
         if (activityPath.length === 0){
             returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-5", IntegrationImplementation.GetString("Nothing to deliver"), false);
             return returnValue;
        }
        */

        var constrainedActivity = null;

        for (i = 0; i < activityPath.length; i++) {

            if (i != (activityPath.length - 1)) {
                if (activityPath[i].GetSequencingControlChoiceExit() === false) {
                    returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, CONTROL_CHOICE_EXIT_ERROR_CHOICE, IntegrationImplementation.GetString("You are not allowed to jump out of {0}.", activityPath[i].GetTitle()), false);
                    return returnValue;
                }
            }

            if (constrainedActivity === null) {
                if (activityPath[i].GetConstrainedChoice() === true) {
                    constrainedActivity = activityPath[i];
                }
            }
        }

        if (constrainedActivity !== null) {

            if (this.IsActivity1BeforeActivity2(constrainedActivity, targetActivity)) {

                traversalDirection = FLOW_DIRECTION_FORWARD;
            } else {
                traversalDirection = FLOW_DIRECTION_BACKWARD;
            }

            var choiceFlowSubProcessResult = this.ChoiceFlowSubprocess(constrainedActivity, traversalDirection);

            var activityToConsider = choiceFlowSubProcessResult;

            if ((!activityToConsider.IsActivityAnAvailableDescendent(targetActivity)) &&
                (targetActivity != constrainedActivity &&
                    targetActivity != activityToConsider)) {
                returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, CONSTRAINED_CHOICE_ERROR, IntegrationImplementation.GetString("You are not allowed to jump out of {0}.", constrainedActivity.GetTitle()), false);
                return returnValue;
            }
        }

        //MR - changed on 2/25/05 to start from the parent of the target activity instead of the targetactivity
        //MR - changed back on 10/26/06 - change was incorrect. need to put back for 3rd Edition
        //MR - changed back again on 10/30/06 to pass Test Suite CM-07e. On Activity 1, Activity 4 should be enabled
        //MR - changed back again on 11/5/06 to pass Test Suite CM-07d. On Activity 3, Activity 12 should be disabled

        //MR 11/5/06 - If you include the actual activity, and it has a stop forward traversal on it, then the  Choice Activity Traversal Subprocess fails because the
        //Sequencing Rules Check Process prevents you from moving to that activity, but
        //If you don't include the actual activity, then the prevent activation clause does not get evaluated
        //Solution - don't run the ChoiceActivityTraversalSubprocess on the target activity

        //activityPath = this.GetPathToAncestorInclusive(this.Activities.GetParentActivity(targetActivity), commonAncestor); //--needed for CM-07e
        activityPath = this.GetPathToAncestorInclusive(targetActivity, commonAncestor);

        if (activityPath.length === 0) {

            returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-5", IntegrationImplementation.GetString("Nothing to open"), false);
            return returnValue;
        }

        if (this.IsActivity1BeforeActivity2(currentActivity, targetActivity)) {

            for (i = (activityPath.length - 1); i >= 0; i--) {

                //MR 11/5/06 - don't evaluate the ChoiceActivityTraversalSubprocess (Stop Forward Treversal) on the target activity
                if (i > 0) {

                    choiceActivityTraversalResult = this.ChoiceActivityTraversalSubprocess(activityPath[i], FLOW_DIRECTION_FORWARD);

                    if (choiceActivityTraversalResult.Reachable === false) {
                        returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, choiceActivityTraversalResult.Exception, choiceActivityTraversalResult.ExceptionText, false);

                        return returnValue;
                    }

                }

                //MR - changed on 2/25/05 - calls to IsActive and GetPreventActivation now work (they were missing parens before)

                if (
                    (activityPath[i].IsActive() === false) &&
                    (activityPath[i] != commonAncestor) &&
                    (activityPath[i].GetPreventActivation() === true)) {
                    returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, PREVENT_ACTIVATION_ERROR, IntegrationImplementation.GetString("You cannot select '{0}' at this time.  Please select another menu item to continue with '{0}.'", activityPath[i].GetTitle()), false);
                    return returnValue;
                }
            }
        } else {

            for (i = (activityPath.length - 1); i >= 0; i--) {

                //MR - changed on 2/25/05 - calls to IsActive and GetPreventActivation now work (they were missing parens before)

                if (
                    (activityPath[i].IsActive() === false) &&
                    (activityPath[i] != commonAncestor) &&
                    (activityPath[i].GetPreventActivation() === true)) {
                    returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, PREVENT_ACTIVATION_ERROR, IntegrationImplementation.GetString("You cannot select '{0}' at this time.  Please select another menu item to continue with '{0}.'", activityPath[i].GetTitle()), false);
                    return returnValue;
                }
            }
        }

    }

    if (targetActivity.IsALeaf() === true) {

        returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(targetActivity, null, "", false);
        return returnValue;
    }

    var flowSubprocessResult = this.FlowSubprocess(targetActivity, FLOW_DIRECTION_FORWARD, true);

    //if (flowSubprocessResult === null){
    if (flowSubprocessResult.Deliverable === false) {

        //we don't want to make these modifications while performing the look-ahead operations as they could affect the look-ahead operations that are still coming
        if (this.LookAhead === false) {

            this.TerminateDescendentAttemptsProcess(commonAncestor);

            this.EndAttemptProcess(commonAncestor, false);

            this.SetCurrentActivity(targetActivity);

        }

        returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(null, "SB.2.9-9", IntegrationImplementation.GetString("Please select another item from the menu."), false);
        return returnValue;
    } else {

        returnValue = new Sequencer_ChoiceSequencingRequestProcessResult(flowSubprocessResult.IdentifiedActivity, null, "", false);
        return returnValue;
    }
}

function Sequencer_ChoiceSequencingRequestProcessResult(deliveryRequest, exception, exceptionText, hidden) {

    this.DeliveryRequest = deliveryRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.Hidden = hidden;

}

Sequencer_ChoiceSequencingRequestProcessResult.prototype.toString = function() {
    return "DeliveryRequest=" + this.DeliveryRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", Hidden=" + this.Hidden;
};
