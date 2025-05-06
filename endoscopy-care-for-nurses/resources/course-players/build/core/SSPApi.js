function SSPApi(_36e, _36f) {
    this.MaxSSPStorage = parseInt(_36e, 10);
    this.ApiInstance = _36f;
}
SSPApi.prototype.InitializeBuckets = SSPApi_InitializeBuckets;
SSPApi.prototype.CheckForGetValueError = SSPApi_CheckForGetValueError;
SSPApi.prototype.CheckForSetValueError = SSPApi_CheckForSetValueError;
SSPApi.prototype.RetrieveGetValueData = SSPApi_RetrieveGetValueData;
SSPApi.prototype.StoreValue = SSPApi_StoreValue;
SSPApi.prototype.GetBucketById = SSPApi_GetBucketById;
SSPApi.prototype.GetBucketByIndex = SSPApi_GetBucketByIndex;
SSPApi.prototype.GetAccessibleBucketCount = SSPApi_GetAccessibleBucketCount;
SSPApi.prototype.GetDelimiterValues = SSPApi_GetDelimiterValues;
SSPApi.prototype.RemoveDelimitersFromElementName = SSPApi_RemoveDelimitersFromElementName;
SSPApi.prototype.RemoveDelimitersFromValue = SSPApi_RemoveDelimitersFromValue;
SSPApi.prototype.GetDelimiterValues = SSPApi_GetDelimiterValues;
SSPApi.prototype.GetCurrentSCOItemIdentifier = SSPApi_GetCurrentSCOItemIdentifier;
SSPApi.prototype.AllocateBucket = SSPApi_AllocateBucket;
SSPApi.prototype.GetStorageAllowedByLms = SSPApi_GetStorageAllowedByLms;
SSPApi.prototype.ResetBucketsForActivity = SSPApi_ResetBucketsForActivity;
SSPApi.prototype.SetErrorState = SSPApi_SetErrorState;
SSPApi.prototype.WriteDetailedLog = SSPApi_WriteDetailedLog;

function SSPApi_InitializeBuckets() {
    var _370;
    var _371;
    var _372;
    for (var i = 0; i < Control.SSPBuckets.length; i++) {
        _370 = Control.SSPBuckets[i];
        if (_370.AllocationSuccess == SSP_ALLOCATION_SUCCESS_NOT_ATTEMPTED) {
            _371 = this.GetStorageAllowedByLms(_370.SizeMin, _370.SizeRequested);
            if (_371 == null) {
                _372 = SSP_ALLOCATION_SUCCESS_FAILURE;
            } else {
                if (_371 == _370.SizeMin) {
                    _372 = SSP_ALLOCATION_SUCCESS_MINIMUM;
                } else {
                    if (_371 == _370.SizeRequested) {
                        _372 = SSP_ALLOCATION_SUCCESS_REQUESTED;
                    } else {
                        Debug.AssertError("Invalid allocation");
                    }
                }
            }
            _370.AllocationSuccess = _372;
        }
    }
}

