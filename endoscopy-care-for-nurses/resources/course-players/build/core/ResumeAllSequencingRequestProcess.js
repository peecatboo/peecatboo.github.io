//****************************************************************************************************************

//Resume All Sequencing Request Process [SB.2.6]

//May return a delivery request; may return an exception code

//Reference:
//Current Activity AM.1.2
//Suspended Activity AM.1.2

function Sequencer_ResumeAllSequencingRequestProcess(callingLog) {

    var returnValue;

    if (this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_ResumeAllSequencingRequestProcessResult(null, "SB.2.6-1", IntegrationImplementation.GetString("A 'Resume All' sequencing request cannot be processed while there is a current activity defined."));
        return returnValue;
    }

    if (!this.IsSuspendedActivityDefined()) {

        returnValue = new Sequencer_ResumeAllSequencingRequestProcessResult(null, "SB.2.6-2", IntegrationImplementation.GetString("There is no suspended activity to resume."));
        return returnValue;
    }

    var suspendedActivity = this.GetSuspendedActivity();

    returnValue = new Sequencer_ResumeAllSequencingRequestProcessResult(suspendedActivity, null, "");
    return returnValue;
}

function Sequencer_ResumeAllSequencingRequestProcessResult(deliveryRequest, exception, exceptionText) {
    this.DeliveryRequest = deliveryRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;

}

Sequencer_ResumeAllSequencingRequestProcessResult.prototype.toString = function() {
    return "DeliveryRequest=" + this.DeliveryRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
