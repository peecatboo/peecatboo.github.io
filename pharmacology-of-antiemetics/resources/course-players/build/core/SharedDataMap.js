(function() {
    SharedDataMap = function(
        TargetId,
        ReadSharedData,
        WriteSharedData) {
        this.Id = TargetId;
        this.ReadSharedData = ReadSharedData;
        this.WriteSharedData = WriteSharedData;
    }

    SharedDataMap.prototype.toString = function() {
        return "Id=" + this.Id +
            ", ReadSharedData=" + this.ReadSharedData +
            ", WriteSharedData=" + this.WriteSharedData;
    };

})();
