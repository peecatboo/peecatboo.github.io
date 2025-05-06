(function() {
    SequencingRollupRuleCondition = function(
        Operator,
        Condition) {
        if (arguments.length > 1) {
            this.Operator = Operator;
            this.Condition = Condition;
        } else { // JSON data
            var data = arguments[0];
            this.Operator = data.Operator;
            this.Condition = data.Condition;
        }
    };



    SequencingRollupRuleCondition.prototype.toString = function() {
        /*
                                    return "Operator=" + this.Operator +
                                        ", Condition=" + this.Condition;
                                    */

        var ret = "";
        if (this.Operator == RULE_CONDITION_OPERATOR_NOT) {
            ret += "NOT ";
        }

        ret += this.Condition;

        return ret;
    };

})();
