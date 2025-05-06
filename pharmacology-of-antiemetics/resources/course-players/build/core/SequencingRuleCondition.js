(function() {
    SequencingRuleCondition = function(
        Condition,
        ReferencedObjective,
        MeasureThreshold,
        Operator) {
        if (arguments.length > 1) {
            this.Condition = Condition;
            this.ReferencedObjective = ReferencedObjective;
            this.MeasureThreshold = MeasureThreshold;
            this.Operator = Operator;
        } else { //JSON data
            var data = arguments[0];
            this.Condition = data.Condition;
            this.ReferencedObjective = data.ReferencedObjective;
            this.MeasureThreshold = data.MeasureThreshold;
            this.Operator = data.Operator;
        }
    };



    SequencingRuleCondition.prototype.toString = function() {
        /*
                                    return "Operator=" + this.Operator +
                                        ", ReferencedObjective=" + this.ReferencedObjective +
                                        ", MeasureThreshold=" + this.MeasureThreshold  +
                                        ", Condition=" + this.Condition;
                                    */
        var ret = "";

        if (this.ReferencedObjective != null && this.ReferencedObjective.length > 0) {
            ret += "Objective " + this.ReferencedObjective + " ";
        } else {
            ret += "Activity "
        }

        if (this.Operator == RULE_CONDITION_OPERATOR_NOT) {
            ret += "NOT "
        }

        ret += this.Condition;

        if (this.Condition == SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_GREATER_THAN ||
            this.Condition == SEQUENCING_RULE_CONDITION_OBJECTIVE_MEASURE_LESS_THAN) {
            ret += " " + this.MeasureThreshold;
        }

        return ret;

    };

})();
