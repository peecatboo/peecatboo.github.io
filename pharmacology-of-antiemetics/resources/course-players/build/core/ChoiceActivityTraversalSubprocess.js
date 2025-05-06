//****************************************************************************************************************

//Choice Activity Traversal Subprocess [SB.2.4]
//For an activity and a traversal direction; returns True if the activity can be reached; may return an exception code
//Reference:
//Check Activity Process UP.5;
//Sequencing Control Forward Only SM.1;
//Sequencing Rules Check Process UP.2

function Sequencer_ChoiceActivityTraversalSubprocess(activity, flowDirection, callingLog) {

    var sequencingRulesCheckResult = null;
    var parentActivity = null;
    var returnValue;

    if (flowDirection == FLOW_DIRECTION_FORWARD) {

        sequencingRulesCheckResult = this.SequencingRulesCheckProcess(activity, RULE_SET_STOP_FORWARD_TRAVERSAL);

        if (sequencingRulesCheckResult !== null) {
            returnValue = new Sequencer_ChoiceActivityTraversalSubprocessResult(false, "SB.2.4-1", IntegrationImplementation.GetString("You are not allowed to move into {0} yet.", activity.GetTitle()));
            return returnValue;
        }

        returnValue = new Sequencer_ChoiceActivityTraversalSubprocessResult(true, null);
        return returnValue;
    }

    if (flowDirection == FLOW_DIRECTION_BACKWARD) {

        if (!activity.IsTheRoot()) {

            parentActivity = this.Activities.GetParentActivity(activity);

            if (parentActivity.GetSequencingControlForwardOnly()) {
                returnValue = new Sequencer_ChoiceActivityTraversalSubprocessResult(false, "SB.2.4-2", IntegrationImplementation.GetString("You must start {0} at the beginning.", parentActivity.GetTitle()));
                return returnValue;
            }
        } else {

            returnValue = new Sequencer_ChoiceActivityTraversalSubprocessResult(false, "SB.2.4-3", IntegrationImplementation.GetString("You have reached the beginning of the course."));
            return returnValue;
        }

        returnValue = new Sequencer_ChoiceActivityTraversalSubprocessResult(true, null);
        return returnValue;
    }

}

function Sequencer_ChoiceActivityTraversalSubprocessResult(reachable, exception, exceptionText) {
    this.Reachable = reachable;
    this.Exception = exception;
    this.ExceptionText = exceptionText;

}

Sequencer_ChoiceActivityTraversalSubprocessResult.prototype.toString = function() {
    return "Reachable=" + this.Reachable +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
