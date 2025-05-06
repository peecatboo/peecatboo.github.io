//****************************************************************************************************************

//Evaluate Rollup Conditions Subprocess [RB.1.4.1]

//    For an activity and a set of Rollup Conditions, True if the condition(s) evaluate to True, False if the condition(s) evaluate to False, and Unknown if condition(s) cannot be evaluated

//    Reference:
//Condition Combination SM.5;
//Rollup Condition SM.5;
//Rollup Condition Operator SM.5;
//Tracking Model TM

function Sequencer_EvaluateRollupConditionsSubprocess(activity, rollupRule, callingLog) {

    //returns true, false, RESULT_UNKNOWN

    var conditionResult;
    var combinedConditionResults;

    var conditionResults = new Array();

    var i;

    for (i = 0; i < rollupRule.Conditions.length; i++) {

        conditionResult = Sequencer_EvaluateRollupRuleCondition(activity, rollupRule.Conditions[i]);

        if (rollupRule.Conditions[i].Operator == RULE_CONDITION_OPERATOR_NOT && conditionResult != RESULT_UNKNOWN) {

            conditionResult = (!conditionResult);
        }

        conditionResults[conditionResults.length] = conditionResult;
    }

    if (conditionResults.length === 0) {

        return RESULT_UNKNOWN;
    }

    if (rollupRule.ConditionCombination == RULE_CONDITION_COMBINATION_ANY) { //ANY = OR

        combinedConditionResults = false;

        for (i = 0; i < conditionResults.length; i++) {
            combinedConditionResults = Sequencer_LogicalOR(combinedConditionResults, conditionResults[i]);
        }

    } else { //ALL = AND

        combinedConditionResults = true;

        for (i = 0; i < conditionResults.length; i++) {
            combinedConditionResults = Sequencer_LogicalAND(combinedConditionResults, conditionResults[i]);
        }

    }

    this.LogSeqReturn(combinedConditionResults);
    return combinedConditionResults;
}

function Sequencer_EvaluateRollupRuleCondition(activity, ruleCondition) {

    //returns true, false or RESULT_UNKNOWN
    var returnValue = null;

    switch (ruleCondition.Condition) {

        case ROLLUP_RULE_CONDITION_SATISFIED:
            returnValue = activity.IsSatisfied("");
            break;

        case ROLLUP_RULE_CONDITION_OBJECTIVE_STATUS_KNOWN:
            returnValue = activity.IsObjectiveStatusKnown("", false);
            break;

        case ROLLUP_RULE_CONDITION_OBJECTIVE_MEASURE_KNOWN:
            returnValue = activity.IsObjectiveMeasureKnown("", false);
            break;

        case ROLLUP_RULE_CONDITION_COMPLETED:
            returnValue = activity.IsCompleted("", false);
            break;

        case ROLLUP_RULE_CONDITION_ACTIVITY_PROGRESS_KNOWN:
            returnValue = activity.IsActivityProgressKnown("", false);
            break;

        case ROLLUP_RULE_CONDITION_ATTEMPTED:
            returnValue = activity.IsAttempted();
            break;

        case ROLLUP_RULE_CONDITION_ATTEMPT_LIMIT_EXCEEDED:
            returnValue = activity.IsAttemptLimitExceeded();
            break;

        case ROLLUP_RULE_CONDITION_NEVER:
            returnValue = false;
            break;

        default:
            break;

    }
    return returnValue;
}
