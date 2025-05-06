;
(function() {
    Communications = function() {

        //internal state data
        this.IntervalFunctionID = "";
        this.FinalExitCalls = 0;
        this.FailedSubmissions = 0;
        this.Disabled = false; //when disabled, this class does not communicate with the server (used when there is an AICC course launched)

        //functions
        this.StartPostDataProcess = Communications_StartPostDataProcess;
        this.KillPostDataProcess = Communications_KillPostDataProcess;

        this.SaveData = Communications_SaveData;
        this.SaveDataNow = Communications_SaveDataNow;
        this.SaveDataOnExit = Communications_SaveDataOnExit;
        this.SaveDebugLog = Communications_SaveDebugLog;

        this.SendDataToServer = Communications_SendDataToServer;
        this.CheckServerResponse = Communications_CheckServerResponse;

        this.CallFailed = Communications_CallFailed;

        this.Disable = Communications_Disable;

        this.LogOnServer = Communications_LogOnServer;
    }


    function Communications_StartPostDataProcess() {

        if (this.Disabled) {
            return;
        }

        //Control.WriteDetailedLog("Communications_StartPostDataProcess");
        this.IntervalFunctionID = window.setInterval("Control.Comm.SaveData(false, false);", RegistrationToDeliver.Package.Properties.CommCommitFrequency);
    }

    function Communications_KillPostDataProcess() {

        if (this.Disabled) {
            return;
        }

        //Control.WriteDetailedLog("Communications_KillPostDataProcess");
        if (this.IntervalFunctionID !== "") {
            window.clearInterval(this.IntervalFunctionID);
            this.IntervalFunctionID = "";
        }
    }

    function Communications_SaveData(synchronous, isFinalExit) {

        if (this.Disabled) {
            return;
        }

        //Control.WriteDetailedLog("Communications Save Data, synchronous=" + synchronous + ", isExit=" + isFinalExit);

        //DE 5/4/2010: Conditional dispatch code, send back big 4 over DispatchDriver each rollup
        if (typeof DispatchDriver != "undefined" || true) {
            var rootActivity = Control.Activities.GetRootActivity();
            var completion = null;
            if (rootActivity.IsCompleted(null, false) != 'unknown' && rootActivity.IsCompleted(null, false) == true) {
                completion = "completed";
            }
            var success = null;
            if (rootActivity.IsSatisfied(null, false) != 'unknown') {
                if (rootActivity.IsSatisfied(null, false) == true) {
                    success = "passed";
                } else {
                    success = "failed";
                }
            }
            var activityScore = rootActivity.GetPrimaryObjective().NormalizedMeasure;
            var measureStatus = rootActivity.GetPrimaryObjective().MeasureStatus;
            var score = measureStatus == true ? (activityScore * 100.0) : "unknown";

            //Rollup session times across all deliverable activities...
            var trackedSessionTime = 0;
            var reportedSessionTime = 0;
            var allActivities = Control.Activities.ActivityList;
            for (var i = 0; i < allActivities.length; i++) {
                var act = allActivities[i];
                if (act.IsDeliverable()) {
                    trackedSessionTime += ConvertIso8601TimeSpanToHundredths(act.RunTime.SessionTimeTracked);
                    reportedSessionTime += ConvertIso8601TimeSpanToHundredths(act.RunTime.SessionTime);
                }
            }
            var sessionTime = (trackedSessionTime > 0) ? trackedSessionTime : reportedSessionTime;
            if (sessionTime == null || isNaN(sessionTime)) {
                sessionTime = 0;
            }

            //alert("completion:"+completion+",success:"+success+",score:"+score+"sessionTime:"+sessionTime);
            DispatchDriver.SetSummary(completion, success, score, sessionTime);
        } else {
            if (isFinalExit === true) {

                //Control.WriteDetailedLog("About to save final data upon player exit, final exit calls = " + this.FinalExitCalls);

                Control.MarkDirtyDataPosted();

                var stateXml = Control.GetXmlForDirtyData();

                this.SendDataToServer(synchronous, stateXml, true);

            } else if (Control.IsThereDirtyData()) {

                Control.MarkDirtyDataPosted();
                var stateXml = Control.GetXmlForDirtyData();

                this.SendDataToServer(synchronous, stateXml);
            }
        }
    }

    function Communications_SaveDataNow(endPeriodicCommit) {

        if (this.Disabled) {
            return;
        }

        //kill the interval call so we don't get into timing issues with this function being called simultaneously

        //Control.WriteDetailedLog("Communications_SaveDataNow");

        this.KillPostDataProcess();

        this.SaveData(true);

        if (!endPeriodicCommit) {
            this.StartPostDataProcess();
        }
    }

    function Communications_SaveDataOnExit() {

        if (this.Disabled) {
            return;
        }

        //kill the interval call so we don't get into timing issues with this function being called simultaneously

        //Control.WriteDetailedLog("Communications_SaveDataOnExit");

        this.KillPostDataProcess();

        this.SaveData(true, true);
    }

    function Communications_SaveDebugLog() {

        // Only send data if we've go it
        // if (Debug.log.root && Debug.log.root.childNodes.length > 0) {

        //     // Use Sarissa's serializer to get the xml text (.xml no longer works)
        //     var debugLogXml = Debug.log.toXml();

        //     // Do this synchronously because it's done upon exit and
        //     // the page we return to needs to have already gotten the logs
        //     $.ajax({
        //         url: DEBUG_LOG_PERSIST_PAGE,
        //         type: 'POST',
        //         data : debugLogXml,
        //         async: false
        //      });
        // }
    }


    function Communications_SendDataToServer(synchronous, strXmlPostData, isExit) {

        if (this.Disabled) {
            return true;
        }


        // if (isExit) {
        //     var resultPostbackPage= MergeQueryStringParameters(SCORM_RESULTS_PAGE, "isExitScormPlayer=true");
        // } else {
        //     var resultPostbackPage = SCORM_RESULTS_PAGE;
        // }

        // //make sure synchronous is a valid boolean (use the NOT operator twice)
        // synchronous = !!synchronous

        // //Control.WriteDetailedLog("In SendDataToServer, synchronous=" + synchronous + ", strPostData=" + strXmlPostData);

        // // A couple notes about the .ajax call below.  Return type is text because although the string is xml, we
        //   // expect to manually parse the string rather than view it as an xml object.  The content type has to
        // // be explicitly set to text/xml or the java-side code won't read the input stream properly

        // $.ajax({
        //     type: 'POST',
        //     url: resultPostbackPage,
        //     cache: false,
        //     dataType: 'text',
        //     contentType: 'text/xml',
        //     data: strXmlPostData,
        //     async: !synchronous,
        //     success: function(response, textStatus){
        //         Control.WriteDetailedLog("Server Responded With:" + response);
        //         return Control.Comm.CheckServerResponse(response, true, synchronous, isExit);
        //     },
        //     error : function (req, textStatus, errorThrown) {
        //         Control.WriteDetailedLogError("ERROR - Server side error occurred when saving state data, HTTP response not 200 (OK). Status: " + req.status);
        //         var canTryAgain = Control.Comm.CallFailed();
        //         if (canTryAgain){
        //             Control.Comm.SaveData(synchronous, isExit);
        //         }
        //     }
        // });

        // return true;
    }

    function Communications_CheckServerResponse(serverResponse, retryFailuresImmediately, synchronous, isExit) {

        if (this.Disabled) {
            return true;
        }

        /*
    Expected response format
    <?xml version="1.0"?>
    <lmsresponse>
    <error present="true/false">
    <source>error source</source>
    <description>error description</description>
    </error>
    </lmsresponse>
    */

        // var success;

        // serverResponse = String(serverResponse);

        // var REG_EX_ERROR_NODE = /\<error present\=\"(true|false)\"\>/;

        // var matchParts = serverResponse.match(REG_EX_ERROR_NODE);

        // if (matchParts === null || matchParts.length != 2){
        //     Control.WriteDetailedLogError("ERROR - Invalid server response received from the LMS.");
        //     success = false;
        // }
        // else{
        //     var callSucceeded = (matchParts[1] == "false");
        //     if (callSucceeded === false){
        //         Control.WriteDetailedLogError("ERROR - LMS was unable to successfully save state date, see the LMS response for specific error information. Server Response=" + serverResponse);
        //         success = false;
        //     }
        //     else{
        //         success = true;
        //     }
        // }

        // if (success === false){
        //     var canTryAgain = this.CallFailed();

        //     if (retryFailuresImmediately && canTryAgain){
        //         this.SaveData(synchronous, isExit);
        //     }
        // }
        // else{
        //     this.FailedSubmissions = 0;
        //     Control.MarkPostedDataClean();
        // }

        // return success;
    }

    function Communications_CallFailed() {

        if (this.Disabled) {
            return false;
        }

        this.FailedSubmissions++;
        Control.MarkPostedDataDirty();

        //Control.WriteDetailedLog("Communications Call Failed, Failed Submissions=" + this.FailedSubmissions);



        if (this.FailedSubmissions >= RegistrationToDeliver.Package.Properties.CommMaxFailedSubmissions) {
            this.KillPostDataProcess();
            //Control.DisplayError("A fatal error has occurred, communication with the server has been lost.");
            return false;
        }

        return true;
    }

    function Communications_Disable() {
        this.Disabled = true;
    }

    function Communications_LogOnServer(msg, jsErrorObject) {
        //don't do this here
        return false;

        // var msgToSend = msg;
        // if(jsErrorObject != null){
        //     msgToSend = msg + GetErrorDetailString(jsErrorObject);
        // }
        // //Log this js error server side
        // $.ajax({
        //     type: 'POST',
        //     url: SERVER_LOGGER_PAGE,
        //     cache: false,
        //     data: {'msg' : RegistrationToDeliver.Id + " - " + msgToSend},
        //     async: false
        // });
    }

})();