function SSPApi_CheckForGetValueError(_374, _375, _376, _377) {
    var _378 = this.RemoveDelimitersFromElementName(_375);
    var _379 = this.GetDelimiterValues(_374);
    var _37a;
    var _37b;
    var size;
    if (_376 !== "") {
        var _37d = this.GetAccessibleBucketCount();
        if (_376 >= _37d) {
            this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The SSP Bucket collection does not have an element at index " + _376 + ", the current element count is " + _37d + ".");
            return false;
        }
    }
    switch (_378) {
        case "ssp._count":
            this.WriteDetailedLog("`1557`");
            break;
        case "ssp.allocate":
            this.WriteDetailedLog("`1519`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_WRITE_ONLY_ERROR, "The ssp.allocate data model element is write-only.");
            return false;
            break;
        case "ssp.n.allocation_success":
            this.WriteDetailedLog("`1296`");
            break;
        case "ssp.n.id":
            this.WriteDetailedLog("`1589`");
        case "ssp.n.bucket_id":
            this.WriteDetailedLog("`1466`");
            break;
        case "ssp.n.bucket_state":
            this.WriteDetailedLog("`1394`");
            break;
        case "ssp.n.data":
            this.WriteDetailedLog("`1558`");
            _37a = this.GetBucketByIndex(_376);
            _37b = _379["offset"];
            size = _379["size"];
            if (_37a.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket improperly declared.");
                return false;
            }
            if (_37b != null) {
                _37b = new String(_37b);
                if (_37b.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for offset must be a valid even integer greater than 0.");
                    return false;
                }
                _37b = parseInt(_37b, 10);
                if (_37b % 2 != 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for offset must be an even integer.");
                    return false;
                }
                if (_37b >= _37a.SizeAllocated()) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Offset exceeds bucket size. This bucket currently has allocated " + _37a.SizeAllocated() + " bytes of storage. Bytes started at offset " + _37b + "were requested.");
                    return false;
                }
            }
            if (size != null) {
                size = new String(size);
                if (size.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for size must be a valid even integer greater than 0.");
                    return false;
                }
                size = parseInt(size, 10);
                if (size % 2 != 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for size must be an even integer.");
                    return false;
                }
                if ((_37b + size) >= _37a.SizeAllocated()) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Requested data exceeds available data. This bucket currently has allocated " + _37a.SizeAllocated() + " bytes of storage. " + size + " bytes starting at offset " + _37b + " were requested. Size + Offset = " + (size + _37b));
                    return false;
                }
            }
            break;
        case "ssp.n.appendData":
            this.WriteDetailedLog("`1439`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_WRITE_ONLY_ERROR, "The ssp.n.appendData data model element is write-only.");
            return false;
            break;
        case "ssp.data":
            this.WriteDetailedLog("`1588`");
            if (_379["bucketID"] == null) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket does not exist. bucketID delimiter is required when using the bucket manager interface.");
                return false;
            }
            _37a = this.GetBucketById(_379["bucketID"], true);
            if (_37a == null) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket does not exist. The bucketID '" + new String(_379["bucketID"]) + "' is not declared or is not visible to this SCO.");
                return false;
            }
            _37b = _379["offset"];
            size = _379["size"];
            if (_37a.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket improperly declared.");
                return false;
            }
            if (_37b != null) {
                _37b = new String(_37b);
                if (_37b.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for offset must be a valid even integer greater than 0.");
                    return false;
                }
                _37b = parseInt(_37b, 10);
                if (_37b % 2 != 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for offset must be an even integer.");
                    return false;
                }
                if (_37b >= _37a.SizeAllocated()) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Offset exceeds bucket size. This bucket currently has allocated " + _37a.SizeAllocated() + " bytes of storage. Bytes starting at offset " + _37b + " were requested.");
                    return false;
                }
            }
            if (size != null) {
                size = new String(size);
                if (size.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for size must be a valid even integer greater than 0.");
                    return false;
                }
                size = parseInt(size, 10);
                if (size % 2 != 0) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The value for size must be an even integer.");
                    return false;
                }
                if ((_37b + size) >= _37a.SizeAllocated()) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Requested data exceeds available data. This bucket currently has allocated " + _37a.SizeAllocated() + " bytes of storage. " + size + " bytes started at offset " + _37b + " were requested. Size + Offset = " + (size + _37b));
                    return false;
                }
            }
            break;
        case "ssp.bucket_state":
            this.WriteDetailedLog("`1438`");
            var _37e = _379["bucketID"];
            if (_37e == null) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket does not exist. bucketID delimiter is required when using the bucket manager interface.");
                return false;
            }
            _37a = this.GetBucketById(_37e, true);
            if (_37a == null) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket does not exist. The bucketID '" + new String(_379["bucketID"]) + "' is not declared or is not visible to this SCO.");
                return false;
            }
            if (_37a.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "Bucket improperly declared.");
            }
            break;
        case "ssp.appendData":
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_WRITE_ONLY_ERROR, "The ssp.appendData data model element is write-only.");
            return false;
            break;
        default:
            this.SetErrorState(SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR, "The data model element '" + _374 + "' does not exist.");
            return false;
            break;
    }
    this.WriteDetailedLog("`1544`");
    return true;
}

