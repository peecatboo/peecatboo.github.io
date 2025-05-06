//****************************************************************************************************************

//Measure Rollup Process [RB.1.1]

//    For an activity; may change the Objective Information for the activity

//This process consolidates the normalized measures of an activity's children's primary objectives into the normalized measure for the primary objective of the activity.

//    Reference:
//Objective Contributes to Rollup SM.6
//Objective Description SM.6
//Objective Measure Status TM.1.1
//Objective Normalized Measure TM.1.1
//Rollup Objective Measure Weight SM.8
//Tracked SM.11

function Sequencer_MeasureRollupProcess(activity, callingLog) {

    var totalWeightedMeasure = 0,
        validData = false,
        countedMeasures = 0,
        targetObjective = activity.GetPrimaryObjective(),
        children = activity.GetChildren(),
        rolledUpObjective = null,
        childObjectives,
        objectiveMeasureWeight,
        normalizedMeasure,
        isSubmitAll = false,
        objectives = activity.GetObjectives(),
        n = children.length,
        i = 0;

    if (targetObjective !== null) {

        for (i = 0; i < n; i++) {

            if (children[i].IsTracked()) {

                rolledUpObjective = null;

                /*
                 childObjectives = children[i].GetObjectives();
                for (var j=0; j < childObjectives.length; j++){
                     if (childObjectives[j].GetContributesToRollup() === true){
                        rolledUpObjective = childObjectives[j];
                         break;
                    }
                }
                */

                var rolledUpObjective = children[i].GetPrimaryObjective();

                if (rolledUpObjective !== null) {

                    objectiveMeasureWeight = children[i].GetRollupObjectiveMeasureWeight();
                    countedMeasures += objectiveMeasureWeight;

                    if (rolledUpObjective.GetMeasureStatus(children[i], false) === true) {

                        normalizedMeasure = rolledUpObjective.GetNormalizedMeasure(children[i], false);

                        validData = true;
                        totalWeightedMeasure += (normalizedMeasure * objectiveMeasureWeight);
                    }
                } else {

                    Debug.AssertError("Measure Rollup Process encountered an activity with no primary objective.");

                    return;
                }
            }

        }

        if (validData === false || countedMeasures == 0) {

            targetObjective.SetMeasureStatus(false, activity);

        } else {
            targetObjective.SetMeasureStatus(true, activity);

            n = objectives.length;
            for (i = 0; i < n; i++) {
                if (objectives[i].GetIdentifier() === 'SubmitAll' && !objectives[i].GetSatisfiedStatus()) {
                    objectives[i].SetProgressStatus(true, false, activity); // needed to restose submit all status on restart
                    isSubmitAll = true;
                }
            }

            // ignore score if we are in active submit all container
            if (isSubmitAll) {
                totalWeightedMeasure = 0;
            }

            var newNormalizedMeasure = (totalWeightedMeasure / countedMeasures);

            newNormalizedMeasure = RoundToPrecision(newNormalizedMeasure, 7);

            targetObjective.SetNormalizedMeasure(newNormalizedMeasure, activity);

        }

        return;

    }

    return;

}
