//****************************************************************************************************************

//Exit Sequencing Request Process [SB.2.11]
//Indicates if the sequencing session has ended; may return an exception code
//Reference:
//Activity is Active AM.1.1
//Current Activity AM.1.2

function Sequencer_ExitSequencingRequestProcess(callingLog) {

    var returnValue;

    if (!this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_ExitSequencingRequestProcessResult(false, "SB.2.11-1", IntegrationImplementation.GetString("An 'Exit Sequencing' request cannot be processed until the sequencing session has begun."));
        return returnValue;
    }

    var currentActivity = this.GetCurrentActivity();

    if (currentActivity.IsActive()) {

        returnValue = new Sequencer_ExitSequencingRequestProcessResult(false, "SB.2.11-2", IntegrationImplementation.GetString("An 'Exit Sequencing' request cannot be processed while an activity is still active."));
        return returnValue;
    }

    //added an implementation specific check for a single sco and process an exit all whenever the single sco is exited
    if (currentActivity.IsTheRoot() || this.CourseIsSingleSco() === true) {

        returnValue = new Sequencer_ExitSequencingRequestProcessResult(true, null, "");
        return returnValue;
    }

    returnValue = new Sequencer_ExitSequencingRequestProcessResult(false, null, "");
    return returnValue;

}

function Sequencer_ExitSequencingRequestProcessResult(endSequencingSession, exception, exceptionText) {

    this.EndSequencingSession = endSequencingSession;
    this.Exception = exception;
    this.ExceptionText = exceptionText;

}

Sequencer_ExitSequencingRequestProcessResult.prototype.toString = function() {
    return "EndSequencingSession=" + this.EndSequencingSession +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
