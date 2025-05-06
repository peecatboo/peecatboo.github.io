//****************************************************************************************************************

//Clear Suspended Activity Subprocess [DB.2.1]
//For an activity; may change the Suspended Activity
//Reference:
//Activity is Suspended AM.1.1
//Suspended Activity AM.1.2

function Sequencer_ClearSuspendedActivitySubprocess(activity, callingLog) {

    var commonAncestor = null;
    var suspendedActivity = null;
    var activityPath = null;

    if (this.IsSuspendedActivityDefined()) {

        suspendedActivity = this.GetSuspendedActivity();
        commonAncestor = this.FindCommonAncestor(activity, suspendedActivity);

        activityPath = this.GetPathToAncestorInclusive(suspendedActivity, commonAncestor);

        if (activityPath.length > 0) {

            for (var i = 0; i < activityPath.length; i++) {

                if (activityPath[i].IsALeaf()) {
                    activityPath[i].SetSuspended(false);
                } else {

                    if (activityPath[i].HasSuspendedChildren() === false) {

                        activityPath[i].SetSuspended(false);
                    }
                }
            }
        }

        this.ClearSuspendedActivity();
    }

    return;

}
