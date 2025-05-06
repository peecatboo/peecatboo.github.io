;
(function() {

    ServerFormater = function() {

    }

    ServerFormater.prototype.ConvertBoolean = ServerFormater_ConvertBoolean;

    ServerFormater.prototype.ConvertCompletionStatus = ServerFormater_ConvertCompletionStatus;
    ServerFormater.prototype.ConvertCredit = ServerFormater_ConvertCredit;
    ServerFormater.prototype.ConvertEntry = ServerFormater_ConvertEntry;
    ServerFormater.prototype.ConvertExit = ServerFormater_ConvertExit;
    ServerFormater.prototype.ConvertMode = ServerFormater_ConvertMode;
    ServerFormater.prototype.ConvertSuccessStatus = ServerFormater_ConvertSuccessStatus;
    ServerFormater.prototype.ConvertInteractionType = ServerFormater_ConvertInteractionType;
    ServerFormater.prototype.ConvertInteractionResult = ServerFormater_ConvertInteractionResult;
    ServerFormater.prototype.GetNumericInteractionResultId = ServerFormater_GetNumericInteractionResultId;

    ServerFormater.prototype.ConvertTimeSpan = ServerFormater_ConvertTimeSpan;
    ServerFormater.prototype.ConvertTime = ServerFormater_ConvertTime;

    ServerFormater.prototype.ConvertSSPAllocationSuccess = ServerFormater_ConvertSSPAllocationSuccess;
    ServerFormater.prototype.ConvertSSPPersistence = ServerFormater_ConvertSSPPersistence;

    ServerFormater.prototype.TrimToLength = ServerFormater_TrimToLength;

    function ServerFormater_ConvertBoolean(value) {
        if (value === true) {
            return "1";
        } else if (value === false) {
            return "0";
        } else {
            // Debug.AssertError("Value is not a boolean");
        }
    }


    function ServerFormater_ConvertCompletionStatus(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_STATUS_UNKNOWN):
                returnValue = 1;
                break;

            case (SCORM_STATUS_COMPLETED):
                returnValue = 2;
                break;

            case (SCORM_STATUS_INCOMPLETE):
                returnValue = 3;
                break;

            case (SCORM_STATUS_BROWSED):
                returnValue = 4;
                break;

            case (SCORM_STATUS_NOT_ATTEMPTED):
                returnValue = 5;
                break;
            default:
                // Debug.AssertError("Unrecognized Completion Status Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertCredit(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_CREDIT):
                returnValue = 1;
                break;

            case (SCORM_CREDIT_NO):
                returnValue = 2;
                break;

            default:
                // Debug.AssertError("Unrecognized Credit Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertEntry(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_ENTRY_AB_INITO):
                returnValue = 1;
                break;

            case (SCORM_ENTRY_RESUME):
                returnValue = 2;
                break;

            case (SCORM_ENTRY_NORMAL):
                returnValue = 3;
                break;

            default:
                // Debug.AssertError("Unrecognized Entry Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertExit(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_EXIT_TIME_OUT):
                returnValue = 1;
                break;

            case (SCORM_EXIT_SUSPEND):
                returnValue = 2;
                break;

            case (SCORM_EXIT_LOGOUT):
                returnValue = 3;
                break;

            case (SCORM_EXIT_NORMAL):
                returnValue = 4;
                break;

            case (SCORM_EXIT_UNKNOWN):
                returnValue = 5;
                break;

            default:
                // Debug.AssertError("Unrecognized Exit Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertMode(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_MODE_NORMAL):
                returnValue = 1;
                break;

            case (SCORM_MODE_BROWSE):
                returnValue = 2;
                break;

            case (SCORM_MODE_REVIEW):
                returnValue = 3;
                break;

            default:
                // Debug.AssertError("Unrecognized Mode Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertSuccessStatus(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_STATUS_UNKNOWN):
                returnValue = 1;
                break;

            case (SCORM_STATUS_PASSED):
                returnValue = 2;
                break;

            case (SCORM_STATUS_FAILED):
                returnValue = 3;
                break;

            default:
                // Debug.AssertError("Unrecognized Success Status Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertInteractionType(value) {

        var returnValue = null;

        switch (value) {

            case (SCORM_TRUE_FALSE):
                returnValue = 1;
                break;

            case (SCORM_CHOICE):
                returnValue = 2;
                break;

            case (SCORM_FILL_IN):
                returnValue = 3;
                break;

            case (SCORM_MATCHING):
                returnValue = 6;
                break;

            case (SCORM_PERFORMANCE):
                returnValue = 7;
                break;

            case (SCORM_SEQUENCING):
                returnValue = 8;
                break;

            case (SCORM_LIKERT):
                returnValue = 5;
                break;

            case (SCORM_NUMERIC):
                returnValue = 9;
                break;

            case (SCORM_LONG_FILL_IN):
                returnValue = 4;
                break;

            case (SCORM_OTHER):
                returnValue = 10;
                break;

            default:
                // Debug.AssertError("Unrecognized Interaction Type Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertInteractionResult(value) {

        //note: the xml creation takes care of the Real type

        var returnValue = null;

        switch (value) {

            case (SCORM_CORRECT):
                returnValue = 1;
                break;

            case (SCORM_UNANTICIPATED):
                returnValue = 3;
                break;

            case (SCORM_INCORRECT):
                returnValue = 2;
                break;

            case (SCORM_NEUTRAL):
                returnValue = 4;
                break;

            default:
                // Debug.AssertError("Unrecognized Interaction Result Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_GetNumericInteractionResultId() {
        return 5;
    }

    function ServerFormater_ConvertTimeSpan(value) {
        return ConvertIso8601TimeSpanToHundredths(value);
    }

    function ServerFormater_ConvertTime(value) {
        return ConvertIso8601TimeToUtcAnsiSql(value);
    }

    function ServerFormater_ConvertSSPAllocationSuccess(value) {
        var returnValue = null;

        switch (value) {
            case (SSP_ALLOCATION_SUCCESS_FAILURE):
                returnValue = 3;
                break;
            case (SSP_ALLOCATION_SUCCESS_MINIMUM):
                returnValue = 1;
                break;
            case (SSP_ALLOCATION_SUCCESS_REQUESTED):
                returnValue = 2;
                break;
            case (SSP_ALLOCATION_SUCCESS_NOT_ATTEMPTED):
                returnValue = 4;
                break;

            default:
                // Debug.AssertError("Unrecognized SSPAllocationSuccess Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_ConvertSSPPersistence(value) {

        var returnValue = null;

        switch (value) {

            case (SSP_PERSISTENCE_LEARNER):
                returnValue = 1;
                break;
            case (SSP_PERSISTENCE_COURSE):
                returnValue = 2;
                break;
            case (SSP_PERSISTENCE_SESSION):
                returnValue = 3;
                break;

            default:
                // Debug.AssertError("Unrecognized SSPPersistence Value");
                returnValue = -1;
                break;
        }

        return returnValue;
    }

    function ServerFormater_TrimToLength(str, len) {

        if (str !== null && str.length > len) {
            str = str.substr(0, len);
        }

        return str;
    }

})();
