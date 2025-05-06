(function() {

    GlobalObjective = function(
        Index,
        ID,
        ObjectiveProgressStatus,
        SatisfiedStatus,
        MeasureStatus,
        NormalizedMeasure,
        ScoreRaw,
        ScoreMin,
        ScoreMax,
        CompletionStatus,
        CompletionStatusValue,
        ProgressMeasureStatus,
        ProgressMeasure) {

        if (arguments.length > 1) {
            this.Index = Index;
            this.ID = ID;
            this.ProgressStatus = ObjectiveProgressStatus;
            this.SatisfiedStatus = SatisfiedStatus;
            this.MeasureStatus = MeasureStatus;
            this.NormalizedMeasure = NormalizedMeasure;

            this.ScoreRaw = ScoreRaw;
            this.ScoreMin = ScoreMin;
            this.ScoreMax = ScoreMax;
            this.CompletionStatus = CompletionStatus;
            this.CompletionStatusValue = CompletionStatusValue;
            this.ProgressMeasureStatus = ProgressMeasureStatus;
            this.ProgressMeasure = ProgressMeasure;
        } else { // JSON data
            var data = arguments[0];
            this.Index = data.Index;
            this.ID = data.ID;
            this.ProgressStatus = data.ObjectiveProgressStatus;
            this.SatisfiedStatus = data.SatisfiedStatus;
            this.MeasureStatus = data.MeasureStatus;
            this.NormalizedMeasure = data.NormalizedMeasure;

            this.ScoreRaw = data.ScoreRaw;
            this.ScoreMin = data.ScoreMin;
            this.ScoreMax = data.ScoreMax;
            this.CompletionStatus = data.CompletionStatus;
            this.CompletionStatusValue = data.CompletionStatusValue;
            this.ProgressMeasureStatus = data.ProgressMeasureStatus;
            this.ProgressMeasure = data.ProgressMeasure;
        }

        this.DataState = DATA_STATE_CLEAN;
    };

    GlobalObjective.prototype.GetXml = GlobalObjective_GetXml;
    GlobalObjective.prototype.Clone = GlobalObjective_Clone;
    GlobalObjective.prototype.SetDirtyData = GlobalObjective_SetDirtyData;
    GlobalObjective.prototype.ResetState = GlobalObjective_ResetState;

    function GlobalObjective_GetXml(registrationId) {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("GO");

        xml.AddAttribute("RI", registrationId);
        xml.AddAttribute("ROI", this.Index);

        xml.AddAttribute("I", this.ID);
        xml.AddAttribute("PS", ServerFormat.ConvertBoolean(this.ProgressStatus));
        xml.AddAttribute("SS", ServerFormat.ConvertBoolean(this.SatisfiedStatus));
        xml.AddAttribute("MS", ServerFormat.ConvertBoolean(this.MeasureStatus));
        xml.AddAttribute("NM", this.NormalizedMeasure);

        xml.AddAttribute("CS", ServerFormat.ConvertBoolean(this.CompletionStatus));
        xml.AddAttribute("CSV", ServerFormat.ConvertBoolean(this.CompletionStatusValue));

        if (this.ScoreRaw !== null) {
            xml.AddAttribute("SR", this.ScoreRaw);
        }
        if (this.ScoreMax !== null) {
            xml.AddAttribute("SM", this.ScoreMax);
        }
        if (this.ScoreMin !== null) {
            xml.AddAttribute("SMi", this.ScoreMin);
        }

        xml.AddAttribute("PrMS", ServerFormat.ConvertBoolean(this.ProgressMeasureStatus));
        if (this.ProgressMeasure !== null) {
            xml.AddAttribute("PM", this.ProgressMeasure);
        }

        return xml.toString();

    }


    function GlobalObjective_Clone() {
        var myClone = new GlobalObjective(
            this.Index,
            this.ID,
            this.ProgressStatus,
            this.SatisfiedStatus,
            this.MeasureStatus,
            this.NormalizedMeasure,
            this.ScoreRaw,
            this.ScoreMin,
            this.ScoreMax,
            this.CompletionStatus,
            this.CompletionStatusValue,
            this.ProgressMeasureStatus,
            this.ProgressMeasure);
        return myClone;
    }

    function GlobalObjective_SetDirtyData() {
        this.DataState = DATA_STATE_DIRTY;
    }

    function GlobalObjective_ResetState() {
        this.ProgressStatus = false;
        this.SatisfiedStatus = false;
        this.MeasureStatus = false;
        this.NormalizedMeasure = 0;

        this.ScoreRaw = null;
        this.ScoreMin = null;
        this.ScoreMax = null;
        this.CompletionStatus = false;
        this.CompletionStatusValue = false;
        this.ProgressMeasureStatus = false;
        this.ProgressMeasure = null;

        this.SetDirtyData();
    }

})();
