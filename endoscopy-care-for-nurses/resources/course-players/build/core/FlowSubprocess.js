//****************************************************************************************************************

//Flow Subprocess [SB.2.3]

//For an activity, a traversal direction, and a consider children flag; indicates if the flow was successful and at what activity the flow stopped; may return an exception code

//Reference:
//Flow Activity Traversal Subprocess SB.2.2
//Flow Tree Traversal Subprocess SB.2.1

function Sequencer_FlowSubprocess(activity, traversalDirection, considerChildren, callingLog) {

    var returnValue;

    var candidateActivity = activity;

    var flowTreeTraversalResult = this.FlowTreeTraversalSubprocess(candidateActivity, traversalDirection, null, considerChildren);

    if (flowTreeTraversalResult.NextActivity === null) {

        returnValue = new Sequencer_FlowSubprocessResult(candidateActivity, false, flowTreeTraversalResult.Exception, flowTreeTraversalResult.ExceptionText, flowTreeTraversalResult.EndSequencingSession);
        return returnValue;
    } else {

        candidateActivity = flowTreeTraversalResult.NextActivity;

        var flowActivityTraversalResult = this.FlowActivityTraversalSubprocess(candidateActivity, traversalDirection, null);

        returnValue = new Sequencer_FlowSubprocessResult(flowActivityTraversalResult.NextActivity, flowActivityTraversalResult.Deliverable, flowActivityTraversalResult.Exception, flowActivityTraversalResult.ExceptionText, flowActivityTraversalResult.EndSequencingSession);
        return returnValue;
    }

}

function Sequencer_FlowSubprocessResult(identifiedActivity, deliverable, exception, exceptionText, endSequencingSession) {

    this.IdentifiedActivity = identifiedActivity;
    this.Deliverable = deliverable;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
    this.EndSequencingSession = endSequencingSession;
}

Sequencer_FlowSubprocessResult.prototype.toString = function() {
    return "IdentifiedActivity=" + this.IdentifiedActivity +
        ", Deliverable=" + this.Deliverable +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText +
        ", EndSequencingSession=" + this.EndSequencingSession;
};
