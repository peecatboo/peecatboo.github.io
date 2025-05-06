//****************************************************************************************************************

//Activity Progress Rollup Process [RB.1.3]

//    For an activity; may change the Attempt Information for the activity

//    Reference:
//Attempt Completion Status TM.1.2.2;
//Attempt Progress Status TM.1.2.2;
//Rollup Rule Check Subprocess RB.1.4; Rollup Action SM.5

function Sequencer_ActivityProgressRollupProcess(activity, callingLog) {

    var subprocessResult;

    subprocessResult = this.RollupRuleCheckSubprocess(activity, RULE_SET_INCOMPLETE );

    if (subprocessResult === true) {

        activity.SetAttemptProgressStatus(true);

        activity.SetAttemptCompletionStatus(false);
    }

    subprocessResult = this.RollupRuleCheckSubprocess(activity, RULE_SET_COMPLETED );

    if (subprocessResult === true) {

        activity.SetAttemptProgressStatus(true);

        activity.SetAttemptCompletionStatus(true);
    }

    if (Sequencer_GetApplicableSetofRollupRules(activity, RULE_SET_INCOMPLETE).length === 0 &&
        Sequencer_GetApplicableSetofRollupRules(activity, RULE_SET_COMPLETED).length === 0) {

        //NOT IN PSEUDO CODE

        this.ActivityProgressRollupProcessUsingDefault(activity );

    }

    return;

}

function Sequencer_ActivityProgressRollupProcessUsingDefault(activity, callingLog) {

    var completed;
    var attempted;
    var incomplete;

    if (activity.IsALeaf()) {
        return;
    }

    //todo - should this only be available children?
    var applicableChildren = activity.GetChildren();

    var allIncomplete = true;

    var allCompleted = true;

    var isEmptySet = true;

    for (var i = 0; i < applicableChildren.length; i++) {

        if (applicableChildren[i].IsTracked()) {

            completed = applicableChildren[i].IsCompleted();

            attempted = applicableChildren[i].IsAttempted();

            incomplete = (completed === false || attempted === true);

            if (this.CheckChildForRollupSubprocess(applicableChildren[i], ROLLUP_RULE_ACTION_COMPLETED )) {

                allCompleted = (allCompleted && (completed === true));
                isEmptySet = false;
            }

            if (this.CheckChildForRollupSubprocess(applicableChildren[i], ROLLUP_RULE_ACTION_INCOMPLETE )) {

                allIncomplete = (allIncomplete && incomplete);
                isEmptySet = false;
            }

        }
    }

    if (isEmptySet && Control.Package.Properties.RollupEmptySetToUnknown) {

        // Leave unknown, we don't have to explicitly set anything.
    } else {

        if (allIncomplete === true) {

            activity.SetAttemptProgressStatus(true);

            activity.SetAttemptCompletionStatus(false);
        }

        if (allCompleted === true) {

            activity.SetAttemptProgressStatus(true);

            activity.SetAttemptCompletionStatus(true);
        }
    }

}
