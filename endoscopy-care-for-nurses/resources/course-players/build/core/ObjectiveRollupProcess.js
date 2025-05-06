//****************************************************************************************************************

//Objective RollupProcess [RB.1.2]

//    Reference:

function Sequencer_ObjectiveRollupProcess(activity, callingLog) {

    //select the appropriate objective rollup process using the rules defined on SN-4-38 - this pseudo code is not defined in the spec, just the logic

    //get the primary objetive

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

            this.ObjectiveRollupUsingMeasureProcess(activity);

            return;
        }

        if (Sequencer_GetApplicableSetofRollupRules(activity, RULE_SET_SATISFIED).length > 0 ||
            Sequencer_GetApplicableSetofRollupRules(activity, RULE_SET_NOT_SATISFIED).length > 0) {

            this.ObjectiveRollupUsingRulesProcess(activity);

            return;
        }

        this.ObjectiveRollupUsingDefaultProcess(activity);

        return;

    } else {
        return;
    }

}
