//****************************************************************************************************************

//Sequencing Post Condition Rules Subprocess [TB.2.2]

//    For the Current Activity; may return a termination request and a sequencing request):

//    Reference:
//Activity is Suspended AM.1.1
//Current Activity AM.1.2
//Sequencing Rules Check Process UP.2
//Sequencing Rule Description SM.2

function Sequencer_SequencingPostConditionRulesSubprocess(callingLog) {

    var returnValue;

    var currentActivity = this.GetCurrentActivity();

    if (currentActivity.IsSuspended()) {
        returnValue = new Sequencer_SequencingPostConditionRulesSubprocessResult(null, null);
        return returnValue;
    }

    var ruleAction = this.SequencingRulesCheckProcess(currentActivity, RULE_SET_POST_CONDITION);

    if (ruleAction !== null) {

        if (ruleAction == SEQUENCING_RULE_ACTION_RETRY ||
            ruleAction == SEQUENCING_RULE_ACTION_CONTINUE ||
            ruleAction == SEQUENCING_RULE_ACTION_PREVIOUS) {

            returnValue = new Sequencer_SequencingPostConditionRulesSubprocessResult(this.TranslateSequencingRuleActionIntoSequencingRequest(ruleAction), null);
            return returnValue;
        }

        if (ruleAction == SEQUENCING_RULE_ACTION_EXIT_PARENT ||
            ruleAction == SEQUENCING_RULE_ACTION_EXIT_ALL) {

            returnValue = new Sequencer_SequencingPostConditionRulesSubprocessResult(null, this.TranslateSequencingRuleActionIntoTerminationRequest(ruleAction));
            return returnValue;
        }

        if (ruleAction == SEQUENCING_RULE_ACTION_RETRY_ALL) {

            returnValue = new Sequencer_SequencingPostConditionRulesSubprocessResult(SEQUENCING_REQUEST_RETRY, TERMINATION_REQUEST_EXIT_ALL);
            return returnValue;
        }
    }

    returnValue = new Sequencer_SequencingPostConditionRulesSubprocessResult(null, null);
    return returnValue;
}

function Sequencer_SequencingPostConditionRulesSubprocessResult(sequencingRequest, terminationRequest) {
    this.TerminationRequest = terminationRequest;
    this.SequencingRequest = sequencingRequest;

}

Sequencer_SequencingPostConditionRulesSubprocessResult.prototype.toString = function() {
    return "TerminationRequest=" + this.TerminationRequest +
        ", SequencingRequest=" + this.SequencingRequest;
};
