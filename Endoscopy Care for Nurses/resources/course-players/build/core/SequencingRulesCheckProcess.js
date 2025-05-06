//****************************************************************************************************************

//Sequencing Rules Check Process [UP.2]
//For an activity and a set of Rule Actions; returns the action to apply or Nil
//Reference:
//Rule Action SM.2
//Sequencing Rule Check Subprocess UP.2.1
//Sequencing Rule Description SM.2

function Sequencer_SequencingRulesCheckProcess(activity, ruleSet, callingLog) {

    var subprocessResult;

    var applicableSequencingRules = Sequencer_GetApplicableSetofSequencingRules(activity, ruleSet);

    if (applicableSequencingRules.length > 0) {

        //done above

        for (var i = 0; i < applicableSequencingRules.length; i++) {

            subprocessResult = this.SequencingRulesCheckSubprocess(activity, applicableSequencingRules[i]);

            if (subprocessResult === true) {

                return applicableSequencingRules[i].Action;

            }
        }
    }

    return null;

}

function Sequencer_GetApplicableSetofSequencingRules(activity, ruleSet) {

    var applicableRules = new Array();

    if (ruleSet == RULE_SET_POST_CONDITION) {
        applicableRules = activity.GetPostConditionRules();
    } else if (ruleSet == RULE_SET_EXIT) {
        applicableRules = activity.GetExitRules();
    } else {
        //rule condition is one of the precondition rules

        var preConditionRules = activity.GetPreConditionRules();

        for (var i = 0; i < preConditionRules.length; i++) {

            switch (ruleSet) {

                case RULE_SET_HIDE_FROM_CHOICE:

                    if (preConditionRules[i].Action == SEQUENCING_RULE_ACTION_HIDDEN_FROM_CHOICE) {
                        applicableRules[applicableRules.length] = preConditionRules[i];
                    }

                    break;

                case RULE_SET_STOP_FORWARD_TRAVERSAL:

                    if (preConditionRules[i].Action == SEQUENCING_RULE_ACTION_STOP_FORWARD_TRAVERSAL) {
                        applicableRules[applicableRules.length] = preConditionRules[i];
                    }

                    break;

                case RULE_SET_DISABLED:

                    if (preConditionRules[i].Action == SEQUENCING_RULE_ACTION_DISABLED) {
                        applicableRules[applicableRules.length] = preConditionRules[i];
                    }

                    break;

                case RULE_SET_SKIPPED:
                    if (preConditionRules[i].Action == SEQUENCING_RULE_ACTION_SKIP) {
                        applicableRules[applicableRules.length] = preConditionRules[i];
                    }

                    break;

                default:
                    return null;
                    //break;
            }

        }
    }
    return applicableRules;

}
