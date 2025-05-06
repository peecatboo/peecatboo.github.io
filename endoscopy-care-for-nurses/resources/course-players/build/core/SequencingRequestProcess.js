//[SB.2.12]****************************************************************************************************************

//[SB.2.12]Sequencing Request Process [SB.2.12]
//[SB.2.12]    For a sequencing request; validates the sequencing request; may return a delivery request; may indicate control be returned to the LTS; may return an exception code
//[SB.2.12]    Reference:
//[SB.2.12]Choice Sequencing Request Process SB.2.9
//[SB.2.12]Continue Sequencing Request Process SB.2.7
//[SB.2.12]Exit Sequencing Request Process SB.2.11
//[SB.2.12]Previous Sequencing Request Process SB.2.8
//[SB.2.12]Resume All Sequencing Request Process SB.2.6
//[SB.2.12]Retry Sequencing Request Process SB.2.10
//[SB.2.12]Start Sequencing Request Process SB.2.5.

function Sequencer_SequencingRequestProcess(sequencingRequest, targetActivity, callingLog) {

    var returnValue;

    switch (sequencingRequest) {

        case SEQUENCING_REQUEST_START:

            var startSequencingRequestResult = this.StartSequencingRequestProcess();

            if (startSequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, null, startSequencingRequestResult.Exception, startSequencingRequestResult.ExceptionText, false);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, startSequencingRequestResult.DeliveryRequest, startSequencingRequestResult.EndSequencingSession, null, "", false);
                return returnValue;
            }
            break;

        case SEQUENCING_REQUEST_RESUME_ALL:

            var resumeAllSequencingRequestResult = this.ResumeAllSequencingRequestProcess();

            if (resumeAllSequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, null, resumeAllSequencingRequestResult.Exception, resumeAllSequencingRequestResult.ExceptionText, false);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, resumeAllSequencingRequestResult.DeliveryRequest, null, null, "", false);
                return returnValue;
            }

            break;

        case SEQUENCING_REQUEST_EXIT:

            var exitSequencingRequestResult = this.ExitSequencingRequestProcess();

            if (exitSequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, null, exitSequencingRequestResult.Exception, exitSequencingRequestResult.ExceptionText, false);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, null, exitSequencingRequestResult.EndSequencingSession, null, "", false);
                return returnValue;
            }

            break;

        case SEQUENCING_REQUEST_RETRY:

            var retrySequencingRequestResult = this.RetrySequencingRequestProcess();

            if (retrySequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, null, retrySequencingRequestResult.Exception, retrySequencingRequestResult.ExceptionText, false);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, retrySequencingRequestResult.DeliveryRequest, null, null, "", false);
                return returnValue;
            }
            break;

        case SEQUENCING_REQUEST_CONTINUE:

            var continueSequencingRequestResult = this.ContinueSequencingRequestProcess();

            if (continueSequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, continueSequencingRequestResult.EndSequencingSession, continueSequencingRequestResult.Exception, continueSequencingRequestResult.ExceptionText, false);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, continueSequencingRequestResult.DeliveryRequest, continueSequencingRequestResult.EndSequencingSession, null, "", false);
                return returnValue;

            }
            break;

        case SEQUENCING_REQUEST_PREVIOUS:

            var previousSequencingRequestResult = this.PreviousSequencingRequestProcess();

            if (previousSequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, previousSequencingRequestResult.EndSequencingSession, previousSequencingRequestResult.Exception, previousSequencingRequestResult.ExceptionText, false);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, previousSequencingRequestResult.DeliveryRequest, previousSequencingRequestResult.EndSequencingSession, null, "", false);
                return returnValue;
            }
            break;

        case SEQUENCING_REQUEST_CHOICE:

            var choiceSequencingRequestResult = this.ChoiceSequencingRequestProcess(targetActivity);

            if (choiceSequencingRequestResult.Exception !== null) {

                returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, null, choiceSequencingRequestResult.Exception, choiceSequencingRequestResult.ExceptionText, choiceSequencingRequestResult.Hidden);
                return returnValue;
            } else {

                returnValue = new Sequencer_SequencingRequestProcessResult(sequencingRequest, choiceSequencingRequestResult.DeliveryRequest, null, null, "", choiceSequencingRequestResult.Hidden);
                return returnValue;
            }
            break;

    }

    returnValue = new Sequencer_SequencingRequestProcessResult(SEQUENCING_REQUEST_NOT_VALID, null, null, "SB.2.12-1", "The sequencing request (" + sequencingRequest + ") is not recognized.", false);
    return returnValue;
}

function Sequencer_SequencingRequestProcessResult(sequencingRequest, deliveryRequest, endSequencingSession, exception, exceptionText, hidden) {

    this.SequencingRequest = sequencingRequest;
    this.DeliveryRequest = deliveryRequest;
    this.EndSequencingSession = endSequencingSession;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.Hidden = hidden;

}

Sequencer_SequencingRequestProcessResult.prototype.toString = function() {
    return "SequencingRequest=" + this.SequencingRequest +
        ", DeliveryRequest=" + this.DeliveryRequest +
        ", EndSequencingSession=" + this.EndSequencingSession +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", Hidden=" + this.Hidden;
};
