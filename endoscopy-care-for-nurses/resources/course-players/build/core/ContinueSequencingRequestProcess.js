//****************************************************************************************************************

//Continue Sequencing Request Process [SB.2.7]
//May return a delivery request; may return an exception code
//Reference:
//Current Activity AM.1.2
//Flow Subprocess SB.2.3

function Sequencer_ContinueSequencingRequestProcess(callingLog) {

    var returnValue;

    if (!this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_ContinueSequencingRequestProcessResult(null, "SB.2.7-1", IntegrationInterface.GetString("The sequencing session has not begun yet."), false);
        return returnValue;
    }

    var currentActivity = this.GetCurrentActivity();

    if (!currentActivity.IsTheRoot()) {

        var parentActivity = this.Activities.GetParentActivity(currentActivity);

        if (parentActivity.GetSequencingControlFlow() === false) {

            returnValue = new Sequencer_ContinueSequencingRequestProcessResult(null, "SB.2.7-2", IntegrationImplementation.GetString("You cannot use 'Next' to enter {0}. Please select a menu item to continue.", parentActivity.GetTitle()), false);
            return returnValue;
        }
    }

    var flowSubProcessResult = this.FlowSubprocess(currentActivity, FLOW_DIRECTION_FORWARD, false);

    if (flowSubProcessResult.Deliverable === false) {

        returnValue = new Sequencer_ContinueSequencingRequestProcessResult(null, flowSubProcessResult.Exception, flowSubProcessResult.ExceptionText, flowSubProcessResult.EndSequencingSession);
        return returnValue;
    } else {

        returnValue = new Sequencer_ContinueSequencingRequestProcessResult(flowSubProcessResult.IdentifiedActivity, null, "", false);
        return returnValue;
    }

}

function Sequencer_ContinueSequencingRequestProcessResult(deliveryRequest, exception, exceptionText, endSequencingSession) {

    this.DeliveryRequest = deliveryRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.EndSequencingSession = endSequencingSession;
}

Sequencer_ContinueSequencingRequestProcessResult.prototype.toString = function() {
    return "DeliveryRequest=" + this.DeliveryRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", EndSequencingSession=" + this.EndSequencingSession;
};
