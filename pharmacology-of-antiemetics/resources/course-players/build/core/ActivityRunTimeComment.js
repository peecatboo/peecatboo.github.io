(function() {

    ActivityRunTimeComment = function(
        Comment,
        Language,
        Location,
        TimestampUtc,
        Timestamp) {

        this.Comment = Comment;
        this.Language = Language;
        this.Location = Location;
        this.TimestampUtc = TimestampUtc;
        this.Timestamp = Timestamp;
    }

    ActivityRunTimeComment.prototype.GetXml = ActivityRunTimeComment_GetXml;
    ActivityRunTimeComment.prototype.toString = ActivityRunTimeComment_toString;

    ActivityRunTimeComment.prototype.GetCommentValue = ActivityRunTimeComment_GetCommentValue;
    ActivityRunTimeComment.prototype.SetCommentValue = ActivityRunTimeComment_SetCommentValue;

    function ActivityRunTimeComment_GetXml(activityId, index, fromLms) {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("ARTC");

        xml.AddAttribute("AI", activityId);
        xml.AddAttribute("I", index);
        xml.AddAttribute("FL", ServerFormat.ConvertBoolean(fromLms));

        if (this.Comment !== null) {
            xml.AddAttribute("C", ServerFormat.TrimToLength(this.Comment, 4000));
        }
        if (this.Language !== null) {
            xml.AddAttribute("L", this.Language);
        }
        if (this.Location !== null) {
            xml.AddAttribute("Lo", ServerFormat.TrimToLength(this.Location, 250));
        }
        if (this.Timestamp !== null && this.Timestamp != '') {
            xml.AddAttribute("TU", ServerFormat.ConvertTime(this.Timestamp));
            xml.AddAttribute("T", this.Timestamp);
        }

        return xml.toString();
    }

    function ActivityRunTimeComment_toString() {
        return "ActivityRunTimeComment";
    }

    function ActivityRunTimeComment_GetCommentValue() {

        var returnValue = "";

        if (this.Language !== null && this.Language !== undefined) {
            returnValue = this.Language;
        }

        returnValue += this.Comment;

        return returnValue;
    }

    function ActivityRunTimeComment_SetCommentValue(value) {

        var langPortion = "";
        var commentPortion = "";

        var closingBracketPosition = value.indexOf("}");

        if (value.indexOf("{lang=") === 0 && closingBracketPosition > 0) {

            langPortion = value.substr(0, closingBracketPosition + 1);

            if (value.length >= (closingBracketPosition + 2)) {
                commentPortion = value.substring(closingBracketPosition + 1);
            }


        } else {
            commentPortion = value;
        }

        this.Language = langPortion;
        this.Comment = commentPortion;
    }

})();
