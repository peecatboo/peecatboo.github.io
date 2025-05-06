//****************************************************************************************************************

//End Attempt Process [UP.4]
//For an activity
//Reference:
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Attempt Completion Status TM.1.2.2
//Attempt Progress Status TM.1.2.2
//Completion Set by Content SM.11
//Objective Contributes to Rollup SM.6
//Objective Progress Status TM.1.1
//Objective Satisfied Status TM.1.1
//Objective Set by Content SM.11
//Tracked SM.11
//Overall Rollup Process RB.1.4

function Sequencer_EndAttemptProcess(activity, delayRollup, callingLog, isSuspendAll) {

    if (isSuspendAll === undefined || isSuspendAll === null) {
        isSuspendAll = false;
    }

    var i;
    var rollupSet = new Array();

    if (activity.IsALeaf()) {

        // The inclusion of activity.WasLaunchedThisSession() is an extension to the standard pseudo-code. This setting indicates whether
        // the activity was actually presented to the user in the browser.  This code was put into place to address the specific use case
        // when a course is delivered with the package setting "launch in new window after click".  If the user never clicked to open the
        // SCO or asset, it was STILL MARKED AS COMPLETE by the code below.  With this change, we will insure that the user had actually
        // "clicked" to view the course.

        if (activity.IsTracked() && activity.WasLaunchedThisSession()) {

            activity.TransferRteDataToActivity();

            if (activity.IsSuspended() === false) {

                if (activity.IsCompletionSetByContent() === false) {

                    if (activity.GetAttemptProgressStatus() === false) {

                        activity.SetAttemptProgressStatus(true);

                        activity.SetAttemptCompletionStatus(true);

                        activity.WasAutoCompleted = true;
                    }
                }

                if (activity.IsObjectiveSetByContent() === false) {

                    /*
                    this.LogSeq("[UP.4]1.1.1.2.1. For all objectives associated with the activity");
                    var objectives = activity.GetObjectives();
                    for (i=0; i < objectives.length; i++){

                        this.LogSeq("[UP.4]1.1.1.2.1.1. If the Objective Contributes to Rollup for the objective is True Then");

                        if (objectives[i].GetContributesToRollup() === true){

                            this.LogSeq("[UP.4]1.1.1.2.1.1.1. If the Objective Progress Status for the objective is False Then (Did the content inform the sequencer of the activity's rolled-up objective status?)");
                            if (objectives[i].GetProgressStatus(activity) === false){

                                this.LogSeq("[UP.4]1.1.1.2.1.1.1.1. Set the Objective Progress Status for the objective to True");
                                objectives[i].SetProgressStatus(true);

                                this.LogSeq("[UP.4]1.1.1.2.1.1.1.2. Set the Objective Satisfied Status for the objective to True");
                                objectives[i].SetSatisfiedStatus(true);
                            }
                        }
                    }
                    */

                    var primaryObjective = activity.GetPrimaryObjective();

                    if (primaryObjective.GetProgressStatus(activity, false) === false) {

                        primaryObjective.SetProgressStatus(true, false, activity);

                        primaryObjective.SetSatisfiedStatus(true, false, activity);

                        activity.WasAutoSatisfied = true;
                    }
                }

            }
        }
    } else {

        if (this.ActivityHasSuspendedChildren(activity)) {
            activity.SetSuspended(true);
        } else {
            activity.SetSuspended(false);
        }
    }

    if (isSuspendAll === false) {
        // this.LogSeq("[UP.4]3. Set the Activity is Active for the activity to False (The current attempt on this the activity has ended)");
        activity.SetActive(false);
    }

    var aryRolledUpActivities;

    if (delayRollup === false) {
        aryRolledUpActivities = this.OverallRollupProcess(activity);
    } else {
        rollupSet[0] = activity;
    }

    //only apply the overall rollup process to the parents of the affected activities
    //the overall rollup process looks to the children of the activity it is called on to aggregate their information into the activity
    //since the global objective did not affect these children, reading them is not necessary and can even be detremental
    //if the children's status's roll up to a status different than that set by the global objective, then the overall rollup process
    //would actually overwrite the status just set by the global objective

    var activitiesAffectedByWriteMaps = this.FindActivitiesAffectedByWriteMaps(activity);
    var affectedParentActivities = this.FindDistinctParentsOfActivitySet(activitiesAffectedByWriteMaps);

    if (delayRollup === false) {
        var distinctAffectedParentActivities = this.GetMinimalSubsetOfActivitiesToRollup(affectedParentActivities, aryRolledUpActivities);

        for (i = 0; i < distinctAffectedParentActivities.length; i++) {

            if (distinctAffectedParentActivities[i] !== null) {
                this.OverallRollupProcess(distinctAffectedParentActivities[i]);
            }
        }
    } else {
        rollupSet = rollupSet.concat(affectedParentActivities);
    }

    //only bother to randomize on the regular sequencer for efficiency and to avoid errors with the randomization process trying to affect the displayed menu items
    if (this.LookAhead === false && isSuspendAll === false) {
        //re-randomize the children if appropriate
        //do this on the way out for several reasons:
        //-if we did it on the way in, it would look wierd if I was expecting to go to SCO 3, then randomization made SCO 4 first
        //-we do an initial randomization when the course loads
        //-the most logical place for re-randomization on the start of an activity (ContentDeliveryEnvironmentProcess)
        //    has already identified an activity for delivery before the randomization could occur
        this.RandomizeChildrenProcess(activity, true);
    }

    return rollupSet;
}
