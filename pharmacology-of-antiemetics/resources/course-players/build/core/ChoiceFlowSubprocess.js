//****************************************************************************************************************

//Choice Flow Subprocess [SB.2.9.1]
//For an activity and a traversal direction; indicates at what activity the flow stopped
//Reference:
//Choice Flow Tree Traversal Subprocess SB.2.9.2

function Sequencer_ChoiceFlowSubprocess(activity, flowDirection, callingLog) {

    var choiceFlowTreeTraversalResult = this.ChoiceFlowTreeTraversalSubprocess(activity, flowDirection);

    if (choiceFlowTreeTraversalResult === null) {

        return activity;
    } else {

        return choiceFlowTreeTraversalResult;
    }

}
