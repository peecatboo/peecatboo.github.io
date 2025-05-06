//****************************************************************************************************************
//Objective Rollup Using Measure Process [RB.1.2 a]
//    For an activity; may change the Objective Information for the activity
//For the primary objective of an activity, this process changes the success status if appropriate based on the normalized measure
//    Reference:
//Objective Contributes to Rollup SM.6;
//Objective Description SM.6;
//Objective Satisfied by Measure SM.6;
//Objective Measure Status TM.1.1;
//Objective Normalized Measure TM.1.1;
//Objective Progress Status TM.1.1;
//Objective Satisfied Status TM.1.1;
//Activity is Active AM.1.1;
//adlseq:measureSatisfactionIfActive SCORM SN.

function Sequencer_ObjectiveRollupUsingMeasureProcess(activity, callingLog) {
    var targetObjective = null;
    /*
     var objectives = activity.GetObjectives();
    for (var i=0; i < objectives.length; i++){

         if (objectives[i].GetContributesToRollup() === true){

             targetObjective = objectives[i];

             break;
        }
    }
    */
    var targetObjective = activity.GetPrimaryObjective();
    if (targetObjective !== null) {
        if (targetObjective.GetSatisfiedByMeasure() === true) {
            if (targetObjective.GetMeasureStatus(activity, false) === false) {
                targetObjective.SetProgressStatus(false, false, activity);
            } else {
                //note, second check for "activity is active is true" is redundent b/c if we get into the OR, it must be true
                if (
                    activity.IsActive() === false ||
                    activity.GetMeasureSatisfactionIfActive() === true) {
                    if (targetObjective.GetNormalizedMeasure(activity, false) >= targetObjective.GetMinimumSatisfiedNormalizedMeasure()) {
                        targetObjective.SetProgressStatus(true, false, activity);
                        targetObjective.SetSatisfiedStatus(true, false, activity);
                    } else {
                        targetObjective.SetProgressStatus(true, false, activity);
                        targetObjective.SetSatisfiedStatus(false, false, activity);
                    }
                } else {
                    targetObjective.SetProgressStatus(false, false, activity);
                }
            }
        }
        return;
    } else {
        return;
    }
}