function SSPApi_CheckForSetValueError(_37f, _380, _381, _382, _383) {
    var _384 = this.RemoveDelimitersFromElementName(_381);
    var _385 = this.GetDelimiterValues(_380);
    _380 = this.RemoveDelimitersFromValue(_380);
    var _386;
    var _387;
    var _388;
    if (_382 !== "") {
        var _389 = this.GetAccessibleBucketCount();
        if (_382 >= _389) {
            this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The SSP Bucket collection does not have an element at index " + _382 + ", the current element count is " + _389 + ".");
            return false;
        }
    }
    switch (_384) {
        case "ssp._count":
            this.WriteDetailedLog("`1557`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The ssp._count data model element is read-only");
            return false;
        case "ssp.allocate":
            this.WriteDetailedLog("`1519`");
            var _38a = _385["bucketID"];
            var _38b = _385["minimum"];
            var _38c = _385["requested"];
            var _38d = _385["reducible"];
            var _38e = _385["persistence"];
            var type = _385["type"];
            if (_38a == null) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The bucketID delimiter must be included in calls to ssp.allocate.");
                return false;
            }
            _38a = new String(_38a);
            if (_38a.length > 4000) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The bucketID can only have a maximum of 4000 characters.");
                return false;
            }
            if (_38c == null) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The requested delimiter must be included in calls to ssp.allocate.");
                return false;
            }
            _38c = new String(_38c);
            if (_38c.search(/\D/) >= 0) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for requested must be a valid integer greater than or equal to 0.");
                return false;
            }
            _38c = parseInt(_38c, 10);
            if (_38c < 0) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for requested must be greater than or equal to 0.");
                return false;
            }
            if (_38c % 2 != 0) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for requested must be an even number.");
                return false;
            }
            var _390 = (Math.pow(2, 32) - 1);
            if (_38c > _390) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for requested is bigger than the max size this LMS allows of " + _390 + ".");
                return false;
            }
            if (_38b != null) {
                _38b = new String(_38b);
                if (_38b.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for minimum must be a valid integer greater than or equal to 0.");
                    return false;
                }
                _38b = parseInt(_38b, 10);
                if (_38b < 0) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for minimum must be greater than or equal to 0.");
                    return false;
                }
                if (_38b % 2 != 0) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for minimum must be an even number.");
                    return false;
                }
                if (_38b > _390) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value for minimum is bigger than the max size this LMS allows of " + _390 + ".");
                    return false;
                }
                if (_38b > _38c) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The minimum requested amount of storage (" + _38b + ") cannot be greater than the requested amount (" + _38c + ").");
                    return false;
                }
            }
            if (_38d != null) {
                _38d = new String(_38d);
                if (_38d != "true" && _38d != "false") {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The reducible delimiter ('" + _38d + "') must be 'true' or 'false'.");
                    return false;
                }
            }
            if (_38e != null) {
                _38e = new String(_38e);
                if (_38e != SSP_PERSISTENCE_LEARNER && _38e != SSP_PERSISTENCE_COURSE && _38e != SSP_PERSISTENCE_SESSION) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The persistence delimiter ('" + _38e + "') must be " + SSP_PERSISTENCE_SESSION + ", '" + SSP_PERSISTENCE_COURSE + "' or '" + SSP_PERSISTENCE_LEARNER + "'.");
                    return false;
                }
            }
            type = new String(type);
            if (type.length > 3000) {
                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The bucket type can only have a maximum of 3000 characters.");
                return false;
            }
            break;
        case "ssp.n.allocation_success":
            this.WriteDetailedLog("`1296`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The ssp.n.allocation_success data model element is read-only");
            return false;
        case "ssp.n.id":
            this.WriteDetailedLog("`1589`");
        case "ssp.n.bucket_id":
            this.WriteDetailedLog("`1466`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The ssp.n.bucket_id data model element is read-only");
            return false;
        case "ssp.n.bucket_state":
            this.WriteDetailedLog("`1394`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The ssp.n.bucket_state data model element is read-only");
            return false;
        case "ssp.n.data":
            this.WriteDetailedLog("`1558`");
            _388 = this.GetBucketByIndex(_382);
            _387 = _385["offset"];
            if (_388.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket improperly declared.");
                return false;
            }
            if (_387 != null) {
                _387 = new String(_387);
                if (_387.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The value for offset must be a valid even integer greater than 0.");
                    return false;
                }
                _387 = parseInt(_387, 10);
                if (_387 % 2 != 0) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The value for offset must be an even integer.");
                    return false;
                }
                if (_387 >= _388.SizeAllocated()) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Offset exceeds bucket size. This bucket currently has allocated " + _388.SizeAllocated() + " bytes of storage. Setting bytes started at offset " + _387 + " was requested.");
                    return false;
                }
                if (_387 >= _388.CurrentlyUsedStorage()) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket not packed. There are currently " + _388.CurrentlyUsedStorage() + " bytes of data stored in this bucket. The offset must be " + "less than this value.");
                    return false;
                }
            } else {
                _387 = 0;
            }
            _386 = _387 + (_380.length * 2);
            if (_386 > _388.SizeAllocated()) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket size exceeded. The value sent has a length of " + (_380.length * 2) + " bytes (each character is 2 bytes). Added to an offset of " + _387 + " bytes, gives a total size of " + _386 + ", which is greater than the allocated size of this bucket (" + _388.SizeAllocated() + " bytes).");
                return false;
            }
            break;
        case "ssp.n.appendData":
            this.WriteDetailedLog("`1439`");
            _388 = this.GetBucketByIndex(_382);
            if (_388.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket improperly declared.");
                return false;
            }
            _386 = _388.CurrentlyUsedStorage() + (_380.length * 2);
            if (_386 > _388.SizeAllocated()) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket size exceeded. The value sent has a length of " + (_380.length * 2) + " bytes (each character is 2 bytes). Added to the current value of size " + _388.CurrentlyUsedStorage() + " bytes, gives a total size of " + _386 + ", which is greater than the allocated size of this bucket (" + _388.SizeAllocated() + " bytes).");
                return false;
            }
            break;
        case "ssp.data":
            this.WriteDetailedLog("`1588`");
            if (_385["bucketID"] == null) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket does not exist. bucketID delimiter is required when using the bucket manager interface.");
                return false;
            }
            _388 = this.GetBucketById(_385["bucketID"], true);
            if (_388 == null) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket does not exist. The bucketID '" + new String(_385["bucketID"]) + "' is not declared or is not visible to this SCO.");
                return false;
            }
            _387 = _385["offset"];
            if (_388.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket improperly declared.");
                return false;
            }
            if (_387 != null) {
                _387 = new String(_387);
                if (_387.search(/\D/) >= 0) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The value for offset must be a valid even integer greater than 0.");
                    return false;
                }
                _387 = parseInt(_387, 10);
                if (_387 % 2 != 0) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The value for offset must be an even integer.");
                    return false;
                }
                if (_387 >= _388.SizeAllocated()) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Offset exceeds bucket size. This bucket currently has allocated " + _388.SizeAllocated() + " bytes of storage. Setting bytes started at offset " + _387 + " was requested.");
                    return false;
                }
                if (_387 >= _388.CurrentlyUsedStorage()) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket not packed. There are currently " + _388.CurrentlyUsedStorage() + " bytes of data stored in this bucket. The offset must be " + "less than this value.");
                    return false;
                }
            } else {
                _387 = 0;
            }
            _386 = _387 + (_380.length * 2);
            if (_386 > _388.SizeAllocated()) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket size exceeded. The value sent has a length of " + (_380.length * 2) + " bytes (each character is 2 bytes). Added to an offset of " + _387 + " bytes, gives a total size of " + _386 + ", which is greater than the allocated size of this bucket (" + _388.SizeAllocated() + " bytes).");
                return false;
            }
            break;
        case "ssp.bucket_state":
            this.WriteDetailedLog("`1438`");
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The ssp.bucket_state data model element is read-only");
            return false;
        case "ssp.appendData":
            this.WriteDetailedLog("`1480`");
            if (_385["bucketID"] == null) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket does not exist. bucketID delimiter is required when using the bucket manager interface.");
                return false;
            }
            _388 = this.GetBucketById(_385["bucketID"], true);
            if (_388 == null) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket does not exist. The bucketID '" + new String(_385["bucketID"]) + "' is not declared or is not visible to this SCO.");
                return false;
            }
            if (_388.AllocationSuccess == SSP_ALLOCATION_SUCCESS_FAILURE) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket improperly declared.");
                return false;
            }
            _386 = _388.CurrentlyUsedStorage() + (_380.length * 2);
            if (_386 > _388.SizeAllocated()) {
                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Bucket size exceeded. The value sent has a length of " + (_380.length * 2) + " bytes (each character is 2 bytes). Added to the current value of size " + _388.CurrentlyUsedStorage() + " bytes, gives a total size of " + _386 + ", which is greater than the allocated size of this bucket (" + _388.SizeAllocated() + " bytes).");
                return false;
            }
            break;
        default:
            this.SetErrorState(SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR, "The data model element '" + _37f + "' does not exist.");
            return false;
            break;
    }
    this.WriteDetailedLog("`1544`");
    return true;
}

