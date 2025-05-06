(function () {
    /**
     * Xyleme functionality start
     */
    var XylemeUtils = function () {
        // we use "_"(underscore) to encode/decode other characters
        var encodingMap = {
            "_": "_0",
            "+": "_1",
            "[": "_2",
            "]": "_3",
            "%": "_4",
            " ": "_5",
            ";": "_6",
            "`": "_7"
        },
        decodingMap = {
            "+": "_1",
            "[": "_2",
            "]": "_3",
            "%": "_4",
            " ": "_5",
            ";": "_6",
            "`": "_7",
            "_": "_0"
        },
        delimitersEncMap = {
            "-": "-0",
            "|": "-1",
            "!": "-2",
            "#": "-3",
            "*": "-4",
            "{": "-5",
            "}": "-6",
            ":": "-7",
            "\"": "-8",
            "@@": "-9"
        },
        delimitersDecMap = {
            "@@": "-9",
            "\"": "-8",
            ":": "-7",
            "}": "-6",
            "{": "-5",
            "*": "-4",
            "#": "-3",
            "!": "-2",
            "|": "-1",
            "-": "-0"
        };

        function encode(text, map) {
            for (prop in map) {
                text = text.split(prop).join(map[prop]);
            }
            return text;
        }

        function decode(text, map) {
            for (prop in map) {
                text = text.split(map[prop]).join(prop);
            }
            return text;
        }
        return {
            /*
             * encode text using encoding map
             */
            encodeText: function (text) {
                return encode(text, encodingMap);
            },
            /*
             * decode text using decoding map
             */
            decodeText: function (text) {
                return decode(text, decodingMap);
            },
            /*
             * encode delimiters in text using encoding map
             */
            encodeDelimiters: function (text) {
                return encode(text, delimitersEncMap);
            },
            /*
             * decode delimiters in text using decoding map
             */
            decodeDelimiters: function (text) {
                return decode(text, delimitersDecMap);
            }
        }
    }();
    /*
     * Xyleme's functionality end
     */
    //TODO: evaluate calling of EvaluatePossibleNavigationRequests to ensure that display state is always updated appropriately (i think we're missing a call after
    //loading a sco, if we add this, make sure it's not redundant with the call in ScoUnloaded
    Controller = function() {

        //state data
        this.ProcessedUnload = false;
        this.MenuIsVisible = false; // AMP 07-30-08 The Scorm 2004 Conformance AutoTest relies on Control.MenuIsVisible when checking the visibility of the menu/Table of Contents
        this.Initialized = false;
        this.ExitScormPlayerCalled = false;
        this.SignalTerminatedPending = false;
        this.PopupBlocked = false; // EDM 9-23-08 Indicates that the SCO popup was blocked by a popup blocker.

        this.ExitDialogVisible = false;

        //overall processing
        this.Initialize = Controller_Initialize;
        this.Unload = Controller_Unload;

        this.GetSuspendData = Controller_GetSuspendData;

        //menu functions
        this.CreateMenuItem = Controller_CreateMenuItem;
        this.RenderMenuItem = Controller_RenderMenuItem;
        this.RedrawChildren = Controller_RedrawChildren;
        this.UpdateDisplay = Controller_UpdateDisplay;
        this.RefreshPage = Controller_RefreshPage;

        //activity
        this.Activities = null;

        //time limit
        this.CheckTimeLimitIntervalId = null;
        this.IsUserOverTimeLimit = Controller_IsUserOverTimeLimit;
        this.ExitIfTimeLimitExceeded = Controller_ExitIfTimeLimitExceeded;
        this.BlockCourseEntryWithMessage = Controller_BlockCourseEntryWithMessage;

        //logistics
        this.ScoLoader = null;
        this.ScoUnloaded = Controller_ScoUnloaded;
        this.ExitScormPlayer = Controller_ExitScormPlayer;
        this.ExitSco = Controller_ExitSco;

        //dirty data management
        this.MarkPostedDataDirty = Controller_MarkPostedDataDirty;
        this.MarkPostedDataClean = Controller_MarkPostedDataClean;
        this.MarkDirtyDataPosted = Controller_MarkDirtyDataPosted;
        this.GetXmlForDirtyData = Controller_GetXmlForDirtyData;
        this.IsThereDirtyData = Controller_IsThereDirtyData;

        //error management
        this.DisplayError = Controller_DisplayError;
        this.GetExceptionText = Controller_GetExceptionText;

        this.TildaCounter = 0;
        this.QuestionCounter = 0;
        this.PipeCounter = 0;
        this.CheckForDebugCommand = Controller_CheckForDebugCommand;

        //GUI Event Handlers
        this.CloseSco = Controller_CloseSco;
        this.ReturnToLms = Controller_ReturnToLms;
        this.GetReturnToLmsNavigationRequest = Controller_GetReturnToLmsNavigationRequest;
        this.ToggleMenuVisibility = Controller_ToggleMenuVisibility;
        this.TriggerReturnToLMS = Controller_TriggerReturnToLMS;
        this.HideExitDialog = Controller_HideExitDialog;
        this.Next = Controller_Next; // AMP 07-30-08 The Scorm 2004 Conformance AutoTest relies on Control.Next being the handler for a next request
        this.Previous = Controller_Previous; // AMP 07-30-08 The Scorm 2004 Conformance AutoTest relies on Control.Previous being the handler for a previous request
        this.Abandon = Controller_Abandon;
        this.AbandonAll = Controller_AbandonAll;
        this.Suspend = Controller_Suspend;
        this.Exit = Controller_Exit;
        this.ExitAll = Controller_ExitAll;
        this.ChoiceRequest = Controller_ChoiceRequest; // AMP 07-30-08 The Scorm 2004 Conformance AutoTest relies on Control.ChoiceRequest(id) being the handler for clicking an activity


        this.ScoHasTerminatedSoUnload = Controller_ScoHasTerminatedSoUnload;
        this.SignalTerminated = Controller_SignalTerminated;
        this.TranslateRunTimeNavRequest = Controller_TranslateRunTimeNavRequest;
        this.FindPossibleNavRequestForRuntimeNavRequest = Controller_FindPossibleNavRequestForRuntimeNavRequest;
        this.GetMessageText = Controller_GetMessageText;

        this.ClearPendingNavigationRequest = Controller_ClearPendingNavigationRequest;
        this.IsThereAPendingNavigationRequest = Controller_IsThereAPendingNavigationRequest;
        this.PendingNavigationRequest = null;

        this.GetPreferredReturnToLmsAction = Controller_GetPreferredReturnToLmsAction;

        this.UpdateGlobalLearnerPrefs = Controller_UpdateGlobalLearnerPrefs;

        //Sequencing
        this.Sequencer = null;
        this.LookAheadSequencer = null;
        this.DeliverActivity = Controller_DeliverActivity;
        this.PerformDelayedDeliveryInitialization = Controller_PerformDelayedDeliveryInitialization;

        this.PossibleNavigationRequests = new Array();
        this.InitializePossibleNavigationRequests = Controller_InitializePossibleNavigationRequests;
        this.EvaluatePossibleNavigationRequests = Controller_EvaluatePossibleNavigationRequests;
        this.FindPossibleChoiceRequestForActivity = Controller_FindPossibleChoiceRequestForActivity;
        this.GetPossibleContinueRequest = Controller_GetPossibleContinueRequest;
        this.GetPossiblePreviousRequest = Controller_GetPossiblePreviousRequest;

        this.IsTargetValid = Controller_IsTargetValid;
        this.ParseTargetStringIntoActivity = Controller_ParseTargetStringIntoActivity;
        this.IsChoiceRequestValid = Controller_IsChoiceRequestValid;
        this.IsJumpRequestValid = Controller_IsJumpRequestValid;
        this.IsContinueRequestValid = Controller_IsContinueRequestValid;
        this.IsPreviousRequestValid = Controller_IsPreviousRequestValid;
        this.ParseTargetStringFromChoiceRequest = Controller_ParseTargetStringFromChoiceRequest;

        this.CloneSequencer = Controller_CloneSequencer;
        this.TearDownSequencer = Controller_TearDownSequencer;

        //Runtime
        this.Api = null;

        //Debug
        this.WriteAuditLog = Controller_WriteAuditLog;
        this.WriteDetailedLog = Controller_WriteDetailedLog;
        this.WriteDetailedLogError = Controller_WriteDetailedLogError;
        this.WriteHistoryLog = Controller_WriteHistoryLog;
        this.WriteHistoryReturnValue = Controller_WriteHistoryReturnValue;

        //History Log
        this.GetLaunchHistoryId = Controller_GetLaunchHistoryId;

        //Xyleme customizations
        this.RerandomizeChildren = Controller_RerandomizeChildren;

        //SSP
        this.SSPBuckets = null;

        // Costom functions
        this.GetBookmarkType = Controller_getBookmarkType;
        this.GetBookmark = Controller_getBookmark;
        this.ApplyBookmark = Controller_applyBookmark;
        this.resetChoiceBranch = Controller_resetChoiceBranch;
        this.resetChoiceBranchContent = Controller_resetChoiceBranchContent;
        this.isPartOfChoiceBranch = Controller_isPartOfChoiceBranch;
        this.isAssessmentWithoutAttempts = Controler_isAssessmentWithoutAttempts;
        this.retake = Controller_retake;
        this.resetAllAncestors = Controller_resetAllAncestors;
        this.resetActivity = Controller_resetActivity;
        this.resetContainer = Controller_resetContainer;
        this.resetObjectives = Controller_resetObjectives;
        this.clearSubmitAllStatus = Controller_clearSubmitAllStatus;
        this.isSubmitAllMode = Controller_isSubmitAllMode;
        this.isAssessment = Controller_isAssessment;
        this.isAnyAssessment = Controller_isAnyAssessment;
        this.hasSubassessments = Controller_hasSubassessments;
        this.isSubmitAllStatusSaved = Controller_isSubmitAllStatusSaved;
        this.isScorecard = Controller_isScorecard;
        this.findScorecard = Controller_findScorecard;
        this.getNextPage = Controller_getNextPage;
        this.getPreviousPage = Controller_getPreviousPage;
        this.getFollowingPageId = Controller_getFollowingPageId;
        this.getPrecedingPageId = Controller_getPrecedingPageId;
    };

    function Controller_Initialize(integration, dataHandler) {
        var sdata, bookmark, bookmarkActivity;

        try {

            this.Integration = integration || [];
            this.DataHandler = dataHandler || [];

            if (dataHandler) {
                sdata = dataHandler.suspendData;
                bookmark = dataHandler.bookmark;
            }

            this.Package = RegistrationToDeliver.Package;

            //this.WriteAuditLog("Control Initialize");

            this.Api = apiReference;

            this.Activities = new ActivityRepository();
            this.Activities.InitializeFromRegistration(RegistrationToDeliver, QuerystringAdditions);

            // IntegrationImplementation.initializeCustomVars();

            //get bookmark
            if (/_type_/.test(bookmark)) {
                var bookmarkType = bookmark;
                bookmark = bookmark.match(/^.*(?=_type_)/)[0];
            }

            if (bookmark != null && bookmark != '') {

                if (dataHandler.isHashBookmark) {
                    for (var i = 0; i < RegistrationToDeliver.Activities.length; i++) {
                        if (RegistrationToDeliver.Activities[i].ItemIdentifier === bookmark) {
                            bookmarkActivity = RegistrationToDeliver.Activities[i];
                        }
                    }

                    while (bookmarkActivity && bookmarkActivity.ParentActivity) {
                        bookmarkActivity = bookmarkActivity.ParentActivity;
                        if (bookmarkActivity.GetSelectionCountStatus() && bookmarkActivity.GetSelectionCount() < bookmarkActivity.GetChildren().length) {
                            bookmark = null;
                            bookmarkActivity = null;
                        }
                    }
                }

                RegistrationToDeliver.SuspendedActivity = bookmark;
            } else {
                // check for containers with flow=false that could prevent the course from starting
                var i, flow = true;

                for (i = 0; !RegistrationToDeliver.Activities[i].IsALeaf() && i < RegistrationToDeliver.Activities.length; i++) {
                    if (!RegistrationToDeliver.Activities[i].GetSequencingControlFlow()) {
                        flow = false;
                    }
                }

                if (!flow) {
                    bookmark = RegistrationToDeliver.Activities[i].GetItemIdentifier();
                    RegistrationToDeliver.SuspendedActivity = bookmark;
                }
            }

            if (sdata && bookmark) {
                //parse SuspendData to re-populate the Activity state

                if (sdata != '') {
                    sdata = XylemeUtils.decodeText(sdata);
                    sdata = Compressor.decompress(sdata);

                    var timeRemaining = sdata.split('@@')[1];
                    if (timeRemaining.length > 0) {
                        this.Timers = XylemeUtils.decodeDelimiters(timeRemaining);
                    }

                    var globalObjData;
                    if (sdata.indexOf('@@') > 0 && sdata.split('@@').length > 2) {
                        globalObjData = sdata.split('@@')[2].split('!');
                    } else {
                        globalObjData = '';
                    }
                    var acts = sdata.split('@@')[0].split('!');
                    //alert(acts.length);
                    for (var a = 0; a < acts.length; a++) {

                        //RegistrationToDeliver.Activities[a].SetSuspended(true);

                        //alert(RegistrationToDeliver.Activities[a].ActivityObjectives.length);
                        var blnCompletion = false;
                        var blnSatisfaction = false;
                        var blnSatisfactionKnown = false;
                        var actStatus = acts[a].split("#")[0];
                        //alert(acts[a].split("|")[2]);

                        if (actStatus.split("|")[0] == 'true') {
                            blnCompletion = true;
                        }
                        if (actStatus.split("|")[1] == 'true') {
                            blnSatisfaction = true;
                            blnSatisfactionKnown = true;
                        } else if (actStatus.split("|")[1] == 'false') {
                            blnSatisfaction = false;
                            blnSatisfactionKnown = true;
                        }

                        if (actStatus.split("|")[0] !== 'unknown') {
                            RegistrationToDeliver.Activities[a].SetAttemptProgressStatus(true);
                        }

                        if (actStatus.split("|")[0] !== 'unknown' || +actStatus.split("|")[2]) {
                            RegistrationToDeliver.Activities[a].SetActivityProgressStatus(true);
                            RegistrationToDeliver.Activities[a].SetSuspended(true);
                        }

                        RegistrationToDeliver.Activities[a].SetAttemptCompletionStatus(blnCompletion);

                        for (var o = 0; o < RegistrationToDeliver.Activities[a].ActivityObjectives.length; o++) {

                            RegistrationToDeliver.Activities[a].ActivityObjectives[o].SetProgressStatus(blnSatisfactionKnown, false, RegistrationToDeliver.Activities[a], true, false);

                            if (blnSatisfactionKnown == true) {
                                if (blnSatisfaction === true) {
                                    //RegistrationToDeliver.Activities[a].ActivityObjectives[o].SetMeasureStatus(true,RegistrationToDeliver.Activities[a]);
                                    //RegistrationToDeliver.Activities[a].ActivityObjectives[o].SetNormalizedMeasure(1.0, RegistrationToDeliver.Activities[a]);
                                } else {
                                    //RegistrationToDeliver.Activities[a].ActivityObjectives[o].SetMeasureStatus(true,RegistrationToDeliver.Activities[a]);
                                    //RegistrationToDeliver.Activities[a].ActivityObjectives[o].SetNormalizedMeasure(0.0, RegistrationToDeliver.Activities[a]);
                                }
                            }

                            RegistrationToDeliver.Activities[a].ActivityObjectives[o].SetSatisfiedStatus(blnSatisfaction, true, RegistrationToDeliver.Activities[a]);
                            //alert('RegistrationToDeliver.Activities[a].ActivityObjectives[0].GetSatisfiedStatus : ' + RegistrationToDeliver.Activities[a].ActivityObjectives[0].GetSatisfiedStatus(RegistrationToDeliver.Activities[a],true));
                        }


                        //restore ActivityAttemptCount
                        if (actStatus.split("|")[2]) {
                            RegistrationToDeliver.Activities[a].ActivityAttemptCount = parseInt(actStatus.split("|")[2]);
                        }

                        //restore SCO score
                        if (actStatus.split("|")[3] && actStatus.split("|")[3] != '') {
                            RegistrationToDeliver.Activities[a].ActivityObjectives[0].ProgressStatus = true;
                            RegistrationToDeliver.Activities[a].ActivityObjectives[0].MeasureStatus = true;
                            RegistrationToDeliver.Activities[a].ActivityObjectives[0].NormalizedMeasure = parseFloat(actStatus.split("|")[3]);
                            RegistrationToDeliver.Activities[a].ActivityObjectives[0].FirstNormalizedMeasure = parseFloat(actStatus.split("|")[3]);
                            RegistrationToDeliver.Activities[a].ActivityObjectives[0].PrevNormalizedMeasure = parseFloat(actStatus.split("|")[3]);
                        }

                        // restore randomization order
                        if (actStatus.split("|")[4]) {
                            var allChildren = RegistrationToDeliver.Activities[a].GetChildren();
                            var order = actStatus.split("|")[4].split(",");
                            for (var i = 0; i < allChildren.length; i++) {
                                allChildren[i].Ordinal = 0;
                                allChildren[i].Included = false;
                            }
                            var included = new Array();
                            for (var i = 0; i < order.length; i++) {
                                var child = allChildren[order[i]];
                                child.Included = true;
                                child.Ordinal = i + 1;
                                included.push(child);
                            }
                            RegistrationToDeliver.Activities[a].SetAvailableChildren(included);
                            RegistrationToDeliver.Activities[a].RandomizedChildren = true;
                        }

                        if (RegistrationToDeliver.Activities[a].RunTime != null) {

                            if (RegistrationToDeliver.Activities[a].RunTime != null) {
                                RegistrationToDeliver.Activities[a].RunTime.CompletionStatus = actStatus.split("|")[0].replace('true', 'completed').replace('false', 'incomplete');
                                if (RegistrationToDeliver.Activities[a].RunTime.Objectives.length > 0) {
                                    RegistrationToDeliver.Activities[a].RunTime.Objectives[0].CompletionStatus = actStatus.split("|")[0].replace('true', 'completed').replace('false', 'incomplete');
                                }
                            }

                            RegistrationToDeliver.Activities[a].RunTime.SatisfactionStatus = actStatus.split("|")[1].replace('true', 'passed').replace('false', 'failed');
                            //alert('RegistrationToDeliver.Activities[a].RunTime.SatisfactionStatus = ' + RegistrationToDeliver.Activities[a].RunTime.SatisfactionStatus);
                            for (var rto = 0; rto < RegistrationToDeliver.Activities[a].RunTime.Objectives.length; rto++) {
                                RegistrationToDeliver.Activities[a].RunTime.Objectives[rto].SatisfactionStatus = actStatus.split("|")[1].replace('true', 'passed').replace('false', 'failed');
                                RegistrationToDeliver.Activities[a].RunTime.Objectives[rto].ScoreScaled = 1.0;
                            }


                            // restore interactions
                            if (acts[a].split("#").length > 1) {
                                var interactions = acts[a].split("#");
                                for (var i = 1; i < interactions.length; i++) {
                                    var fields = interactions[i].split("*");
                                    var id = fields[0];
                                    // restore rest of fields
                                    var result = fields[1];
                                    var weighting = fields[2];
                                    var description = XylemeUtils.decodeDelimiters(fields[3]);
                                    var learnerResponse = typeof(fields[4]) !== "undefined" ? XylemeUtils.decodeDelimiters(fields[4]) : "";

                                    var interaction = new ActivityRunTimeInteraction(id,
                                        "",
                                        null,
                                        null,
                                        weighting,
                                        result,
                                        null,
                                        description,
                                        learnerResponse,
                                        new Array(),
                                        new Array());
                                    RegistrationToDeliver.Activities[a].RunTime.Interactions.push(interaction);
                                    RegistrationToDeliver.Activities[a].RunTime.Entry = "resume";
                                    RegistrationToDeliver.Activities[a].RunTime.Exit = "suspend";
                                }
                            }
                        }
                    }
                    // populate GlobalObjectives from saved data
                    for (var go = 0; go < globalObjData.length; go++) {

                        if (globalObjData[go].split("|")[0].substr(0, 1) === 't') {
                            RegistrationToDeliver.GlobalObjectives[go].MeasureStatus = true;
                        }
                        if (RegistrationToDeliver.GlobalObjectives[go].MeasureStatus == true && globalObjData[go].split("|")[1] != '') {
                            RegistrationToDeliver.GlobalObjectives[go].NormalizedMeasure = parseFloat(globalObjData[go].split("|")[1]);
                        }
                        if (globalObjData[go].split("|")[2].substr(0, 1) === 't') {
                            RegistrationToDeliver.GlobalObjectives[go].ProgressStatus = true;
                        }
                        if (globalObjData[go].split("|")[3].substr(0, 1) === 't') {
                            RegistrationToDeliver.GlobalObjectives[go].SatisfiedStatus = true;
                        }
                    }

                    if (sdata.indexOf('#~') === -1) {
                        this.DataHandler.PTFdataToRestore = "";
                    } else {
                        this.DataHandler.PTFdataToRestore = sdata.substring(sdata.indexOf('#~') + 2, sdata.lastIndexOf('#~'));
                    }
                } else { // first start
                    if (RegistrationToDeliver.Activities[0].LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationLimit) { // init timer, in minutes
                        this.Package.Properties.TimeLimit = ConvertIso8601TimeSpanToHundredths(RegistrationToDeliver.Activities[0].LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationLimit) / 6000;
                    }
                }
            }

            /*if (ContentPageAddress) { // replace page guids with absolute urls in preview
        for (a in RegistrationToDeliver.Activities) {
            if (!RegistrationToDeliver.Activities.hasOwnProperty(a)) {
                continue;
            }

            var lo = RegistrationToDeliver.Activities[a].LearningObject;
            if (lo.Href && lo.Href.indexOf("http") != 0 && lo.Href.indexOf("SCORECARD") == -1 && lo.Href.toLowerCase().indexOf("about:blank") == -1) {
                lo.Href = ContentPageAddress + "&guid=" + lo.Href;
            } else if (lo.Href.indexOf("SCORECARD") != -1) { // scorecard in preview
                lo.Href = ContentPackageAddress + SCORECARD_RELATIVE_PATH; // the constant is in DefaultIntegration.js
            }
        }

        // initialize timer for preview
        if (RegistrationToDeliver.Activities[0].LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationLimit) { // init timer, in minutes
            this.Package.Properties.TimeLimit = ConvertIso8601TimeSpanToHundredths(RegistrationToDeliver.Activities[0].LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationLimit)/6000;
        }
    }*/

            this.Sequencer = new Sequencer(false, this.Activities);
            this.Sequencer.GlobalObjectives = RegistrationToDeliver.GlobalObjectives;
            this.Sequencer.SharedData = RegistrationToDeliver.SharedData;
            this.Sequencer.Activities.SetSequencer(this.Sequencer, false);

            this.SSPBuckets = RegistrationToDeliver.SSPBuckets;

            this.SharedData = RegistrationToDeliver.SharedData;

            this.DeliverFramesetUnloadEventCalled = false;

            if (SSP_ENABLED && this.Api.SSPApi != null) {
                this.Api.SSPApi.InitializeBuckets();
            }

            this.InitializePossibleNavigationRequests();

            var suspendedActivity = this.Activities.GetActivityByDatabaseId(RegistrationToDeliver.SuspendedActivity);
            if (suspendedActivity == null) {
                suspendedActivity = this.Activities.GetActivityFromIdentifier(RegistrationToDeliver.SuspendedActivity);
            }
            this.Sequencer.SetSuspendedActivity(suspendedActivity);

            this.Sequencer.InitialRandomizationAndSelection(!!sdata);

            this.CreateMenuItem(null, this.Activities.ActivityTree);

            if (bookmarkType) {
                this.ApplyBookmark(bookmarkType, suspendedActivity);
            }

            this.LookAheadSequencer = new Sequencer(true, this.Sequencer.Activities.Clone());

            this.Comm = new Communications();

            var isPreview = ExternalRegistrationId == '';

            //If is preview or we're launching an AICC course, then we don't want to send any posts to the server, the content will take care of it
            //Also disable communications if the registration is in preview mode (indicated by lack of external reg id.  Note that
            //"review" mode where isTracking=false does NOT disable communications since we still want to postback history logs.
            if (isPreview || this.Package.LearningStandard.isAICC()) {
                this.Comm.Disable();
            }

            this.Comm.StartPostDataProcess();

            // Build full URL's using the relative URLs for Intermediate and Popup pages.  These files will be found
            // relative to the deliver page itself.  Fully qualified urls are built due to an incompatability within
            // Safari using relative URLs.
            var deliveryPageUrl = window.location.toString();
            IntermediatePage.PageHref = BuildFullUrl(IntermediatePage.PageHref, deliveryPageUrl);
            PopupLauncherPage.PageHref = BuildFullUrl(PopupLauncherPage.PageHref, deliveryPageUrl);

            this.ScoLoader = new ScoLoader(IntermediatePage, PopupLauncherPage, PathToCourse,
                RegistrationToDeliver.Package.Properties.ScoLaunchType,
                RegistrationToDeliver.Package.Properties.WrapScoWindowWithApi,
                RegistrationToDeliver.Package.LearningStandard);

            this.Initialized = true;

            //If time limit specified, and exceeded, stop them here
            if (this.Package.Properties.TimeLimit > 0 && this.IsUserOverTimeLimit()) {
                //this.WriteAuditLog("Time limit exceeded, blocking entry to course");
                this.BlockCourseEntryWithMessage(IntegrationImplementation.GetString("The time limit for this course has been exceeded."));
            }
            //Otherwise, carry on like normal, start sequencer, etc
            else {
                this.Sequencer.Start();

                //todo: make it an option to invoke the look ahead sequencer asychronously (can improve apparent load speed on very large courses)
                //window.setTimeout("Control.EvaluatePossibleNavigationRequests()", 1);
                this.EvaluatePossibleNavigationRequests();

                //Implement time limit checking, if set above default of 0
                if (this.Package.Properties.TimeLimit > 0) {
                    this.CheckTimeLimitIntervalId = setInterval("Control.ExitIfTimeLimitExceeded()", 5000);
                }
            }

            this.Integration.triggerPlayerStart();

        } catch (error) {
            var msgStr = "Controller_Initialize Error: ";
            if (typeof RegistrationToDeliver != "undefined" && typeof RegistrationToDeliver.Id != "undefined") {
                msgStr = msgStr + "RegistrationId: " + RegistrationToDeliver.Id + ", ";
            }
            //this.Comm.LogOnServer(msgStr, error);
            throw error;
        }

        var message = 'Leaving this assessment will mark your attempt as completed.\nYou will now be able to submit other responses on return to the course'
    }

    // Unload is triggered by the deliver page's onbeforeunload and onunload events.  Most likely the onbeforeunload
    // is the only real time it's used since the subsequent call will exit early.

    function Controller_Unload() {
        var suspendData = {};

        try {

            //this.WriteAuditLog("Control Unload: this.ProcessedUnload=" + this.ProcessedUnload + ", this.ExitScormPlayerCalled=" + this.ExitScormPlayerCalled + ", this.Api.NeedToCloseOutSession()=" + this.Api.NeedToCloseOutSession());

            // Unload is called in two spots, onbeforeunload and onunload of the deliver page so this variable
            // basically just indicates that onbeforeunload has already been called.  Note that Chrome can try to run onbeforeunload and onunload
            // at teh same time so use the early DeliverFramesetUnloadEventCalled variable here rather than ProcessedUnload

            // added right part (merging)
            if (this.DeliverFramesetUnloadEventCalled || this.RefreshPageForAiccCalled) {
                return;
            }

            isSubmitAll = /Resume/.test(this.GetBookmarkType()) && this.isSubmitAllMode() && !this.isSubmitAllStatusSaved();

            this.DeliverFramesetUnloadEventCalled = true;

            // added (merging)
            if (this.Api != null && this.Api.RunTimeData != null && this.Api.RunTimeData.NavRequest == SCORM_RUNTIME_NAV_REQUEST_NONE) {
                this.Sequencer.ReturnToLmsInvoked = true;
            }

            // Clone the sequencer
            var preUnloadedSequencer = new Sequencer(false, this.Sequencer.Activities.Clone());
            var preUnloadedCurrentActivity = this.Sequencer.CurrentActivity;

            // Save off the API values that might get altered via CloseOutSession (may be called by ScoUnloaded)
            var preUnloadSessionTime = this.Api.RunTimeData.SessionTime;
            var preUnloadTotalTime = this.Api.RunTimeData.TotalTime;
            var preUnloadTotalTimeTracked = this.Api.RunTimeData.TotalTimeTracked;
            var preUnloadEntry = this.Api.RunTimeData.Entry;
            var preUnloadCompletionStatus = this.Api.RunTimeData.CompletionStatus;
            var preUnloadCompletionStatusChangedDuringRuntime = this.Api.RunTimeData.CompletionStatusChangedDuringRuntime;
            var preUnloadSuccessStatus = this.Api.RunTimeData.SuccessStatus;
            var preUnloadSuccessStatusChangedDuringRuntime = this.Api.RunTimeData.SuccessStatusChangedDuringRuntime;
            var preUnloadNavRequest = this.Api.RunTimeData.NavRequest;

            // Since Unload has been processed it means we'ere tearing down windows now.  So set the return to lms nav request
            // in a legacy manner that prevents any user-selectable alerts which could short circuit processing of the
            // overall sequencer we're trying to get to.  This nav request mimicks a click of "return to lms"
            if (this.Activities.GetNumDeliverableActivities() == 1) {
                this.PendingNavigationRequest = this.GetReturnToLmsNavigationRequest("exit_all");
            } else {
                this.PendingNavigationRequest = this.GetReturnToLmsNavigationRequest("suspend_all");
            }

            this.ScoUnloaded("Unload()"); // will ultimately trigger the OverallSequencingProcess and thus activity rollup.  I
            // it also will close out the session if the content didn't call finish

            // This allows us to return to a state from which a subsequent Finish/Terminate call from a SCO's window onbeforeunload or onunload
            // event could be serviced correctly.  A Sequencer, particularly form SCORM 2004 cannot be run more than once without side effects.
            // This is why we're reverting to the previous state -- to allow for a subsequent run.

            // keep global objectives updated because they have no getters to update them later
            var preUnloadGlobalObjectives = new Array();
            for (var objId in this.Sequencer.GlobalObjectives) {
                if (!this.Sequencer.GlobalObjectives.hasOwnProperty(objId)) {
                    continue;
                }

                preUnloadGlobalObjectives.push(this.Sequencer.GlobalObjectives[objId].Clone());
            }

            this.Sequencer = preUnloadedSequencer;
            this.Sequencer.CurrentActivity = preUnloadedCurrentActivity;

            this.Api.RunTimeData.SessionTime = preUnloadSessionTime;
            this.Api.RunTimeData.TotalTime = preUnloadTotalTime;
            this.Api.RunTimeData.TotalTimeTracked = preUnloadTotalTimeTracked;
            this.Api.RunTimeData.Entry = preUnloadEntry;
            this.Api.RunTimeData.CompletionStatus = preUnloadCompletionStatus;
            this.Api.RunTimeData.CompletionStatusChangedDuringRuntime = preUnloadCompletionStatusChangedDuringRuntime;
            this.Api.RunTimeData.SuccessStatus = preUnloadSuccessStatus;
            this.Api.RunTimeData.SuccessStatusChangedDuringRuntime = preUnloadSuccessStatusChangedDuringRuntime
            this.Api.RunTimeData.NavRequest = preUnloadNavRequest;
            this.Api.CloseOutSessionCalled = false;
            for (var objId in preUnloadGlobalObjectives) {
                if (!preUnloadGlobalObjectives.hasOwnProperty(objId)) {
                    continue;
                }

                this.Sequencer.GlobalObjectives.push(preUnloadGlobalObjectives[objId].Clone());
            }

            this.ScoLoader.ScoLoaded = true;

            // Is this necessary?  Test new win, new win and kill middle window on all browsers to test.
            if (this.SignalTerminatedPending) {
                this.Api.CloseOutSessionCalled = true;
                this.SignalTerminated();
            }

            if (!this.ExitScormPlayerCalled) {
                // Some sequencing paths such as simply "close item" will not have resulted in ExitScormPlayer
                this.ExitScormPlayer("Unload()");
            }

            // This is part of resetting the state so a lagging Api.Terminate() can do its thing as if unload had never run
            this.ExitScormPlayerCalled = false;

            this.ProcessedUnload = true;

            suspendData = this.GetSuspendData();

            this.Integration.triggerPlayerUnload(suspendData);

            //******************************************************************************//

        } catch (error) {
            var msgStr = "Controller_Unload Error: ";
            if (typeof RegistrationToDeliver != "undefined" && typeof RegistrationToDeliver.Id != "undefined") {
                msgStr = msgStr + "RegistrationId: " + RegistrationToDeliver.Id + ", ";
            }
            //this.Comm.LogOnServer(msgStr, error);
            throw error;
        }
    }

    //private

    function Controller_GetSuspendData() {
        var suspendData = {},
            isCompleted = false,
            isSubmitAll,
            rootActivity = this.Activities.GetRootActivity();

        //set completion;
        if (rootActivity.IsCompleted(null, false) != 'unknown' && rootActivity.IsCompleted(null, false) == true) {
            isCompleted = true;
        }
        suspendData.completionStatus = isCompleted;
        //set satisfaction
        suspendData.successStatus = ''; // stays empty, if LMS setting prevents it from being saved
        if (rootActivity.IsSatisfied(null, false) != 'unknown') {
            if (rootActivity.IsSatisfied(null, false) == true) {
                if (LMS.toLowerCase() !== "sf" || isCompleted) {
                    suspendData.successStatus = true;
                    if (LMS.toLowerCase() !== "gl") {
                        isCompleted = true;
                    }
                }
            } else {
                suspendData.successStatus = false;
            }
        }
        //set the score
        suspendData.score = null; // stays null, if LMS setting prevents it from being saved
        if ((isCompleted || (LMS.toLowerCase() !== "saba" && LMS.toLowerCase() !== "gl")) && rootActivity.GetPrimaryObjective().GetMeasureStatus(rootActivity, false)) {
            suspendData.score = rootActivity.GetPrimaryObjective().GetNormalizedMeasure(rootActivity, false) * 100;
        }
        var enhancedBookmark = this.GetBookmark();
        if (enhancedBookmark) {
            suspendData.bookmark = enhancedBookmark;
        } else {
            //set the current SCO as the bookmark
            suspendData.bookmark = this.Sequencer.CurrentActivity.DatabaseId;
        }

        //build suspend data
        var sdata = "";
        for (var i = 0; i < this.Activities.ActivityList.length; i++) {

            // sdata += this.Activities.ActivityList[i].GetItemIdentifier();
            // sdata += "|";
            sdata += this.Activities.ActivityList[i].IsCompleted(null, false);
            sdata += "|";
            sdata += this.Activities.ActivityList[i].IsSatisfied(null, false);
            sdata += "|";
            sdata += this.Activities.ActivityList[i].ActivityAttemptCount;
            sdata += "|";
            if (this.Activities.ActivityList[i].ActivityObjectives.length > 0 && this.Activities.ActivityList[i].ActivityObjectives[0].MeasureStatus) {
                sdata += this.Activities.ActivityList[i].ActivityObjectives[0].NormalizedMeasure;
            }

            if (this.Activities.ActivityList[i].RunTime) {
                for (var j = 0; j < this.Activities.ActivityList[i].RunTime.Interactions.length; j++) {
                    var interaction = this.Activities.ActivityList[i].RunTime.Interactions[j];
                    sdata += "#" + interaction.Id.substring(interaction.Id.lastIndexOf('-') + 1);
                    sdata += "*" + (interaction.Result != null ? interaction.Result : "");
                    sdata += "*" + (interaction.Weighting != null ? interaction.Weighting : "");
                    sdata += "*" + (interaction.Description != null ? XylemeUtils.encodeDelimiters(interaction.Description) : "");
                    sdata += "*" + (interaction.LearnerResponse != null ? XylemeUtils.encodeDelimiters(interaction.LearnerResponse) : "");
                }
            }

            // store randomization order
            if (this.Activities.ActivityList[i].GetRandomizeChildren() || this.Activities.ActivityList[i].GetSelectionCountStatus()) {
                var children = this.Activities.ActivityList[i].GetChildren();
                var order = new Array();
                for (var j = 0; j < children.length; j++) {
                    if (children[j].Included)
                        order[children[j].Ordinal - 1] = j;
                }
                sdata += "|" + order.join();
            }
            if (i < this.Activities.ActivityList.length - 1) {
                sdata += "!";
            }
        }

        sdata += "@@"; //time remaining delimiter
        // get time remaining and persist

        sdata += this.Timers ? XylemeUtils.encodeDelimiters(this.Timers) : "{}";

        if (this.Sequencer.GlobalObjectives.length > 0) {
            sdata += "@@"; //global objectives delimiter
        }

        for (var go = 0; go < this.Sequencer.GlobalObjectives.length; go++) {
            sdata += this.Sequencer.GlobalObjectives[go].MeasureStatus;
            sdata += "|";
            sdata += this.Sequencer.GlobalObjectives[go].NormalizedMeasure;
            sdata += "|";
            sdata += this.Sequencer.GlobalObjectives[go].ProgressStatus;
            sdata += "|";
            sdata += this.Sequencer.GlobalObjectives[go].SatisfiedStatus;
            if (go < this.Sequencer.GlobalObjectives.length - 1) {
                sdata += "!";
            }
        }

        sdata = Compressor.compress(sdata);
        sdata = XylemeUtils.encodeText(sdata);
        suspendData.suspendData = sdata;

        return suspendData;
    }

    function Controller_CreateMenuItem(parentMenuItem, activity) {

        //this.WriteAuditLog("Control CreateMenuItem for " + activity);

        activity.MenuItem = new MenuItem(parentMenuItem, activity);

        if (parentMenuItem !== null) {
            parentMenuItem.Children[parentMenuItem.Children.length] = activity.MenuItem;
        }

        var availableChildren = activity.GetAvailableChildren();

        for (var childActivity in availableChildren) {
            if (!availableChildren.hasOwnProperty(childActivity)) {
                continue;
            }

            this.CreateMenuItem(activity.MenuItem, availableChildren[childActivity]);
        }
    }

    //private

    function Controller_RenderMenuItem(activity) {

        //this.WriteAuditLog("Control RenderMenuItem for " + activity);

        //JMH - 1/20/07 - This seems odd, but the activity is now a param to Render().  The reason being is that, while the
        // activity has an associated MenuItem, it's now possible that different activity data can be used to render it
        // (main sequencer or lookahead).  As such, the activity object is no longer a local member of MenuItem, thus we
        // need to pass it in.
        activity.MenuItem.Render(activity);

        var childActivities = activity.GetAvailableChildren();

        for (var childActivity in childActivities) {
            if (!childActivities.hasOwnProperty(childActivity)) {
                continue;
            }

            this.RenderMenuItem(childActivities[childActivity]);
        }
    }

    //protected - available to sequencing functions only

    function Controller_RedrawChildren(activity) {
        activity.MenuItem.ResynchChildren(activity);
        //this.RenderMenuItem(activity);
    }


    //private

    function Controller_UpdateDisplay(useLookAheadDataNavInfo, useLookAheadActivityStatus) {

        //var logParent = this.WriteAuditLog("Control Update Display");

        // We have two uses for lookahead data
        // 1. We want it's navigation choice result so use the looahead to say "what would happen".  We can use this to appropriately display a link
        // 2. While we're inside a sco, before exiting and after each commit we run the lookahead sequencer.  The activity status data at that
        // moment is more valid/up-to-date than the main sequencer.  So we want to use lookahead activity data after commits.

        // Make sure input params are usable
        if (this.Package.Properties.LookaheadSequencerMode === LOOKAHEAD_SEQUENCER_MODE_DISABLE) {
            useLookAheadDataNavInfo = false;
            useLookAheadActivityStatus = false;
        } else {
            if (useLookAheadDataNavInfo === undefined || useLookAheadDataNavInfo === null) {
                useLookAheadDataNavInfo = false;
            }
            if (useLookAheadActivityStatus === undefined || useLookAheadActivityStatus === null) {
                useLookAheadActivityStatus = false;
            }
        }

        var visibleMenuItemCount = 0;
        var navigationRequestInfo;

        //this.WriteDetailedLog("Updating display for each menu item", logParent);
        for (var activityId in this.Sequencer.Activities.ActivityList) {
            if (!this.Sequencer.Activities.ActivityList.hasOwnProperty(activityId)) {
                continue;
            }

            if (useLookAheadActivityStatus) {
                var activity = this.LookAheadSequencer.Activities.ActivityList[activityId];
            } else {
                var activity = this.Sequencer.Activities.ActivityList[activityId];
            }

            if (useLookAheadDataNavInfo) {
                navigationRequestInfo = this.FindPossibleChoiceRequestForActivity(this.LookAheadSequencer.Activities.ActivityList[activityId]);
            } else {
                navigationRequestInfo = this.FindPossibleChoiceRequestForActivity(this.Sequencer.Activities.ActivityList[activityId]);
            }

            activity.SetHiddenFromChoice(navigationRequestInfo.Hidden);

            //There's only one real set of menu items and these are attached to the main sequencer, so always use "this.Sequencer" when
            //using MenuItems
            var menuItem = this.Sequencer.Activities.ActivityList[activityId].MenuItem;

            //menu items do not get created for activities that are not selected in the selection and randomization process
            if (menuItem !== null) {
                menuItem.UpdateStateDisplay(activity, this.Sequencer.CurrentActivity, navigationRequestInfo, useLookAheadActivityStatus);
                if (menuItem.Visible) {
                    visibleMenuItemCount++;
                }
            }
        }

        //if the menu item for the current activity isn't visible, we want to make the first parent that is visible show as active
        if (visibleMenuItemCount > 0 && this.Sequencer.CurrentActivity != null) {

            var currentMenuItem = this.Sequencer.CurrentActivity.MenuItem;

            if (currentMenuItem.Visible === false && currentMenuItem.CurrentDisplayState.ActiveDisplayed === true) {

                var parentActivity = this.Sequencer.CurrentActivity.ParentActivity;
                var currentIsHighlighted = false;

                while (parentActivity != null && currentIsHighlighted == false) {
                    if (parentActivity.MenuItem.Visible === true) {

                        //parent is visible, call UpdateStateDisplay and pass the parent activity in as the current activity so it gets displayed as such
                        if (useLookAheadDataNavInfo) {
                            navigationRequestInfo = this.FindPossibleChoiceRequestForActivity(this.LookAheadSequencer.Activities.ActivityList[activityId]);
                        } else {
                            navigationRequestInfo = this.FindPossibleChoiceRequestForActivity(this.Sequencer.Activities.ActivityList[activityId]);
                        }

                        parentActivity.MenuItem.UpdateStateDisplay(parentActivity, parentActivity, navigationRequestInfo, useLookAheadActivityStatus)
                        currentIsHighlighted = true;
                    } else {
                        parentActivity = parentActivity.ParentActivity;
                    }
                }

            }
        }

        var isFollowingActivityScorecard = this.isScorecard(this.getFollowingPageId());
        //NOTE: The UpdateControlState should always take the "real" non-lookahead sequencer because we need static data off the real current activity
        var state = {
            origin: 'ScormPlayer',
            next: {
                visible: Control.Sequencer.GetCurrentActivity().LearningObject.SequencingData.HideContinue === false,
                enabled: isFollowingActivityScorecard || (Control.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed === true &&
                                Control.Sequencer.GetCurrentActivity().LearningObject.SequencingData.HideContinue === false)
            },
            previous: {
                visible: Control.Sequencer.GetCurrentActivity().LearningObject.SequencingData.HidePrevious === false,
                enabled: (Control.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].WillSucceed === true &&
                                Control.Sequencer.GetCurrentActivity().LearningObject.SequencingData.HidePrevious === false)
            }
        };
        this.Integration.updateControls(state);
    }


    //private

    function Controller_RefreshPage() {

        //called to update the AICC data which resides on the server
        //TODO - improvement would be to keep the page loaded and just pull down the updated state data via xmlhttp

        //find the top level window for the player...the window with the Control object
        var MAX_PARENTS_TO_SEARCH = 500;
        var nParentsSearched = 0;
        var win = window;

        while ((win.Control === null) &&
            (win.parent !== null) && (win.parent != win) &&
            (nParentsSearched <= MAX_PARENTS_TO_SEARCH)) {

            nParentsSearched++;
            win = win.parent;
        }

        if (win.Control === null) {
            //Debug.AssertError("Could not locate the top level window.");
        } else {
            win.location.replace(win.location);
        }
    }

    //
    // This method is a big deal.  It's responsible for calling the overall sequencing process.  It's also responsible for closing out the API session
    // if the content failed to do so.  This should only get called once per Activity otherwise, particularly for SCORM 2004, we open ourselves up
    // to errors.  This is why when Unload() calls this method, it clones the sequencer beforehand and returns that state after calling this method
    // in case a straggling API.Finish() is called after the fact at shutdown time.
    //

    function Controller_ScoUnloaded(caller) {

        //var logParent = this.WriteAuditLog("Control ScoUnloaded called by " + caller);

        // We mark this event here, after the course content has exited so that
        // any api calls it makes while being unloaded will hit the log first
        //this.WriteHistoryLog("", {ev:'ScoUnloaded'});

        //called from the intermediate page when it loads...this signals that the last SCO has completely unloaded and thus finished its processing

        //make sure that things are loaded and ready...the intermediate page loads with the initial frameset and might slip in an extra call here on initial load
        if (this.Initialized === false) {
            return;
        }

        // Because multiple process might be in play guard against calling this twice here.  But need to find an actual problem case before using
        // this as it seems to cause autotest problems.
        //if (!this.ScoLoader.ScoLoaded) {
        //    return;
        //}

        this.ScoLoader.ScoLoaded = false;

        //check to make sure that the SCO called Finish/Terminate. Note the value for NeedToCloseOutSession is a bit misleading, false means we do need to close out the session
        if (this.Api.Activity !== null && this.Api.NeedToCloseOutSession()) {
            // added (merging)
            if (this.Api.Initialized) {
                this.Api.CloseOutSession("ScoUnloaded() because apparently Finish/Terminate wasn't called");
                this.Api.SetDirtyData();
            }
        }

        if ((this.Api.Activity != null) && (this.Api.Activity.LearningObject.ScormType === SCORM_TYPE_ASSET) && this.Api.Activity.WasLaunchedThisSession()) {
            this.Api.AccumulateTotalTimeTracked();
            //this.WriteDetailedLog("New Tracked Total Time for Asset: " + this.Api.RunTimeData.TotalTimeTracked);
            // Recalculate duration timings for each parent of this asset
            var aryParentActivities = this.Sequencer.Activities.GetActivityPath(this.Api.Activity, false);
            for (var i = 0; i < aryParentActivities.length; i++) {
                aryParentActivities[i].RollupDurations();
            }
        }

        //use the user's navigation request if it exists, otherwise, check the runtime for a nav request by the SCO, then try to determine
        //the appropriate rudimentary sequencing request (exit action)
        if (this.PendingNavigationRequest === null) {

            if ((this.Api !== null) && (this.Api.RunTimeData != null) &&
                (this.Api.RunTimeData.NavRequest != SCORM_RUNTIME_NAV_REQUEST_NONE)) {

                //this.WriteDetailedLog("API Runtime Nav Request Detected = " + this.Api.RunTimeData.NavRequest, logParent);

                this.PendingNavigationRequest = this.TranslateRunTimeNavRequest(this.Api.RunTimeData.NavRequest);
            }

        }

        this.Sequencer.NavigationRequest = this.PendingNavigationRequest;

        this.ClearPendingNavigationRequest();

        // Note that upon exit the OverallSequencingProcess will result in an ExitScormPlayer call which will do
        // the final data postback
        this.Sequencer.OverallSequencingProcess();

        //don't bother with look ahead  or saving if we're exiting. it slows things down and introduces funny
        //sequencing situations that lead to errors and the save is redundant since we'll do SaveDataOnExit
        if (this.ExitScormPlayerCalled === false && !this.DeliverFramesetUnloadEventCalled) {
            this.EvaluatePossibleNavigationRequests();

            // We need to interject this SaveData call and reset the timer
            this.Comm.KillPostDataProcess();
            this.Comm.SaveData(true, false);
            this.Comm.StartPostDataProcess();
        }
    }
    //
    // This method is only called directly by the OverallSequencingProcess.  There's one way this would get called twice (and therefore save data twice): if
    // there's a straggling APIFinish call made after Unload() has run.
    //

    function Controller_ExitScormPlayer(caller) {

        //TODO: should this be an integration function?
        //TODO: can we always count on the current window being the player window?

        this.ExitScormPlayerCalled = true;

        //window.close();

        return;
        // if (Debug.ShowDebugLogAtExit) {
        //     if (Debug.DataIsAvailable()) {
        //         Debug.ShowAllAvailableData();
        //     }
        // }

        this.Comm.SaveDataOnExit();

        // Calling this after save data call to capture any potential problems during the communcations postback
        if (SHOULD_SAVE_CLIENT_DEBUG_LOGS && RegistrationToDeliver.TrackingEnabled) {
            this.Comm.SaveDebugLog(true);
        }

        // This window manipulation might be redundant and mess the the firing of events if done
        // when the player is already unloading
        if (!this.ProcessedUnload) {
            if (this.Package.Properties.PlayerLaunchType == LAUNCH_TYPE_FRAMESET) {
                // Protect against case where the top level window is killed/closed.
                try {
                    window.location = RedirectOnExitUrl;
                } catch (e) {
                    // Eat it, must have been hard-closed
                }
            } else if (!this.PopupBlocked) {
                // Protect against case where the top level window is killed/closed.
                try {
                    if (window.opener && window.opener !== null && window.opener.closed === false) {
                        window.opener.location = RedirectOnExitUrl;
                    }
                } catch (e) {
                    // Eat it, must have been hard-closed
                }

                /*try {
                    window.close();
                } catch (e) {
                    //Eat it, must have been hard-closed
                }*/
            }
        }
    }

    function Controller_ExitSco() {
        this.ScoLoader.UnloadSco();
    }

    function Controller_MarkPostedDataDirty() {
        //this.WriteAuditLog("Control MarkPostedDataDirty");

        for (var activity in this.Activities.ActivityList) {
            if (!this.Activities.ActivityList.hasOwnProperty(activity)) {
                continue;
            }

            if (this.Activities.ActivityList[activity].DataState == DATA_STATE_POSTED) {
                this.Activities.ActivityList[activity].DataState = DATA_STATE_DIRTY;
            }

            this.Activities.ActivityList[activity].MarkPostedObjectiveDataDirty();
        }

        if (this.Sequencer.GlobalObjectives !== null && this.Sequencer.GlobalObjectives !== undefined) {
            for (var globalObjective in this.Sequencer.GlobalObjectives) {
                if (!this.Sequencer.GlobalObjectives.hasOwnProperty(globalObjective)) {
                    continue;
                }

                dataState = this.Sequencer.GlobalObjectives[globalObjective].DataState;

                if (dataState == DATA_STATE_POSTED) {
                    this.Sequencer.GlobalObjectives[globalObjective].DataState = DATA_STATE_DIRTY;
                }
            }
        }

        for (var bucket in this.SSPBuckets) {
            if (!this.SSPBuckets.hasOwnProperty(bucket)) {
                continue;
            }

            if (this.SSPBuckets[bucket].DataState == DATA_STATE_POSTED) {
                this.SSPBuckets[bucket].DataState = DATA_STATE_DIRTY;
            }
        }
    }

    function Controller_MarkPostedDataClean() {
        //this.WriteAuditLog("Control MarkPostedDataClean");

        for (var activity in this.Activities.ActivityList) {
            if (!this.Activities.ActivityList.hasOwnProperty(activity)) {
                continue;
            }

            if (this.Activities.ActivityList[activity].DataState == DATA_STATE_POSTED) {
                this.Activities.ActivityList[activity].DataState = DATA_STATE_CLEAN;
            }

            this.Activities.ActivityList[activity].MarkPostedObjectiveDataClean();
        }

        if (this.Sequencer.GlobalObjectives !== null && this.Sequencer.GlobalObjectives !== undefined) {
            for (var globalObjective in this.Sequencer.GlobalObjectives) {
                if (!this.Sequencer.GlobalObjectives.hasOwnProperty(globalObjective)) {
                    continue;
                }

                dataState = this.Sequencer.GlobalObjectives[globalObjective].DataState;

                if (dataState == DATA_STATE_POSTED) {
                    this.Sequencer.GlobalObjectives[globalObjective].DataState = DATA_STATE_CLEAN;
                }
            }
        }

        for (var bucket in this.SSPBuckets) {
            if (!this.SSPBuckets.hasOwnProperty(bucket)) {
                continue;
            }

            if (this.SSPBuckets[bucket].DataState == DATA_STATE_POSTED) {
                this.SSPBuckets[bucket].DataState = DATA_STATE_CLEAN;
            }
        }
    }

    function Controller_MarkDirtyDataPosted() {
        // this.WriteAuditLog("Control MarkDirtyDataPosted");

        for (var activity in this.Activities.ActivityList) {
            if (!this.Activities.ActivityList.hasOwnProperty(activity)) {
                continue;
            }

            if (this.Activities.ActivityList[activity].IsAnythingDirty()) {
                this.Activities.ActivityList[activity].DataState = DATA_STATE_POSTED;
            }

            this.Activities.ActivityList[activity].MarkDirtyObjectiveDataPosted();
        }

        if (this.Sequencer.GlobalObjectives !== null && this.Sequencer.GlobalObjectives !== undefined) {
            for (var globalObjective in this.Sequencer.GlobalObjectives) {
                if (!this.Sequencer.GlobalObjectives.hasOwnProperty(globalObjective)) {
                    continue;
                }

                if (!this.Sequencer.GlobalObjectives.hasOwnProperty(globalObjective)) {
                    continue;
                }

                dataState = this.Sequencer.GlobalObjectives[globalObjective].DataState;

                if (dataState == DATA_STATE_DIRTY) {
                    this.Sequencer.GlobalObjectives[globalObjective].DataState = DATA_STATE_POSTED;
                }
            }
        }

        for (var bucket in this.SSPBuckets) {
            if (!this.SSPBuckets.hasOwnProperty(bucket)) {
                continue;
            }
            if (this.SSPBuckets[bucket].DataState == DATA_STATE_DIRTY) {
                this.SSPBuckets[bucket].DataState = DATA_STATE_POSTED;
            }
        }
    }

    function Controller_GetXmlForDirtyData() {

        // this.WriteAuditLog("Control GetXmlForDirtyData");

        var ServerFormat = new ServerFormater();
        var xml = new XmlElement("RTD");

        xml.AddAttribute("RI", RegistrationToDeliver.Id);

        if (this.Sequencer.GetSuspendedActivity() !== null) {
            xml.AddAttribute("SAI", this.Sequencer.GetSuspendedActivity().GetDatabaseIdentifier());
        }

        if (this.GetLaunchHistoryId() !== null) {
            xml.AddAttribute("LH", this.GetLaunchHistoryId());
        }

        xml.AddAttribute("TR", RegistrationToDeliver.TrackingEnabled);

        // We're still going to postback when tracking is disabled but we don't want/need the extra
        // reg data appended that's not going to be persisted.
        if (RegistrationToDeliver.TrackingEnabled) {
            for (var activity in this.Activities.ActivityList) {
                if (!this.Activities.ActivityList.hasOwnProperty(activity)) {
                    continue;
                }

                if (this.Activities.ActivityList[activity].IsAnythingDirty() ||
                    this.Activities.ActivityList[activity].DataState == DATA_STATE_POSTED) {

                    xml.AddElement(this.Activities.ActivityList[activity].GetXml());
                }
            }

            if (this.Sequencer.GlobalObjectives !== null && this.Sequencer.GlobalObjectives !== undefined) {
                for (var globalObjective in this.Sequencer.GlobalObjectives) {
                    if (!this.Sequencer.GlobalObjectives.hasOwnProperty(globalObjective)) {
                        continue;
                    }

                    dataState = this.Sequencer.GlobalObjectives[globalObjective].DataState;

                    //for now we're posting all global objectives
                    if (dataState == DATA_STATE_DIRTY || dataState == DATA_STATE_POSTED) {
                        xml.AddElement(this.Sequencer.GlobalObjectives[globalObjective].GetXml(RegistrationToDeliver.Id, globalObjective));
                    }
                }
            }

            for (var bucket in this.SSPBuckets) {
                if (!this.SSPBuckets.hasOwnProperty(bucket)) {
                    continue;
                }
                if (this.SSPBuckets[bucket].DataState == DATA_STATE_DIRTY ||
                    this.SSPBuckets[bucket].DataState == DATA_STATE_POSTED) {

                    xml.AddElement(this.SSPBuckets[bucket].GetXml());

                }
            }

            for (var sharedDataItem in this.SharedData) {
                if (!this.SharedData.hasOwnProperty(sharedDataItem)) {
                    continue;
                }
                if (this.SharedData[sharedDataItem].DataState == DATA_STATE_DIRTY ||
                    this.SharedData[sharedDataItem].DataState == DATA_STATE_POSTED) {

                    xml.AddElement(this.SharedData[sharedDataItem].GetXml());

                }
            }
        }

        // Append the current event log for this launch
        var historyLogXml = HistoryLog.log.dom.getElementsByTagName('RTL')[0];
        //xml.AddElement(historyLogXml);
        historyLogXml.setAttribute("trackingEnabled", RegistrationToDeliver.TrackingEnabled);

        //Try to add the history log, if something breaks (because of a possible conflict between sarissa and IE9, for instance)
        //make a note of it in the XML...
        try {
            xml.AddElement(HistoryLog.GetSerializedLog());
        } catch (error) {
            xml.AddElement("<RTL_ERROR>There was an error attaching the history log to this XML, see Controller_GetXmlForDirtyData</RTL_ERROR>");
        }

        // Append overall registration status
        var rootActivity = this.Activities.GetRootActivity();
        var xmlStatus = new XmlElement("RS");

        // Satisfaction - pass/fail/unknown
        if (rootActivity.GetPrimaryObjective().ProgressStatus) {
            var satisfactionStatus = rootActivity.GetPrimaryObjective().SatisfiedStatus ? "passed" : "failed";
        } else {
            var satisfactionStatus = "unknown";
        }
        xmlStatus.AddAttribute("SS", satisfactionStatus);

        // Completion - complete/incomplete/unknown
        if (rootActivity.AttemptProgressStatus) {
            var completionStatus = rootActivity.AttemptCompletionStatus ? "complete" : "incomplete";
        } else {
            var completionStatus = "unknown";
        }
        xmlStatus.AddAttribute("CS", completionStatus);

        xmlStatus.AddAttribute("MS", ServerFormat.ConvertBoolean(rootActivity.GetPrimaryObjective().MeasureStatus));
        xmlStatus.AddAttribute("NM", rootActivity.GetPrimaryObjective().NormalizedMeasure);

        xmlStatus.AddAttribute("ED", ServerFormat.ConvertTimeSpan(rootActivity.ActivityExperiencedDurationTracked));

        xml.AddElement(xmlStatus);

        return "<?xml version=\"1.0\"?>" + xml.toString();
    }

    function Controller_IsThereDirtyData() {
        // this.WriteAuditLog("Control IsThereDirtyData");

        for (var activity in this.Activities.ActivityList) {
            if (!this.Activities.ActivityList.hasOwnProperty(activity)) {
                continue;
            }
            if (this.Activities.ActivityList[activity].IsAnythingDirty() ||
                this.Activities.ActivityList[activity].DataState == DATA_STATE_POSTED) {
                return true;
            }
        }

        if (this.Sequencer.GlobalObjectives !== null && this.Sequencer.GlobalObjectives !== undefined) {
            for (var globalObjective in this.Sequencer.GlobalObjectives) {
                if (!this.Sequencer.GlobalObjectives.hasOwnProperty(globalObjective)) {
                    continue;
                }

                dataState = this.Sequencer.GlobalObjectives[globalObjective].DataState;

                if (dataState == DATA_STATE_DIRTY || dataState == DATA_STATE_POSTED) {
                    return true;
                }
            }
        }

        for (var bucket in this.SSPBuckets) {
            if (!this.SSPBuckets.hasOwnProperty(bucket)) {
                continue;
            }
            if (this.SSPBuckets[bucket].DataState == DATA_STATE_DIRTY ||
                this.SSPBuckets[bucket].DataState == DATA_STATE_POSTED) {

                return true;

            }
        }

        return false;
    }



    function Controller_DisplayError(errorString) {
        // this.WriteAuditLog("Control DisplayError - " + errorString);

        // if (Debug.DataIsAvailable()){
        //     if (confirm(errorString + "\n\nPress 'OK' to display debug information to send to technical support, or press 'Cancel' to exit.")){
        //         Debug.ShowAllAvailableData(true);
        //     }
        // }
        // else{
        //     alert(errorString);
        // }
        return;
    }


    function Controller_GetExceptionText() {

        // Exit timing somestimes has us writing to the debugger when it's already gone. Code is
        // called by the intermediate page.
        // if (typeof Debug != "undefined") {
        //     this.WriteAuditLog("Control GetExceptionText");
        // }

        //should return human readable error message from the sequencer.
        //this is called from the intermediate page if it is stuck there

        //there are certain timing situations where this method will get invoked before
        //the page has completed loading while the sequencer is still null

        // if (this.Sequencer != null && this.Sequencer != undefined){
        //     return this.Sequencer.GetExceptionText();
        // }
        // else{
        //     return "";
        // }
    }


    function Controller_CheckForDebugCommand(intKeyCode) {

        // if (intKeyCode == ASCII_SHIFT_IN){
        //     Debug.RecordControlAudit = true;
        //     Debug.RecordControlDetailed = true;
        //     Debug.RecordRteAudit = true;
        //     Debug.RecordRteDetailed = true;
        //     Debug.RecordSequencingAudit = true;
        //     Debug.RecordSequencingDetailed = true;
        //     Debug.RecordLookAheadAudit = true;
        //     Debug.RecordLookAheadDetailed = true;
        //     alert("Debugger set to Level 8 [Maximum]");

        // } else if (this.QuestionCounter == 4) {
        //     if (intKeyCode == ASCII_QUESTION){
        //         Debug.ShowAllAvailableData();
        //     } else if (intKeyCode == ASCII_D){
        //         Debug.ShowDebugLogAtExit = true;
        //     } else {

        //         var debugLevel = -1;

        //         if (intKeyCode == ASCII_0){
        //             debugLevel = 0;
        //         } else if (intKeyCode == ASCII_1){
        //             debugLevel = 1;
        //         } else if (intKeyCode == ASCII_2){
        //             debugLevel = 2;
        //         } else if (intKeyCode == ASCII_3){
        //             debugLevel = 3;
        //         } else if (intKeyCode == ASCII_4){
        //             debugLevel = 4;
        //         } else if (intKeyCode == ASCII_5){
        //             debugLevel = 5;
        //         } else if (intKeyCode == ASCII_6){
        //             debugLevel = 6;
        //         } else if (intKeyCode == ASCII_7){
        //             debugLevel = 7;
        //         } else if (intKeyCode == ASCII_8){
        //             debugLevel = 8;
        //         }

        //         Debug.RecordControlAudit = debugLevel > 0;
        //         Debug.RecordControlDetailed = debugLevel > 1;
        //         Debug.RecordRteAudit = debugLevel > 2;
        //         Debug.RecordRteDetailed = debugLevel > 3;
        //         Debug.RecordSequencingAudit = debugLevel > 4;
        //         Debug.RecordSequencingDetailed = debugLevel > 5;
        //         Debug.RecordLookAheadAudit = debugLevel > 6;
        //         Debug.RecordLookAheadDetailed = debugLevel > 7;

        //         alert("Debugger set to Level " + debugLevel);
        //     }

        //     this.QuestionCounter = 0;
        // }
        // else if (intKeyCode == ASCII_QUESTION){
        //     this.QuestionCounter++;
        // }
        // else if (intKeyCode == ASCII_TILDA){
        //     this.TildaCounter++;
        //     if (this.TildaCounter == 5){
        //         this.TildaCounter = 0;
        //         Debug.External.Invoke();
        //     }
        // }
        // else if (intKeyCode == ASCII_PIPE){
        //     this.PipeCounter++;
        //     if (this.PipeCounter == 5){
        //         this.PipeCounter = 0;
        //         launchTypeTemp = this.ScoLoader.ScoLaunchType;
        //         this.ScoLoader.ScoLaunchType = LAUNCH_TYPE_POPUP_WITH_MENU;
        //         this.ScoLoader.LoadSco(this.Sequencer.GetCurrentActivity());
        //         this.ScoLoader.ScoLaunchType = launchTypeTemp;
        //     }
        // }
        // else if (intKeyCode !== 0){  //in FireFox, the shift key comes through as a keypress with code of 0...we want to ignore this
        //     this.QuestionCounter = 0;
        //     this.TildaCounter = 0;
        // }

    }

    function Controller_CloseSco() {

        // this.WriteAuditLog("Control Recieved Close Sco From GUI");

        if (this.PendingNavigationRequest === null) {

            if (this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT].WillSucceed === true) {
                this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_EXIT, null, "");
            } else if (this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_ABANDON] === true) {
                this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_ABANDON, null, "");
            }

        }

        // this.WriteHistoryLog("", {ev:'GUI Close', ac:this.PendingNavigationRequest.Type});

        //TODO: in scorm 2004 and 1.2, we need to provide a message to the user

        this.ScoLoader.UnloadSco();
    }

    // Legacy UI's can call this method without the preferred action defined.  New
    // SCORM 2004 4TH ed capable UI's should explicitly pass an action of "suspend_all"
    // or "exit_all" to this method.  The UI might choose to do this through a dialog
    // or two explicit buttons

    function Controller_ReturnToLms(preferredAction) {

        // this.WriteAuditLog("Control Recieved Return To Lms From GUI");

        this.Sequencer.ReturnToLmsInvoked = true;

        if (preferredAction === null || preferredAction === undefined) {
            preferredAction = this.GetPreferredReturnToLmsAction();
        }

        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = this.GetReturnToLmsNavigationRequest(preferredAction);
        }

        // this.WriteHistoryLog("", {ev:'GUI ReturnToLms', ac:this.PendingNavigationRequest.Type});

        this.Unload();
    }

    function Controller_GetReturnToLmsNavigationRequest(preferredAction) {

        //The whole point of a suspend all is to get the user back to where he last left off. If we have a single sco,
        //then this isn't necessary. It is probably better in this case to process an Exit All because that will call End Attempt
        //and transfer the runtime data to the activity tree for rollup.

        var hideSuspendAll = false;
        var hideAbandonAll = false;
        var hideExitAll = false;

        if (this.Sequencer.CurrentActivity != null) {
            hideSuspendAll = this.Sequencer.CurrentActivity.LearningObject.SequencingData.HideSuspendAll;
            hideAbandonAll = this.Sequencer.CurrentActivity.LearningObject.SequencingData.HideAbandonAll;
            hideExitAll = this.Sequencer.CurrentActivity.LearningObject.SequencingData.HideExitAll;
        }

        if (this.Activities.GetNumDeliverableActivities() == 1) {
            return new NavigationRequest(NAVIGATION_REQUEST_EXIT_ALL, null, "");
        } else {

            if (preferredAction == "exit_all") {

                if (hideExitAll === false && this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL].WillSucceed === true) {
                    return new NavigationRequest(NAVIGATION_REQUEST_EXIT_ALL, null, "");
                }

            } else if (preferredAction == "suspend_all") {

                /* MR - 8/31/09 - removing this, wrong implementation of this package property. moved to the TerminationRequestProcess in the SuspendAll case
            if (Control.Package.Properties.InvokeRollupAtSuspendAll === true){
                window.setTimeout("Control.EvaluatePossibleNavigationRequests(true);", 150);
            }
            */
                if (hideSuspendAll === false && this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL].WillSucceed === true) {
                    return new NavigationRequest(NAVIGATION_REQUEST_SUSPEND_ALL, null, "");
                }

            }
        }

        //if neither suspend nor exit will succeed, try to abandon or just simply exit
        if (hideAbandonAll === false && this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_ABANDON_ALL].WillSucceed === true) {
            return new NavigationRequest(NAVIGATION_REQUEST_ABANDON_ALL, null, "");
        } else {
            return new NavigationRequest(NAVIGATION_REQUEST_EXIT_PLAYER, null, "");
        }
    }

    function Controller_ToggleMenuVisibility() {}

    function Controller_HideExitDialog() {
        this.ExitDialogVisible = false;
    }

    function Controller_TriggerReturnToLMS() {

        // logParent = this.WriteAuditLog("Control TriggerReturnToLMS");

        var hideSuspendAll = false;
        var hideExitAll = false;
        var hideAbandonAll = false;

        if (this.Sequencer.CurrentActivity != null) {
            hideSuspendAll = this.Sequencer.CurrentActivity.LearningObject.SequencingData.HideSuspendAll;
            hideExitAll = this.Sequencer.CurrentActivity.LearningObject.SequencingData.HideExitAll;
            hideAbandonAll = this.Sequencer.CurrentActivity.LearningObject.SequencingData.HideAbandonAll;
        }


        if (hideSuspendAll === true || hideExitAll === true) {
            if (hideSuspendAll === true) {
                if (hideExitAll === true) {
                    if (hideAbandonAll === true) {
                        // this.WriteDetailedLog("The Return To LMS button should be not be available for selection.", logParent);
                    } else {
                        this.ReturnToLms("abandon_all");
                    }
                } else {
                    this.ReturnToLms("exit_all");
                }
            } else {
                this.ReturnToLms("suspend_all");
            }

        } else if (this.Package.Properties.ReturnToLmsAction == "selectable") {
            //TODO: Put text in resource
            if (this.ExitDialogVisible === false) {
                this.ExitDialogVisible = true;
            }


        } else if (this.Package.Properties.ReturnToLmsAction == "legacy") {
            if (this.Activities.GetNumDeliverableActivities() == 1) {
                this.ReturnToLms("exit_all");
            } else {
                this.ReturnToLms("suspend_all");
            }
        } else {
            this.ReturnToLms(this.Package.Properties.ReturnToLmsAction);
        }


    }


    function Controller_Next() {
        // this.WriteAuditLog("Control Recieved Next Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI Continue'});
        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_CONTINUE, null);
        }



        //this.ScoLoader.UnloadSco();
    }

    function Controller_Previous() {
        // this.WriteAuditLog("Control Recieved Previous Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI Previous'});
        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_PREVIOUS, null, "");
        }

        //this.ScoLoader.UnloadSco();
    }

    function Controller_Abandon() {
        // this.WriteAuditLog("Control Recieved Abandon Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI Abandon'});
        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_ABANDON, null, "");
        }

        this.ScoLoader.UnloadSco();
    }

    function Controller_AbandonAll() {
        // this.WriteAuditLog("Control Recieved Abandon All Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI AbandonAll'});

        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_ABANDON_ALL, null, "");
        }

        this.ScoLoader.UnloadSco();
    }

    function Controller_Suspend() {
        // this.WriteAuditLog("Control Recieved Suspend Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI Suspend'});
        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_SUSPEND_ALL, null, "");
        }

        this.ScoLoader.UnloadSco();
    }

    function Controller_Exit() {
        // this.WriteAuditLog("Control Recieved Exit Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI Exit'});

        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_EXIT, null, "");
        }

        //TODO: in scorm 2004 and 1.2, we need to provide a message to the user

        this.ScoLoader.UnloadSco();
    }

    function Controller_ExitAll() {
        // this.WriteAuditLog("Control Recieved Exit All Request From GUI");
        // this.WriteHistoryLog("", {ev:'GUI ExitAll'});
        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_EXIT_ALL, null, "");
        }

        this.ScoLoader.UnloadSco();
    }

    function Controller_ChoiceRequest(activityItemIdentifier) {

        // this.WriteAuditLog("Control Recieved Choice Request For '" + activityItemIdentifier + "' From GUI");
        // var historyAtts = {ev:'GUI Choice'};
        // var activity = null;
        // if (this.Activities) {
        //     activity = this.Activities.GetActivityFromIdentifier(activityItemIdentifier);
        //     if (activity) {
        //        historyAtts.tai = activity.ItemIdentifier;
        //        historyAtts.tat = activity.LearningObject.Title;
        //     }
        // }
        // this.WriteHistoryLog("", historyAtts);

        if (this.PendingNavigationRequest === null) {
            this.PendingNavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_CHOICE, activityItemIdentifier, "");
        }

        //this.ScoLoader.UnloadSco();
    }


    function Controller_ScoHasTerminatedSoUnload() {

        // var logParent = this.WriteAuditLog("In ScoHasTerminatedSoUnload");

        this.ScoLoader.UnloadSco();

    }

    //
    // This is method is simply just the Generic Finish/Terminate behavior that the Controller must do, regardless of the learning
    // standard.  It is called at the end of each API's Finish or Terminate call.
    //

    function Controller_SignalTerminated() {

        // This condition should only be seen when the Unload() method (Called by the deliver frameset's onunload) has already been called
        // and done its thing, including SaveDataOnExit, but a Straggling Api.Finish() or Termiate() call had been made by the content's
        // window unload event handlers.  Note that Unload() would have returned the state back to pre-overallsequencingprocess so
        // it's save to run it over again here.
        //if (this.ProcessedUnload === true && this.ExitScormPlayerCalled === false){
        if (this.DeliverFramesetUnloadEventCalled) {

            if (this.ScoLoader.ScoLoaded) {

                //if the browser unload event has been fired and the window is closing because the user closed the browser window
                //(and not as a result of a sequencing action which would be indicated by ExitScormPlayerCalled == true)
                //then we need to transfer the runtime data to the activity tree and rollup the data before saving and closing
                //this will be handled by running the OverallSequencingProcess

                // Since Unload has been processed it means we'ere tearing down windows now.  So set the return to lms nav request
                // in a legacy manner that prevents any user-selectable alerts which could short circuit processing of the
                // overall sequencer we're trying to get to.
                if (this.Activities.GetNumDeliverableActivities() == 1) {
                    this.PendingNavigationRequest = this.GetReturnToLmsNavigationRequest("exit_all");
                } else {
                    this.PendingNavigationRequest = this.GetReturnToLmsNavigationRequest("suspend_all");
                }

                this.ScoUnloaded("SignalTerminated()");

                if (!this.ExitScormPlayerCalled) {
                    // Some sequencing paths such as simply "close item" will not have resulted in ExitScormPlayer
                    this.ExitScormPlayer("SignalTerminated()");
                }
            } else {

                // We must be in the middle of an Unload with a Finish that happened in the interrim -- rare thing that I noticed
                // happening when the middle window was closed from launch player in new window / launch sco in new window
                this.SignalTerminatedPending = true;
            }
        }
    }

    function Controller_GetPreferredReturnToLmsAction() {


        var action = "";

        if (this.Package.Properties.ReturnToLmsAction == "selectable") {
            //TODO: Put text in resource
            if (confirm("Exiting Course.  Click 'OK' To save state and pick up where you left off or choose 'Cancel' to finish the Course.")) {
                action = "suspend_all";
            } else {
                action = "exit_all";
            }
        } else if (this.Package.Properties.ReturnToLmsAction == "legacy") {
            if (this.Activities.GetNumDeliverableActivities() == 1) {
                action = "exit_all";
            } else {
                action = "suspend_all";
            }
        } else {
            action = this.Package.Properties.ReturnToLmsAction;
        }

        return action;
    }


    function Controller_TranslateRunTimeNavRequest(adlNavRequest) {
        //accepts an adl.nav.request from the RTE and translates it into an internal NavigationRequest object

        if (adlNavRequest.substring(0, 1) == "{") {

            var targetIdentifier = this.ParseTargetStringFromChoiceRequest(adlNavRequest);

            if (adlNavRequest.substr(adlNavRequest.indexOf("}") + 1) == 'choice') {
                return new NavigationRequest(NAVIGATION_REQUEST_CHOICE, targetIdentifier, "");
            } else if (adlNavRequest.substr(adlNavRequest.indexOf("}") + 1) == 'jump') {
                return new NavigationRequest(NAVIGATION_REQUEST_JUMP, targetIdentifier, "");
            }
        }

        switch (adlNavRequest) {
            case SCORM_RUNTIME_NAV_REQUEST_CONTINUE:
                return new NavigationRequest(NAVIGATION_REQUEST_CONTINUE, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_PREVIOUS:
                return new NavigationRequest(NAVIGATION_REQUEST_PREVIOUS, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_EXIT:
                return new NavigationRequest(NAVIGATION_REQUEST_EXIT, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_EXITALL:
                return new NavigationRequest(NAVIGATION_REQUEST_EXIT_ALL, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_ABANDON:
                return new NavigationRequest(NAVIGATION_REQUEST_ABANDON, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_ABANDONALL:
                return new NavigationRequest(NAVIGATION_REQUEST_ABANDON_ALL, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_SUSPENDALL:
                return new NavigationRequest(NAVIGATION_REQUEST_SUSPEND_ALL, null, "");
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_NONE:
                return null;
                //break;

            default:
                // Debug.AssertError("Unrecognized runtime navigation request");
                break;
        }
    }

    function Controller_FindPossibleNavRequestForRuntimeNavRequest(adlNavRequest) {
        //accepts an adl.nav.request from the RTE and finds the associated internal PossibleNavigationRequest object if it exists

        if (adlNavRequest.substring(0, 1) == "{") {

            var targetIdentifier = this.ParseTargetStringFromChoiceRequest(adlNavRequest);

            if (adlNavRequest.substr(adlNavRequest.indexOf("}") + 1) == 'choice') {
                var arrayIndex = POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE;
                for (var i = arrayIndex; i < this.PossibleNavigationRequests.length; i++) {
                    if (this.PossibleNavigationRequests[i].TargetActivityItemIdentifier == targetIdentifier) {
                        return this.PossibleNavigationRequests[i];
                    }
                }
            } else if (adlNavRequest.substr(adlNavRequest.indexOf("}") + 1) == 'jump') {
                var jumpRequest = new NavigationRequest(NAVIGATION_REQUEST_JUMP, targetIdentifier, "");
                jumpRequest.WillSucceed = this.IsJumpRequestValid(adlNavRequest);
                return jumpRequest;
            }
        }

        switch (adlNavRequest) {
            case SCORM_RUNTIME_NAV_REQUEST_CONTINUE:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_PREVIOUS:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_EXIT:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_EXITALL:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_ABANDON:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_ABANDON];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_ABANDONALL:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_ABANDON_ALL];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_SUSPENDALL:
                return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL];
                //break;

            case SCORM_RUNTIME_NAV_REQUEST_NONE:
                return null;
                //break;

            default:
                // Debug.AssertError("Unrecognized runtime navigation request");
                break;
        }
    }

    function Controller_GetMessageText() {

        var msg = "";

        try {
            if (this.Sequencer.NavigationRequest !== null && this.Sequencer.NavigationRequest !== undefined) {
                if (this.Sequencer.NavigationRequest.MessageToUser !== null && this.Sequencer.NavigationRequest.MessageToUser !== undefined) {
                    msg = this.Sequencer.NavigationRequest.MessageToUser;
                }
            }
        } catch (e) {
            // Return "" by default, timing errors have caused problems here despite our checks for null and undefined
        }

        return msg;
    }

    function Controller_ClearPendingNavigationRequest() {
        // this.WriteAuditLog("Control ClearPendingNavigationRequest");

        this.PendingNavigationRequest = null;
    }

    function Controller_IsThereAPendingNavigationRequest() {
        return (this.PendingNavigationRequest !== null);
    }

    function Controller_DeliverActivity(activity) {

        // this.WriteAuditLog("**************************************");
        // this.WriteAuditLog("Deliverying Activity - " + activity);
        // this.WriteAuditLog("**************************************");

        // var logParent = this.WriteAuditLog("Control DeliverActivity - " + activity);

        // if (activity.IsDeliverable() === false){
        //     Debug.AssertError("ERROR - Asked to deliver a non-leaf activity - " + activity);
        // }

        // If launch after click, the PopupLauncher will make these two calls once the course is actually viewed,
        // otherwise make the calls here as usual
        if ((Control.Package.Properties.ScoLaunchType !== LAUNCH_TYPE_POPUP_AFTER_CLICK) &&
            (Control.Package.Properties.ScoLaunchType !== LAUNCH_TYPE_POPUP_AFTER_CLICK_WITHOUT_BROWSER_TOOLBAR)) {
            this.Api.ResetState();
            this.Api.InitializeForDelivery(activity);
        }

        // MOVED HERE from ScoLoader, as ScoLoader is not used any longer
        activity.LaunchedThisSession = false;

        if (activity.GetActivityStartTimestampUtc() === null) {
            activity.SetActivityStartTimestampUtc(ConvertDateToIso8601String(new Date()));
        }

        if (activity.GetAttemptStartTimestampUtc() === null) {
            activity.SetAttemptStartTimestampUtc(ConvertDateToIso8601String(new Date()));
        }
        ////////////////////

        if (typeof this.Integration !== 'undefined') {
            var href = activity.LearningObject.Href;
            if (href.indexOf('?') > -1) {
                href = href.substring(0, href.indexOf('?'));
            } else if (href.indexOf('&') > -1) {
                href = href.substring(0, href.indexOf('&'));
            }
            href += '.html';
            this.Integration.urlChanged(href, activity.GetItemIdentifier());

            // MOVED HERE from ScoLoader, as ScoLoader is not used any longer
            this.Api.InitTrackedTimeStart(activity);
            activity.SetLaunchedThisSession();
        } else {
            this.ScoLoader.LoadSco(activity);
        }

        this.UpdateDisplay(false, false);

        // this.WriteDetailedLog("Exiting Control Deliver Activity", logParent);
    }

    // For use with "Launch after click" -- called within popup launcher

    function Controller_PerformDelayedDeliveryInitialization(activity) {

        this.Sequencer.ContentDeliveryEnvironmentActivityDataSubProcess(activity);

        this.Api.ResetState();
        this.Api.InitializeForDelivery(activity);
        this.EvaluatePossibleNavigationRequests();
    }

    function Controller_InitializePossibleNavigationRequests() {

        // var logParent = this.WriteAuditLog("Initializing Possible Navigation Requests");
        // If lookahead is disabled, we must automatically expose the navigation elements
        if (Control.Package.Properties.LookaheadSequencerMode === LOOKAHEAD_SEQUENCER_MODE_DISABLE) {
            // this.WriteDetailedLog("Lookahead Sequencer Mode Disabled", logParent);
            var defaultNavRequestResult = true;
        } else {
            // this.WriteDetailedLog("Lookahead Sequencer Mode Enabled", logParent);
            var defaultNavRequestResult = RESULT_UNKNOWN;
        }

        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_START] = new PossibleRequest(NAVIGATION_REQUEST_START, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_RESUME_ALL] = new PossibleRequest(NAVIGATION_REQUEST_RESUME_ALL, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE] = new PossibleRequest(NAVIGATION_REQUEST_CONTINUE, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS] = new PossibleRequest(NAVIGATION_REQUEST_PREVIOUS, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT] = new PossibleRequest(NAVIGATION_REQUEST_EXIT, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_EXIT_ALL] = new PossibleRequest(NAVIGATION_REQUEST_EXIT_ALL, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_SUSPEND_ALL] = new PossibleRequest(NAVIGATION_REQUEST_SUSPEND_ALL, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_ABANDON] = new PossibleRequest(NAVIGATION_REQUEST_ABANDON, null, defaultNavRequestResult, "", "");
        this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_ABANDON_ALL] = new PossibleRequest(NAVIGATION_REQUEST_ABANDON_ALL, null, defaultNavRequestResult, "", "");

        var arrayIndex = POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE;

        for (var identifier in this.Activities.SortedActivityList) {
            if (!this.Activities.SortedActivityList.hasOwnProperty(identifier)) {
                continue;
            }

            activity = this.Activities.SortedActivityList[identifier];

            itemId = activity.GetItemIdentifier();

            this.PossibleNavigationRequests[arrayIndex] = new PossibleRequest(NAVIGATION_REQUEST_CHOICE, itemId, defaultNavRequestResult, "", "");

            arrayIndex++;
        }

        // for(var id in this.PossibleNavigationRequests){
        //     this.WriteDetailedLog("Initialized " + this.PossibleNavigationRequests[id].toString(), logParent);
        // }

        this.Sequencer.InitializePossibleNavigationRequestAbsolutes(this.PossibleNavigationRequests, this.Activities.ActivityTree, this.Activities.SortedActivityList);
    }

    // This is the method that actually runs the Lookahead Sequencer

    function Controller_EvaluatePossibleNavigationRequests(isActivityStillLoaded, invokeRunTimeNavRequestIfItWillNowSucceed) {

        if (invokeRunTimeNavRequestIfItWillNowSucceed === undefined || invokeRunTimeNavRequestIfItWillNowSucceed === null) {
            invokeRunTimeNavRequestIfItWillNowSucceed = false;
        }

        //copy regular sequencer's clean activity state to the look ahead sequencer's activity state

        if (this.Package.Properties.LookaheadSequencerMode !== LOOKAHEAD_SEQUENCER_MODE_DISABLE) {

            // var logParent = this.WriteAuditLog("Control Evaluate Possible Navigation Requests");

            // this.WriteDetailedLog("Tearing down sequencer", logParent);
            this.TearDownSequencer(this.LookAheadSequencer);

            // this.WriteDetailedLog("Cloning sequencer", logParent);
            this.LookAheadSequencer = this.CloneSequencer(this.Sequencer);
            this.LookAheadSequencer.LookAhead = true;

            // this.WriteDetailedLog("Setting sequencer pointer for cloned activities", logParent);
            this.LookAheadSequencer.Activities.SetSequencer(this.LookAheadSequencer, true);

            // this.WriteDetailedLog("Performing sequencing look ahead evaluation", logParent);
            // set current activity as completed before checking possible navigation requests
            var currActivity = this.LookAheadSequencer.GetCurrentActivity();
            if (currActivity) {
                currActivity.SetAttemptProgressStatus(true);
                currActivity.SetAttemptCompletionStatus(true);
                this.LookAheadSequencer.OverallRollupProcess(currActivity.ParentActivity);
            }

            this.PossibleNavigationRequests = this.LookAheadSequencer.EvaluatePossibleNavigationRequests(this.PossibleNavigationRequests);

            // this.WriteDetailedLog("Done Evaluating Possible Navigation Requests", logParent);

            if (invokeRunTimeNavRequestIfItWillNowSucceed === true) {

                if (this.PendingNavigationRequest === null) {

                    if ((this.Api !== null) && (this.Api.RunTimeData != null) &&
                        (this.Api.RunTimeData.NavRequest != SCORM_RUNTIME_NAV_REQUEST_NONE)) {

                        var navRequest = Control.FindPossibleNavRequestForRuntimeNavRequest(this.Api.RunTimeData.NavRequest);

                        // this.WriteDetailedLog("Checking to see if the nav request (" + navRequest + ") from the runtime will succeed now after re-evaluating with current data.", logParent);

                        if (navRequest.WillSucceed === true) {
                            // this.WriteDetailedLog("Nav request will succeed. Unloading SCO.", logParent);
                            Control.ScoHasTerminatedSoUnload();
                        } else {
                            // this.WriteDetailedLog("Nav request will NOT succeed. Leaving SCO loaded.", logParent);
                        }
                    }

                }
            }

            if (isActivityStillLoaded !== undefined && isActivityStillLoaded !== null && isActivityStillLoaded == true) {
                this.UpdateDisplay(true, true); // use lookahead nav info =  true, use lookahead activity data = true
            } else {
                this.UpdateDisplay(true, false);
            }

        } else {

            // var logParent = this.WriteAuditLog("Bypassing Lookahead Sequencer processing because PackageProperties.LookaheadSequencerMode = disabled");
        }

        this.Api.IsLookAheadSequencerRunning = false;
        this.Api.RunLookAheadSequencerIfNeeded();
    }


    function Controller_FindPossibleChoiceRequestForActivity(activity) {

        var targetItemIdentifier = activity.GetItemIdentifier();

        var arrayIndex = POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE;

        for (var i = arrayIndex; i < this.PossibleNavigationRequests.length; i++) {

            if (this.PossibleNavigationRequests[i].TargetActivityItemIdentifier == targetItemIdentifier) {
                return this.PossibleNavigationRequests[i];
            }
        }

        // Debug.AssertError("Could not locate possible choice request for activity-" + activity);

        return null;
    }

    function Controller_GetPossibleContinueRequest() {
        return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE];
    }


    function Controller_GetPossiblePreviousRequest() {
        return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS];
    }


    function Controller_IsTargetValid(targetString) {

        var targetActivity = this.ParseTargetStringIntoActivity(targetString);

        if (targetActivity === null) {
            return false;
        } else {
            return true;
        }
    }

    function Controller_IsChoiceRequestValid(target) {

        var targetActivity = this.ParseTargetStringIntoActivity(target);
        var targetItemIdentifier = targetActivity.GetItemIdentifier();

        for (var i = POSSIBLE_NAVIGATION_REQUEST_INDEX_CHOICE; i < this.PossibleNavigationRequests.length; i++) {

            if (this.PossibleNavigationRequests[i].TargetActivityItemIdentifier == targetItemIdentifier) {
                return this.PossibleNavigationRequests[i].WillSucceed;
            }
        }

        return false;
    }

    function Controller_IsJumpRequestValid(target) {

        var targetActivity = this.ParseTargetStringIntoActivity(target);

        if (targetActivity != null)
            return targetActivity.IsAvailable();

        return false;
    }

    function Controller_IsContinueRequestValid() {
        return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed;
    }

    function Controller_IsPreviousRequestValid() {
        return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].WillSucceed;
    }

    function Controller_ParseTargetStringIntoActivity(value) {

        var itemIdentifier = this.ParseTargetStringFromChoiceRequest(value);

        var targetActivity = this.Activities.GetActivityFromIdentifier(itemIdentifier);

        return targetActivity;
    }

    function Controller_ParseTargetStringFromChoiceRequest(value) {
        //TODO - test this....make more robust...check for case indexOf("=") < 0
        return value.substring(value.indexOf("=") + 1, value.indexOf("}"));
    }


    function Controller_CloneSequencer(sequencerToClone, resultIsLookAhead) {

        var sequencerReturn = new Sequencer(resultIsLookAhead, sequencerToClone.Activities.Clone());

        if (sequencerToClone.SuspendedActivity === null) {
            sequencerReturn.SuspendedActivity = null;
        } else {
            sequencerReturn.SuspendedActivity = sequencerReturn.Activities.GetActivityFromIdentifier(sequencerToClone.SuspendedActivity.GetItemIdentifier());
        }

        if (sequencerToClone.CurrentActivity === null) {
            sequencerReturn.CurrentActivity = null;
        } else {
            sequencerReturn.CurrentActivity = sequencerReturn.Activities.GetActivityFromIdentifier(sequencerToClone.CurrentActivity.GetItemIdentifier());
        }

        //this.GlobalObjectives = new Array();
        sequencerReturn.GlobalObjectives = new Array();

        for (var objId in sequencerToClone.GlobalObjectives) {
            if (!sequencerToClone.GlobalObjectives.hasOwnProperty(objId)) {
                continue;
            }
            sequencerReturn.GlobalObjectives[sequencerReturn.GlobalObjectives.length] = sequencerToClone.GlobalObjectives[objId].Clone();
        }

        //TODO - find a cleaner way to copy properties that are specific to one sequencer or another
        if (sequencerToClone.AtEndOfCourse !== undefined) {
            sequencerReturn.AtEndOfCourse = sequencerToClone.AtEndOfCourse;
            sequencerReturn.AtStartOfCourse = sequencerToClone.AtStartOfCourse;
        }

        sequencerReturn.NavigationRequest = null;
        sequencerReturn.ChoiceTargetIdentifier = null;

        sequencerReturn.Exception = null;
        sequencerReturn.ExceptionText = null;

        return sequencerReturn;
    }

    function Controller_TearDownSequencer(sequencer) {

        sequencer.LookAhead = null;

        if (sequencer.Activities !== null) {
            sequencer.Activities.TearDown();
        }
        sequencer.Activities = null;

        sequencer.NavigationRequest = null;
        sequencer.ChoiceTargetIdentifier = null;

        sequencer.SuspendedActivity = null;
        sequencer.CurrentActivity = null;

        sequencer.Exception = null;
        sequencer.ExceptionText = null;

        sequencer.GlobalObjectives = null;
    }

    function Controller_WriteAuditLog(str) {
        // Debug.WriteControlAudit(str);
    }

    function Controller_WriteDetailedLog(str, parent) {
        // Debug.WriteControlDetailed(str, parent);
    }

    function Controller_WriteDetailedLogError(str, parent) {
        // Debug.WriteControlDetailed(str, parent, true);
    }

    function Controller_WriteHistoryLog(str, atts) {
        // HistoryLog.WriteEventDetailed(str, atts);
    }

    function Controller_WriteHistoryReturnValue(str, atts) {
        // HistoryLog.WriteEventDetailedReturnValue(str, atts);
    }

    function Controller_GetLaunchHistoryId() {
        return LaunchHistoryId;
    }

    // Given a relative page href and the full href to the current delivery page,
    // this function will construct a full href relative to the delivery page.

    function BuildFullUrl(relativeHref, deliveryPageUrl) {

        if (deliveryPageUrl.indexOf("?") > -1) {
            var deliveryPagePathWithoutQueryString = deliveryPageUrl.substr(0, deliveryPageUrl.indexOf("?"));
        } else {
            var deliveryPagePathWithoutQueryString = deliveryPageUrl
        }

        var baseHref = deliveryPageUrl.substr(0, deliveryPagePathWithoutQueryString.lastIndexOf("/"));

        // The relative href might contain ../ to move up a directory.  If so, we must adjust
        // the baseHref appropriately
        while (relativeHref.indexOf("../") > -1) {
            relativeHref = relativeHref.substr(3, relativeHref.length);
            baseHref = baseHref.substr(0, baseHref.lastIndexOf("/"));
        }

        return baseHref + "/" + relativeHref;
    }

    //finds and returns the control object.  Needed to handle the scormengine being launched within an external frameset.

    function GetController() {
        var MAX_PARENTS_TO_SEARCH = 500;
        var nParentsSearched = 0;
        var win = window;

        while ((win.Control === null) &&
            (win.parent !== null) && (win.parent != win) &&
            (nParentsSearched <= MAX_PARENTS_TO_SEARCH)) {

            nParentsSearched++;
            win = win.parent;
        }

        if (win.Control === null) {
            // Debug.AssertError("Could not locate the Control object.");
        } else {
            return win.Control;
        }
    }

    function Controller_UpdateGlobalLearnerPrefs() {

        if (this.Api.LearnerPrefsArray !== null && this.Api.LearnerPrefsArray !== undefined) {
            var preferenceArray = this.Api.LearnerPrefsArray;

            for (var preference_name in preferenceArray) {
                if (!preferenceArray.hasOwnProperty(preference_name)) {
                    continue;
                }

                for (var activityIterator in this.Activities.ActivityList) {
                    if (!this.Activities.ActivityList.hasOwnProperty(activityIterator)) {
                        continue;
                    }

                    var activity = this.Activities.ActivityList[activityIterator];
                    if (activity.RunTime !== null && activity.RunTime[preference_name] !== preferenceArray[preference_name]) {
                        activity.RunTime[preference_name] = preferenceArray[preference_name];
                        activity.RunTime.SetDirtyData();
                    }
                }

            }
        }
    }

    //Time Limit and related functionality...

    function Controller_IsUserOverTimeLimit() {
        if (this.Package.Properties.TimeLimit <= 0) {
            return false;
        }

        var rootActivity = this.Activities.GetRootActivity();
        if (rootActivity === null) {
            return false;
        }

        //TODO: Option to use reported time instead?
        var experiencedDurationTracked = ConvertIso8601TimeSpanToHundredths(rootActivity.GetActivityExperiencedDurationTracked());

        //Calculate tracked time so far. If the tracked start date on the Api object hasn't been initialized, then we haven't
        //started, so the tracked time should be zero
        var currentTrackedTimeHundredths;
        if (this.Api.TrackedStartDate === null) {
            currentTrackedTimeHundredths = 0;
        } else {
            currentTrackedTimeHundredths = Math.round((new Date() - this.Api.TrackedStartDate) / 10);
        }

        var runningTotalHundredths = experiencedDurationTracked + currentTrackedTimeHundredths;
        var timeLimitHundredths = this.Package.Properties.TimeLimit * 60 * 100; //Time limit is specified in minutes

        return runningTotalHundredths > timeLimitHundredths;
    }

    //This is run on a regular interval, see Control.Initialize()

    function Controller_ExitIfTimeLimitExceeded() {
        if (this.IsUserOverTimeLimit() == true) {
            // this.WriteAuditLog("Time limit exceeded, automatically returning user from the course");
            //Only show the message once
            if (this.MessageShown !== true) {
                alert("You have exceeded the time limit for this course, your session will now end.");
                this.MessageShown = true;
            }
            this.TriggerReturnToLMS();
        }
    }

    //Disables all navigation options and displays the message using a NAVIGATION_REQUEST_DISPLAY_MESSAGE NavigationRequest

    function Controller_BlockCourseEntryWithMessage(messageText) {
        this.Sequencer.NavigationRequest = new NavigationRequest(NAVIGATION_REQUEST_DISPLAY_MESSAGE, null, messageText);
        for (var activityId in this.Sequencer.Activities.ActivityList) {
            if (!this.Sequencer.Activities.ActivityList.hasOwnProperty(activityId)) {
                continue;
            }

            activity.SetHiddenFromChoice(true);
            var menuItem = this.Sequencer.Activities.ActivityList[activityId].MenuItem;
            if (menuItem !== null) {
                menuItem.Disable();
            }
        }
        for (var i = 0; i < this.PossibleNavigationRequests.length; i++) {
            this.PossibleNavigationRequests[i].WillSucceed = false;
        }
        //CRE.updateNavigation();
    }

    function Controller_RerandomizeChildren(activity) {
        this.Sequencer.SelectChildrenProcess(activity);
        this.Sequencer.RandomizeChildrenProcess(activity, true);
    }

    // Custom functions
    function Controller_getBookmarkType() {
        var curActivity = this.Sequencer.CurrentActivity,
            type = 'Resume';

        if (curActivity.GetObjectives() && curActivity.GetObjectives().length > 1 ) {
            for (var i = 1; i < curActivity.GetObjectives().length; i++) {
                var objIden = curActivity.GetObjectives()[i].GetIdentifier();
                if (/Retake/.test(objIden)) {
                    type =  'Retake';
                    break;
                }
                if (/Review/.test(objIden)) {
                    type =  'Review';
                    break;
                }
            }
        }
        return type;
    }

    function Controller_getBookmark() {
        var curActivity = this.Sequencer.CurrentActivity,
            type = this.GetBookmarkType(),
            attemptLimit = NaN,
            scorecardActivity = null,
            parentContainer, i, objIden;

        if(/Review|Retake/.test(type)) {

            scorecardActivity = this.findScorecard();
        }

        if(scorecardActivity){
            scorecardActivity = Control.Sequencer.Activities.GetActivityFromIdentifier(scorecardActivity);
            parentContainer = scorecardActivity.ParentActivity;

            if (!hasVisitedQuestions(parentContainer)) {
                type = '';
            }
        } else {
            // haven't found scorecard in activities
            type = '';
        }

        if (type === 'Retake') {
            // find attempt limit
            if (curActivity.GetObjectives() && curActivity.GetObjectives().length > 1) {
                for (i = 1; i < curActivity.GetObjectives().length; i++) {
                    objIden = curActivity.GetObjectives()[i].GetIdentifier();
                    if (/Retake/.test(objIden)) {
                        attemptLimit = parseInt(objIden.match(/^.*-(.*)/)[1]);
                        break;
                    }
                }
            }
            type = parentContainer.ActivityAttemptCount > attemptLimit ? 'Review' : type;
        }

        switch (type) {
            case 'Retake' :
                return parentContainer.GetFirstAvailableDescendantLeaf().GetDatabaseIdentifier()
                    + "_type_" + type + "_" + parentContainer.GetDatabaseIdentifier();
                break;
            case 'Review' :
                return scorecardActivity.GetDatabaseIdentifier()
                    + "_type_" + type + "_" + parentContainer.GetDatabaseIdentifier();
                break;
            default:
            return '';
        }

        function hasVisitedQuestions(container) {
            var result = false,
                children = container.GetAvailableChildren(),
                objectives,
                findQuestions = function (child) {
                    if (!child.IsALeaf()) {
                       child.GetAvailableChildren().forEach(findQuestions);
                    } else {
                        objectives = child.GetObjectives();
                        objectives = objectives.filter(function (objective) {
                            return (/^q-/).test(objective.GetIdentifier());
                        });
                        if (objectives.length > 0 && (child.AttemptProgressStatus || child.Active)) {
                            result = true;
                        }
                    }
                }

            if (children && children.length) {
                children.forEach(findQuestions);
            }
            return result;
        }
    }

    function Controller_isScorecard(activityId) {
        if (activityId) {
            var objective = this.Sequencer.Activities.GetActivityFromIdentifier(
                activityId).GetPrimaryObjective();

            return objective && objective.GetIdentifier() ===
                'EnhancedScorecard';
        }
        return false;
    }

    function Controller_findScorecard() {
        var assessmentRoot = this.Sequencer.CurrentActivity.ParentActivity,
            siblings, scorecard = null;

        while (assessmentRoot.ParentActivity && this.isAssessment(assessmentRoot.ParentActivity)) {
            assessmentRoot = assessmentRoot.ParentActivity;
        }

        siblings = assessmentRoot.GetAvailableChildren() || []

        siblings.forEach(function (a) {
            if (a.GetPrimaryObjective() && a.GetPrimaryObjective().GetIdentifier() === 'EnhancedScorecard') {
                scorecard = a.GetItemIdentifier();
            }
        });

        return scorecard;
    }

    function Controller_applyBookmark(bookmark, suspendedActivity){
        var parentContId = bookmark.replace(/^.*_/, ""),
            type = bookmark.match(/_type_(.*)_/)[1],
            bookmarkId = bookmark.replace(/_.*/, "");

        var parentContainer = this.Activities.GetActivityByDatabaseId(parentContId);
        switch (type) {
            case 'Retake' :
                    // firstCall set to false to prevent errors when call CRE.TREE.choose()
                    this.retake(parentContId, true, true);
                    // check if assessment was re-randomized
                    if (suspendedActivity.ParentActivity.GetRandomizeChildren()) {
                        suspendedActivity = suspendedActivity.ParentActivity.GetFirstAvailableChild();
                        RegistrationToDeliver.SuspendedActivity = suspendedActivity.GetDatabaseIdentifier();
                        this.Sequencer.SetSuspendedActivity(suspendedActivity);
                    }
                break;
            case 'Review' :
                var activities = parentContainer.ChildActivities;
                for (var i = 0; i < activities.length; i++) {
                    if(activities[i].GetDatabaseIdentifier() !== bookmarkId) { // not page with enhanced scorecard
                        activities[i].SetAttemptProgressStatus(true);
                        activities[i].SetAttemptedDuringThisAttempt(true);
                        activities[i].SetAttemptCompletionStatus (true);
                    }
                }
                break;
            default:
            // do nothing
        }
    }

    function Controller_isSubmitAllStatusSaved(activityId) {
        var activity, objectives, i, n;

        if (!activityId) {
            activity = this.Sequencer.CurrentActivity;
        } else {
            activity = this.Sequencer.GetActivityFromIdentifier(activityId);
        }

        objectives = activity.GetObjectives();
        i = 0;
        n = objectives.length;

        for (; i < n; i++) {
            if (/^Submit/.test(objectives[i].GetIdentifier()) && objectives[i].GetSatisfiedStatus() === true) {
                return true;
            }
        }
        return false;
    }

    function Controller_resetChoiceBranch() {
        var choiceBranch = this.Sequencer.GetCurrentActivity(),
            courseRoot = this.Sequencer.GetRootActivity();

        // clear ancestors data
        this.resetAllAncestors(choiceBranch);

        // reset Choice Branch related content
        this.resetChoiceBranchContent(courseRoot, choiceBranch);

        this.Integration.triggerContentRemove();
        this.ChoiceRequest(choiceBranch.GetItemIdentifier());
        this.ScoUnloaded();
    }

    function Controller_resetChoiceBranchContent(content, choiceBranch, isPartOfChoiceBranch) {
        var activities = content.ChildActivities,
            activity, i, n;

        for (i = 0, n = activities.length; i < n; i++) {
            activity = activities[i];
            // recursively clear all Choice Branch related progress data
            if (isPartOfChoiceBranch || this.isPartOfChoiceBranch(choiceBranch, activity)) {
                if (!this.isAssessmentWithoutAttempts(activity)) {
                    this.resetActivity(activity);
                    this.clearSubmitAllStatus(activity);
                    this.resetObjectives(activity);
                    if (activity.IsALeaf()) {
                        if (activity.RunTime) {
                            activity.RunTime.ResetState(true);
                        }
                    } else {
                        activity.Suspended = false;
                        this.resetChoiceBranchContent(activity, choiceBranch, true);
                        this.RerandomizeChildren(activity);
                    }
                }
            } else {
                this.resetChoiceBranchContent(activity, choiceBranch);
            }
        }
    }

    function Controller_isPartOfChoiceBranch(choiceBranchActivity, contentActivity) {
        var choiceBranchObjectives = choiceBranchActivity.GetObjectives(),
            activityObjectives = contentActivity.GetObjectives(),
            choiceBranchGlobalObjectiveId, choiceBranchGlobalMaps,
            activityGlobalObjectiveId, activityGlobalMaps;

        for (var i = 0, n = activityObjectives.length; i < n; i++) {
            activityGlobalMaps = activityObjectives[i].GetMaps();
            if (activityGlobalMaps.length) {
                for (var x = 0, o = activityGlobalMaps.length; x < o; x++) {
                    activityGlobalObjectiveId = activityGlobalMaps[x].TargetObjectiveId;
                    if (!activityGlobalObjectiveId) {
                        continue;
                    }
                    for (var j = 0, m = choiceBranchObjectives.length; j < m; j++) {
                        choiceBranchGlobalMaps = choiceBranchObjectives[j].GetMaps();
                        if (choiceBranchGlobalMaps.length) {
                            for (var y = 0, p = choiceBranchGlobalMaps.length; y < p; y++) {
                                choiceBranchGlobalObjectiveId = choiceBranchGlobalMaps[y].TargetObjectiveId;
                                if (choiceBranchGlobalObjectiveId && choiceBranchGlobalObjectiveId === activityGlobalObjectiveId) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    function Controler_isAssessmentWithoutAttempts(assessmentRoot) {
        var children = assessmentRoot.ChildActivities,
            scorecard, question, objectives;

        // assessment container means if scorecard is a child
        for (var i = 0, n = children.length; i < n; i++) {
            a = children[i];
            if (this.isScorecard(a.GetItemIdentifier())) {
                scorecard = a;
            }
        }

        if (scorecard) {
            var findQuestion = function (activity) {
                var children = activity.ChildActivities,
                    child, question;

                for (var i = 0, n = children.length; i < n; i++) {
                    child = children[i];
                    if (child.IsALeaf()) {
                        objectives = child.GetObjectives();
                        objectives = objectives.filter(function (objective) {
                            return (/^q-/).test(objective.GetIdentifier());
                        });
                        if (objectives.length > 0) {
                            return child;
                        }
                    } else {
                        question = findQuestion(child);
                        if (question) {
                            return question;
                        }
                    }
                }
                return question;
            }
            // find question
            question = findQuestion(assessmentRoot);
            if (question) {
                objectives = question.GetObjectives();
                // find attempt limit
                if (objectives && objectives.length) {
                    for (var j = 1; j < objectives.length; j++) {
                        objIden = objectives[j].GetIdentifier();
                        if (/Retake/.test(objIden) || /Resume/.test(objIden) || /Review/.test(objIden)) {
                            attemptLimit = parseInt(objIden.match(/^.*-(.*)/)[1]);
                            break;
                        }
                    }
                }
                return assessmentRoot.ActivityAttemptCount > attemptLimit;
            }
        }

        return false;
    }

    function Controller_retake(activityID, firstCall, restartCourse) {
        var activity = activityID ? this.Activities.GetActivityByDatabaseId(activityID) : this.Sequencer.GetCurrentActivity().ParentActivity;

        if (firstCall) {
            this.resetActivity(activity);
            this.resetAllAncestors(activity);
        }

        // recursively clear all progress data from current container
        this.resetContainer(activity);

        if (firstCall && !restartCourse) {
            this.Integration.triggerContentRemove();
            this.ChoiceRequest(activity.GetItemIdentifier());
            this.ScoUnloaded();
        }
    }

    function Controller_resetAllAncestors(activity) {
        var parent = activity.ParentActivity;

        if (parent) {
            this.resetActivity(parent);
            // recursively reset state for all ancestors
            this.resetAllAncestors(parent);
        }
    }

    function Controller_resetActivity(activity) {
        activity.Suspended                     = false;
        activity.Active                        = false;
        activity.ActivityProgressStatus        = false;
        activity.AttemptProgressStatus         = false;
        activity.AttemptCompletionAmountStatus = false;
        activity.AttemptCompletionStatus       = false;
        activity.WasAutoCompleted              = false;
        activity.WasAutoSatisfied              = false;
        activity.ActivityObjectives.forEach(function(o){ o.Clear() });
        activity.SetDirtyData();
    }

    function Controller_resetContainer(activity) {
        var activities = activity.ChildActivities,
            a, i, n;

        this.resetActivity(activity);
        this.clearSubmitAllStatus(activity);

        for (i = 0, n = activities.length; i < n; i++) {
            a = activities[i];

            this.resetActivity(a);
            this.resetObjectives(a);

            if (a.IsALeaf()) {
                if(a.RunTime) {
                    a.RunTime.ResetState(true);
                }
            } else {
                a.Suspended = false;
                this.resetContainer(a);
                this.RerandomizeChildren(a);
            }
        }
    }

    function Controller_resetObjectives(activity) {
        var objectives = activity.GetObjectives(),
            i, n;

        if (activity.LearningObject.SequencingData.UseCurrentAttemptObjectiveInformation === true){
            for (i = 0, n = objectives.length; i < n; i++){
                objectives[i].ResetAttemptState();
            }
            return;
        }
        //if this is a questions container, clear primary objective progress status
        if (activity.ChildActivities.length) {
            activity.GetPrimaryObjective().Clear();

            if (activity.ParentActivity.ItemIdentifier !== 'defaultOrganization') {
                activity.ParentActivity.GetPrimaryObjective().Clear();
                this.Sequencer.OverallRollupProcess(activity.ParentActivity);
            }
        }
    }

    function Controller_clearSubmitAllStatus(activity) {
        if (this.isAssessment(activity)) {
            // get target global objective Id
            activity = activity || this.Sequencer.CurrentActivity;
            var objectives = activity.GetObjectives(),
                i = 0,
                n = objectives.length,
                globalObjectiveId = null,
                globalObjective;

            for (; i < n; i++) {
                if (/^Submit/.test(objectives[i].GetIdentifier())) {
                    globalObjectiveId = objectives[i].GetMaps()[0].TargetObjectiveId;
                    break;
                }
            }

            // clear global objective
            if (globalObjectiveId != null) {
                globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(globalObjectiveId);
                globalObjective.ProgressStatus = false;
                globalObjective.SatisfiedStatus = false;
            }
        }
    }

    function Controller_isSubmitAllMode(activity) {
        // set "submit all button clicked" status
        activity = activity || this.Sequencer.CurrentActivity;
        var objectives = activity.GetObjectives(),
            i = 0,
            n = objectives.length;

        for (; i < n; i++) {
            if (objectives[i].GetIdentifier() === 'SubmitAll') {
                objectives[i].SetProgressStatus(true, false, activity); // needed to restose submit all status on restart
                return true;
            }
        }
        return false;
    }

    function Controller_isAssessment(activity) {
        // set "submit all button clicked" status
        activity = activity || this.Sequencer.CurrentActivity;
        var currentObjective, targetObjective, commonObjective, commonAncestor,
            result = false,
            root = this;

        if (this.Sequencer.CurrentActivity) {
            this.Sequencer.CurrentActivity.GetObjectives().forEach(function (o) {
                if (/^Submit/.test(o.GetIdentifier()) && o.Maps.length > 0) {
                    currentObjective = o.Maps[0].TargetObjectiveId;
                    if (activity === root.Sequencer.CurrentActivity) {
                        o.SetProgressStatus(true, false, activity); // needed to restore submit all status on restart
                    }
                }
            });

            commonAncestor = this.Sequencer.FindCommonAncestor(activity, this.Sequencer.CurrentActivity);
            if (commonAncestor) {
                commonAncestor.GetObjectives().forEach(function (o) {
                    if (/^Submit/.test(o.GetIdentifier()) && o.Maps.length > 0) {
                        commonObjective = o.Maps[0].TargetObjectiveId;
                    }
                });
                if (currentObjective && commonObjective === currentObjective) {
                    return true; // if we are moving from higher level assessment into a subassessment then don's submit
                }
            }
        }

        activity.GetObjectives().forEach(function (o) {
            if (/^Submit/.test(o.GetIdentifier()) && o.Maps.length > 0) {
                targetObjective = o.Maps[0].TargetObjectiveId;
                if (activity === root.Sequencer.CurrentActivity || !root.Sequencer.CurrentActivity) {
                    o.SetProgressStatus(true, false, activity); // needed to restore submit all status on restart
                    result = true;
                } else {
                    result = targetObjective === currentObjective;
                }
            }
        });

        return result;

    }

    function Controller_isAnyAssessment(activity) {
        activity = activity || this.Sequencer.CurrentActivity;
        var currentObjective = null;

        activity.GetObjectives().forEach(function (o) {
            if (/^Submit/.test(o.GetIdentifier()) && o.Maps.length > 0) {
                currentObjective = o.Maps[0].TargetObjectiveId;
            }
        });

        return currentObjective != null;
    }

    function Controller_hasSubassessments(activity) {
        return activity.GetObjectives().some(function (o) {
            return (/^so-/.test(o.GetIdentifier()) || /^sa-/.test(o.GetIdentifier())) && o.Maps.length > 0;
        });
    }

    function Controller_getNextPage() {
        if (this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].WillSucceed) {
            return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_CONTINUE].LookAheadResult;
        }
        return null;
    }

    function Controller_getPreviousPage() {
        if (this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].WillSucceed) {
            return this.PossibleNavigationRequests[POSSIBLE_NAVIGATION_REQUEST_INDEX_PREVIOUS].LookAheadResult;
        }
        return null;
    }

    function Controller_getFollowingPageId(activity, incrementor) {
        var currentActivity = activity || Control.Sequencer.CurrentActivity,
            parentActivity = currentActivity.ParentActivity,
            nextActivity, currentActivityIndex, i, length, itemId;

        incrementor = incrementor !== undefined ? incrementor : 1;

        // if not course root
        if (parentActivity) {
            // activity index in parent
            currentActivityIndex = parentActivity.AvailableChildren.indexOf(currentActivity);
            if (currentActivityIndex + incrementor < parentActivity.AvailableChildren.length) {
                // when current item is not the last activity in the parent
                for (i = currentActivityIndex + incrementor, length = parentActivity.AvailableChildren.length; i < length; i++) {
                    nextActivity = parentActivity.AvailableChildren[i];
                    if (nextActivity.IsALeaf()) {
                        // return first leaf found
                        return nextActivity.GetItemIdentifier();
                    } else {
                        nextActivity = nextActivity.AvailableChildren[0];
                        if (nextActivity) {
                            itemId = Controller_getFollowingPageId(nextActivity, 0);
                        }
                        // handle empty containers
                        if (itemId) {
                            return itemId;
                        }
                    }
                }
            } else {
                // when current item is the last activity in the parent
                return Controller_getFollowingPageId(parentActivity, 1);
            }
        }
        // when the last page in the course
        return null;
    }

    function Controller_getPrecedingPageId(activity, decrementor) {
        var currentActivity = activity || Control.Sequencer.CurrentActivity,
            parentActivity = currentActivity.ParentActivity,
            currentActivityIndex, previousActivity, i, itemId;

        decrementor = decrementor !== undefined ? decrementor : 1;

        // if not course root
        if (parentActivity) {
            // activity index in parent
            currentActivityIndex = parentActivity.AvailableChildren.indexOf(currentActivity);
            if (currentActivityIndex - decrementor >= 0) {
                // when current item is not the first activity in the parent
                for (i = currentActivityIndex - decrementor; i >= 0; i--) {
                    previousActivity = parentActivity.AvailableChildren[i];
                    if (previousActivity.IsALeaf()) {
                        // return first leaf found
                        return previousActivity.GetItemIdentifier();
                    } else {
                        previousActivity = previousActivity.AvailableChildren[previousActivity.AvailableChildren.length - 1];
                        if (previousActivity) {
                            itemId = Controller_getPrecedingPageId(previousActivity, 0);
                        }
                        // handle empty containers
                        if (itemId) {
                            return itemId;
                        }
                    }
                }
            } else {
                // when current item is the first activity in the parent
                return Controller_getPrecedingPageId(parentActivity, 1);
            }
        }
        // when the first page in the course
        return null;
    }

})();
