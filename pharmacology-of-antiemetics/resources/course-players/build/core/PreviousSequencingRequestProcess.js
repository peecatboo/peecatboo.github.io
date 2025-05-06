//****************************************************************************************************************
//Previous Sequencing Request Process [SB.2.8]
//May return a delivery request; may return an exception code
//Reference:
//Current Activity AM.1.2
//Flow Subprocess SB.2.3

function Sequencer_PreviousSequencingRequestProcess(callingLog) {

    var returnValue;

    if (!this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_PreviousSequencingRequestProcessResult(null, "SB.2.8-1", IntegrationImplementation.GetString("You cannot use 'Previous' at this time."), false);
        return returnValue;
    }

    var currentActivity = this.GetCurrentActivity();

    if (!currentActivity.IsTheRoot()) {

        var parentActivity = this.Activities.GetParentActivity(currentActivity);

        if (parentActivity.GetSequencingControlFlow() === false) {

            returnValue = new Sequencer_PreviousSequencingRequestProcessResult(null, "SB.2.8-2", IntegrationImplementation.GetString("Please select 'Next' or 'Previous' to move through {0}.", parentActivity.GetTitle()), false);
            return returnValue;
        }
    }

    var flowSubProcessResult = this.FlowSubprocess(currentActivity, FLOW_DIRECTION_BACKWARD, false);

    if (flowSubProcessResult.Deliverable === false) {

        returnValue = new Sequencer_PreviousSequencingRequestProcessResult(null, flowSubProcessResult.Exception, flowSubProcessResult.ExceptionText, flowSubProcessResult.EndSequencingSession);
        return returnValue;
    } else {

        returnValue = new Sequencer_PreviousSequencingRequestProcessResult(flowSubProcessResult.IdentifiedActivity, null, "", false);
        return returnValue;

    }
}

function Sequencer_PreviousSequencingRequestProcessResult(deliveryRequest, exception, exceptionText, endSequencingSession) {

    this.DeliveryRequest = deliveryRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.EndSequencingSession = endSequencingSession;
}

Sequencer_PreviousSequencingRequestProcessResult.prototype.toString = function() {
    return "DeliveryRequest=" + this.DeliveryRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
