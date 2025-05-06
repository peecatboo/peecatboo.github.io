//****************************************************************************************************************

//Start Sequencing Request Process [SB.2.5]
//May return a delivery request; may return an exception code
//Reference:
//Current Activity AM.1.2
//Flow Subprocess SB.2.3

function Sequencer_StartSequencingRequestProcess(callingLog) {

    var returnValue;

    if (this.IsCurrentActivityDefined()) {

        returnValue = new Sequencer_StartSequencingRequestProcessResult(null, "SB.2.5-1", IntegrationImplementation.GetString("You cannot 'Start' an item that is already open."), false);
        return returnValue;
    }

    var rootActivity = this.GetRootActivity();

    if (rootActivity.IsALeaf()) {

        returnValue = new Sequencer_StartSequencingRequestProcessResult(rootActivity, null, "", false);
        return returnValue;
    }
    //jmh 12/13/2010 - always flow to first sco if the course structure is disabled.  This basically handles the case
    //                 where a single sco course has AlwaysFlowToFirstSco = false but doesn't have a course structure
    //                 menu so the user can't launch the sco.
    else if (Control.Package.Properties.AlwaysFlowToFirstSco === true || Control.Package.Properties.ShowCourseStructure == false) {

        var orderedListOfActivities = this.GetOrderedListOfActivities();

        for (var orderedActivity in orderedListOfActivities) {
            if (!orderedListOfActivities.hasOwnProperty(orderedActivity)) {
                continue;
            }

            if (orderedListOfActivities[orderedActivity].IsDeliverable() === true) {
                returnValue = new Sequencer_StartSequencingRequestProcessResult(orderedListOfActivities[orderedActivity], null, "", false);
                return returnValue;
            }
        }

        returnValue = new Sequencer_StartSequencingRequestProcessResult(null, "SB.2.5-2.5", "There are no deliverable activities in this course.", false);
        return returnValue;
    } else {

        var flowSubProcessResult = this.FlowSubprocess(rootActivity, FLOW_DIRECTION_FORWARD, true);

        if (flowSubProcessResult.Deliverable === false) {

            returnValue = new Sequencer_StartSequencingRequestProcessResult(null, flowSubProcessResult.Exception, flowSubProcessResult.ExceptionText, flowSubProcessResult.EndSequencingSession);
            return returnValue;
        } else {

            returnValue = new Sequencer_StartSequencingRequestProcessResult(flowSubProcessResult.IdentifiedActivity, null, "", false);
            return returnValue;
        }
    }
}

function Sequencer_StartSequencingRequestProcessResult(deliveryRequest, exception, exceptionText, endSequencingSession) {

    this.DeliveryRequest = deliveryRequest;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.EndSequencingSession = endSequencingSession;
}

Sequencer_StartSequencingRequestProcessResult.prototype.toString = function() {
    return "DeliveryRequest=" + this.DeliveryRequest +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", EndSequencingSession=" + this.EndSequencingSession;
};
