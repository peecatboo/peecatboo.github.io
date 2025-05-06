//****************************************************************************************************************

//Sequencing Exit Action Rules Subprocess [TB.2.1]

//    For the Current Activity; may change the Current Activity

//    Reference:
//Current Activity AM.1.2
//End Attempt Process UP.4
//Sequencing Rules Check Process UP.2
//Sequencing Rule Description SM.2
//Terminate Descendent Attempts Process UP.3

function Sequencer_SequencingExitActionRulesSubprocess(callingLog) {

    var currentActivity = this.GetCurrentActivity();
    var parentActivity = this.Activities.GetParentActivity(currentActivity);

    var aryParentActivities;

    if (parentActivity !== null) {
        aryParentActivities = this.GetActivityPath(parentActivity, true);
    } else {
        //if the parent activity is null, then the current activity must be the root, so use it
        aryParentActivities = this.GetActivityPath(currentActivity, true);
    }

    var exitTarget = null;
    var ruleCheckReturnValue = null;

    for (var i = (aryParentActivities.length - 1); i >= 0; i--) {

        ruleCheckReturnValue = this.SequencingRulesCheckProcess(aryParentActivities[i], RULE_SET_EXIT);

        if (ruleCheckReturnValue !== null) {

            exitTarget = aryParentActivities[i];

            break;

        }
    }

    if (exitTarget !== null) {

        this.TerminateDescendentAttemptsProcess(exitTarget);

        this.EndAttemptProcess(exitTarget, false);

        this.SetCurrentActivity(exitTarget);
    }

    return;

}
