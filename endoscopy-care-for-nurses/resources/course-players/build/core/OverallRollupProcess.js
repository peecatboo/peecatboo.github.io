//****************************************************************************************************************
//Overall Rollup Process [RB.1.5]

//    For an activity; may change the tracking information for the activity and its ancestors

//    Reference:
//Activity Progress Rollup Process RB.1.3
//Measure Rollup Process RB.1.1
//Objective Rollup Process RB.1.2
//Tracked SM.11; Tracking Model TM

function Sequencer_OverallRollupProcess(activity, callingLog) {

    var aryParentActivities = this.GetActivityPath(activity, true);

    if (aryParentActivities.length === 0) {
        return;
    }

    //optimization - once we've encountered an activity that doesn't change its status at all, we can stop rolling up to parents, see S&N spec section 4.6.1

    var primaryObjective;
    var priorMeasureStatus;
    var priorNormalizedMeasure;
    var priorObjectiveProgressStatus;
    var priorObjectiveSatisfiedStatus;
    var priorAttemptProgressStatus;
    var priorAttemptCompletionStatus;

    var newMeasureStatus;
    var newNormalizedMeasure;
    var newObjectiveProgressStatus;
    var newObjectiveSatisfiedStatus;
    var newAttemptProgressStatus;
    var newAttemptCompletionStatus;

    var aryRolledUpActivities = new Array();

    // We skip other rollups when the statii stop changing
    var onlyDurationRollup = false;

    for (var i = 0; i < aryParentActivities.length; i++) {

        if (!aryParentActivities[i].IsALeaf()) {
            aryParentActivities[i].RollupDurations();
        }

        if (onlyDurationRollup) {
            continue;
        }

        //save the status prior to rollup
        primaryObjective = aryParentActivities[i].GetPrimaryObjective();

        priorMeasureStatus = primaryObjective.GetMeasureStatus(aryParentActivities[i], false);
        priorNormalizedMeasure = primaryObjective.GetNormalizedMeasure(aryParentActivities[i], false);
        priorObjectiveProgressStatus = primaryObjective.GetProgressStatus(aryParentActivities[i], false);
        priorObjectiveSatisfiedStatus = primaryObjective.GetSatisfiedStatus(aryParentActivities[i], false);
        priorAttemptProgressStatus = aryParentActivities[i].GetAttemptProgressStatus();
        priorAttemptCompletionStatus = aryParentActivities[i].GetAttemptCompletionStatus();

        //do rollup
        if (!aryParentActivities[i].IsALeaf()) {
            this.MeasureRollupProcess(aryParentActivities[i]);
        }

        this.ObjectiveRollupProcess(aryParentActivities[i]);

        this.ActivityProgressRollupProcess(aryParentActivities[i]);

        //get the new status, if it is the same as the prior status, exit the loop
        newMeasureStatus = primaryObjective.GetMeasureStatus(aryParentActivities[i], false);
        newNormalizedMeasure = primaryObjective.GetNormalizedMeasure(aryParentActivities[i], false);
        newObjectiveProgressStatus = primaryObjective.GetProgressStatus(aryParentActivities[i], false);
        newObjectiveSatisfiedStatus = primaryObjective.GetSatisfiedStatus(aryParentActivities[i], false);
        newAttemptProgressStatus = aryParentActivities[i].GetAttemptProgressStatus();
        newAttemptCompletionStatus = aryParentActivities[i].GetAttemptCompletionStatus();

        // If this is the real sequencer and we are looking at the root activity, then log changes to completion / status to history log
        if (!this.LookAhead && aryParentActivities[i].IsTheRoot()) {
            if (newAttemptProgressStatus != priorAttemptProgressStatus || newAttemptCompletionStatus != priorAttemptCompletionStatus) {
                // Updated completion
                var newCompletionStr = (newAttemptProgressStatus ? (newAttemptCompletionStatus ? SCORM_STATUS_COMPLETED : SCORM_STATUS_INCOMPLETE) : SCORM_STATUS_NOT_ATTEMPTED);
                this.WriteHistoryLog("", {
                    ev: 'Rollup Completion',
                    v: newCompletionStr,
                    ai: aryParentActivities[i].ItemIdentifier
                });

            }
            if (newObjectiveProgressStatus != priorObjectiveProgressStatus || newObjectiveSatisfiedStatus != priorObjectiveSatisfiedStatus) {
                // Updated satisfaction
                var newSatisfactionStr = (newObjectiveProgressStatus ? (newObjectiveSatisfiedStatus ? SCORM_STATUS_PASSED : SCORM_STATUS_FAILED) : SCORM_STATUS_UNKNOWN);
                this.WriteHistoryLog("", {
                    ev: 'Rollup Satisfaction',
                    v: newSatisfactionStr,
                    ai: aryParentActivities[i].ItemIdentifier
                });

            }
        }
        // Rustici Software Special Code: if the success or completion status changes after this rollup
        // we need to set WasAutoSatisified to the same value as the leaf
        if (newObjectiveSatisfiedStatus != priorObjectiveSatisfiedStatus) {
            aryParentActivities[i].WasAutoSatisfied = activity.WasAutoSatisfied;
        }
        if (newAttemptCompletionStatus != priorAttemptCompletionStatus) {
            aryParentActivities[i].WasAutoCompleted = activity.WasAutoCompleted;
        }

        //we don't want to stop on the first activity because the state may have been changed before we entered this process
        if (i > 0 &&
            newMeasureStatus == priorMeasureStatus &&
            newNormalizedMeasure == priorNormalizedMeasure &&
            newObjectiveProgressStatus == priorObjectiveProgressStatus &&
            newObjectiveSatisfiedStatus == priorObjectiveSatisfiedStatus &&
            newAttemptProgressStatus == priorAttemptProgressStatus &&
            newAttemptCompletionStatus == priorAttemptCompletionStatus) {

            onlyDurationRollup = true;
        } else {
            aryRolledUpActivities[aryRolledUpActivities.length] = aryParentActivities[i];
        }
    }

    return aryRolledUpActivities;

}
