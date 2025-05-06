(function() {
    SharedData = function(
        SharedDataId,
        SharedDataValId,
        Data) {
        this.SharedDataId = SharedDataId;
        this.SharedDataValId = SharedDataValId;
        this.Data = Data;

        this.DataState = DATA_STATE_CLEAN;
    }

    SharedData.prototype.toString = function() {
        return "SharedDataId=" + this.SharedDataId +
            ", SharedDataValId=" + this.SharedDataValId +
            ", Data=" + this.Data;
    };

    SharedData.prototype.GetXml = SharedData_GetXml;
    SharedData.prototype.GetData = SharedData_GetData;
    SharedData.prototype.WriteData = SharedData_WriteData;
    SharedData.prototype.SetDirtyData = SharedData_SetDirtyData;

    function SharedData_GetXml() {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("SD");

        xml.AddAttribute("SDVI", this.SharedDataValId);
        xml.AddAttribute("D", ServerFormat.TrimToLength(this.Data, 64000));

        return xml.toString();
    }

    function SharedData_GetData() {
        return this.Data;
    }

    function SharedData_WriteData(newData) {
        this.Data = newData;
        this.SetDirtyData();
    }

    function SharedData_SetDirtyData() {
        this.DataState = DATA_STATE_DIRTY;
    }

})();
