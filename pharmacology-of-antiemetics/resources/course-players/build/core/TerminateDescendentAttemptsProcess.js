//****************************************************************************************************************
//Terminate Descendent Attempts Process [UP.3]
//For an activity
//Reference:
//Current Activity AM.1.2
//End Attempt Process UP.4

function Sequencer_TerminateDescendentAttemptsProcess(activity, callingLog) {

    var commonAncestor = this.FindCommonAncestor(activity, this.GetCurrentActivity());

    var aryParents = this.GetPathToAncestorExclusive(this.GetCurrentActivity(), commonAncestor, false);

    var rollupSet = new Array();

    if (aryParents.length > 0) {

        for (var i = 0; i < aryParents.length; i++) {

            rollupSet = rollupSet.concat(this.EndAttemptProcess(aryParents[i], true));

        }
    }

    //as a performance optimization, we'll rollup any activities that we terminated here instead of in end attempt...this prevents parent activities from being rollup up twice
    var distinctRollupActivities = this.GetMinimalSubsetOfActivitiesToRollup(rollupSet, null);

    for (var rollupActivity in distinctRollupActivities) {
        if (!distinctRollupActivities.hasOwnProperty(rollupActivity)) {
            continue;
        }
        this.OverallRollupProcess(distinctRollupActivities[rollupActivity]);
    }

    return;
}
