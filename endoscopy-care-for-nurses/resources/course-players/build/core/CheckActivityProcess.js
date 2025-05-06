//****************************************************************************************************************

//Check Activity Process [UP.5]
//For an activity, returns True if the activity is disabled or violates any of its limit conditions
//Reference:
//Disabled Rules SM.2
//Limit Conditions Check Process UP.1
//Sequencing Rules Check Process UP.2

function Sequencer_CheckActivityProcess(activity, callingLog) {

    var sequencingRulesCheckResult = this.SequencingRulesCheckProcess(activity, RULE_SET_DISABLED);

    if (sequencingRulesCheckResult !== null) {
        return true;
    }

    var limitConditionsCheckResult = this.LimitConditionsCheckProcess(activity);

    if (limitConditionsCheckResult) {
        return true;
    }

    return false;

}
