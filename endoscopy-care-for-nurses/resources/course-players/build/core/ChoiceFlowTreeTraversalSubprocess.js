//****************************************************************************************************************

//Choice Flow Tree Traversal Subprocess [SB.2.9.2]
//For an activity, a traversal direction; returns the 'next' activity in directed traversal of the activity tree
//Reference:
//Available Children AM.1.1

function Sequencer_ChoiceFlowTreeTraversalSubprocess(activity, flowDirection, callingLog) {

    var parentActivity = this.Activities.GetParentActivity(activity);
    var choiceFlowTreeTraversalResult = null;
    var nextActivity = null;
    var previousActivity = null;

    if (flowDirection == FLOW_DIRECTION_FORWARD) {

        if (this.IsActivityLastOverall(activity) ||
            activity.IsTheRoot() === true) {
            return null;
        }

        if (parentActivity.IsActivityTheLastAvailableChild(activity)) {

            choiceFlowTreeTraversalResult = this.ChoiceFlowTreeTraversalSubprocess(parentActivity, FLOW_DIRECTION_FORWARD);

            return choiceFlowTreeTraversalResult;
        } else {

            nextActivity = parentActivity.GetNextActivity(activity);

            return nextActivity;
        }
    }

    if (flowDirection == FLOW_DIRECTION_BACKWARD) {

        if (activity.IsTheRoot()) {
            return null;
        }

        if (parentActivity.IsActivityTheFirstAvailableChild(activity)) {

            choiceFlowTreeTraversalResult = this.ChoiceFlowTreeTraversalSubprocess(parentActivity, FLOW_DIRECTION_BACKWARD);

            return choiceFlowTreeTraversalResult;
        } else {

            previousActivity = parentActivity.GetPreviousActivity(activity);

            return previousActivity;
        }
    }

}
