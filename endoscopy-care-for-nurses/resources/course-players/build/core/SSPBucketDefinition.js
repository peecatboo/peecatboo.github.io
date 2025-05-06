(function() {
    //represents a bucket declared staticly in the SCORM manifest
    SSPBucketDefinition = function(
        Id,
        BucketType,
        Persistence,
        SizeMin,
        SizeRequested,
        Reducible) {
        this.Id = Id;
        this.BucketType = BucketType;
        this.Persistence = Persistence;
        this.SizeMin = SizeMin;
        this.SizeRequested = SizeRequested;
        this.Reducible = Reducible;
    }


    SSPBucketDefinition.prototype.toString =
        function() {
            return "Id=" + this.Id +
                ", BucketType=" + this.BucketType +
                ", Persistence=" + this.Persistence +
                ", SizeMin=" + this.SizeMin +
                ", SizeRequested=" + this.SizeRequested +
                ", Reducible=" + this.Reducible;
    };

})();
