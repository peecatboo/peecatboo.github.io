(function(){
    SequencingRollupRule = function(
            ConditionCombination,
            ChildActivitySet,
            MinimumCount,
            MinimumPercent,
            Action,
            Conditions){
        if (arguments.length > 1) {
            this.ConditionCombination = ConditionCombination;
            this.ChildActivitySet = ChildActivitySet;
            this.MinimumCount = MinimumCount;
            this.MinimumPercent = MinimumPercent;
            this.Action = Action;
            this.Conditions = Conditions;
        } else { // JSON data
            var data = arguments[0];
            this.ConditionCombination = data.ConditionCombination;
            this.ChildActivitySet = data.ChildActivitySet;
            this.MinimumCount = data.MinimumCount;
            this.MinimumPercent = data.MinimumPercent;
            this.Action = data.Action;
            this.Conditions = data.Conditions.map(function (condition) {
                return new SequencingRollupRuleCondition(condition);
            });
        }
    };

SequencingRollupRule.prototype.toString =
        function(){

            /*
            var ret= "ConditionCombination=" + this.ConditionCombination +
                ", ChildActivitySet=" + this.ChildActivitySet +
                ", MinimumCount=" + this.MinimumCount +
                ", MinimumPercent=" + this.MinimumPercent +
                ", Action=" + this.Action +
                ", Conditions: ";
            */

            //if activity set, have cond Comb conditions, then action

            var ret = "If ";

            if (this.ChildActivitySet == CHILD_ACTIVITY_SET_AT_LEAST_COUNT){
                ret += "At Least " + this.MinimumCount + " Child Activities Meet "
            }
            else if (this.ChildActivitySet == CHILD_ACTIVITY_SET_AT_LEAST_PERCENT){
                ret += "At Least " + this.MinimumPercent + " Percent of Child Activities Meet "
            }
            else if (this.ChildActivitySet == CHILD_ACTIVITY_SET_ALL){
                ret += "All Child Activities Meet ";
            }
            else if (this.ChildActivitySet == CHILD_ACTIVITY_SET_ANY){
                ret += "Any Child Activity Meets ";
            }
            else if (this.ChildActivitySet == CHILD_ACTIVITY_SET_NONE){
                ret += "No Child Activity Meets ";
            }

            if (this.ConditionCombination == RULE_CONDITION_COMBINATION_ANY){
                ret += " Any Condition ";
            }
            else{
                ret += " All Conditions ";
            }

            ret += " THEN " + this.Action;

            if (this.Conditions.length > 1){

                ret += ". Conditions: "

                for (var condition in this.Conditions){
                    if (!this.Conditions.hasOwnProperty(condition)) {
                        continue;
                    }
                    ret += "{" + condition + "} " + this.Conditions[condition] + "; ";
                }

            }
            else{
                ret += ". Condition: " + this.Conditions[0];
            }

            return ret;

            };

})();
