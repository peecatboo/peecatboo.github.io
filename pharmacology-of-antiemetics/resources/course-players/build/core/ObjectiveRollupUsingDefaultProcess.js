//****************************************************************************************************************

//Objective Rollup Using Default Process [RB.1.2 c]

//    For an activity; may change the Objective Information for the activity

//For the primary objective of an activity, this process changes the success status if appropriate based on the default rollup rules

//    Reference:

function Sequencer_ObjectiveRollupUsingDefaultProcess(activity, callingLog) {

    var satisfied;
    var attempted;
    var notSatisfied;

    if (activity.IsALeaf()) {
        return;
    }

    //get the primary objective

    var targetObjective = null;

    var i;

    /*
     var objectives = activity.GetObjectives();
    for (i=0; i < objectives.length; i++){

         if (objectives[i].GetContributesToRollup() === true){

             targetObjective = objectives[i];

             break;
        }
    }
    */

    var targetObjective = activity.GetPrimaryObjective();

    //get applicable child set
    var applicableChildren = activity.GetChildren();

    var allNotSatisfied = true;

    var allSatisfied = true;

    var isEmptySet = true;

    for (i = 0; i < applicableChildren.length; i++) {

        if (applicableChildren[i].IsTracked()) {

            satisfied = applicableChildren[i].IsSatisfied();

            attempted = applicableChildren[i].IsAttempted();

            notSatisfied = (satisfied === false || attempted === true);

            if (this.CheckChildForRollupSubprocess(applicableChildren[i], ROLLUP_RULE_ACTION_SATISFIED)) {
                allSatisfied = (allSatisfied && (satisfied === true));
                isEmptySet = false;
            }

            if (this.CheckChildForRollupSubprocess(applicableChildren[i], ROLLUP_RULE_ACTION_NOT_SATISFIED)) {
                allNotSatisfied = (allNotSatisfied && notSatisfied);
                isEmptySet = false;
            }

        }
    }

    if (isEmptySet && Control.Package.Properties.RollupEmptySetToUnknown) {

        // Leave unknown, we don't have to explicitly set anything.
    } else {

        if (allNotSatisfied === true) {

            targetObjective.SetProgressStatus(true, false, activity);

            targetObjective.SetSatisfiedStatus(false, false, activity);
        }

        if (allSatisfied === true) {

            targetObjective.SetProgressStatus(true, false, activity);

            targetObjective.SetSatisfiedStatus(true, false, activity);
        }
    }

}
