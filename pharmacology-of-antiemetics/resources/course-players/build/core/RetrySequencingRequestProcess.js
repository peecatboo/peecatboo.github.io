//****************************************************************************************************************

//Retry Sequencing Request Process [SB.2.10]
//May return a delivery request; may return an exception code
//Reference:
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Current Activity AM.1.2
//Flow Subprocess SB.2.3

function Sequencer_RetrySequencingRequestProcess(callingLog) {

    var returnValue;

    var flowSubProcessSuccess;

    if (!this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_RetrySequencingRequestProcessResult(null, "SB.2.10-1", IntegrationImplementation.GetString("You cannot use 'Resume All' while the current item is open."));
        return returnValue;
    }

    var currentActivity = this.GetCurrentActivity();

    if (currentActivity.IsActive() || currentActivity.IsSuspended()) {

        returnValue = new Sequencer_RetrySequencingRequestProcessResult(null, "SB.2.10-2", IntegrationImplementation.GetString("A 'Retry' sequencing request cannot be processed while there is an active or suspended activity."));
        return returnValue;
    }

    if (!currentActivity.IsALeaf()) {

        flowSubProcessResult = this.FlowSubprocess(currentActivity, FLOW_DIRECTION_FORWARD, true);

        if (flowSubProcessResult.Deliverable === false) {

            returnValue = new Sequencer_RetrySequencingRequestProcessResult(null, "SB.2.10-3", IntegrationImplementation.GetString("You cannot 'Retry' this item because: {1}", currentActivity.GetTitle(), flowSubProcessResult.ExceptionText));
            return returnValue;
        } else {

            returnValue = new Sequencer_RetrySequencingRequestProcessResult(flowSubProcessResult.IdentifiedActivity, null, "");
            return returnValue;
        }
    } else {

        returnValue = new Sequencer_RetrySequencingRequestProcessResult(currentActivity, null, "");
        return returnValue;
    }

}

function Sequencer_RetrySequencingRequestProcessResult(deliveryRequest, exception, exceptionText) {
    this.DeliveryRequest = deliveryRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;

}

Sequencer_RetrySequencingRequestProcessResult.prototype.toString = function() {
    return "DeliveryRequest=" + this.DeliveryRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
