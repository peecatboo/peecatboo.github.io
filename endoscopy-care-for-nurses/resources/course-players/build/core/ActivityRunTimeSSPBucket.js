(function() {
    //represents a bucket containing data
    ActivityRunTimeSSPBucket = function(
        Id,
        BucketType,
        Persistence,
        SizeMin,
        SizeRequested,
        Reducible,
        TotalSpace,
        Data) {
        this.Id = Id;
        this.BucketType = BucketType;
        this.Persistence = Persistence;
        this.SizeMin = SizeMin;
        this.SizeRequested = SizeRequested;
        this.Reducible = Reducible;
        this.TotalSpace = TotalSpace;
        this.Data = Data;
    }


    ActivityRunTimeSSPBucket.prototype.toString =
        function() {
            return "Id=" + this.Id +
                ", BucketType=" + this.BucketType +
                ", Persistence=" + this.Persistence +
                ", SizeMin=" + this.SizeMin +
                ", SizeRequested=" + this.SizeRequested +
                ", Reducible=" + this.Reducible +
                ", TotalSpace=" + this.TotalSpace +
                ", Data=" + this.Data;
    };

})();
