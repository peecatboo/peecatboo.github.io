//****************************************************************************************************************
//Flow Activity Traversal Subprocess [SB.2.2]

//For an activity, a traversal direction, and a previous traversal direction; returns the 'next' activity in a directed traversal of the activity tree and True if the activity can be delivered; may return an exception code)

//Reference:
//Check Activity Process UP.5
//Flow Activity Traversal Subprocess SB.2.2
//Flow Tree Traversal Subprocess SB.2.1
//Sequencing Control Flow SM.1
//Sequencing Rules Check Process UP.2

function Sequencer_FlowActivityTraversalSubprocess(activity, traversalDirection, previousTraversalDirection, callingLog) {

    var sequencingRulesCheckResult;
    var flowTreeTraversalResult;
    var flowActivityTraversalResult;
    var checkActivityResult;

    var returnValue;

    var parentActivity = this.Activities.GetParentActivity(activity);

    if (parentActivity.GetSequencingControlFlow() === false) {
        returnValue = new Sequencer_FlowActivityTraversalSubprocessReturnObject(false, activity, "SB.2.2-1", IntegrationImplementation.GetString("Please select a menu item to continue with {0}.", parentActivity.GetTitle()), false);
        return returnValue;
    }

    sequencingRulesCheckResult = this.SequencingRulesCheckProcess(activity, RULE_SET_SKIPPED);

    if (sequencingRulesCheckResult !== null) {

        flowTreeTraversalResult = this.FlowTreeTraversalSubprocess(activity, traversalDirection, previousTraversalDirection, false);

        if (flowTreeTraversalResult.NextActivity === null) {

            returnValue = new Sequencer_FlowActivityTraversalSubprocessReturnObject(false, activity, flowTreeTraversalResult.Exception, flowTreeTraversalResult.ExceptionText, flowTreeTraversalResult.EndSequencingSession);
            return returnValue;
        } else {

            if (previousTraversalDirection == FLOW_DIRECTION_BACKWARD &&
                flowTreeTraversalResult.TraversalDirection == FLOW_DIRECTION_BACKWARD) {

                //The pseudo code strictly says to use "traversalDirection" here, however the newsgroup posts (search on "cm-3b") say this needs to be the traversal
                //direction returned by the last call to FlowTreeTraversalSubprocess. Need to make the newsgroup change to make it work. Confirmed with Angelo.

                //flowActivityTraversalResult = this.FlowActivityTraversalSubprocess(flowTreeTraversalResult.NextActivity, traversalDirection, null);
                flowActivityTraversalResult = this.FlowActivityTraversalSubprocess(flowTreeTraversalResult.NextActivity, flowTreeTraversalResult.TraversalDirection, null);
            } else {

                flowActivityTraversalResult = this.FlowActivityTraversalSubprocess(flowTreeTraversalResult.NextActivity, traversalDirection, previousTraversalDirection);
            }

            returnValue = flowActivityTraversalResult;
            return returnValue;
        }

    }

    checkActivityResult = this.CheckActivityProcess(activity);

    if (checkActivityResult === true) {

        returnValue = new Sequencer_FlowActivityTraversalSubprocessReturnObject(false, activity, "SB.2.2-2", IntegrationImplementation.GetString("'{0}' is not available at this time.  Please select another menu item to continue.", activity.GetTitle()), false);
        return returnValue;
    }

    if (activity.IsALeaf() === false) {

        flowTreeTraversalResult = this.FlowTreeTraversalSubprocess(activity, traversalDirection, null, true);

        if (flowTreeTraversalResult.NextActivity === null) {

            returnValue = new Sequencer_FlowActivityTraversalSubprocessReturnObject(false, activity, flowTreeTraversalResult.Exception, flowTreeTraversalResult.ExceptionText, flowTreeTraversalResult.EndSequencingSession);
            return returnValue;
        } else {

            if (traversalDirection == FLOW_DIRECTION_BACKWARD &&
                flowTreeTraversalResult.TraversalDirection == FLOW_DIRECTION_FORWARD) {

                flowActivityTraversalResult = this.FlowActivityTraversalSubprocess(flowTreeTraversalResult.NextActivity, FLOW_DIRECTION_FORWARD, FLOW_DIRECTION_BACKWARD);
            } else {

                flowActivityTraversalResult = this.FlowActivityTraversalSubprocess(flowTreeTraversalResult.NextActivity, traversalDirection, null);
            }

            returnValue = flowActivityTraversalResult;
            return returnValue;
        }
    }

    returnValue = new Sequencer_FlowActivityTraversalSubprocessReturnObject(true, activity, null, "", false);
    return returnValue;

}

function Sequencer_FlowActivityTraversalSubprocessReturnObject(deliverable, nextActivity, exception, exceptionText, endSequencingSession) {

    this.Deliverable = deliverable;
    this.NextActivity = nextActivity;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.EndSequencingSession = endSequencingSession;

}

Sequencer_FlowActivityTraversalSubprocessReturnObject.prototype.toString = function() {
    return "Deliverable=" + this.Deliverable +
        ", NextActivity=" + this.NextActivity +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", EndSequencingSession=" + this.EndSequencingSession;
};
