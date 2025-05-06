(function() {
    ActivityRunTimeInteraction = function(
        Id,
        Type,
        TimestampUtc,
        Timestamp,
        Weighting,
        Result,
        Latency,
        Description,
        LearnerResponse,
        CorrectResponses,
        Objectives) {
        this.Id = Id;

        //TODO: documentation note: these values that have if=="" the = null....those are vocabulary elements that can be null...
        //those are fairly unique and difficult to handle on the server side

        if (Type === "") {
            Type = "";
        }
        this.Type = Type;

        this.TimestampUtc = TimestampUtc;
        this.Timestamp = Timestamp;
        this.Weighting = Weighting;

        if (Result === "") {
            Result = null;
        }
        this.Result = Result;

        if (Latency === "") {
            Latency = null;
        }
        this.Latency = Latency;

        this.Description = Description;
        this.LearnerResponse = LearnerResponse;
        this.CorrectResponses = CorrectResponses;
        this.Objectives = Objectives;
    }


    ActivityRunTimeInteraction.prototype.GetXml = ActivityRunTimeInteraction_GetXml;
    ActivityRunTimeInteraction.prototype.toString = ActivityRunTimeInteraction_toString;


    function ActivityRunTimeInteraction_GetXml(activityId, index) {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("ARTI");

        xml.AddAttribute("AI", activityId);
        xml.AddAttribute("I", index);

        xml.AddAttribute("Id", ServerFormat.TrimToLength(this.Id, 4000));

        if (this.Type !== null) {
            xml.AddAttribute("T", ServerFormat.ConvertInteractionType(this.Type));
        }
        if (this.Timestamp !== null) {
            xml.AddAttribute("TU", ServerFormat.ConvertTime(this.Timestamp));
            xml.AddAttribute("Ti", this.Timestamp);
        }
        if (this.Weighting !== null) {
            xml.AddAttribute("W", this.Weighting);
        }
        if (this.Result !== null && this.Result !== "") {
            if (IsValidCMIDecimal(this.Result)) {
                xml.AddAttribute("R", ServerFormat.GetNumericInteractionResultId());
                xml.AddAttribute("RN", this.Result);
            } else {
                xml.AddAttribute("R", ServerFormat.ConvertInteractionResult(this.Result));
            }

        }
        if (this.Latency !== null) {
            xml.AddAttribute("L", ServerFormat.ConvertTimeSpan(this.Latency));
        }
        if (this.Description !== null) {
            xml.AddAttribute("D", ServerFormat.TrimToLength(this.Description, 500));
        }
        if (this.LearnerResponse !== null) {
            xml.AddAttribute("LR", ServerFormat.TrimToLength(this.LearnerResponse, 7800));
        }

        var tempCorrectResponseXml;
        var i;
        for (i = 0; i < this.CorrectResponses.length; i++) {
            tempCorrectResponseXml = new XmlElement("CR");

            tempCorrectResponseXml.AddAttribute("AI", activityId);
            tempCorrectResponseXml.AddAttribute("II", index);
            tempCorrectResponseXml.AddAttribute("I", i);

            tempCorrectResponseXml.AddAttribute("V", ServerFormat.TrimToLength(this.CorrectResponses[i], 7800));
            xml.AddElement(tempCorrectResponseXml.toString());
        }

        var tempObjectiveXml;
        for (i = 0; i < this.Objectives.length; i++) {
            tempObjectiveXml = new XmlElement("O");

            tempObjectiveXml.AddAttribute("AI", activityId);
            tempObjectiveXml.AddAttribute("II", index);
            tempObjectiveXml.AddAttribute("I", i);

            tempObjectiveXml.AddAttribute("Id", ServerFormat.TrimToLength(this.Objectives[i], 4000));
            xml.AddElement(tempObjectiveXml.toString());
        }

        return xml.toString();
    }

    function ActivityRunTimeInteraction_toString() {
        return "ActivityRunTimeInteraction";
    }

})();
