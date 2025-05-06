//[SB.2.1]Flow Tree Traversal Subprocess [SB.2.1]
//[SB.2.1]For an activity, a traversal direction, a consider children flag, and a previous traversal direction; returns the 'next' activity in directed traversal of the activity tree, may return the traversal direction, and may return an exception code

//[SB.2.1]Reference:
//[SB.2.1]Available Children AM.1.1
//[SB.2.1]Flow Activity Traversal Subprocess SB.2.2
//[SB.2.1]Sequencing Control Forward Only SM.1
//[SB.2.1]Sequencing Rules Check Process UP.2

function Sequencer_FlowTreeTraversalSubprocess(activity, traversalDirection, previousTraversalDirection, considerChildren, callingLog) {

    var reversedDirection;
    var flowTreeTraversalResult;
    var nextAvailableActivity;
    var availableChildren;
    var previousAvailableActivity;

    var returnValue;

    var parentActivity = this.Activities.GetParentActivity(activity);

    reversedDirection = false;

    if (previousTraversalDirection !== null &&
        previousTraversalDirection == FLOW_DIRECTION_BACKWARD &&
        parentActivity.IsActivityTheLastAvailableChild(activity)) {

        traversalDirection = FLOW_DIRECTION_BACKWARD;

        activity = parentActivity.GetFirstAvailableChild();

        reversedDirection = true;
    }

    if (traversalDirection == FLOW_DIRECTION_FORWARD) {

        if (
            (this.IsActivityLastOverall(activity)) ||
            (considerChildren === false && activity.IsTheRoot() === true)
        ) {

            this.TerminateDescendentAttemptsProcess(this.Activities.GetRootActivity());

            returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(null, null, null, null, true);
            return returnValue;
        }

        if (activity.IsALeaf() || considerChildren === false) {

            //in sequencing test case RU-7c, if you complete activity #5 at the end and hit continue, we get an error here because parentActivity is null....figure out
            //what the correct behavior is
            //same thing happens in Competency Photoshop example when you pass the pretest and hit next
            //note - this behavior should be corrected in the TerminationRequestProcess, lines 3.4 & 3.4.1 which are being added to the pseudo code

            if (parentActivity.IsActivityTheLastAvailableChild(activity)) {

                flowTreeTraversalResult = this.FlowTreeTraversalSubprocess(parentActivity, FLOW_DIRECTION_FORWARD, null, false);

                returnValue = flowTreeTraversalResult;
                return returnValue;

            } else {

                nextAvailableActivity = parentActivity.GetNextActivity(activity);

                returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(nextAvailableActivity, traversalDirection, null, "", false);
                return returnValue;
            }

        } else {

            availableChildren = activity.GetAvailableChildren();

            if (availableChildren.length > 0) {

                returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(availableChildren[0], traversalDirection, null, "", false);
                return returnValue;
            } else {

                returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(null, null, "SB.2.1-2", IntegrationImplementation.GetString("The activity '{0}' does not have any available children to deliver.", activity.GetTitle()), false);
                return returnValue;
            }
        }
    }

    if (traversalDirection == FLOW_DIRECTION_BACKWARD) {

        if (activity.IsTheRoot()) {

            returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(null, null, "SB.2.1-3", IntegrationImplementation.GetString("You have reached the beginning of the course."), false);
            return returnValue;
        }

        if (activity.IsALeaf() || considerChildren === false) {

            if (reversedDirection === false) {

                if (parentActivity.GetSequencingControlForwardOnly() === true) {

                    returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(null, null, "SB.2.1-4", IntegrationImplementation.GetString("The activity '{0}' may only be entered from the beginning.", parentActivity.GetTitle()), false);
                    return returnValue;
                }
            }

            if (parentActivity.IsActivityTheFirstAvailableChild(activity)) {

                flowTreeTraversalResult = this.FlowTreeTraversalSubprocess(parentActivity, FLOW_DIRECTION_BACKWARD, null, false);

                returnValue = flowTreeTraversalResult;
                return returnValue;
            } else {

                previousAvailableActivity = parentActivity.GetPreviousActivity(activity);

                returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(previousAvailableActivity, traversalDirection, null, "", false);
                return returnValue;
            }
        } else {

            availableChildren = activity.GetAvailableChildren();

            if (availableChildren.length > 0) {

                if (activity.GetSequencingControlForwardOnly() === true) {

                    returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(availableChildren[0], FLOW_DIRECTION_FORWARD, null, "", false);
                    return returnValue;
                } else {
                    returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(availableChildren[availableChildren.length - 1], FLOW_DIRECTION_BACKWARD, null, "", false);
                    return returnValue;
                }
            } else {
                returnValue = new Sequencer_FlowTreeTraversalSubprocessReturnObject(null, null, "SB.2.1-2", IntegrationInterface.GetString("The activity '{0}' may only be entered from the beginning.", parentActivity.GetTitle()), false);
                return returnValue;
            }
        }
    }

}

function Sequencer_FlowTreeTraversalSubprocessReturnObject(nextActivity, traversalDirection, exception, exceptionText, endSequencingSession) {

    this.NextActivity = nextActivity;
    this.TraversalDirection = traversalDirection;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.EndSequencingSession = endSequencingSession;
}

Sequencer_FlowTreeTraversalSubprocessReturnObject.prototype.toString = function() {
    return "NextActivity=" + this.NextActivity +
        ", TraversalDirection=" + this.TraversalDirection +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", EndSequencingSession=" + this.EndSequencingSession;
};
