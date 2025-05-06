//****************************************************************************************************************

//Overall Sequencing Process [OP.1]

//Reference:
//Content Delivery Environment Process DB.2
//Delivery Request Process DB.1.3
//Navigation Request Process NB.2.1
//Sequencing Request Process SB.2.12
//Termination Request Process TB.2.3

//Accepts - Navigation Request
//Call this function in response to a navigation request from the LMS/RTE
//There are three types of requests, Navigation, Sequencing, Delivery (also Termination)

function Sequencer_OverallSequencingProcess(callingLog) {
    try {

        var terminationRequest = null;
        var sequencingRequest = null;
        var targetActivity = null;
        var deliveryRequest = null;
        var endSequencingSession = null;

        this.ResetException();

        //extensions for Rustici SCP Only***********************
        //NOTE - this code is now obsolete, the GetExitAction will always return DisplayMessage

        if (this.NavigationRequest === null) {

            var exitAction = this.GetExitAction(this.GetCurrentActivity());

            //TODO: add get text to integration layer
            var messageText = "";

            if (exitAction == EXIT_ACTION_EXIT_CONFIRMATION ||
                exitAction == EXIT_ACTION_DISPLAY_MESSAGE) {

                var rootActivity = Control.Activities.GetRootActivity();
                var courseIsSatisfied = (rootActivity.IsCompleted() || rootActivity.IsSatisfied());

                if (courseIsSatisfied === true) {
                    messageText = IntegrationImplementation.GetString("The course is now complete. Please make a selection to continue.");
                } else {
                    messageText = IntegrationImplementation.GetString("Please make a selection.");
                }
            }

            switch (exitAction) {

                case (EXIT_ACTION_EXIT_NO_CONFIRMATION):
                    this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_EXIT_ALL, null, "");
                    break;

                case (EXIT_ACTION_EXIT_CONFIRMATION):
                    //TODO: add get text to integration layer

                    if (confirm("Would you like to exit the course now?")) {
                        this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_EXIT_ALL, null, "");
                    } else {
                        this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_DISPLAY_MESSAGE, null, messageText);
                    }
                    break;

                case (EXIT_ACTION_GO_TO_NEXT_SCO):
                    this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_CONTINUE, null, "");
                    break;

                case (EXIT_ACTION_DISPLAY_MESSAGE):
                    this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_DISPLAY_MESSAGE, null, messageText);
                    break;

                case (EXIT_ACTION_DO_NOTHING):
                    this.NavigationRequest = null;
                    break;

                case (EXIT_ACTION_REFRESH_PAGE):
                    Control.RefreshPage();
                    break;
            }
        }

        if (this.NavigationRequest == null) {
            return;
        }

        //END extensions for Rustici SCP Only***********************

        //This code below is important to ensure that upong exit of a single sco, we will exit the player.
        //When cleaning up the above, remember to test that scenario.
        if (this.NavigationRequest.Type == NAVIGATION_REQUEST_DISPLAY_MESSAGE) {
            //return;

            //translate this to a an exit request
            this.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_EXIT, null, "")
        }
        if (this.NavigationRequest.Type == NAVIGATION_REQUEST_EXIT_PLAYER) {
            Control.ExitScormPlayer("Sequencer");
            return;
        }

        var navigationRequestResult = this.NavigationRequestProcess(this.NavigationRequest.Type, this.NavigationRequest.TargetActivity);

        if (navigationRequestResult.NavigationRequest == NAVIGATION_REQUEST_NOT_VALID) {

            this.Exception = navigationRequestResult.Exception;
            this.ExceptionText = navigationRequestResult.ExceptionText;

            return false;
        }

        terminationRequest = navigationRequestResult.TerminationRequest;
        sequencingRequest = navigationRequestResult.SequencingRequest;
        targetActivity = navigationRequestResult.TargetActivity;

        if (terminationRequest !== null) {

            var terminationRequestResult = this.TerminationRequestProcess(terminationRequest);

            if (terminationRequestResult.TerminationRequest == TERMINATION_REQUEST_NOT_VALID) {

                this.Exception = terminationRequestResult.Exception;
                this.ExceptionText = terminationRequestResult.ExceptionText;

                return false;
            }

            if (terminationRequestResult.SequencingRequest !== null) {

                sequencingRequest = terminationRequestResult.SequencingRequest;
            }

        }

        if (sequencingRequest !== null) {

            var sequencingRequestResult = this.SequencingRequestProcess(sequencingRequest, targetActivity);

            if (sequencingRequestResult.SequencingRequest == SEQUENCING_REQUEST_NOT_VALID) {

                this.Exception = sequencingRequestResult.Exception;
                this.ExceptionText = sequencingRequestResult.ExceptionText;

                return false;
            }

            if (sequencingRequestResult.EndSequencingSession === true) {

                Control.ExitScormPlayer("Sequencer");

                return;
            }

            if (sequencingRequestResult.DeliveryRequest === null) {

                this.Exception = "OP.1.4";
                this.ExceptionText = IntegrationImplementation.GetString("Please make a selection.");

                //the SCO should have already been unloaded, don't unload it again because that will trigger the overall sequencing process again

                return;
            }

            deliveryRequest = sequencingRequestResult.DeliveryRequest;
        }

        if (deliveryRequest !== null) {

            var deliveryRequestResult = this.DeliveryRequestProcess(deliveryRequest);

            if (deliveryRequestResult.Valid === false) {

                //This condition can occur when a previos attempt was suspended when the current sco was not active (such
                //as right after an exit request). When this happens, the root activity is the suspended activity and nothing
                //is identified for delivery.

                this.Exception = "OP.1.5";
                this.ExceptionText = IntegrationImplementation.GetString("Please make a selection.");

                return false;
            }

            //        // We only mark events that lead to Sco delivery
            //        var historyAtts = {ev:'SequencerPicksActivity'};
            //        if (this.CurrentActivity) {
            //            historyAtts.ai = this.CurrentActivity.ItemIdentifier;
            //        }

            //        if (deliveryRequest) {
            //            historyAtts.tai = deliveryRequest.ItemIdentifier;
            //            historyAtts.tat = deliveryRequest.LearningObject.Title;
            //        }
            //
            //        historyAtts.nt = (this.NavigationRequest.Type ? this.NavigationRequest.Type : "NONE PROVIDED");
            //        this.WriteHistoryLog("", historyAtts);

            this.ContentDeliveryEnvironmentProcess(deliveryRequest);

        }

        return;

    } catch (error) {
        var msgStr = "Error in OverallSequencingProcess for SCORM 2004 3rd Edition: ";
        if (typeof RegistrationToDeliver != "undefined" && typeof RegistrationToDeliver.Id != "undefined") {
            msgStr = msgStr + "RegistrationId: " + RegistrationToDeliver.Id + ", ";
        }
        Control.Comm.LogOnServer(msgStr, error);
        throw error;
    }

}