function SSPApi_RetrieveGetValueData(_391, _392, _393, _394) {
    var _395 = this.RemoveDelimitersFromElementName(_392);
    var _396 = this.GetDelimiterValues(_391);
    var _397 = "";
    switch (_395) {
        case "ssp._count":
            this.WriteDetailedLog("`1557`");
            _397 = this.GetAccessibleBucketCount();
            break;
        case "ssp.allocate":
            this.WriteDetailedLog("`1519`");
            Debug.AssertError("ERROR - Element is Write Only, ssp.allocate");
            blnReturn = false;
            break;
        case "ssp.n.allocation_success":
            this.WriteDetailedLog("`1296`");
            var _398 = this.GetBucketByIndex(_393);
            _397 = _398.AllocationSuccess;
            break;
        case "ssp.n.id":
            this.WriteDetailedLog("`1589`");
        case "ssp.n.bucket_id":
            this.WriteDetailedLog("`1466`");
            _398 = this.GetBucketByIndex(_393);
            _397 = _398.Id;
            break;
        case "ssp.n.bucket_state":
            this.WriteDetailedLog("`1394`");
            _398 = this.GetBucketByIndex(_393);
            _397 = _398.GetBucketState();
            break;
        case "ssp.n.data":
            this.WriteDetailedLog("`1558`");
            _398 = this.GetBucketByIndex(_393);
            _397 = _398.GetData(_396["offset"], _396["size"]);
            break;
        case "ssp.n.appendData":
            this.WriteDetailedLog("`1439`");
            Debug.AssertError("ERROR - Element is Write Only, ssp.n.appendData");
            blnReturn = false;
            break;
        case "ssp.data":
            this.WriteDetailedLog("`1588`");
            _398 = this.GetBucketById(_396["bucketID"], true);
            _397 = _398.GetData(_396["offset"], _396["size"]);
            break;
        case "ssp.bucket_state":
            this.WriteDetailedLog("`1438`");
            _398 = this.GetBucketById(_396["bucketID"], true);
            _397 = _398.GetBucketState();
            break;
        case "ssp.appendData":
            Debug.AssertError("ERROR - Element is Write Only, ssp.appendData");
            blnReturn = false;
            break;
        default:
            Debug.AssertError("ERROR - Unrecognized data model element:" + _395);
            blnReturn = false;
            break;
    }
    return _397;
}

