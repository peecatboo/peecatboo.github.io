//****************************************************************************************************************

//Objective Rollup Using Rules Process [RB.1.2 b]
//    For an activity; may change the Objective Information for the activity

//    Reference:
        //Objective Contributes to Rollup SM.6
        //Objective Description SM.6
        //Objective Progress Status TM.1.1
        //Objective Satisfied Status TM.1.1
        //Rollup Rule Check Subprocess RB.1.4
        //Rollup Action SM.5

function Sequencer_ObjectiveRollupUsingRulesProcess(activity, callingLog){



    var subprocessResult;

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

     if (targetObjective !== null){

         subprocessResult = this.RollupRuleCheckSubprocess(activity, RULE_SET_NOT_SATISFIED);

         if (subprocessResult === true){

             targetObjective.SetProgressStatus(true, false, activity);

             targetObjective.SetSatisfiedStatus(false, false, activity);
        }

         subprocessResult = this.RollupRuleCheckSubprocess(activity, RULE_SET_SATISFIED);

         if (subprocessResult === true){

             targetObjective.SetProgressStatus(true, false, activity);

             targetObjective.SetSatisfiedStatus(true, false, activity);
        }

          return;
    }
    else{
           return;
    }

}
