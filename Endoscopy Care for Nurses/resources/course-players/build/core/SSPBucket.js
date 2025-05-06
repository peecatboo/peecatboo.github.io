var SSP_ALLOCATION_SUCCESS_FAILURE = "failure";
var SSP_ALLOCATION_SUCCESS_MINIMUM = "minimum";
var SSP_ALLOCATION_SUCCESS_REQUESTED = "requested";
var SSP_ALLOCATION_SUCCESS_NOT_ATTEMPTED = "not attempted"

var SSP_PERSISTENCE_LEARNER = "learner";
var SSP_PERSISTENCE_COURSE = "course";
var SSP_PERSISTENCE_SESSION = "session";

(function() {
    //represents a runtime SSP bucket
    SSPBucket = function(
        BucketIndex,
        Id,
        BucketType,
        Persistence,
        SizeMin,
        SizeRequested,
        Reducible,
        LocalActivityId,
        AllocationSuccess,
        Data) {


        this.BucketIndex = CleanExternalString(BucketIndex);
        this.Id = CleanExternalString(Id);
        this.BucketType = CleanExternalString(BucketType);
        this.Persistence = CleanExternalString(Persistence);
        this.SizeMin = parseInt(CleanExternalString(SizeMin));
        this.SizeRequested = parseInt(CleanExternalString(SizeRequested));
        this.Reducible = CleanExternalString(Reducible).toBoolean();
        this.LocalActivityId = CleanExternalString(LocalActivityId);
        this.AllocationSuccess = CleanExternalString(AllocationSuccess);;
        this.Data = CleanExternalString(Data);


        this.DataState = DATA_STATE_CLEAN;

        //Local Activity Id explained
        /*
    -SSP buckets can have a scope of learner, course or session.
    -If the scope is session, then the bucket is local only to a single SCO.
    -We only have one collection of SSP buckets for the entire course.
    -If there is a value in the LocalActivityId field, then it means that the
    bucket is scoped as session for a particular SCO (that corresponds to the item
    id stored in LocalActivityId)
    -If a bucket allocation fails for a SCO, then it will have an empty bucket
    associated with it that has an AllocationSuccess of FAILURE
    */
    }

    SSPBucket.prototype.toString =
        function() {
            return "BucketIndex=" + this.Index +
                "Id=" + this.Id +
                ", BucketType=" + this.BucketType +
                ", Persistence=" + this.Persistence +
                ", SizeMin=" + this.SizeMin +
                ", SizeRequested=" + this.SizeRequested +
                ", Reducible=" + this.Reducible +
                ", LocalActivityId=" + this.LocalActivityId +
                ", AllocationSuccess=" + this.AllocationSuccess +
                ", Data=" + this.Data;
    };


    SSPBucket.prototype.GetXml = SSPBucket_GetXml;
    SSPBucket.prototype.IsVisible = SSPBucket_IsVisible;
    SSPBucket.prototype.CurrentlyUsedStorage = SSPBucket_CurrentlyUsedStorage;
    SSPBucket.prototype.GetBucketState = SSPBucket_GetBucketState;
    SSPBucket.prototype.GetData = SSPBucket_GetData;
    SSPBucket.prototype.WriteData = SSPBucket_WriteData;
    SSPBucket.prototype.SetDirtyData = SSPBucket_SetDirtyData;
    SSPBucket.prototype.AppendData = SSPBucket_AppendData;
    SSPBucket.prototype.SizeAllocated = SSPBucket_SizeAllocated;
    SSPBucket.prototype.ResetData = SSPBucket_ResetData;


    function SSPBucket_GetXml() {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("SSP");

        xml.AddAttribute("IN", this.BucketIndex);
        xml.AddAttribute("ID", ServerFormat.TrimToLength(this.Id, 4000));
        xml.AddAttribute("BT", ServerFormat.TrimToLength(this.BucketType, 4000));
        xml.AddAttribute("P", ServerFormat.ConvertSSPPersistence(this.Persistence));
        xml.AddAttribute("SM", this.SizeMin);
        xml.AddAttribute("SR", this.SizeRequested);
        xml.AddAttribute("R", ServerFormat.ConvertBoolean(this.Reducible));
        xml.AddAttribute("LAI", this.LocalActivityId);
        xml.AddAttribute("AS", ServerFormat.ConvertSSPAllocationSuccess(this.AllocationSuccess));
        xml.AddAttribute("D", this.Data);

        return xml.toString();

    }

    function SSPBucket_IsVisible(itemIdentifier) {

        if (this.LocalActivityId == "" || this.LocalActivityId == null ||
            this.LocalActivityId == itemIdentifier) {
            return true;
        }
        return false;
    }


    function SSPBucket_CurrentlyUsedStorage() {
        return this.Data.length * 2; //length returns characters, but SSP operates in bytes and each character consumes 2 bytes
    }

    function SSPBucket_GetBucketState() {

        var state = "";

        var sizeAllocated = this.SizeAllocated();

        state = "{totalSpace=" + ((sizeAllocated != null) ? sizeAllocated : 0) + "}";
        state += "{used=" + this.CurrentlyUsedStorage() + "}";

        if (this.BucketType != null && this.BucketType.length > 0) {
            state += "{type=" + this.BucketType + "}";
        }

        return state;
    }

    function SSPBucket_GetData(offset, size) {

        if (offset == null || offset.length == 0) {
            offset = 0;
        } else {
            offset = parseInt(offset, 10);
        }

        if (size == null || size.length == 0) {
            size = 0;
        } else {
            size = parseInt(size, 10);
        }

        //need to divide by 2 to get the actual number of characters since these value are passed in as bytes
        offset = offset / 2;
        size = size / 2;

        var str = new String();

        if (size > 0) {
            return this.Data.substr(offset, size);
        } else {
            return this.Data.substr(offset);
        }

    }

    function SSPBucket_WriteData(offset, newData) {

        if (offset == null || offset.length == 0) {
            offset = 0;
        } else {
            offset = parseInt(offset, 10);
        }

        //need to divide by 2 to get the actual number of characters since these value are passed in as bytes
        offset = offset / 2;

        if (offset == 0) {
            this.Data = newData;
        } else {
            var strStart = this.Data.slice(0, offset);

            var strEnd = "";
            if (offset + newData.length < this.Data.length) {
                strEnd = this.Data.slice(offset + newData.length);
            }

            this.Data = strStart + newData + strEnd;
        }

        this.SetDirtyData();
    }


    function SSPBucket_AppendData(newData) {
        this.Data += newData;
        this.SetDirtyData();
    }


    function SSPBucket_SetDirtyData() {
        this.DataState = DATA_STATE_DIRTY;
    }

    function SSPBucket_SizeAllocated() {

        switch (this.AllocationSuccess) {

            case SSP_ALLOCATION_SUCCESS_FAILURE:
                return null;
                break;

            case SSP_ALLOCATION_SUCCESS_MINIMUM:
                return this.SizeMin;
                break;

            case SSP_ALLOCATION_SUCCESS_REQUESTED:
                return this.SizeRequested;
                break;

            case SSP_ALLOCATION_SUCCESS_NOT_ATTEMPTED:
                return 0;
                break;
        }

        // Debug.AssertError("Invalid allocation success");

    }

    function SSPBucket_ResetData() {
        this.Data = "";
        this.SetDirtyData();
    }
})();
