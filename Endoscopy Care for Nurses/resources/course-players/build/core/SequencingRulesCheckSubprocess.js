//****************************************************************************************************************
//Sequencing Rule Check Subprocess [UP.2.1]
//For an activity and a Sequencing Rule; returns True if the rule applies, False if the rule does not apply, and Unknown if the condition(s) cannot be evaluated
//Reference:
//Rule Combination SM.2
//Rule Condition SM.2
//Rule Condition Operator SM.2
//Sequencing Rule Description SM.2
//Tracking Model TM

function Sequencer_SequencingRulesCheckSubprocess(activity, rule, callingLog) {

    //returns true, false, or RESULT_UNKNOWN

    var ruleConditionResults = new Array();

    var conditionResult;
    var combinedConditionResults;

    var i;

    for (i = 0; i < rule.RuleConditions.length; i++) {

        conditionResult = this.EvaluateSequencingRuleCondition(activity, rule.RuleConditions[i]); //store true, false or RESULT_UNKNOWN

        if (rule.RuleConditions[i].Operator == RULE_CONDITION_OPERATOR_NOT) {

            if (conditionResult != "unknown") {
                conditionResult = (!conditionResult);
            }
        }

        ruleConditionResults[ruleConditionResults.length] = conditionResult;
    }

    if (ruleConditionResults.length === 0) {

        return RESULT_UNKNOWN;
    }

    if (rule.ConditionCombination == RULE_CONDITION_COMBINATION_ANY) { //ANY = OR

        combinedConditionResults = false;

        for (i = 0; i < ruleConditionResults.length; i++) {
            combinedConditionResults = Sequencer_LogicalOR(combinedConditionResults, ruleConditionResults[i]);
        }

    } else { //ALL = AND

        combinedConditionResults = true;

        for (i = 0; i < ruleConditionResults.length; i++) {
            combinedConditionResults = Sequencer_LogicalAND(combinedConditionResults, ruleConditionResults[i]);
        }

    }

    return combinedConditionResults;

}

function Sequencer_EvaluateSequencingRuleCondition(activity, ruleCondition, callingLog) {

    //return true, false or RESULT_UNKNOWN
    var returnValue = null;
    switch (ruleCondition.Condition) {

        case SEQUENCING_RULE_CONDITION_SATISFIED:
            returnValue = activity.IsSatisfied(ruleCondition.ReferencedObjective, true);
            break;

        case SEQUENCING_RULE_CONDITION_OBJECTIVE_STATUS_KNOWN:
            returnValue = activity.IsObjectiveStatusKnown(ruleCondition.ReferencedObjective, true);
            break;

        case SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_KNOWN:
            returnValue = activity.IsObjectiveMeasureKnown(ruleCondition.ReferencedObjective, true);
            break;

        case SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_GREATER_THAN:
            returnValue = activity.IsObjectiveMeasureGreaterThan(ruleCondition.ReferencedObjective, ruleCondition.MeasureThreshold, true);
            break;

        case SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_LESS_THAN:
            returnValue = activity.IsObjectiveMeasureLessThan(ruleCondition.ReferencedObjective, ruleCondition.MeasureThreshold, true);
            break;

        case SEQUENCING_RULE_CONDITION_COMPLETED:
            returnValue = activity.IsCompleted(ruleCondition.ReferencedObjective, true);
            break;

        case SEQUENCING_RULE_CONDITION_ACTIVITY_PROGRESS_KNOWN:
            returnValue = activity.IsActivityProgressKnown(ruleCondition.ReferencedObjective, true);
            break;

        case SEQUENCING_RULE_CONDITION_ATTEMPTED:
            returnValue = activity.IsAttempted();
            break;

        case SEQUENCING_RULE_CONDITION_ATTEMPT_LIMIT_EXCEEDED:
            returnValue = activity.IsAttemptLimitExceeded();
            break;

        case SEQUENCING_RULE_CONDITION_ALWAYS:
            returnValue = true;
            break;

        default:
            returnValue = RESULT_UNKNOWN;
            break;

    }

    return returnValue;
}

//TODO - move these some place more logical since they are reused from EvaluateRollupConditionsSubprocess

function Sequencer_LogicalOR(value1, value2) {

    if (value1 == RESULT_UNKNOWN) {
        if (value2 === true) {
            return true;
        } else { //value 2 === false or unknown
            return RESULT_UNKNOWN;
        }
    } else {
        if (value2 == RESULT_UNKNOWN) {
            if (value1 === true) {
                return true;
            } else {
                return RESULT_UNKNOWN;
            }
        } else {
            return (value1 || value2);
        }
    }

}

function Sequencer_LogicalAND(value1, value2) {

    if (value1 == RESULT_UNKNOWN) {
        if (value2 === false) {
            return false;
        } else {
            return RESULT_UNKNOWN;
        }
    } else {
        if (value2 == RESULT_UNKNOWN) {
            if (value1 === false) {
                return false;
            } else {
                return RESULT_UNKNOWN;
            }
        } else {
            return (value1 && value2);
        }
    }
}
