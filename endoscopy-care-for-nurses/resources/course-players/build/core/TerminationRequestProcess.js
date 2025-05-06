//****************************************************************************************************************
//Termination Request Process

//    For a termination request, ends the current attempt on the Current Activity; returns the validity of the termination request; may return a sequencing request; may return an exception code

//    Reference:
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Current Activity AM.1.2
//End Attempt Process UP.4
//Sequencing Exit Action Rules Subprocess TB.2.1
//Sequencing Post Condition Rules Subprocess TB.2.2
//Terminate Descendent Attempts Process UP.3

function Sequencer_TerminationRequestProcess(terminationRequest, callingLog) {

    var returnValue;

    var currentActivity = this.GetCurrentActivity();
    var parentActivity = this.Activities.GetParentActivity(currentActivity);
    var rootActivity = this.GetRootActivity();
    var activityTree;

    var sequencingPostConditionResult = null;
    var fallThroughToNextCase = false;

    if (!this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-1", IntegrationImplementation.GetString("You cannot use 'Terminate' because no item is currently open."));
        return returnValue;
    }

    if ((terminationRequest == TERMINATION_REQUEST_EXIT || terminationRequest == TERMINATION_REQUEST_ABANDON) &&
        (currentActivity.IsActive() === false)) {

        returnValue = new Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-2", IntegrationImplementation.GetString("The current activity has already been terminated."));
        return returnValue;
    }

    switch (terminationRequest) {

        case TERMINATION_REQUEST_EXIT:

            this.EndAttemptProcess(currentActivity, false);

            this.SequencingExitActionRulesSubprocess();

            var processedExit;
            do {
                processedExit = false;

                sequencingPostConditionResult = this.SequencingPostConditionRulesSubprocess();

                if (sequencingPostConditionResult.TerminationRequest == TERMINATION_REQUEST_EXIT_ALL) {

                    terminationRequest = TERMINATION_REQUEST_EXIT_ALL;

                    fallThroughToNextCase = true; //indicate that we don't want to break at the end of this case
                    break; //exit the do loop
                }

                if (sequencingPostConditionResult.TerminationRequest == TERMINATION_REQUEST_EXIT_PARENT) {

                    if (this.GetCurrentActivity() !== null && this.GetCurrentActivity().IsTheRoot() === false) {

                        this.SetCurrentActivity(this.Activities.GetParentActivity(this.GetCurrentActivity()));

                        this.EndAttemptProcess(this.GetCurrentActivity(), false);

                        processedExit = true;
                    } else {

                        returnValue = new Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-4", IntegrationImplementation.GetString("An 'Exit Parent' sequencing request cannot be processed on the root of the activity tree."));
                        return returnValue;
                    }
                } else {
                    //this code added per Addendum 2.22 (replaces interm fix below)

                    if (this.GetCurrentActivity() !== null && this.GetCurrentActivity().IsTheRoot() === true &&
                        sequencingPostConditionResult.SequencingRequest != SEQUENCING_REQUEST_RETRY) {

                        returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, SEQUENCING_REQUEST_EXIT, null, "");
                        return returnValue;
                    }
                }

                /*
                //lines 3.4 & 3.4.1 are added after a conversation with Angelo on 1-28-05, these lines will be added to the normalized
                //pseudo code in an upcoming addendum (added above now that addendum is out)
                 if (this.GetCurrentActivity() !== null && this.GetCurrentActivity().IsTheRoot() === true &&
                    sequencingPostConditionResult.SequencingRequest != SEQUENCING_REQUEST_RETRY){

                     return new Sequencer_TerminationRequestProcessResult(terminationRequest, SEQUENCING_REQUEST_EXIT, null, "");
                }
                */
            }
            while (processedExit !== false);

            if (!fallThroughToNextCase) { //if Sequencing Post Condition Rule Subprocess returned a termination request of Exit All, we fall through to the Exit All section

                //TODO: restructure this function such that there isn't a break immediately after a return so JSLint will be happy
                returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, sequencingPostConditionResult.SequencingRequest, null, "");
                return returnValue;
                break;
            }

        case TERMINATION_REQUEST_EXIT_ALL:

            if (currentActivity.IsActive()) {

                this.EndAttemptProcess(currentActivity, false);

            }

            this.TerminateDescendentAttemptsProcess(rootActivity);

            this.EndAttemptProcess(rootActivity, false);

            this.SetCurrentActivity(rootActivity);

            if (sequencingPostConditionResult !== null && sequencingPostConditionResult.SequencingRequest !== null) {

                returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, sequencingPostConditionResult.SequencingRequest, null, "");
                return returnValue;
            } else {
                returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, SEQUENCING_REQUEST_EXIT, null, "");
                return returnValue;
            }

            break;

        case TERMINATION_REQUEST_SUSPEND_ALL:

            // Modification to perform rollup even on suspend when exiting the player [Ontime feature #211].
            // When the learner clicks Return To LMS, a suspend all request is processed to ensure that progress isn't lost. Problem is
            // that suspend all doesn't trigger rollup, so if the learner clicks Return To LMS while sitting on the last SCO, it is possible
            // that the course will not complete because it is not rolled up even though all of the requirements have been met.
            if ((Control.Package.Properties.InvokeRollupAtSuspendAll === true || this.ReturnToLmsInvoked) &&
                currentActivity.IsActive()
            ) {
                this.EndAttemptProcess(currentActivity, false, null, true);
            }

            if (currentActivity.IsActive() || currentActivity.IsSuspended()) {

                this.OverallRollupProcess(currentActivity);

                this.SetSuspendedActivity(currentActivity);

            } else {

                if (!currentActivity.IsTheRoot()) {
                    this.SetSuspendedActivity(parentActivity);
                } else {

                    Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-3", "The suspend all termination request failed because there is no activity to suspend")
                }
            }

            activityTree = this.GetActivityPath(this.GetSuspendedActivity(), true);

            if (activityTree.length === 0) {

                returnValue = new Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-5", IntegrationImplementation.GetString("Nothing to suspend"));
                return returnValue;
            }

            for (var i = 0; i < activityTree.length; i++) {

                activityTree[i].SetActive(false);

                activityTree[i].SetSuspended(true);
            }

            this.SetCurrentActivity(rootActivity);

            returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, SEQUENCING_REQUEST_EXIT, null, "");
            return returnValue;
            break;

        case TERMINATION_REQUEST_ABANDON:

            currentActivity.SetActive(false);

            returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, null, null, "");
            return returnValue;
            break;

        case TERMINATION_REQUEST_ABANDON_ALL:

            activityTree = this.GetActivityPath(currentActivity, true);

            if (activityTree.length === 0) {

                returnValue = new Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-6", IntegrationImplementation.GetString("Nothing to close"));
                return returnValue;
            }

            for (var i = 0; i < activityTree.length; i++) {

                activityTree[i].SetActive(false);

            }

            this.SetCurrentActivity(rootActivity);

            returnValue = new Sequencer_TerminationRequestProcessResult(terminationRequest, SEQUENCING_REQUEST_EXIT, null, "");
            return returnValue;
            break;

        default:

            returnValue = new Sequencer_TerminationRequestProcessResult(TERMINATION_REQUEST_NOT_VALID, null, "TB.2.3-7", IntegrationImplementation.GetString("The 'Termination' request {0} is not recognized.", terminationRequest));
            return returnValue;
            break;
    }

}

function Sequencer_TerminationRequestProcessResult(terminationRequest, sequencingRequest, exception, exceptionText) {

    this.TerminationRequest = terminationRequest;
    this.SequencingRequest = sequencingRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
}

Sequencer_TerminationRequestProcessResult.prototype.toString = function() {
    return "TerminationRequest=" + this.TerminationRequest +
        ", SequencingRequest=" + this.SequencingRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
