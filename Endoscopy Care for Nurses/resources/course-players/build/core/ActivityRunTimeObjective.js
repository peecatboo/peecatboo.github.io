(function() {

    ActivityRunTimeObjective = function(
        Identifier,
        SuccessStatus,
        CompletionStatus,
        ScoreScaled,
        ScoreRaw,
        ScoreMax,
        ScoreMin,
        ProgressMeasure,
        Description) {
        if (arguments.length > 1) {
            this.Identifier = Identifier;
            this.SuccessStatus = SuccessStatus;
            this.CompletionStatus = CompletionStatus;
            this.ScoreScaled = ScoreScaled;
            this.ScoreRaw = ScoreRaw;
            this.ScoreMax = ScoreMax;
            this.ScoreMin = ScoreMin;
            this.ProgressMeasure = ProgressMeasure;
            this.Description = Description;
        } else { // JSON data
            var data = arguments[0];
            this.Identifier = data.Identifier;
            this.SuccessStatus = data.SuccessStatus;
            this.CompletionStatus = data.CompletionStatus;
            this.ScoreScaled = data.ScoreScaled;
            this.ScoreRaw = data.ScoreRaw;
            this.ScoreMax = data.ScoreMax;
            this.ScoreMin = data.ScoreMin;
            this.ProgressMeasure = data.ProgressMeasure;
            this.Description = data.Description;
        }

        this.SuccessStatusChangedDuringRuntime = false;
        this.MeasureChangedDuringRuntime = false;
        this.ProgressMeasureChangedDuringRuntime = false;
        this.CompletionStatusChangedDuringRuntime = false;
    };

    ActivityRunTimeObjective.prototype.GetXml = ActivityRunTimeObjective_GetXml;
    ActivityRunTimeObjective.prototype.toString = ActivityRunTimeObjective_toString;

    function ActivityRunTimeObjective_GetXml(activityId, index) {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("ARTO");

        xml.AddAttribute("AI", activityId);
        xml.AddAttribute("I", index);

        if (this.Identifier !== null) {
            xml.AddAttribute("Id", ServerFormat.TrimToLength(this.Identifier, 4000));
        }

        xml.AddAttribute("SS", ServerFormat.ConvertSuccessStatus(this.SuccessStatus));
        xml.AddAttribute("CS", ServerFormat.ConvertCompletionStatus(this.CompletionStatus));

        if (this.ScoreScaled !== null) {
            xml.AddAttribute("SSc", this.ScoreScaled);
        }
        if (this.ScoreRaw !== null) {
            xml.AddAttribute("SR", this.ScoreRaw);
        }
        if (this.ScoreMax !== null) {
            xml.AddAttribute("SM", this.ScoreMax);
        }
        if (this.ScoreMin !== null) {
            xml.AddAttribute("SMi", this.ScoreMin);
        }
        if (this.ProgressMeasure !== null) {
            xml.AddAttribute("PM", this.ProgressMeasure);
        }
        if (this.Description !== null) {
            xml.AddAttribute("D", ServerFormat.TrimToLength(this.Description, 500));
        }

        return xml.toString();
    }

    function ActivityRunTimeObjective_toString() {
        return "ActivityRunTimeObjective - " + this.Identifier;
    }

})();
