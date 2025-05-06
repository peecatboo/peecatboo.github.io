//****************************************************************************************************************

//Navigation Request Process [NB.2.1]

//For a navigation request and possibly a specified activity, returns the validity of the navigation request;
//may return a termination request, a sequencing request, and/or a target activity; may return an exception code

//Reference:
//Current Activity AM.1.2;
//Sequencing Control Choice SM.1;
//Sequencing Control Choice Exit SM.1;
//Sequencing Control Flow SM.1;
//Sequencing Control Forward Only SM.1;
//Suspended Activity AM.1.2

function Sequencer_NavigationRequestProcess(navigationRequest, targetActivityIdentifier, callingLog) {

    var currentActivity = this.GetCurrentActivity();

    var parentActivity = null;

    if (currentActivity !== null) {
        parentActivity = currentActivity.ParentActivity;
    }

    var parentActivityTitle = "";
    if (parentActivity !== null) {
        parentActivityTitle = parentActivity.GetTitle();
    }

    var returnValue;

    switch (navigationRequest) {

        case NAVIGATION_REQUEST_START:

            if (!this.IsCurrentActivityDefined()) {

                returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, null, SEQUENCING_REQUEST_START, null, null, "");
                return returnValue;
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-1", null, IntegrationImplementation.GetString("The sequencing session has already been started."));
                return returnValue;
            }

            break;

        case NAVIGATION_REQUEST_RESUME_ALL:

            if (!this.IsCurrentActivityDefined()) {

                if (this.IsSuspendedActivityDefined()) {

                    returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, null, SEQUENCING_REQUEST_RESUME_ALL, null, null, "");
                    return returnValue;
                } else {

                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-3", null, IntegrationImplementation.GetString("There is no suspended activity to resume."));
                    return returnValue;
                }
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-1", null, IntegrationImplementation.GetString("The sequencing session has already been started."));
                return returnValue;
            }

            break;

        case NAVIGATION_REQUEST_CONTINUE:

            if (!this.IsCurrentActivityDefined()) {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-1", null, IntegrationImplementation.GetString("Cannot continue until the sequencing session has begun."));
                return returnValue;
            }

            if ((!currentActivity.IsTheRoot()) && (parentActivity.LearningObject.SequencingData.ControlFlow === true)) {

                if (currentActivity.IsActive()) {

                    returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_EXIT, SEQUENCING_REQUEST_CONTINUE, null, null, "");
                    return returnValue;
                } else {

                    returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, null, SEQUENCING_REQUEST_CONTINUE, null, null, "");
                    return returnValue;
                }
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-4", null, IntegrationImplementation.GetString("Please select a menu item to continue with {0}.", parentActivityTitle));
                return returnValue;
            }
            break;

        case NAVIGATION_REQUEST_PREVIOUS:

            if (!this.IsCurrentActivityDefined()) {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-2", null, IntegrationImplementation.GetString("Cannot move backwards until the sequencing session has begun."));
                return returnValue;
            }

            if (!currentActivity.IsTheRoot()) {

                if (parentActivity.LearningObject.SequencingData.ControlFlow === true && parentActivity.LearningObject.SequencingData.ControlForwardOnly === false) {

                    if (currentActivity.IsActive()) {

                        returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_EXIT, SEQUENCING_REQUEST_PREVIOUS, null, null, "");
                        return returnValue;
                    } else {

                        returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, null, SEQUENCING_REQUEST_PREVIOUS, null, null, "");
                        return returnValue;
                    }
                } else {

                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-5", null, IntegrationImplementation.GetString("Please select a menu item to continue with {0}.", parentActivity.GetTitle()));
                    return returnValue;
                }
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-6", null, IntegrationImplementation.GetString("You have reached the beginning of the course."));
                return returnValue;
            }
            break;

        case NAVIGATION_REQUEST_FORWARD:

            returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-7", null, IntegrationImplementation.GetString("The 'Forward' navigation request is not supported, try using 'Continue'."));
            return returnValue;
            //break;

        case NAVIGATION_REQUEST_BACKWARD:

            returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-7", null, IntegrationImplementation.GetString("The 'Backward' navigation request is not supported, try using 'Previous'."));
            return returnValue;
            //break;

        case NAVIGATION_REQUEST_CHOICE:

            if (this.DoesActivityExist(targetActivityIdentifier)) {

                var targetActivity = this.GetActivityFromIdentifier(targetActivityIdentifier);
                var targetParentActivity = this.Activities.GetParentActivity(targetActivity);

                //not in pseudo code
                if (targetActivity.IsAvailable() === false) {
                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-7", null, IntegrationImplementation.GetString("The activity '{0}' was not selected to be delivered in this attempt.", targetActivity));
                    return returnValue;
                }

                if (targetActivity.IsTheRoot() || targetParentActivity.LearningObject.SequencingData.ControlChoice === true) {

                    if (!this.IsCurrentActivityDefined()) {

                        returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, null, SEQUENCING_REQUEST_CHOICE, null, targetActivity, "");
                        return returnValue;
                    }

                    if (!this.AreActivitiesSiblings(currentActivity, targetActivity)) {

                        var commonAncestor = this.FindCommonAncestor(currentActivity, targetActivity);

                        //var aryParentActivities = this.GetActivityPath(currentActivity, true);    //removed for addendum 3.8 / 3.9
                        var aryParentActivities = this.GetPathToAncestorExclusive(currentActivity, commonAncestor, true);

                        if (aryParentActivities.length > 0) {

                            for (var i = 0; i < aryParentActivities.length; i++) {

                                //stop the loop at the common ancestor
                                if (aryParentActivities[i].GetItemIdentifier() == commonAncestor.GetItemIdentifier()) {
                                    break;
                                }

                                if (aryParentActivities[i].IsActive() === true && aryParentActivities[i].LearningObject.SequencingData.ControlChoiceExit === false) {

                                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, CONTROL_CHOICE_EXIT_ERROR_NAV, null, IntegrationImplementation.GetString("You must complete '{0}' before you can select another item.", aryParentActivities[i]));
                                    return returnValue;
                                }
                            }
                        } else {

                            returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-9", null, IntegrationImplementation.GetString("Nothing to open"));
                            return returnValue;
                        }
                    }

                    if (currentActivity.IsActive() && currentActivity.GetSequencingControlChoiceExit() === false) {
                        returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, CONTROL_CHOICE_EXIT_ERROR_NAV, null, IntegrationImplementation.GetString("You are not allowed to jump out of {0}.", currentActivity.GetTitle()));
                        return returnValue;
                    }

                    if (currentActivity.IsActive()) {

                        returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_EXIT, SEQUENCING_REQUEST_CHOICE, null, targetActivity, "");
                        return returnValue;
                    } else {

                        returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, null, SEQUENCING_REQUEST_CHOICE, null, targetActivity, "");
                        return returnValue;
                    }
                } else {

                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-10", null, IntegrationImplementation.GetString("Please select 'Next' or 'Previous' to move through {0}.", targetParentActivity.GetTitle()));
                    return returnValue;
                }
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-11", null, IntegrationImplementation.GetString("The activity you selected ({0}) does not exist.", targetActivityIdentifier));
                return returnValue;
            }
            break;

        case NAVIGATION_REQUEST_EXIT:

            if (this.IsCurrentActivityDefined()) {

                if (currentActivity.IsActive()) {

                    returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_EXIT, SEQUENCING_REQUEST_EXIT, null, null, "");
                    return returnValue;
                } else {

                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-12", null, IntegrationImplementation.GetString("The Exit navigation request is invalid because the current activity ({0}) is no longer active.", currentActivity.GetTitle()));
                    return returnValue;
                }
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-2", null, IntegrationImplementation.GetString("The Exit navigation request is invalid because there is no current activity."));
                return returnValue;
            }

            break;

        case NAVIGATION_REQUEST_EXIT_ALL:

            if (this.IsCurrentActivityDefined()) {

                returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_EXIT_ALL, SEQUENCING_REQUEST_EXIT, null, null, "");
                return returnValue;
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-2", null, IntegrationImplementation.GetString("The Exit All navigation request is invalid because there is no current activity."));
                return returnValue;
            }
            break;

        case NAVIGATION_REQUEST_ABANDON:

            if (this.IsCurrentActivityDefined()) {

                if (currentActivity.IsActive()) {

                    returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_ABANDON, SEQUENCING_REQUEST_EXIT, null, null, "");
                    return returnValue;
                } else {

                    returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-12", null, IntegrationImplementation.GetString("The 'Abandon' navigation request is invalid because the current activity '{0}' is no longer active.", currentActivity.GetTitle()));
                    return returnValue;
                }
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-2", null, IntegrationImplementation.GetString("The 'Abandon' navigation request is invalid because there is no current activity."));
                return returnValue;
            }
            break;

        case NAVIGATION_REQUEST_ABANDON_ALL:

            if (this.IsCurrentActivityDefined()) {

                returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_ABANDON_ALL, SEQUENCING_REQUEST_EXIT, null, null, "");
                return returnValue;
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-2", null, IntegrationImplementation.GetString("You cannot use 'Abandon All' if no item is currently open."));
                return returnValue;
            }
            break;

        case NAVIGATION_REQUEST_SUSPEND_ALL:

            if (this.IsCurrentActivityDefined()) {

                returnValue = new Sequencer_NavigationRequestProcessResult(navigationRequest, TERMINATION_REQUEST_SUSPEND_ALL, SEQUENCING_REQUEST_EXIT, null, null, "");
                return returnValue;
            } else {

                returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-2", null, IntegrationImplementation.GetString("The 'Suspend All' navigation request is invalid because there is no current activity."));
                return returnValue;
            }
            break;

        default:

            returnValue = new Sequencer_NavigationRequestProcessResult(NAVIGATION_REQUEST_NOT_VALID, null, null, "NB.2.1-13", null, IntegrationImplementation.GetString("Undefined Navigation Request"));
            return returnValue;
            //break;

    }

}

function Sequencer_NavigationRequestProcessResult(navigationRequest, terminationRequest, sequencingRequest, exception, targetActivity, exceptionText) {

    this.NavigationRequest = navigationRequest;
    this.TerminationRequest = terminationRequest;
    this.SequencingRequest = sequencingRequest;
    this.Exception = exception;
    this.TargetActivity = targetActivity;
    this.ExceptionText = exceptionText;
}

Sequencer_NavigationRequestProcessResult.prototype.toString = function() {
    return "NavigationRequest=" + this.NavigationRequest +
        ", TerminationRequest=" + this.TerminationRequest +
        ", SequencingRequest=" + this.SequencingRequest +
        ", Exception=" + this.Exception +
        ", TargetActivity=" + this.TargetActivity +
        ", ExceptionText=" + this.ExceptionText;
};