function SSPApi_StoreValue(_399, _39a, _39b, _39c, _39d) {
    var _39e = this.RemoveDelimitersFromElementName(_39b);
    var _39f = this.GetDelimiterValues(_39a);
    _39a = this.RemoveDelimitersFromValue(_39a);
    var _3a0 = true;
    switch (_39e) {
        case "ssp._count":
            this.WriteDetailedLog("`1557`");
            Debug.AssertError("ERROR - Element is Read Only, ssp._count");
            _3a0 = false;
            break;
        case "ssp.allocate":
            this.WriteDetailedLog("`1519`");
            this.AllocateBucket(_39f["bucketID"], _39f["minimum"], _39f["requested"], _39f["reducible"], _39f["persistence"], _39f["type"]);
            _3a0 = true;
            break;
        case "ssp.n.allocation_success":
            this.WriteDetailedLog("`1296`");
            Debug.AssertError("ERROR - Element is Read Only, ssp._count");
            _3a0 = false;
            break;
        case "ssp.n.id":
            this.WriteDetailedLog("`1589`");
        case "ssp.n.bucket_id":
            this.WriteDetailedLog("`1466`");
            Debug.AssertError("ERROR - Element is Read Only, ssp.n.bucket_id");
            _3a0 = false;
            break;
        case "ssp.n.bucket_state":
            this.WriteDetailedLog("`1394`");
            Debug.AssertError("ERROR - Element is Read Only, ssp.n.bucket_state");
            _3a0 = false;
            break;
        case "ssp.n.data":
            this.WriteDetailedLog("`1558`");
            bucket = this.GetBucketByIndex(_39c);
            bucket.WriteData(_39f["offset"], _39a);
            break;
        case "ssp.n.appendData":
            this.WriteDetailedLog("`1439`");
            bucket = this.GetBucketByIndex(_39c);
            bucket.AppendData(_39a);
            break;
        case "ssp.data":
            this.WriteDetailedLog("`1588`");
            bucket = this.GetBucketById(_39f["bucketID"], true);
            bucket.WriteData(_39f["offset"], _39a);
            break;
        case "ssp.bucket_state":
            this.WriteDetailedLog("`1438`");
            Debug.AssertError("ERROR - Element is Read Only, ssp.n.bucket_id");
            _3a0 = false;
            break;
        case "ssp.appendData":
            this.WriteDetailedLog("`1480`");
            bucket = this.GetBucketById(_39f["bucketID"], true);
            bucket.AppendData(_39a);
            break;
        default:
            Debug.AssertError("ERROR - Unrecognized data model element:" + _39e);
            _3a0 = false;
            break;
    }
    return _3a0;
}

