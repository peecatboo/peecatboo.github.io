(function() {
    SequencingRule = function(
        ConditionCombination,
        Action,
        RuleConditions) {
        if (arguments.length > 1) {
            this.ConditionCombination = ConditionCombination;
            this.Action = Action;
            this.RuleConditions = RuleConditions;
        } else { // JSON data
            var data = arguments[0];
            this.ConditionCombination = data.ConditionCombination;
            this.Action = data.Action;
            this.RuleConditions = data.RuleConditions.map(function (condition) {
                return new SequencingRuleCondition(condition);
            });
        }
    };


    SequencingRule.prototype.toString =
        function() {

            /*
            var ret= "ConditionCombination=" + this.ConditionCombination +
                ", Action=" + this.Action +
                ", Conditions: ";
            */
            var ret = "If " + this.ConditionCombination + " condition(s) evaluate to true, then " + this.Action + ".  ";

            if (this.RuleConditions.length > 1) {
                ret += "Conditions: ";

                for (var condition in this.RuleConditions) {
                    if (!this.RuleConditions.hasOwnProperty(condition)) {
                        continue;
                    }
                    ret += "{" + condition + "} " + this.RuleConditions[condition] + "; ";
                }
            } else {
                ret += "Condition: " + this.RuleConditions[0];
            }

            return ret;

    };

})();
