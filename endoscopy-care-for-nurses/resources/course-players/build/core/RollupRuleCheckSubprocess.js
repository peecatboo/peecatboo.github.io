//****************************************************************************************************************

//Rollup Rule Check Subprocess [RB.1.4]

//    For an activity and a Rollup Action; returns True if the action applies

//    Reference:
//Check Child for Rollup Subprocess RB.1.4.2;
//Evaluate Rollup Conditions Subprocess RB.1.4.1;
//Rollup Action SM.5;
//Rollup Child Activity Set SM.5;
//Rollup Minimum Count SM.5;
//Rollup Minimum Percent SM.5;
//Rollup Rule Description SM.5;
//Tracked SM.11;
//Tracking Model TM

function Sequencer_RollupRuleCheckSubprocess(activity, ruleSet, callingLog) {

    //var contributingChldren;
    var children;
    var checkChildResult;
    var evaluateConditionsResult;
    var statusChange;
    var numTrue = 0;
    var numFalse = 0;
    var numUnknown = 0;

    var applicableRules = Sequencer_GetApplicableSetofRollupRules(activity, ruleSet);
    if (applicableRules.length > 0) {

        //done above

        children = activity.GetChildren(); //TODO - should this be all children or just available children?

        for (var i = 0; i < applicableRules.length; i++) {

            contributingChldren = new Array();

            numTrue = 0;
            numFalse = 0;
            numUnknown = 0;

            for (var j = 0; j < children.length; j++) {

                if (children[j].IsTracked() === true) {

                    checkChildResult = this.CheckChildForRollupSubprocess(children[j], applicableRules[i].Action);

                    if (checkChildResult === true) {

                        evaluateConditionsResult = this.EvaluateRollupConditionsSubprocess(children[j], applicableRules[i]);

                        if (evaluateConditionsResult == RESULT_UNKNOWN) {

                            numUnknown++;

                            if (applicableRules[i].ChildActivitySet == CHILD_ACTIVITY_SET_ALL ||
                                applicableRules[i].ChildActivitySet == CHILD_ACTIVITY_SET_NONE) {
                                //break the loop, rule cannot be satisfied
                                j = children.length;
                            }
                        } else {
                            if (evaluateConditionsResult === true) {

                                numTrue++;

                                if (applicableRules[i].ChildActivitySet == CHILD_ACTIVITY_SET_ANY ||
                                    applicableRules[i].ChildActivitySet == CHILD_ACTIVITY_SET_NONE) {
                                    //break the loop, remaining children won't matter
                                    j = children.length;
                                }
                            } else {
                                numFalse++;

                                if (applicableRules[i].ChildActivitySet == CHILD_ACTIVITY_SET_ALL) {
                                    //break the loop, remaining children won't matter
                                    j = children.length;
                                }
                            }
                        }
                    }
                }
            }

            switch (applicableRules[i].ChildActivitySet) {

                case CHILD_ACTIVITY_SET_ALL:
                    if (numFalse === 0 && numUnknown === 0) {

                        statusChange = true;
                    }

                    break;

                case CHILD_ACTIVITY_SET_ANY:
                    if (numTrue > 0) {
                        statusChange = true;
                    }

                    break;

                case CHILD_ACTIVITY_SET_NONE:

                    if (numTrue === 0 && numUnknown === 0) {

                        statusChange = true;
                    }

                    break;

                case CHILD_ACTIVITY_SET_AT_LEAST_COUNT:
                    if (numTrue >= applicableRules[i].MinimumCount) {

                        statusChange = true;
                    }
                    break;

                case CHILD_ACTIVITY_SET_AT_LEAST_PERCENT:
                    var percent = (numTrue / (numTrue + numFalse + numUnknown));
                    if (percent >= applicableRules[i].MinimumPercent) {

                        statusChange = true;
                    }

                    break;

                default:
                    //error
                    break;
            }

            if (statusChange === true) {

                return true;
            }

        }
    }

    return false;

}

//TODO - this should really be moved to be part of an object rather than a stand-alone function (it is used from other places - Sequencer_ObjectiveRollupProcess)

function Sequencer_GetApplicableSetofRollupRules(activity, ruleSet) {

    var applicableRules = new Array();

    var allRules = activity.GetRollupRules();

    for (var i = 0; i < allRules.length; i++) {

        switch (ruleSet) {

            case RULE_SET_SATISFIED:
                if (allRules[i].Action == ROLLUP_RULE_ACTION_SATISFIED) {
                    applicableRules[applicableRules.length] = allRules[i];
                }
                break;

            case RULE_SET_NOT_SATISFIED:
                if (allRules[i].Action == ROLLUP_RULE_ACTION_NOT_SATISFIED) {
                    applicableRules[applicableRules.length] = allRules[i];
                }
                break;

            case RULE_SET_COMPLETED:
                if (allRules[i].Action == ROLLUP_RULE_ACTION_COMPLETED) {
                    applicableRules[applicableRules.length] = allRules[i];
                }
                break;

            case RULE_SET_INCOMPLETE:
                if (allRules[i].Action == ROLLUP_RULE_ACTION_INCOMPLETE) {
                    applicableRules[applicableRules.length] = allRules[i];
                }
                break;

        }

    }

    return applicableRules;
}