function SSPApi_GetBucketById(_3a1, _3a2) {
    var _3a3 = null;
    for (var _3a4 in Control.SSPBuckets) {
        if (!Control.SSPBuckets.hasOwnProperty(_3a4)) {
            continue;
        }
        if ((_3a2 == false) || Control.SSPBuckets[_3a4].IsVisible(this.GetCurrentSCOItemIdentifier())) {
            if (Control.SSPBuckets[_3a4].Id == _3a1) {
                return Control.SSPBuckets[_3a4];
            }
        }
    }
    return _3a3;
}

function SSPApi_GetBucketByIndex(_3a5) {
    var _3a6 = null;
    i = 0;
    for (var _3a7 in Control.SSPBuckets) {
        if (!Control.SSPBuckets.hasOwnProperty(_3a7)) {
            continue;
        }
        if (Control.SSPBuckets[_3a7].IsVisible(this.GetCurrentSCOItemIdentifier())) {
            if (i == _3a5) {
                return Control.SSPBuckets[_3a7];
            }
            i++;
        }
    }
    return _3a6;
}

function SSPApi_GetAccessibleBucketCount() {
    var _3a8 = 0;
    for (var _3a9 in Control.SSPBuckets) {
        if (!Control.SSPBuckets.hasOwnProperty(_3a9)) {
            continue;
        }
        if (Control.SSPBuckets[_3a9].IsVisible(this.GetCurrentSCOItemIdentifier())) {
            _3a8++;
        }
    }
    return _3a8;
}

function SSPApi_RemoveDelimitersFromElementName(_3aa) {
    var _3ab;
    var _3ac;
    _3aa = new String(_3aa);
    _3ac = _3aa;
    _3ab = _3aa.indexOf("{");
    if (_3ab > 0) {
        _3ac = _3aa.substr(0, _3ab - 1);
    }
    return _3ac.toString();
}

function SSPApi_RemoveDelimitersFromValue(_3ad) {
    var _3ae = /^\{\w+=[^\s\}]+\}/;
    _3ad = new String(_3ad);
    while (_3ad.match(_3ae)) {
        _3ad = _3ad.replace(_3ae, "");
    }
    return _3ad;
}

