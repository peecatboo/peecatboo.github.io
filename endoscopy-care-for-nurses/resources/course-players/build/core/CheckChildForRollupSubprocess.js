//****************************************************************************************************************

//Check Child for Rollup Subprocess [RB.1.4.2]

//    For an activity and a Rollup Action; returns True if the activity is included in rollup

//    Reference:
//Rollup Action SM.5
//Rollup Objective Satisfied SM.8
//Rollup Progress Completion SM.8
//Activity Attempt Count TM.1.2.1
//Sequencing Rules Check Process UP.2
//adlseq:requiredForSatisfied SCORM SN
//adlseq:requiredForNotSatisfied SCORM SN
//adlseq:requiredForCompleted SCORM SN
//adlseq:requiredForIncomplete SCORM SN

function Sequencer_CheckChildForRollupSubprocess(activity, ruleAction, callingLog) {

    var sequencingRulesCheckResult;

    var included = false;

    if (ruleAction == ROLLUP_RULE_ACTION_SATISFIED || ruleAction == ROLLUP_RULE_ACTION_NOT_SATISFIED) {

        if (activity.GetRollupObjectiveSatisfied() === true) {

            included = true;

            var requiredForSatified = activity.GetRequiredForSatisfied();
            var requiredForNotSatified = activity.GetRequiredForNotSatisfied();

            if (
                (ruleAction == ROLLUP_RULE_ACTION_SATISFIED && requiredForSatified == ROLLUP_CONSIDERATION_IF_NOT_SUSPENDED) ||
                (ruleAction == ROLLUP_RULE_ACTION_NOT_SATISFIED && requiredForNotSatified == ROLLUP_CONSIDERATION_IF_NOT_SUSPENDED)) {

                //should this also need to check to see if ActivityProgressStatus === true, if so, use the Activity_IsAttempted function...no, attempt count will never be > 0 without activity progress status being true.

                if (activity.GetAttemptCount() > 0 && activity.IsSuspended() === true) {

                    included = false;
                }
            } else {
                if (
                    (ruleAction == ROLLUP_RULE_ACTION_SATISFIED && requiredForSatified == ROLLUP_CONSIDERATION_IF_ATTEMPTED) ||
                    (ruleAction == ROLLUP_RULE_ACTION_NOT_SATISFIED && requiredForNotSatified == ROLLUP_CONSIDERATION_IF_ATTEMPTED)) {

                    if (activity.GetAttemptCount() === 0) {

                        included = false;
                    }

                } else {

                    if (
                        (ruleAction == ROLLUP_RULE_ACTION_SATISFIED && requiredForSatified == ROLLUP_CONSIDERATION_IF_NOT_SKIPPED) ||
                        (ruleAction == ROLLUP_RULE_ACTION_NOT_SATISFIED && requiredForNotSatified == ROLLUP_CONSIDERATION_IF_NOT_SKIPPED)) {

                        sequencingRulesCheckResult = this.SequencingRulesCheckProcess(activity, RULE_SET_SKIPPED);

                        if (sequencingRulesCheckResult !== null) {

                            included = false;
                        }
                    }
                }
            }
        }
    }

    if (ruleAction == ROLLUP_RULE_ACTION_COMPLETED || ruleAction == ROLLUP_RULE_ACTION_INCOMPLETE) {

        if (activity.RollupProgressCompletion() === true) {

            included = true;

            var requiredForCompleted = activity.GetRequiredForCompleted();
            var requiredForIncomplete = activity.GetRequiredForIncomplete();

            if (
                (ruleAction == ROLLUP_RULE_ACTION_COMPLETED && requiredForCompleted == ROLLUP_CONSIDERATION_IF_NOT_SUSPENDED) ||
                (ruleAction == ROLLUP_RULE_ACTION_INCOMPLETE && requiredForIncomplete == ROLLUP_CONSIDERATION_IF_NOT_SUSPENDED)) {

                if (activity.GetAttemptCount() > 0 && activity.IsSuspended() === true) {

                    included = false;
                }
            } else {
                if (
                    (ruleAction == ROLLUP_RULE_ACTION_COMPLETED && requiredForCompleted == ROLLUP_CONSIDERATION_IF_ATTEMPTED) ||
                    (ruleAction == ROLLUP_RULE_ACTION_INCOMPLETE && requiredForIncomplete == ROLLUP_CONSIDERATION_IF_ATTEMPTED)) {

                    if (activity.GetAttemptCount() === 0) {

                        included = false;
                    }
                } else {
                    if (
                        (ruleAction == ROLLUP_RULE_ACTION_COMPLETED && requiredForCompleted == ROLLUP_CONSIDERATION_IF_NOT_SKIPPED) ||
                        (ruleAction == ROLLUP_RULE_ACTION_INCOMPLETE && requiredForIncomplete == ROLLUP_CONSIDERATION_IF_NOT_SKIPPED)) {

                        sequencingRulesCheckResult = this.SequencingRulesCheckProcess(activity, RULE_SET_SKIPPED);

                        if (sequencingRulesCheckResult !== null) {

                            included = false;
                        }
                    }
                }
            }
        }

    }

    return included;

}