function SSPApi_GetDelimiterValues(_3af) {
    var _3b0 = /\{\w+=[^\s\}]+\}/g;
    var _3b1 = _3af.match(_3b0);
    var _3b2 = new Array();
    if (_3b1 != null) {
        for (var i = 0; i < _3b1.length; i++) {
            var _3b4 = _3b1[i].slice(1, -1);
            var _3b5 = _3b4.split("=");
            _3b2[_3b5[0]] = [_3b5[1]];
        }
    }
    return _3b2;
}

function SSPApi_GetCurrentSCOItemIdentifier() {
    return Control.Sequencer.GetCurrentActivity().ItemIdentifier;
}

function SSPApi_AllocateBucket(_3b6, _3b7, _3b8, _3b9, _3ba, type) {
    var _3bc = this.GetBucketById(_3b6, false);
    var _3bd;
    if (_3b7 == undefined || type == "minimum") {
        _3b7 = 0;
    }
    if (_3b9 == undefined || type == "reducible") {
        redicible = false;
    }
    if (_3ba == undefined || type == "persistence") {
        _3ba = "learner";
    }
    if (type == undefined || type == "undefined") {
        type = "";
    }
    if (_3bc != null) {
        if (_3bc.SizeMin != _3b7 || _3bc.SizeRequested != _3b8 || _3bc.Reducible != _3b9 || _3bc.Persistence != _3ba || _3bc.BucketType != type) {
            _3bd = Control.SSPBuckets.length;
            Control.SSPBuckets[_3bd] = new SSPBucket(_3bd, _3b6, type, _3ba, _3b7, _3b8, _3b9, this.GetCurrentSCOItemIdentifier(), SSP_ALLOCATION_SUCCESS_FAILURE, "");
            Control.SSPBuckets[_3bd].SetDirtyData();
        }
    } else {
        var _3be = this.GetStorageAllowedByLms(_3b7, _3b8);
        var _3bf;
        if (_3be == null) {
            _3bf = SSP_ALLOCATION_SUCCESS_FAILURE;
        } else {
            if (_3be == _3b7) {
                _3bf = SSP_ALLOCATION_SUCCESS_MINIMUM;
            } else {
                if (_3be == _3b8) {
                    _3bf = SSP_ALLOCATION_SUCCESS_REQUESTED;
                } else {
                    Debug.AssertError("Invalid allocation");
                }
            }
        }
        _3bd = Control.SSPBuckets.length;
        Control.SSPBuckets[_3bd] = new SSPBucket(_3bd, _3b6, type, _3ba, _3b7, _3b8, _3b9, (_3ba == SSP_PERSISTENCE_SESSION ? this.GetCurrentSCOItemIdentifier() : ""), _3bf, "");
        Control.SSPBuckets[_3bd].SetDirtyData();
    }
}

function SSPApi_GetStorageAllowedByLms(_3c0, _3c1) {
    _3c0 = parseInt(_3c0, 10);
    _3c1 = parseInt(_3c1, 10);
    var _3c2 = 0;
    for (var i = 0; i < Control.SSPBuckets.length; i++) {
        _3c2 += Control.SSPBuckets[i].SizeAllocated();
    }
    if ((_3c2 + _3c1) <= this.MaxSSPStorage) {
        return _3c1;
    } else {
        if (_3c0 > 0 && ((_3c2 + _3c0) <= this.MaxSSPStorage)) {
            return _3c0;
        } else {
            return null;
        }
    }
}

function SSPApi_ResetBucketsForActivity(_3c4) {
    var _3c5;
    for (var i = 0; i < Control.SSPBuckets.length; i++) {
        _3c5 = Control.SSPBuckets[i];
        if (_3c5.LocalActivityId == _3c4 && _3c5.Persistence == SSP_PERSISTENCE_SESSION) {
            _3c5.ResetData();
        }
    }
}

function SSPApi_SetErrorState(_3c7, _3c8) {
    this.ApiInstance.SetErrorState(_3c7, _3c8);
}

function SSPApi_WriteDetailedLog(str) {
    this.ApiInstance.WriteDetailedLog(str);
}
