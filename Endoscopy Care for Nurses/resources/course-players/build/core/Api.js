/* SCORM 2004 3rd Edition Compatible API */

var SCORM_TRUE = "true";
var SCORM_FALSE = "false";
var SCORM_UNKNOWN = "unknown";

var SCORM2004_NO_ERROR = "0";

var SCORM2004_GENERAL_EXCEPTION_ERROR = "101";
var SCORM2004_GENERAL_INITIALIZATION_FAILURE_ERROR = "102";
var SCORM2004_ALREADY_INTIAILIZED_ERROR = "103";
var SCORM2004_CONTENT_INSTANCE_TERMINATED_ERROR = "104";
var SCORM2004_GENERAL_TERMINATION_FAILURE_ERROR = "111";
var SCORM2004_TERMINATION_BEFORE_INITIALIZATION_ERROR = "112";
var SCORM2004_TERMINATION_AFTER_TERMINATION_ERROR = "113";
var SCORM2004_RETRIEVE_DATA_BEFORE_INITIALIZATION_ERROR = "122";
var SCORM2004_RETRIEVE_DATA_AFTER_TERMINATION_ERROR = "123";
var SCORM2004_STORE_DATA_BEFORE_INITIALIZATION_ERROR = "132";
var SCORM2004_STORE_DATA_AFTER_TERMINATION_ERROR = "133";
var SCORM2004_COMMIT_BEFORE_INITIALIZATION_ERROR = "142";
var SCORM2004_COMMIT_AFTER_TERMINATION_ERROR = "143";

var SCORM2004_GENERAL_ARGUMENT_ERROR = "201";

var SCORM2004_GENERAL_GET_FAILURE_ERROR = "301";
var SCORM2004_GENERAL_SET_FAILURE_ERROR = "351";
var SCORM2004_GENERAL_COMMIT_FAILURE_ERROR = "391";

var SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR = "401";
var SCORM2004_UNIMPLEMENTED_DATA_MODEL_ELEMENT_ERROR = "402";
var SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR = "403";
var SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR = "404";

var SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR = "406";
var SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR = "407";
var SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR = "408";

var SCORM2004_ErrorStrings = new Array();

SCORM2004_ErrorStrings[SCORM2004_NO_ERROR] = "No Error";
SCORM2004_ErrorStrings[SCORM2004_GENERAL_EXCEPTION_ERROR] = "General Exception";
SCORM2004_ErrorStrings[SCORM2004_GENERAL_INITIALIZATION_FAILURE_ERROR] = "General Initialization Failure";
SCORM2004_ErrorStrings[SCORM2004_ALREADY_INTIAILIZED_ERROR] = "Already Initialized";
SCORM2004_ErrorStrings[SCORM2004_CONTENT_INSTANCE_TERMINATED_ERROR] = "Content Instance Terminated";
SCORM2004_ErrorStrings[SCORM2004_GENERAL_TERMINATION_FAILURE_ERROR] = "General Termination Failure";
SCORM2004_ErrorStrings[SCORM2004_TERMINATION_BEFORE_INITIALIZATION_ERROR] = "Termination Before Initialization";
SCORM2004_ErrorStrings[SCORM2004_TERMINATION_AFTER_TERMINATION_ERROR] = "Termination AFter Termination";
SCORM2004_ErrorStrings[SCORM2004_RETRIEVE_DATA_BEFORE_INITIALIZATION_ERROR] = "Retrieve Data Before Initialization";
SCORM2004_ErrorStrings[SCORM2004_RETRIEVE_DATA_AFTER_TERMINATION_ERROR] = "Retrieve Data After Termination";
SCORM2004_ErrorStrings[SCORM2004_STORE_DATA_BEFORE_INITIALIZATION_ERROR] = "Store Data Before Initialization";
SCORM2004_ErrorStrings[SCORM2004_STORE_DATA_AFTER_TERMINATION_ERROR] = "Store Data After Termination";
SCORM2004_ErrorStrings[SCORM2004_COMMIT_BEFORE_INITIALIZATION_ERROR] = "Commit Before Initialization";
SCORM2004_ErrorStrings[SCORM2004_COMMIT_AFTER_TERMINATION_ERROR] = "Commit After Termination";

SCORM2004_ErrorStrings[SCORM2004_GENERAL_ARGUMENT_ERROR] = "General Argument Error";

SCORM2004_ErrorStrings[SCORM2004_GENERAL_GET_FAILURE_ERROR] = "General Get Failure";
SCORM2004_ErrorStrings[SCORM2004_GENERAL_SET_FAILURE_ERROR] = "General Set Failure";
SCORM2004_ErrorStrings[SCORM2004_GENERAL_COMMIT_FAILURE_ERROR] = "General Commit Failure";

SCORM2004_ErrorStrings[SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR] = "Undefined Data Model Element";
SCORM2004_ErrorStrings[SCORM2004_UNIMPLEMENTED_DATA_MODEL_ELEMENT_ERROR] = "Unimplemented Data Model Element";
SCORM2004_ErrorStrings[SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR] = "Data Model Element Value Not Initialized";
SCORM2004_ErrorStrings[SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR] = "Data Model Element Is Read Only";

SCORM2004_ErrorStrings[SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR] = "Data Model Element Type Mismatch";
SCORM2004_ErrorStrings[SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR] = "Data Model Element Value Out Of Range";
SCORM2004_ErrorStrings[SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR] = "Data Model Dependency Not Established";


var SCORM2004_VERSION = "1.0";
var SCORM2004_COMMENTS_FROM_LEARNER_CHILDREN = "comment,location,timestamp";
var SCORM2004_COMMENTS_FROM_LMS_CHILDREN = "comment,location,timestamp";
var SCORM2004_INTERACTIONS_CHILDREN = "id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description";
var SCORM2004_LEARNER_PREFERENCE_CHILDREN = "audio_level,language,delivery_speed,audio_captioning";
var SCORM2004_OBJECTIVES_CHILDREN = "progress_measure,description,score,id,success_status,completion_status";
var SCORM2004_OBJECTIVES_SCORE_CHILDREN = "scaled,raw,min,max";
var SCORM2004_SCORE_CHILDREN = "scaled,min,max,raw";



(function() {
    RunTimeApi = function(learnerId, learnerName) {

        this.LearnerId = learnerId;
        this.LearnerName = learnerName;

        this.ErrorNumber = SCORM2004_NO_ERROR;
        this.ErrorString = "";
        this.ErrorDiagnostic = "";

        //TODO: make sure that 2004 calculates tracked time
        this.TrackedStartDate = null;
        this.TrackedEndDate = null;

        this.Initialized = false;
        this.Terminated = false;
        this.ScoCalledFinish = false;
        this.CloseOutSessionCalled = false;

        this.RunTimeData = null;
        this.LearningObject = null;
        this.Activity = null;

        this.IsLookAheadSequencerDataDirty = false;
        this.IsLookAheadSequencerRunning = false;

        this.LearnerPrefsArray = new Object();

        if (SSP_ENABLED) {
            this.SSPApi = new SSPApi(MAX_SSP_STORAGE, this);

        }
    }

    //-------------------------------------------------------------------------------
    //public interface exposed to controller

    RunTimeApi.prototype.GetNavigationRequest = RunTimeApi_GetNavigationRequest;
    RunTimeApi.prototype.ResetState = RunTimeApi_ResetState;
    RunTimeApi.prototype.InitializeForDelivery = RunTimeApi_InitializeForDelivery;
    RunTimeApi.prototype.SetDirtyData = RunTimeApi_SetDirtyData;





    RunTimeApi.prototype.CloseOutSession = RunTimeApi_CloseOutSession;
    RunTimeApi.prototype.NeedToCloseOutSession = RunTimeApi_NeedToCloseOutSession;
    RunTimeApi.prototype.AccumulateTotalTimeTracked = RunTimeApi_AccumulateTotalTimeTracked;
    RunTimeApi.prototype.InitTrackedTimeStart = RunTimeApi_InitTrackedTimeStart;

    function RunTimeApi_GetNavigationRequest() {
        return null;
    }

    function RunTimeApi_ResetState(activity) {
        this.TrackedStartDate = null;
        this.TrackedEndDate = null;

    }

    function RunTimeApi_InitializeForDelivery(activity) {

        this.RunTimeData = activity.RunTime;
        this.LearningObject = activity.LearningObject;
        this.Activity = activity;
        this.CloseOutSessionCalled = false;

        if (Control.Package.Properties.ResetRunTimeDataTiming == RESET_RT_DATA_TIMING_WHEN_EXIT_IS_NOT_SUSPEND) {
            if (this.RunTimeData.Exit != SCORM_EXIT_SUSPEND && this.RunTimeData.Exit != SCORM_EXIT_LOGOUT) {
                var atts = {
                    ev: 'ResetRuntime',
                    ai: activity.ItemIdentifier,
                    at: activity.LearningObject.Title
                };

                this.RunTimeData.ResetState();
            }
        }

        //reset the nav request so it is not executed again
        this.RunTimeData.NavRequest = SCORM_RUNTIME_NAV_REQUEST_NONE;

        this.Initialized = false;
        this.Terminated = false;

        this.ScoCalledFinish = false;

        this.TrackedStartDate = null;
        this.TrackedEndDate = null;

        this.ErrorNumber = SCORM2004_NO_ERROR;
        this.ErrorString = "";
        this.ErrorDiagnostic = "";

        var identifier;
        var runTimeObjective;
        var activityObjective;

        for (var activityObjectiveIndex in this.Activity.ActivityObjectives) {
            if (!this.Activity.ActivityObjectives.hasOwnProperty(activityObjectiveIndex)) {
                continue;
            }

            activityObjective = this.Activity.ActivityObjectives[activityObjectiveIndex];

            identifier = activityObjective.GetIdentifier();

            //if there is an identifier, then the runtime needs access to its latest state

            if (identifier !== null && identifier !== undefined && identifier.length > 0) {

                runTimeObjective = this.RunTimeData.FindObjectiveWithId(identifier);

                if (runTimeObjective === null) {
                    this.RunTimeData.AddObjective();
                    runTimeObjective = this.RunTimeData.Objectives[this.RunTimeData.Objectives.length - 1];
                    runTimeObjective.Identifier = identifier;
                }

                //update the success status and scaled score from the activity objective
                if (activityObjective.GetProgressStatus(this.Activity, false) === true) {
                    if (activityObjective.GetSatisfiedStatus(this.Activity, false) === true) {
                        runTimeObjective.SuccessStatus = SCORM_STATUS_PASSED;
                    } else {
                        runTimeObjective.SuccessStatus = SCORM_STATUS_FAILED;
                    }
                } else {
                    runTimeObjective.SuccessStatus = SCORM_STATUS_UNKNOWN;
                }

                if (activityObjective.GetMeasureStatus(this.Activity, false) === true) {
                    runTimeObjective.ScoreScaled = activityObjective.GetNormalizedMeasure(this.Activity, false);
                }

                //mark the data relevalt to sequencing as coming from sequencing initialization rather than a runtime change
                //we don't want to resave this data to the activity tree if it doens't change at runtime, that would give a
                //local objective known status, even though it was populated from a global objective
                runTimeObjective.SuccessStatusChangedDuringRuntime = false;
                runTimeObjective.MeasureChangedDuringRuntime = false;
            }
        }

    }

    function RunTimeApi_SetDirtyData() {
        this.Activity.DataState = DATA_STATE_DIRTY;
    }


    function RunTimeApi_NeedToCloseOutSession() {

        return !this.CloseOutSessionCalled;
    }

    //-------------------------------------------------------------------------------
    //public items specific to this API


    RunTimeApi.prototype.version = SCORM2004_VERSION;

    RunTimeApi.prototype.Initialize = RunTimeApi_Initialize;
    RunTimeApi.prototype.Terminate = RunTimeApi_Terminate;

    RunTimeApi.prototype.GetValue = RunTimeApi_GetValue;
    RunTimeApi.prototype.SetValue = RunTimeApi_SetValue;
    RunTimeApi.prototype.Commit = RunTimeApi_Commit;

    RunTimeApi.prototype.GetLastError = RunTimeApi_GetLastError;
    RunTimeApi.prototype.GetErrorString = RunTimeApi_GetErrorString;
    RunTimeApi.prototype.GetDiagnostic = RunTimeApi_GetDiagnostic;

    RunTimeApi.prototype.RetrieveGetValueData = RunTimeApi_RetrieveGetValueData;
    RunTimeApi.prototype.StoreValue = RunTimeApi_StoreValue;

    RunTimeApi.prototype.SetErrorState = RunTimeApi_SetErrorState;
    RunTimeApi.prototype.ClearErrorState = RunTimeApi_ClearErrorState;

    RunTimeApi.prototype.CheckMaxLength = RunTimeApi_CheckMaxLength;
    RunTimeApi.prototype.CheckLengthAndWarn = RunTimeApi_CheckLengthAndWarn;

    RunTimeApi.prototype.CheckForInitializeError = RunTimeApi_CheckForInitializeError;
    RunTimeApi.prototype.CheckForTerminateError = RunTimeApi_CheckForTerminateError;
    RunTimeApi.prototype.CheckForGetValueError = RunTimeApi_CheckForGetValueError;
    RunTimeApi.prototype.CheckForSetValueError = RunTimeApi_CheckForSetValueError;
    RunTimeApi.prototype.CheckForCommitError = RunTimeApi_CheckForCommitError;

    RunTimeApi.prototype.CheckCommentsCollectionLength = RunTimeApi_CheckCommentsCollectionLength;
    RunTimeApi.prototype.CheckInteractionsCollectionLength = RunTimeApi_CheckInteractionsCollectionLength;
    RunTimeApi.prototype.CheckInteractionObjectivesCollectionLength = RunTimeApi_CheckInteractionObjectivesCollectionLength;
    RunTimeApi.prototype.CheckInteractionsCorrectResponsesCollectionLength = RunTimeApi_CheckInteractionsCorrectResponsesCollectionLength;
    RunTimeApi.prototype.CheckObjectivesCollectionLength = RunTimeApi_CheckObjectivesCollectionLength;


    RunTimeApi.prototype.LookAheadSessionClose = RunTimeApi_LookAheadSessionClose;


    RunTimeApi.prototype.ValidOtheresponse = RunTimeApi_ValidOtheresponse;
    RunTimeApi.prototype.ValidNumericResponse = RunTimeApi_ValidNumericResponse;
    RunTimeApi.prototype.ValidSequencingResponse = RunTimeApi_ValidSequencingResponse;
    RunTimeApi.prototype.ValidPerformanceResponse = RunTimeApi_ValidPerformanceResponse;
    RunTimeApi.prototype.ValidMatchingResponse = RunTimeApi_ValidMatchingResponse;
    RunTimeApi.prototype.ValidLikeRTResponse = RunTimeApi_ValidLikeRTResponse;
    RunTimeApi.prototype.ValidLongFillInResponse = RunTimeApi_ValidLongFillInResponse;
    RunTimeApi.prototype.ValidFillInResponse = RunTimeApi_ValidFillInResponse;
    RunTimeApi.prototype.IsValidArrayOfLocalizedStrings = RunTimeApi_IsValidArrayOfLocalizedStrings;
    RunTimeApi.prototype.IsValidArrayOfShortIdentifiers = RunTimeApi_IsValidArrayOfShortIdentifiers;
    RunTimeApi.prototype.IsValidCommaDelimitedArrayOfShortIdentifiers = RunTimeApi_IsValidCommaDelimitedArrayOfShortIdentifiers; //MR 8/17 - see change note below
    RunTimeApi.prototype.ValidMultipleChoiceResponse = RunTimeApi_ValidMultipleChoiceResponse;
    RunTimeApi.prototype.ValidTrueFalseResponse = RunTimeApi_ValidTrueFalseResponse;
    RunTimeApi.prototype.ValidTimeInterval = RunTimeApi_ValidTimeInterval;
    RunTimeApi.prototype.ValidTime = RunTimeApi_ValidTime;
    RunTimeApi.prototype.ValidReal = RunTimeApi_ValidReal;
    RunTimeApi.prototype.IsValidUrn = RunTimeApi_IsValidUrn;
    RunTimeApi.prototype.ValidIdentifier = RunTimeApi_ValidIdentifier;
    RunTimeApi.prototype.ValidShortIdentifier = RunTimeApi_ValidShortIdentifier;
    RunTimeApi.prototype.ValidLongIdentifier = RunTimeApi_ValidLongIdentifier;
    RunTimeApi.prototype.ValidLanguage = RunTimeApi_ValidLanguage;
    RunTimeApi.prototype.ExtractLanguageDelimiterFromLocalizedString = RunTimeApi_ExtractLanguageDelimiterFromLocalizedString;
    RunTimeApi.prototype.ValidLocalizedString = RunTimeApi_ValidLocalizedString;
    RunTimeApi.prototype.ValidCharString = RunTimeApi_ValidCharString;

    RunTimeApi.prototype.TranslateBooleanIntoCMI = RunTimeApi_TranslateBooleanIntoCMI;
    RunTimeApi.prototype.SetLookAheadDirtyDataFlagIfNeeded = RunTimeApi_SetLookAheadDirtyDataFlagIfNeeded;
    RunTimeApi.prototype.RunLookAheadSequencerIfNeeded = RunTimeApi_RunLookAheadSequencerIfNeeded;

    RunTimeApi.prototype.GetCompletionStatus = RunTimeApi_GetCompletionStatus;
    RunTimeApi.prototype.GetSuccessStatus = RunTimeApi_GetSuccessStatus;

    function RunTimeApi_Initialize(arg) {

        var callIsErrorFree;
        var returnValue;

        this.ClearErrorState();

        callIsErrorFree = this.CheckForInitializeError(arg);

        if (!callIsErrorFree) {
            returnValue = SCORM_FALSE;
        } else {
            // the TrackedStartDate is now being set when the content is launched by the browser (inside the ScoLauncher or PopupLauncher)
            //this.TrackedStartDate = new Date();

            //reset exit per addendum 3.2
            this.RunTimeData.Exit = SCORM_EXIT_UNKNOWN;

            this.Initialized = true;
            returnValue = SCORM_TRUE;
        }

        Control.ScoLoader.ScoLoaded = true;

        return returnValue;
    }

    function RunTimeApi_Terminate(arg) {

        var callIsErrorFree;
        var successfulStateTransition;
        var returnValue;

        this.ClearErrorState();

        callIsErrorFree = this.CheckForTerminateError(arg);

        //make sure that the Control is only notified to unload once
        var canNotifyControlToUnload = (callIsErrorFree && (this.ScoCalledFinish === false));

        if (!callIsErrorFree) {
            returnValue = SCORM_FALSE;
        } else {

            this.CloseOutSession("Terminate");

            this.RunLookAheadSequencerIfNeeded();

            this.Terminated = true;
            this.ScoCalledFinish = true;

            this.SetDirtyData();

            returnValue = SCORM_TRUE;

        }

        //Signal the controler to unload this sco after a brief interval has passed to allow for any cleanup.
        //The controller will be responsible for determining if this SCO has already been scheduled to unload via another navigation request. - WRONG
        //Actually we need to make sure that there isn't a pending navigation request here as well because if a SCO only calls Terminate in the onunload
        //event, it is quite possible that a long running event (such as EvaluatePossibleNavigatioRequests) will delay this call until after the Controller
        //has already executed and cleared the pending navigation request. If that happens, this event would trigger another UnloadSco call which would
        //unload the SCO that was already loaded by the Control's Navigation request. - MR 9-24-05

        //For SCORM 2004, we don't use rudimentary sequencing (exit actions) so we only unload if there is a navigation event to consider
        if (canNotifyControlToUnload === true &&
            this.RunTimeData.NavRequest != SCORM_RUNTIME_NAV_REQUEST_NONE &&
            Control.IsThereAPendingNavigationRequest() === false) {

            window.setTimeout("Control.ScoHasTerminatedSoUnload();", 150);
        }

        Control.SignalTerminated();


        return returnValue;
    }

    function RunTimeApi_GetValue(element) {



        var returnValue;
        var callIsErrorFree;

        this.ClearErrorState();

        element = CleanExternalString(element);

        var elementWithOutIndex = RemoveIndiciesFromCmiElement(element);

        var primaryIndex = ExtractIndex(element);
        var secondaryIndex = ExtractSecondaryIndex(element);

        callIsErrorFree = this.CheckForGetValueError(element, elementWithOutIndex, primaryIndex, secondaryIndex);

        if (!callIsErrorFree) {
            returnValue = "";
        } else {
            returnValue = this.RetrieveGetValueData(element, elementWithOutIndex, primaryIndex, secondaryIndex);

            if (returnValue === null) {
                //TODO - this represents an error condition - Value Not Set
                returnValue = "";
            }
        }


        return returnValue;

    }


    function RunTimeApi_SetValue(element, value) {



        var callIsErrorFree;
        var returnValue;

        this.ClearErrorState();

        element = CleanExternalString(element);
        value = CleanExternalString(value);


        var elementWithOutIndex = RemoveIndiciesFromCmiElement(element);

        var primaryIndex = ExtractIndex(element);
        var secondaryIndex = ExtractSecondaryIndex(element);

        this.CheckMaxLength(elementWithOutIndex, value);

        callIsErrorFree = this.CheckForSetValueError(element, value, elementWithOutIndex, primaryIndex, secondaryIndex);

        if (!callIsErrorFree) {
            returnValue = SCORM_FALSE;
        } else {
            this.StoreValue(element, value, elementWithOutIndex, primaryIndex, secondaryIndex);

            this.SetDirtyData();

            returnValue = SCORM_TRUE;
        }


        return returnValue;

    }


    function RunTimeApi_Commit(arg) {



        var callIsErrorFree;
        var returnValue;

        this.ClearErrorState();

        callIsErrorFree = this.CheckForCommitError(arg);

        if (!callIsErrorFree) {
            returnValue = SCORM_FALSE;
        } else {
            returnValue = SCORM_TRUE;
        }

        this.RunLookAheadSequencerIfNeeded(true);


        return returnValue;
    }


    function RunTimeApi_GetLastError() {


        var returnValue = this.ErrorNumber;


        return returnValue;
    }

    function RunTimeApi_GetErrorString(arg) {

        var returnValue = "";

        if (arg === "") {
            //updated Test Suite prohibits sending most recent error, March 2007
            //returnValue = this.ErrorString;
            returnValue = "";
        } else {
            if (SCORM2004_ErrorStrings[arg] !== null && SCORM2004_ErrorStrings[arg] !== undefined) {
                returnValue = SCORM2004_ErrorStrings[arg];
            }
        }


        return returnValue;
    }

    function RunTimeApi_GetDiagnostic(arg) {



        var strReturn;

        if (this.ErrorDiagnostic === "") {
            strReturn = "No diagnostic information available";
        } else {
            strReturn = this.ErrorDiagnostic;
        }


        return strReturn;
    }


    //****************************************************************************


    function RunTimeApi_CloseOutSession(caller) {











        //TODO - this exact code is used in SCORM 1.2, should it be part of the ActivityRunTime object?

        //accumulate the session time into the total time
        var sessionTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.RunTimeData.SessionTime);
        var previousTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.RunTimeData.TotalTime);

        var totalTimeHundredths = sessionTimeHundredths + previousTimeHundredths;

        var totalTimeIso = ConvertHundredthsToIso8601TimeSpan(totalTimeHundredths);






        this.RunTimeData.TotalTime = totalTimeIso;
        this.RunTimeData.SessionTime = "";

        //now accumulate the total time "tracked" which is a SCORM Engine specific calculation of time spent
        this.AccumulateTotalTimeTracked();


        //change entry based on exit type or pending navigation request
        if (Control.IsThereAPendingNavigationRequest()) {

            if (Control.PendingNavigationRequest.Type == NAVIGATION_REQUEST_SUSPEND_ALL) {

                this.RunTimeData.Exit = SCORM_EXIT_SUSPEND;
            }
        } else {
            if (this.RunTimeData.NavRequest == SCORM_RUNTIME_NAV_REQUEST_SUSPENDALL) {

                this.RunTimeData.Exit = SCORM_EXIT_SUSPEND;
            }
        }

        if (this.RunTimeData.Exit == SCORM_EXIT_SUSPEND || this.RunTimeData.Exit == SCORM_EXIT_LOGOUT) {

            this.RunTimeData.Entry = SCORM_ENTRY_RESUME;
        }

        var newCompletionStatus = this.GetCompletionStatus();
        if (newCompletionStatus != this.RunTimeData.CompletionStatus) {
            this.RunTimeData.CompletionStatus = newCompletionStatus;
            this.RunTimeData.CompletionStatusChangedDuringRuntime = true;
        }

        var newSuccessStatus = this.GetSuccessStatus();
        if (newSuccessStatus != this.RunTimeData.SuccessStatus) {
            this.RunTimeData.SuccessStatus = this.GetSuccessStatus();
            this.RunTimeData.SuccessStatusChangedDuringRuntime = true;
        }

        //perform required sequencing actions depending on the value of exit

        if (this.RunTimeData.Exit == SCORM_EXIT_TIME_OUT) {

            this.RunTimeData.NavRequest = SCORM_RUNTIME_NAV_REQUEST_EXITALL;
        } else if (this.RunTimeData.Exit == SCORM_EXIT_LOGOUT) {

            if (Control.Package.Properties.LogoutCausesPlayerExit === true) {

                this.RunTimeData.NavRequest = SCORM_RUNTIME_NAV_REQUEST_SUSPENDALL;
            } else {

                this.Activity.SetSuspended(true);
            }
        } else if (this.RunTimeData.Exit == SCORM_EXIT_SUSPEND) {

            this.Activity.SetSuspended(true);
        }

        this.CloseOutSessionCalled = true;

        return true;
    }

    function RunTimeApi_LookAheadSessionClose() {
        if (this.RunTimeData != null) {
            this.RunTimeData.LookAheadCompletionStatus = this.GetCompletionStatus();
            this.RunTimeData.LookAheadSuccessStatus = this.GetSuccessStatus();
        }
    }


    function RunTimeApi_RetrieveGetValueData(element, elementWithOutIndex, primaryIndex, secondaryIndex) {



        var choiceTarget;

        var returnData = "";

        //**************************************************************
        //special case to deal with request_valid.choice....this data element
        //requires GetValue to return "false" instead of "" if the request is improperly formatted
        //Note, this requirement applies "If the target delimiter {target=<STRING>}is not provided or is improperly formatted"
        //     since adl.nav.request_valid.choice. would be a case of {target=<STRING>} not being provided, we must return 301/false in that
        //     case.  It is less clear what to do if the final "." is also not provided, but it seems consistant (and more usefull) to treat it
        //     as 301/false (and log blank as an invalid target).

        if (element.indexOf("adl.nav.request_valid.choice") === 0) {



            choiceTarget = ((element.indexOf("{") >= 0) ? element.substring(element.indexOf("{")) : "");

            if (!Control.IsTargetValid(choiceTarget)) {
                this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The target of the choice request (" + choiceTarget + ") is invalid.");
                return SCORM_FALSE;
            }

            returnData = Control.IsChoiceRequestValid(choiceTarget);
            if (returnData == false) {
                var targetActivity = Control.ParseTargetStringIntoActivity(choiceTarget);
                var choiceRequest = Control.FindPossibleChoiceRequestForActivity(targetActivity);

            }
            returnData = this.TranslateBooleanIntoCMI(returnData);
            return returnData;
        }
        //**************************************************************

        switch (elementWithOutIndex) {

            case "cmi._version":

                returnData = SCORM2004_VERSION;
                break;

                //Comments From Learner

            case "cmi.comments_from_learner._children":

                returnData = SCORM2004_COMMENTS_FROM_LEARNER_CHILDREN;
                break;

            case "cmi.comments_from_learner._count":

                returnData = this.RunTimeData.Comments.length;
                break;

            case "cmi.comments_from_learner.n.comment":

                returnData = this.RunTimeData.Comments[primaryIndex].GetCommentValue();
                break;

            case "cmi.comments_from_learner.n.location":

                returnData = this.RunTimeData.Comments[primaryIndex].Location;
                break;

            case "cmi.comments_from_learner.n.timestamp":

                returnData = this.RunTimeData.Comments[primaryIndex].Timestamp;
                break;


                //Comments From LMS

            case "cmi.comments_from_lms._children":

                returnData = SCORM2004_COMMENTS_FROM_LMS_CHILDREN;
                break;

            case "cmi.comments_from_lms._count":

                returnData = this.RunTimeData.CommentsFromLMS.length;
                break;

            case "cmi.comments_from_lms.n.comment":

                returnData = this.RunTimeData.CommentsFromLMS[primaryIndex].GetCommentValue();
                break;

            case "cmi.comments_from_lms.n.location":

                returnData = this.RunTimeData.CommentsFromLMS[primaryIndex].Location;
                break;

            case "cmi.comments_from_lms.n.timestamp":

                returnData = this.RunTimeData.CommentsFromLMS[primaryIndex].Timestamp;
                break;


                //CMI

            case "cmi.completion_status":

                //In 3rd Edition, this evaluation of progress measure against completion threshold has to be done in real time
                returnData = this.GetCompletionStatus();
                //returnData = this.RunTimeData.CompletionStatus;
                break;

            case "cmi.completion_threshold":

                returnData = this.LearningObject.CompletionThreshold;
                break;

            case "cmi.credit":

                returnData = this.RunTimeData.Credit;
                break;

            case "cmi.entry":

                returnData = this.RunTimeData.Entry;
                break;

            case "cmi.exit":



                returnData = "";

                break;

                //Interactions

            case "cmi.interactions._children":

                returnData = SCORM2004_INTERACTIONS_CHILDREN;
                break;

            case "cmi.interactions._count":

                returnData = this.RunTimeData.Interactions.length;
                break;

            case "cmi.interactions.n.id":

                returnData = this.RunTimeData.Interactions[primaryIndex].Id;
                break;

            case "cmi.interactions.n.type":

                returnData = this.RunTimeData.Interactions[primaryIndex].Type;
                break;

            case "cmi.interactions.n.objectives._count":

                returnData = this.RunTimeData.Interactions[primaryIndex].Objectives.length;
                break;

            case "cmi.interactions.n.objectives.n.id":

                returnData = this.RunTimeData.Interactions[primaryIndex].Objectives[secondaryIndex];
                break;

            case "cmi.interactions.n.timestamp":

                returnData = this.RunTimeData.Interactions[primaryIndex].Timestamp;
                break;

            case "cmi.interactions.n.correct_responses._count":

                returnData = this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length;
                break;

            case "cmi.interactions.n.correct_responses.n.pattern":

                returnData = this.RunTimeData.Interactions[primaryIndex].CorrectResponses[secondaryIndex];
                break;

            case "cmi.interactions.n.weighting":

                returnData = this.RunTimeData.Interactions[primaryIndex].Weighting;
                break;

            case "cmi.interactions.n.learner_response":

                returnData = this.RunTimeData.Interactions[primaryIndex].LearnerResponse;
                break;

            case "cmi.interactions.n.result":

                returnData = this.RunTimeData.Interactions[primaryIndex].Result;
                break;

            case "cmi.interactions.n.latency":

                returnData = this.RunTimeData.Interactions[primaryIndex].Latency;
                break;

            case "cmi.interactions.n.description":
            case "cmi.interactions.n.text":

                returnData = this.RunTimeData.Interactions[primaryIndex].Description;
                break;

                //CMI

            case "cmi.launch_data":

                returnData = this.LearningObject.DataFromLms;
                break;

            case "cmi.learner_id":

                returnData = LearnerId;
                break;

            case "cmi.learner_name":

                returnData = LearnerName;
                break;

                //Learner Preference

            case "cmi.learner_preference._children":

                returnData = SCORM2004_LEARNER_PREFERENCE_CHILDREN;
                break;

            case "cmi.learner_preference.audio_level":

                returnData = this.RunTimeData.AudioLevel;
                break;

            case "cmi.learner_preference.language":

                returnData = this.RunTimeData.LanguagePreference;
                break;

            case "cmi.learner_preference.delivery_speed":

                returnData = this.RunTimeData.DeliverySpeed;
                break;

            case "cmi.learner_preference.audio_captioning":

                returnData = this.RunTimeData.AudioCaptioning;
                break;

                //CMI

            case "cmi.location":

                returnData = this.RunTimeData.Location;
                break;

            case "cmi.max_time_allowed":



                returnData = "";
                //TODO: improvement - make this a method on LearningObject....preferably make all property access done via methods
                if (this.LearningObject.SequencingData !== null &&
                    this.LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationControl === true) {
                    returnData = this.LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationLimit;
                }

                break;

            case "cmi.mode":

                returnData = this.RunTimeData.Mode;
                break;

                //Objectives

            case "cmi.objectives._children":

                returnData = SCORM2004_OBJECTIVES_CHILDREN;
                break;

            case "cmi.objectives._count":

                returnData = this.RunTimeData.Objectives.length;
                break;

            case "cmi.objectives.n.id":

                returnData = this.RunTimeData.Objectives[primaryIndex].Identifier;
                break;

            case "cmi.objectives.n.score._children":

                returnData = SCORM2004_OBJECTIVES_SCORE_CHILDREN;
                break;

            case "cmi.objectives.n.score.scaled":

                returnData = this.RunTimeData.Objectives[primaryIndex].ScoreScaled;
                break;

            case "cmi.objectives.n.score.raw":

                returnData = this.RunTimeData.Objectives[primaryIndex].ScoreRaw;
                break;

            case "cmi.objectives.n.score.min":

                returnData = this.RunTimeData.Objectives[primaryIndex].ScoreMin;
                break;

            case "cmi.objectives.n.score.max":

                returnData = this.RunTimeData.Objectives[primaryIndex].ScoreMax;
                break;

            case "cmi.objectives.n.success_status":

                returnData = this.RunTimeData.Objectives[primaryIndex].SuccessStatus;
                break;

            case "cmi.objectives.n.completion_status":

                returnData = this.RunTimeData.Objectives[primaryIndex].CompletionStatus;
                break;

            case "cmi.objectives.n.progress_measure":

                returnData = this.RunTimeData.Objectives[primaryIndex].ProgressMeasure;
                break;

            case "cmi.objectives.n.description":

                returnData = this.RunTimeData.Objectives[primaryIndex].Description;
                break;

                //CMI

            case "cmi.progress_measure":

                returnData = this.RunTimeData.ProgressMeasure;
                break;

            case "cmi.scaled_passing_score":



                returnData = this.LearningObject.GetScaledPassingScore();

                if (returnData === null) {
                    returnData = "";
                }

                break;

            case "cmi.score._children":

                returnData = SCORM2004_SCORE_CHILDREN;
                break;

            case "cmi.score.scaled":

                returnData = this.RunTimeData.ScoreScaled;
                break;

            case "cmi.score.raw":

                returnData = this.RunTimeData.ScoreRaw;
                break;

            case "cmi.score.max":

                returnData = this.RunTimeData.ScoreMax;
                break;

            case "cmi.score.min":

                returnData = this.RunTimeData.ScoreMin;
                break;

            case "cmi.session_time":


                //returnData = this.RunTimeData.SessionTime;
                returnData = "";
                break;

            case "cmi.success_status":

                //In 3rd Edition, this evaluation of score against passing score has to be done in real time
                returnData = this.GetSuccessStatus();
                //returnData = this.RunTimeData.SuccessStatus;
                break;

            case "cmi.suspend_data":

                returnData = this.RunTimeData.SuspendData;
                break;

            case "cmi.time_limit_action":

                returnData = this.LearningObject.TimeLimitAction;
                break;

            case "cmi.total_time":

                returnData = this.RunTimeData.TotalTime;
                break;

            case "adl.nav.request":

                returnData = this.RunTimeData.NavRequest;
                break;

            case "adl.nav.request_valid.continue":

                returnData = Control.IsContinueRequestValid();
                if (returnData == false) {
                    var request = Control.GetPossibleContinueRequest();

                }
                returnData = this.TranslateBooleanIntoCMI(returnData);
                break;

            case "adl.nav.request_valid.previous":

                returnData = Control.IsPreviousRequestValid();
                if (returnData == false) {
                    var request = Control.GetPossiblePreviousRequest();

                }
                returnData = this.TranslateBooleanIntoCMI(returnData);
                break;

            case "adl.nav.request_valid.choice":

                //no error possible
                 break;

            default:

                if (elementWithOutIndex.indexOf("ssp") === 0 && SSP_ENABLED) {
                    returnData = this.SSPApi.RetrieveGetValueData(element, elementWithOutIndex, primaryIndex, secondaryIndex);
                } else {
                     returnData = "";
                }
                break;
        }

        return returnData;
    }



    //***********************************************************************************
    //***********************************************************************************
    //***********************************************************************************
    //***********************************************************************************
    //***********************************************************************************
    //***********************************************************************************
    //***********************************************************************************

    function RunTimeApi_StoreValue(element, value, elementWithOutIndex, primaryIndex, secondaryIndex) {



        var blnReturn = true;

        switch (elementWithOutIndex) {

            case "cmi._version":

                break;

                //Comments From Learner

            case "cmi.comments_from_learner._children":
                 blnReturn = false;
                break;

            case "cmi.comments_from_learner._count":
                 blnReturn = false;
                break;

            case "cmi.comments_from_learner.n.comment":


                this.CheckCommentsCollectionLength(primaryIndex);

                this.RunTimeData.Comments[primaryIndex].SetCommentValue(value);
                break;

            case "cmi.comments_from_learner.n.location":

                this.CheckCommentsCollectionLength(primaryIndex);
                this.RunTimeData.Comments[primaryIndex].Location = value;
                break;

            case "cmi.comments_from_learner.n.timestamp":

                this.CheckCommentsCollectionLength(primaryIndex);
                this.RunTimeData.Comments[primaryIndex].Timestamp = value;
                break;


                //Comments From LMS

            case "cmi.comments_from_lms._children":
                 blnReturn = false;
                break;

            case "cmi.comments_from_lms._count":
                 blnReturn = false;
                break;

            case "cmi.comments_from_lms.n.comment":
                 blnReturn = false;
                break;

            case "cmi.comments_from_lms.n.location":
                 blnReturn = false;
                break;

            case "cmi.comments_from_lms.n.timestamp":
                 blnReturn = false;
                break;


                //CMI

            case "cmi.completion_status":

                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.CompletionStatus, value);
                this.RunTimeData.CompletionStatus = value;
                this.RunTimeData.CompletionStatusChangedDuringRuntime = true;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.completion_threshold":
                 blnReturn = false;
                break;

            case "cmi.credit":
                 blnReturn = false;
                break;

            case "cmi.entry":
                 blnReturn = false;
                break;

            case "cmi.exit":
                this.RunTimeData.Exit = value;
                break;

                //Interactions

            case "cmi.interactions._children":
                 blnReturn = false;
                break;

            case "cmi.interactions._count":
                 blnReturn = false;
                break;

            case "cmi.interactions.n.id":
                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Id = value;
                break;

            case "cmi.interactions.n.type":

                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Type = value;
                break;

            case "cmi.interactions.n.objectives._count":
                 blnReturn = false;
                break;

            case "cmi.interactions.n.objectives.n.id":

                this.CheckInteractionObjectivesCollectionLength(primaryIndex, secondaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Objectives[secondaryIndex] = value;
                break;

            case "cmi.interactions.n.timestamp":
                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Timestamp = value;
                break;

            case "cmi.interactions.n.correct_responses._count":
                 blnReturn = false;
                break;

            case "cmi.interactions.n.correct_responses.n.pattern":
                this.CheckInteractionsCorrectResponsesCollectionLength(primaryIndex, secondaryIndex);
                this.RunTimeData.Interactions[primaryIndex].CorrectResponses[secondaryIndex] = value;
                break;

            case "cmi.interactions.n.weighting":

                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Weighting = value;
                break;

            case "cmi.interactions.n.learner_response":
                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].LearnerResponse = value;
                break;

            case "cmi.interactions.n.result":
                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Result = value;
                break;

            case "cmi.interactions.n.latency":
                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Latency = value;
                break;

            case "cmi.interactions.n.description":
                // case "cmi.interactions.n.text":
                this.CheckInteractionsCollectionLength(primaryIndex);
                this.RunTimeData.Interactions[primaryIndex].Description = value;
                break;

                //CMI

            case "cmi.launch_data":
                 blnReturn = false;
                break;

            case "cmi.learner_id":
                 blnReturn = false;
                break;

            case "cmi.learner_name":
                 blnReturn = false;
                break;

                //Learner Preference

            case "cmi.learner_preference._children":
                 blnReturn = false;
                break;

            case "cmi.learner_preference.audio_level":

                this.RunTimeData.AudioLevel = value;
                if (Control.Package.Properties.MakeStudentPrefsGlobalToCourse === true) {
                    this.LearnerPrefsArray.AudioLevel = value;
                }
                break;

            case "cmi.learner_preference.language":

                this.RunTimeData.LanguagePreference = value;
                if (Control.Package.Properties.MakeStudentPrefsGlobalToCourse === true) {
                    this.LearnerPrefsArray.LanguagePreference = value;
                }
                break;

            case "cmi.learner_preference.delivery_speed":

                this.RunTimeData.DeliverySpeed = value;
                if (Control.Package.Properties.MakeStudentPrefsGlobalToCourse === true) {
                    this.LearnerPrefsArray.DeliverySpeed = value;
                }
                break;

            case "cmi.learner_preference.audio_captioning":

                this.RunTimeData.AudioCaptioning = value;
                if (Control.Package.Properties.MakeStudentPrefsGlobalToCourse === true) {
                    this.LearnerPrefsArray.AudioCaptioning = value;
                }
                break;

                //CMI

            case "cmi.location":

                this.RunTimeData.Location = value;
                break;

            case "cmi.max_time_allowed":
                 blnReturn = false;
                break;

            case "cmi.mode":
                 blnReturn = false;
                break;

                //Objectives

            case "cmi.objectives._children":
                 blnReturn = false;
                break;

            case "cmi.objectives._count":
                 blnReturn = false;
                break;

            case "cmi.objectives.n.id":


                this.CheckObjectivesCollectionLength(primaryIndex);
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].Identifier, value);
                this.RunTimeData.Objectives[primaryIndex].Identifier = value;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.objectives.n.score._children":
                 blnReturn = false;
                break;

            case "cmi.objectives.n.score.scaled":

                this.CheckObjectivesCollectionLength(primaryIndex);
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].ScoreScaled, value);
                this.RunTimeData.Objectives[primaryIndex].ScoreScaled = value;
                this.RunTimeData.Objectives[primaryIndex].MeasureChangedDuringRuntime = true;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.objectives.n.score.raw":

                this.CheckObjectivesCollectionLength(primaryIndex);

                if (Control.Package.Properties.ScaleRawScore) {
                    this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].ScoreRaw, value);
                }

                this.RunTimeData.Objectives[primaryIndex].ScoreRaw = value;

                if (Control.Package.Properties.ScaleRawScore) {
                    this.RunLookAheadSequencerIfNeeded();
                }
                break;

            case "cmi.objectives.n.score.min":

                this.CheckObjectivesCollectionLength(primaryIndex);

                if (Control.Package.Properties.ScaleRawScore) {
                    this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].ScoreMin, value);
                }

                this.RunTimeData.Objectives[primaryIndex].ScoreMin = value;

                if (Control.Package.Properties.ScaleRawScore) {
                    this.RunLookAheadSequencerIfNeeded();
                }
                break;

            case "cmi.objectives.n.score.max":

                this.CheckObjectivesCollectionLength(primaryIndex);

                if (Control.Package.Properties.ScaleRawScore) {
                    this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].ScoreMax, value);
                }

                this.RunTimeData.Objectives[primaryIndex].ScoreMax = value;

                if (Control.Package.Properties.ScaleRawScore) {
                    this.RunLookAheadSequencerIfNeeded();
                }
                break;

            case "cmi.objectives.n.success_status":
                this.CheckObjectivesCollectionLength(primaryIndex);
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].SuccessStatus, value);
                this.RunTimeData.Objectives[primaryIndex].SuccessStatus = value;
                this.RunTimeData.Objectives[primaryIndex].SuccessStatusChangedDuringRuntime = true;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.objectives.n.completion_status":
                this.CheckObjectivesCollectionLength(primaryIndex);
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].CompletionStatus, value);
                this.RunTimeData.Objectives[primaryIndex].CompletionStatus = value;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.objectives.n.progress_measure":

                this.CheckObjectivesCollectionLength(primaryIndex);
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.Objectives[primaryIndex].ProgressMeasure, value);
                this.RunTimeData.Objectives[primaryIndex].ProgressMeasure = value;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.objectives.n.description":

                this.CheckObjectivesCollectionLength(primaryIndex);
                this.RunTimeData.Objectives[primaryIndex].Description = value;
                break;

                //CMI

            case "cmi.progress_measure":

                this.RunTimeData.ProgressMeasure = value;
                break;

            case "cmi.scaled_passing_score":
                 blnReturn = false;
                break;

            case "cmi.score._children":
                 blnReturn = false;
                break;

            case "cmi.score.scaled":
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.ScoreScaled, value);
                this.RunTimeData.ScoreScaled = value;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.score.raw":
                if (Control.Package.Properties.ScaleRawScore) {
                    this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.ScoreRaw, value);
                }

                this.RunTimeData.ScoreRaw = value;

                if (Control.Package.Properties.ScaleRawScore) {
                    this.RunLookAheadSequencerIfNeeded();
                }
                break;

            case "cmi.score.max":
                if (Control.Package.Properties.ScaleRawScore) {
                    this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.ScoreMax, value);
                }

                this.RunTimeData.ScoreMax = value;

                if (Control.Package.Properties.ScaleRawScore) {
                    this.RunLookAheadSequencerIfNeeded();
                }
                break;

            case "cmi.score.min":
                if (Control.Package.Properties.ScaleRawScore) {
                    this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.ScoreMin, value);
                }

                this.RunTimeData.ScoreMin = value;

                if (Control.Package.Properties.ScaleRawScore) {
                    this.RunLookAheadSequencerIfNeeded();
                }
                break;

            case "cmi.session_time":
                this.RunTimeData.SessionTime = value;
                break;

            case "cmi.success_status":
                this.SetLookAheadDirtyDataFlagIfNeeded(this.RunTimeData.SuccessStatus, value);
                this.RunTimeData.SuccessStatus = value;
                this.RunLookAheadSequencerIfNeeded();
                break;

            case "cmi.suspend_data":

                this.RunTimeData.SuspendData = value;
                break;

            case "cmi.time_limit_action":
                 blnReturn = false;
                break;

            case "cmi.total_time":
                 blnReturn = false;
                break;

            case "adl.nav.request":

                this.RunTimeData.NavRequest = value;
                break;

            case "adl.nav.request_valid.continue":
                 break;

            case "adl.nav.request_valid.previous":
                 break;

            case "adl.nav.request_valid.choice":
                 break;

            default:

                if (elementWithOutIndex.indexOf("ssp") === 0) {
                    if (SSP_ENABLED) {
                        return this.SSPApi.StoreValue(element, value, elementWithOutIndex, primaryIndex, secondaryIndex);
                    }
                }

                 returnData = "";
                break;

        }
    }



    function RunTimeApi_CheckCommentsCollectionLength(primaryIndex) {

        if (this.RunTimeData.Comments.length <= primaryIndex) {

            this.RunTimeData.Comments[primaryIndex] = new ActivityRunTimeComment(null, null, null, null, null);
        }
    }

    function RunTimeApi_CheckInteractionsCollectionLength(primaryIndex) {
        if (this.RunTimeData.Interactions.length <= primaryIndex) {

            this.RunTimeData.Interactions[primaryIndex] = new ActivityRunTimeInteraction(null, null, null, null, null, null, null, null, null, new Array(), new Array());
        }
    }

    function RunTimeApi_CheckInteractionObjectivesCollectionLength(primaryIndex, secondaryIndex) {
        //note we shouldn't have to check the primary index because the id element must be set before any secondary elements can be set.
        //when id gets set, the primaryIndex element will be set

        if (this.RunTimeData.Interactions[primaryIndex].Objectives.length <= secondaryIndex) {

            this.RunTimeData.Interactions[primaryIndex].Objectives[secondaryIndex] = null;
        }

    }

    function RunTimeApi_CheckInteractionsCorrectResponsesCollectionLength(primaryIndex, secondaryIndex) {
        //note we shouldn't have to check the primary index because the id element must be set before any secondary elements can be set.
        //when id gets set, the primaryIndex element will be set

        if (this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length <= secondaryIndex) {

            this.RunTimeData.Interactions[primaryIndex].CorrectResponses[secondaryIndex] = null;
        }
    }

    function RunTimeApi_CheckObjectivesCollectionLength(primaryIndex) {
        if (this.RunTimeData.Objectives.length <= primaryIndex) {

            this.RunTimeData.Objectives[primaryIndex] = new ActivityRunTimeObjective(null, "unknown", "unknown", null, null, null, null, null, null);
        }
    }



    function RunTimeApi_SetErrorState(errorNumber, errorDiagnostic) {

        // if (errorNumber != SCORM2004_NO_ERROR){

        // }

        this.ErrorNumber = errorNumber;
        this.ErrorString = SCORM2004_ErrorStrings[errorNumber];
        this.ErrorDiagnostic = errorDiagnostic;
    }

    function RunTimeApi_ClearErrorState() {
        this.SetErrorState(SCORM2004_NO_ERROR, "");
    }


    function RunTimeApi_CheckForInitializeError(arg) {



        //TODO: might want to check XML HTTP works in here and check for previous communication failures, set General Initialization if it does not

        if (this.Initialized) {
            this.SetErrorState(SCORM2004_ALREADY_INTIAILIZED_ERROR, "Initialize has already been called and may only be called once per session.");
            return false;
        }

        if (this.Terminated) {
            this.SetErrorState(SCORM2004_CONTENT_INSTANCE_TERMINATED_ERROR, "Initialize cannot be called after Terminate has already beeen called.");
            return false;
        }

        if (arg !== "") {
            this.SetErrorState(SCORM2004_GENERAL_ARGUMENT_ERROR, "The argument to Initialize must be an empty string (\"\"). The argument '" + arg + "' is invalid.");
            return false;
        }



        return true;
    }

    function RunTimeApi_CheckForTerminateError(arg) {



        if (!this.Initialized) {
            this.SetErrorState(SCORM2004_TERMINATION_BEFORE_INITIALIZATION_ERROR, "Terminate cannot be called before Initialize has been called.");
            return false;
        }

        if (this.Terminated) {
            this.SetErrorState(SCORM2004_TERMINATION_AFTER_TERMINATION_ERROR, "Terminate cannot be called after Terminate has already beeen called.");
            return false;
        }

        if (arg !== "") {
            this.SetErrorState(SCORM2004_GENERAL_ARGUMENT_ERROR, "The argument to Terminate must be an empty string (\"\"). The argument '" + arg + "' is invalid.");
            return false;
        }


        return true;
    }

    function RunTimeApi_CheckForCommitError(arg) {



        if (!this.Initialized) {
            this.SetErrorState(SCORM2004_COMMIT_BEFORE_INITIALIZATION_ERROR, "Commit cannot be called before Initialize has been called.");
            return false;
        }

        if (this.Terminated) {
            this.SetErrorState(SCORM2004_COMMIT_AFTER_TERMINATION_ERROR, "Commit cannot be called after Terminate has already beeen called.");
            return false;
        }

        if (arg !== "") {
            this.SetErrorState(SCORM2004_GENERAL_ARGUMENT_ERROR, "The argument to Commit must be an empty string (\"\"). The argument '" + arg + "' is invalid.");
            return false;
        }


        return true;
    }



    function RunTimeApi_CheckMaxLength(elementWithOutIndex, value) {

        switch (elementWithOutIndex) {

            case "cmi.comments_from_learner.n.comment":
                this.CheckLengthAndWarn(value, 4250);
                break;

            case "cmi.comments_from_learner.n.location":
                this.CheckLengthAndWarn(value, 250);
                break;
            case "cmi.interactions.n.id":
                this.CheckLengthAndWarn(value, 4000);
                break;

            case "cmi.interactions.n.objectives.n.id":
                this.CheckLengthAndWarn(value, 4000);
                break;

            case "cmi.interactions.n.correct_responses.n.pattern":
                this.CheckLengthAndWarn(value, 7800);
                break;

            case "cmi.interactions.n.learner_response":
                this.CheckLengthAndWarn(value, 7800);
                break;

            case "cmi.interactions.n.description":
            case "cmi.interactions.n.text":
                this.CheckLengthAndWarn(value, 500);
                break;

            case "cmi.learner_preference.language":
                this.CheckLengthAndWarn(value, 250);
                break;

            case "cmi.location":
                this.CheckLengthAndWarn(value, 1000);
                break;

            case "cmi.objectives.n.id":
                this.CheckLengthAndWarn(value, 4000);
                break;

            case "cmi.objectives.n.description":
                this.CheckLengthAndWarn(value, 500);
                break;

            case "cmi.suspend_data":
                this.CheckLengthAndWarn(value, Control.Package.Properties.SuspendDataMaxLength);
                break;

            default:
                //not a charstring...do nothing
                break;
        }

        return;
    }

    function RunTimeApi_CheckLengthAndWarn(str, len) {

        //NOTE: The proper behavior for SCORM 2004 is to allow the call and submit a warning that the string will be trimmed.
        //That is what we are doing here currently. Unfortunately, the current versions of the 2004 Test Suite (1.3.2) expects you to return
        //the full value during the same session. To meet that requirement, we only do trimming before we send the data to the server.
        //This is good and bad. Good because during a session a SCO can do whatever it wants without error. Bad because the cleint and server
        //get a bit out of synch.

        if (str.length > len) {
            this.SetErrorState(SCORM2004_NO_ERROR, "The string was trimmed to fit withing the SPM of " + len + " characters.");
        }

        return;
    }



    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************


    function RunTimeApi_CheckForGetValueError(element, elementWithOutIndex, primaryIndex, secondaryIndex) {



        if (!this.Initialized) {
            this.SetErrorState(SCORM2004_RETRIEVE_DATA_BEFORE_INITIALIZATION_ERROR, "GetValue cannot be called before Initialize has been called.");
            return false;
        }

        if (this.Terminated) {
            this.SetErrorState(SCORM2004_RETRIEVE_DATA_AFTER_TERMINATION_ERROR, "GetValue cannot be called after Terminate has already beeen called.");
            return false;
        }

        if (element.length === 0) {
            this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The data model element for GetValue was not specified.");
            return false;
        }

        //check the collections if there was an index passed
        if (primaryIndex !== "") {

            if (elementWithOutIndex.indexOf("cmi.comments_from_learner") >= 0) {
                if (primaryIndex >= this.RunTimeData.Comments.length) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The Comments From Learner collection does not have an element at index " + primaryIndex +
                        ", the current element count is " + this.RunTimeData.Comments.length + ".");
                    return false;
                }
            } else if (elementWithOutIndex.indexOf("cmi.comments_from_lms") >= 0) {
                if (primaryIndex >= this.RunTimeData.CommentsFromLMS.length) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The Comments From LMS collection does not have an element at index " + primaryIndex +
                        ", the current element count is " + this.RunTimeData.CommentsFromLMS.length + ".");
                    return false;
                }
            } else if (elementWithOutIndex.indexOf("cmi.objectives") >= 0) {

                if (primaryIndex >= this.RunTimeData.Objectives.length) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The Objectives collection does not have an element at index " + primaryIndex +
                        ", the current element count is " + this.RunTimeData.Objectives.length + ".");
                    return false;
                }
            } else if (elementWithOutIndex.indexOf("cmi.interactions") >= 0) {

                if (primaryIndex >= this.RunTimeData.Interactions.length) {
                    this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The Interactions collection does not have an element at index " + primaryIndex +
                        ", the current element count is " + this.RunTimeData.Interactions.length + ".");
                    return false;
                }

                if (elementWithOutIndex.indexOf("cmi.interactions.n.correct_responses") >= 0) {
                    if (secondaryIndex !== "") {
                        if (secondaryIndex >= this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length) {
                            this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The Correct Responses collection for Interaction #" + primaryIndex + " does not have an element at index " + secondaryIndex +
                                ", the current element count is " + this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length + ".");
                            return false;
                        }
                    }
                } else if (elementWithOutIndex.indexOf("cmi.interactions.n.objectives") >= 0) {
                    if (secondaryIndex !== "") {
                        if (secondaryIndex >= this.RunTimeData.Interactions[primaryIndex].Objectives.length) {
                            this.SetErrorState(SCORM2004_GENERAL_GET_FAILURE_ERROR, "The Objectives collection for Interaction #" + primaryIndex + " does not have an element at index " + secondaryIndex +
                                ", the current element count is " + this.RunTimeData.Interactions[primaryIndex].Objectives.length + ".");
                            return false;
                        }
                    }
                }
            }

        }



        switch (elementWithOutIndex) {

            case "cmi._version":

                //no error possible
                break;

                //Comments From Learner

            case "cmi.comments_from_learner._children":

                //no error possible
                break;

            case "cmi.comments_from_learner._count":

                //no error possible
                break;

            case "cmi.comments_from_learner.n.comment":

                if (this.RunTimeData.Comments[primaryIndex].Comment === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Comment field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.comments_from_learner.n.location":

                if (this.RunTimeData.Comments[primaryIndex].Location === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Location field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.comments_from_learner.n.timestamp":

                if (this.RunTimeData.Comments[primaryIndex].Timestamp === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The TimeStamp field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;


                //Comments From LMS

            case "cmi.comments_from_lms._children":

                //no error possible
                break;

            case "cmi.comments_from_lms._count":

                //no error possible
                break;

            case "cmi.comments_from_lms.n.comment":

                if (this.RunTimeData.CommentsFromLMS[primaryIndex].Comment === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Comment field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.comments_from_lms.n.location":

                if (this.RunTimeData.CommentsFromLMS[primaryIndex].Location === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Location field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.comments_from_lms.n.timestamp":

                if (this.RunTimeData.CommentsFromLMS[primaryIndex].Timestamp === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Timestamp field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;


                //CMI

            case "cmi.completion_status":

                //no error possible
                break;

            case "cmi.completion_threshold":

                if (this.LearningObject.CompletionThreshold === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The completion threshold for this SCO was not specificed.");
                    return false;
                }
                break;

            case "cmi.credit":

                //no error possible
                break;

            case "cmi.entry":

                //no error possible
                break;

            case "cmi.exit":


                return false;
                //break;

                //Interactions

            case "cmi.interactions._children":

                //no error possible
                break;

            case "cmi.interactions._count":

                //no error possible
                break;

            case "cmi.interactions.n.id":

                //no error possible - we already checked for max index and the id element must be the first one set by the SCO when creating an interaction
                break;

            case "cmi.interactions.n.type":

                if (this.RunTimeData.Interactions[primaryIndex].Type === null || this.RunTimeData.Interactions[primaryIndex].Type === "") {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Type field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.interactions.n.objectives._count":

                //no error possible
                break;

            case "cmi.interactions.n.objectives.n.id":

                //no error possible - we already checked the collection's size and since ID is the only element, it must have been set if the array element exists
                break;

            case "cmi.interactions.n.timestamp":

                if (this.RunTimeData.Interactions[primaryIndex].Timestamp === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Time Stamp field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.interactions.n.correct_responses._count":

                //no error possible
                break;

            case "cmi.interactions.n.correct_responses.n.pattern":

                //no error possible
                break;

            case "cmi.interactions.n.weighting":

                if (this.RunTimeData.Interactions[primaryIndex].Weighting === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Weighting field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.interactions.n.learner_response":

                if (this.RunTimeData.Interactions[primaryIndex].LearnerResponse === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Learner Response field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.interactions.n.result":

                if (this.RunTimeData.Interactions[primaryIndex].Result === null || this.RunTimeData.Interactions[primaryIndex].Result === "") {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Result field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.interactions.n.latency":

                if (this.RunTimeData.Interactions[primaryIndex].Latency === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Latency field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.interactions.n.description":
            case "cmi.interactions.n.text":

                if (this.RunTimeData.Interactions[primaryIndex].Description === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Description field has not been initialized for the element at index " + primaryIndex);
                    return false;
                }
                break;

                //CMI

            case "cmi.launch_data":

                if (this.LearningObject.DataFromLms === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Launch Data field was not specified for this SCO.");
                    return false;
                }
                break;

            case "cmi.learner_id":

                //no error possible
                break;

            case "cmi.learner_name":

                //no error possible
                break;

                //Learner Preference

            case "cmi.learner_preference._children":

                //no error possible
                break;

            case "cmi.learner_preference.audio_level":

                if (this.RunTimeData.AudioLevel === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Audio Level field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.learner_preference.language":

                if (this.RunTimeData.LanguagePreference === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Language Preference field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.learner_preference.delivery_speed":

                if (this.RunTimeData.DeliverySpeed === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Delivery Speed field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.learner_preference.audio_captioning":

                if (this.RunTimeData.AudioCaptioning === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Audio Captioning field has not been set for this SCO.");
                    return false;
                }
                break;

                //CMI

            case "cmi.location":

                if (this.RunTimeData.Location === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Location field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.max_time_allowed":


                if (this.LearningObject.SequencingData === null ||
                    this.LearningObject.SequencingData.LimitConditionAttemptAbsoluteDurationControl === false) {

                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Max Time Allowed field was not specified in the manifest for this SCO.");
                    return false;
                }
                break;

            case "cmi.mode":

                //no error possible
                break;

                //Objectives

            case "cmi.objectives._children":

                //no error possible
                break;

            case "cmi.objectives._count":

                //no error possible
                break;

            case "cmi.objectives.n.id":

                //no error possible
                break;

            case "cmi.objectives.n.score._children":

                //no error possible
                break;

            case "cmi.objectives.n.score.scaled":

                if (this.RunTimeData.Objectives[primaryIndex].ScoreScaled === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Scaled Score field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.score.raw":

                if (this.RunTimeData.Objectives[primaryIndex].ScoreRaw === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Raw Score field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.score.min":

                if (this.RunTimeData.Objectives[primaryIndex].ScoreMin === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Min Score field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.score.max":

                if (this.RunTimeData.Objectives[primaryIndex].ScoreMax === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Max Score field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.success_status":

                if (this.RunTimeData.Objectives[primaryIndex].SuccessStatus === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The SuccessStatus field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.completion_status":

                if (this.RunTimeData.Objectives[primaryIndex].CompletionStatus === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The CompletionStatus field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.progress_measure":

                if (this.RunTimeData.Objectives[primaryIndex].ProgressMeasure === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The ProgressMeasure field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

            case "cmi.objectives.n.description":

                if (this.RunTimeData.Objectives[primaryIndex].Description === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Description field has not been initialized for the objective at index " + primaryIndex);
                    return false;
                }
                break;

                //CMI

            case "cmi.progress_measure":

                if (this.RunTimeData.ProgressMeasure === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Progress Measure field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.scaled_passing_score":

                if (this.LearningObject.GetScaledPassingScore() === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Scaled Passing Score field was not specificed for this SCO.");
                    return false;
                }
                break;

            case "cmi.score._children":

                //no error possible
                break;

            case "cmi.score.scaled":

                if (this.RunTimeData.ScoreScaled === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Scaled Score field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.score.raw":

                if (this.RunTimeData.ScoreRaw === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Raw Score field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.score.max":

                if (this.RunTimeData.ScoreMax === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Max Score field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.score.min":

                if (this.RunTimeData.ScoreMin === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Min Score field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.session_time":



                //return false;
                return false;
                break;

            case "cmi.success_status":

                //no error possible
                break;

            case "cmi.suspend_data":

                if (this.RunTimeData.SuspendData === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Suspend Data field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.time_limit_action":

                if (this.LearningObject.TimeLimitAction === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_NOT_INITIALIZED_ERROR, "The Time Limit Action field has not been set for this SCO.");
                    return false;
                }
                break;

            case "cmi.total_time":

                //no error possible
                break;

            case "adl.nav.request":

                //no error possible
                break;

            case "adl.nav.request_valid.continue":

                //no error possible
                break;

            case "adl.nav.request_valid.previous":

                //no error possible
                break;
            default:

                if (elementWithOutIndex.indexOf("adl.nav.request_valid.choice") === 0) {

                    return true;
                }

                if (elementWithOutIndex.indexOf("ssp") === 0) {
                    if (SSP_ENABLED) {
                        return this.SSPApi.CheckForGetValueError(element, elementWithOutIndex, primaryIndex, secondaryIndex);
                    }
                }

                //TODO - add _children, _count and _keyword checking - not needed to pass the test suite, check specs for proper behavior

                this.SetErrorState(SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR, "The data model element '" + element + "' does not exist.");
                return false;
                //break;
        }



        return true;
    }


    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************



    function RunTimeApi_CheckForSetValueError(element, value, elementWithOutIndex, primaryIndex, secondaryIndex) {



        if (!this.Initialized) {
            this.SetErrorState(SCORM2004_STORE_DATA_BEFORE_INITIALIZATION_ERROR, "SetValue cannot be called before Initialize has been called.");
            return false;
        }

        if (this.Terminated) {
            this.SetErrorState(SCORM2004_STORE_DATA_AFTER_TERMINATION_ERROR, "SetValue cannot be called after Terminate has already beeen called.");
            return false;
        }

        if (element.length === 0) {
            //********
            //NOTE: according to the spec SCORM2004_GENERAL_SET_FAILURE_ERROR is correct, however the test suite requires SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR (fixed in Test Suite v1.3.3)
            //********
            this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The data model element for SetValue was not specified.");
            //this.SetErrorState(SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR, "The data model element for SetValue was not specified.");
            return false;
        }



        if (element.indexOf("adl.nav.request_valid.choice.{") === 0) {
            this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The adl.nav.request_valid.choice element is read only");
            return false;
        }


        //check the collections
        if (primaryIndex !== "") {
            if (elementWithOutIndex.indexOf("cmi.comments_from_learner") >= 0) {
                if (primaryIndex > this.RunTimeData.Comments.length) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The Comments From Learner collection elements must be set sequentially, the index " + primaryIndex +
                        ", is greater than the next available index of " + this.RunTimeData.Comments.length + ".");
                    return false;
                }
            } else if (elementWithOutIndex.indexOf("cmi.comments_from_lms") >= 0) {
                if (primaryIndex > this.RunTimeData.CommentsFromLMS.length) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The Comments From LMS collection elements must be set sequentially, the index " + primaryIndex +
                        ", is greater than the next available index of " + this.RunTimeData.CommentsFromLMS.length + ".");
                    return false;
                }
            } else if (elementWithOutIndex.indexOf("cmi.objectives") >= 0) {
                if (primaryIndex > this.RunTimeData.Objectives.length) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The Objectives collection elements must be set sequentially, the index " + primaryIndex +
                        ", is greater than the next available index of " + this.RunTimeData.Objectives.length + ".");
                    return false;
                }
            } else if (elementWithOutIndex.indexOf("cmi.interactions") >= 0) {
                if (primaryIndex > this.RunTimeData.Interactions.length) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The Interactions collection elements must be set sequentially, the index " + primaryIndex +
                        ", is greater than the next available index of " + this.RunTimeData.Interactions.length + ".");
                    return false;
                } else if (elementWithOutIndex.indexOf("cmi.interactions.n.correct_responses") >= 0) {
                    if (primaryIndex >= this.RunTimeData.Interactions.length) {
                        this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The Interactions collection elements must be set sequentially, the index " + primaryIndex +
                            ", is greater than the next available index of " + this.RunTimeData.Interactions.length + ".");
                        return false;
                    }

                    if (secondaryIndex !== "") {
                        if (secondaryIndex > this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length) {
                            this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The Correct Responses collection elements for Interaction #" + primaryIndex + " must be set sequentially the index " + secondaryIndex +
                                " is greater than the next available index of " + this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length + ".");
                            return false;
                        }
                    }
                } else if (elementWithOutIndex.indexOf("cmi.interactions.n.objectives") >= 0) {
                    if (primaryIndex >= this.RunTimeData.Interactions.length) {
                        this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The Interactions collection elements must be set sequentially, the index " + primaryIndex +
                            ", is greater than the next available index of " + this.RunTimeData.Interactions.length + ".");
                        return false;
                    }
                    if (secondaryIndex !== "") {
                        if (secondaryIndex > this.RunTimeData.Interactions[primaryIndex].Objectives.length) {
                            this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The Objectives collection elements for Interaction #" + primaryIndex + " must be set sequentially the index " + secondaryIndex +
                                " is greater than the next available index of " + this.RunTimeData.Interactions[primaryIndex].Objectives.length + ".");
                            return false;
                        }
                    }
                }
            }
        }

        var validCorrectResponse;
        var i;

        switch (elementWithOutIndex) {

            case "cmi._version":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi._version data model element is read-only");
                return false;
                //break;

                //Comments From Learner

            case "cmi.comments_from_learner._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_learner._children data model element is read-only");
                return false;
                //break;

            case "cmi.comments_from_learner._count":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_learner._count data model element is read-only");
                return false;
                //break;

            case "cmi.comments_from_learner.n.comment":

                if (!this.ValidLocalizedString(value, 4000)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.comments_from_learner.n.comment data model element is not a valid localized string type (SPM 4000)");
                    return false;
                }
                break;

            case "cmi.comments_from_learner.n.location":

                if (!this.ValidCharString(value, 250)) {
                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "The cmi.comments_from_learner.n.comment data model element is not a valid char string type (SPM 250)");
                    return false;
                }
                break;

            case "cmi.comments_from_learner.n.timestamp":

                if (!this.ValidTime(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.comments_from_learner.n.timestamp data model element is not a valid time");
                    return false;
                }
                break;


                //Comments From LMS

            case "cmi.comments_from_lms._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_lms._children data model element is read-only");
                return false;
                //break;

            case "cmi.comments_from_lms._count":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_lms._count data model element is read-only");
                return false;
                //break;

            case "cmi.comments_from_lms.n.comment":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_lms.comment data model element is read-only");
                return false;
                //break;

            case "cmi.comments_from_lms.n.location":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_lms.location data model element is read-only");
                return false;
                //break;

            case "cmi.comments_from_lms.n.timestamp":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.comments_from_lms.timestamp data model element is read-only");
                return false;
                //break;


                //CMI
            case "cmi.completion_status":

                if (value != SCORM_STATUS_COMPLETED &&
                    value != SCORM_STATUS_INCOMPLETE &&
                    value != SCORM_STATUS_NOT_ATTEMPTED &&
                    value != SCORM_STATUS_UNKNOWN) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The completion_status data model element must be a proper vocabulary element.");
                    return false;
                }
                break;

            case "cmi.completion_threshold":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The completion_threshold data model element is read-only");
                return false;
                //break;

            case "cmi.credit":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The credit data model element is read-only");
                return false;
                //break;

            case "cmi.entry":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The entry data model element is read-only");
                return false;
                //break;

            case "cmi.exit":

                if (value != SCORM_EXIT_TIME_OUT &&
                    value != SCORM_EXIT_SUSPEND &&
                    value != SCORM_EXIT_LOGOUT &&
                    value != SCORM_EXIT_NORMAL &&
                    value != SCORM_EXIT_UNKNOWN) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The exit data model element must be a proper vocabulary element.");
                    return false;
                }

                if (value == SCORM_EXIT_LOGOUT) {

                }
                break;

                //Interactions

            case "cmi.interactions._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The interactions._children element is read-only");
                return false;
                //break;

            case "cmi.interactions._count":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The interactions._count element is read-only");
                return false;
                //break;

            case "cmi.interactions.n.id":

                if (!this.ValidLongIdentifier(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".id value of '" + value + "' is not a valid long identifier.");
                    return false;
                }
                break;

            case "cmi.interactions.n.type":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }

                if (value != SCORM_TRUE_FALSE &&
                    value != SCORM_CHOICE &&
                    value != SCORM_FILL_IN &&
                    value != SCORM_LONG_FILL_IN &&
                    value != SCORM_LIKERT &&
                    value != SCORM_MATCHING &&
                    value != SCORM_PERFORMANCE &&
                    value != SCORM_SEQUENCING &&
                    value != SCORM_NUMERIC &&
                    value != SCORM_OTHER) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".type value of '" + value + "' is not a valid interaction type.");
                    return false;
                }
                break;

            case "cmi.interactions.n.objectives._count":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The interactions.objectives._count element is read-only");
                return false;
                //break;

            case "cmi.interactions.n.objectives.n.id":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidLongIdentifier(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".objectives." + secondaryIndex + ".id value of '" + value + "' is not a valid long identifier type.");
                    return false;
                }


                for (i = 0; i < this.RunTimeData.Interactions[primaryIndex].Objectives.length; i++) {
                    if ((this.RunTimeData.Interactions[primaryIndex].Objectives[i] == value) && (i != secondaryIndex)) {
                        this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Every interaction objective identifier must be unique. The value '" + value + "' has already been set in objective #" + i);
                        return false;
                    }
                }
                break;

            case "cmi.interactions.n.timestamp":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidTime(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".timestamp value of '" + value + "' is not a valid time type.");
                    return false;
                }
                break;

            case "cmi.interactions.n.correct_responses._count":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The interactions.correct_responses._count element is read-only");
                return false;
                //break;

            case "cmi.interactions.n.correct_responses.n.pattern":



                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }
                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Type === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.type element must be set before a correct response can be set.");
                    return false;
                }

                validCorrectResponse = true;
                if (RegistrationToDeliver.Package.Properties.ValidateInteractionResponses) {
                    switch (this.RunTimeData.Interactions[primaryIndex].Type) {

                        case SCORM_TRUE_FALSE:
                            if (this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length > 0 && secondaryIndex > 0) {
                                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "A true-false interaction can only have one correct response.");
                                return false;
                            }
                            validCorrectResponse = this.ValidTrueFalseResponse(value);
                            break;

                        case SCORM_CHOICE:
                            validCorrectResponse = this.ValidMultipleChoiceResponse(value);

                            for (i = 0; i < this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length; i++) {
                                if (this.RunTimeData.Interactions[primaryIndex].CorrectResponses[i] == value) {
                                    this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Every correct response to a choice interaction must be unique. The value '" + value + "' has already been set in correct response #" + i);
                                    return false;
                                }
                            }

                            break;

                        case SCORM_FILL_IN:
                            validCorrectResponse = this.ValidFillInResponse(value, true);
                            break;

                        case SCORM_LONG_FILL_IN:
                            validCorrectResponse = this.ValidLongFillInResponse(value, true);
                            break;

                        case SCORM_LIKERT:
                            if (this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length > 0 && secondaryIndex > 0) {
                                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "A likert interaction can only have one correct response.");
                                return false;
                            }
                            validCorrectResponse = this.ValidLikeRTResponse(value);
                            break;

                        case SCORM_MATCHING:
                            validCorrectResponse = this.ValidMatchingResponse(value);
                            break;

                        case SCORM_PERFORMANCE:
                            validCorrectResponse = this.ValidPerformanceResponse(value, true);
                            break;

                        case SCORM_SEQUENCING:
                            validCorrectResponse = this.ValidSequencingResponse(value);
                            break;

                        case SCORM_NUMERIC:
                            if (this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length > 0 && secondaryIndex > 0) {
                                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "A numeric interaction can only have one correct response.");
                                return false;
                            }
                            validCorrectResponse = this.ValidNumericResponse(value, true);
                            break;

                        case SCORM_OTHER:
                            if (this.RunTimeData.Interactions[primaryIndex].CorrectResponses.length > 0 && secondaryIndex > 0) {
                                this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "An 'other' interaction can only have one correct response.");
                                return false;
                            }
                            validCorrectResponse = this.ValidOtheresponse(value);
                            break;
                    }
                }

                if (!validCorrectResponse) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".correct_responses." + secondaryIndex + ".pattern value of '" + value + "' is not a valid correct response to an interaction of type " + this.RunTimeData.Interactions[primaryIndex].Type + ".");
                    return false;
                }
                break;

            case "cmi.interactions.n.weighting":


                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".weighting value of '" + value + "' is not a valid real number.");
                    return false;
                }

                break;

            case "cmi.interactions.n.learner_response":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }
                if (this.RunTimeData.Interactions[primaryIndex].Type === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.type element must be set before a learner response can be set.");
                    return false;
                }

                validCorrectResponse = true;
                if (RegistrationToDeliver.Package.Properties.ValidateInteractionResponses) {
                    switch (this.RunTimeData.Interactions[primaryIndex].Type) {
                        case "true-false":
                            validCorrectResponse = this.ValidTrueFalseResponse(value);
                            break;
                        case "choice":
                            validCorrectResponse = this.ValidMultipleChoiceResponse(value);
                            break;
                        case "fill-in":
                            validCorrectResponse = this.ValidFillInResponse(value, false);
                            break;
                        case "long-fill-in":
                            validCorrectResponse = this.ValidLongFillInResponse(value, false);
                            break;
                        case "likert":
                            validCorrectResponse = this.ValidLikeRTResponse(value);
                            break;
                        case "matching":
                            validCorrectResponse = this.ValidMatchingResponse(value);
                            break;
                        case "performance":
                            validCorrectResponse = this.ValidPerformanceResponse(value, false);
                            break;
                        case "sequencing":
                            validCorrectResponse = this.ValidSequencingResponse(value);
                            break;
                        case "numeric":
                            validCorrectResponse = this.ValidNumericResponse(value, false);
                            break;
                        case "other":
                            validCorrectResponse = this.ValidOtheresponse(value);
                            break;
                    }
                }

                if (!validCorrectResponse) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".learner_response value of '" + value + "' is not a valid response to an interaction of type " + this.RunTimeData.Interactions[primaryIndex].Type + ".");
                    return false;
                }
                break;

            case "cmi.interactions.n.result":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }

                if (value != SCORM_CORRECT &&
                    value != SCORM_INCORRECT &&
                    value != SCORM_UNANTICIPATED &&
                    value != SCORM_NEUTRAL) {

                    if (!this.ValidReal(value)) {
                        this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".result value of '" + value + "' is not a valid interaction result.");
                        return false;
                    }
                }

                break;

            case "cmi.interactions.n.latency":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidTimeInterval(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".latency value of '" + value + "' is not a valid timespan.");
                    return false;
                }
                break;

            case "cmi.interactions.n.description":
            case "cmi.interactions.n.text":

                if (this.RunTimeData.Interactions[primaryIndex] === undefined || this.RunTimeData.Interactions[primaryIndex].Id === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The interactions.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidLocalizedString(value, 250)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.interactions." + primaryIndex + ".description value of '" + value + "' is not a valid localized string SPM 250.");
                    return false;
                }
                break;

                //CMI

            case "cmi.launch_data":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.launch_data element is read-only");
                return false;
                //break;

            case "cmi.learner_id":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.learner_id element is read-only");
                return false;
                //break;

            case "cmi.learner_name":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.learner_name element is read-only");
                return false;
                //break;

                //Learner Preference

            case "cmi.learner_preference._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.learner_preference._children element is read-only");
                return false;
                //break;

            case "cmi.learner_preference.audio_level":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.learner_preference.audio_level value of '" + value + "' is not a valid real number.");
                    return false;
                }

                if (parseFloat(value) < 0) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR, "The cmi.learner_preference.audio_level value of '" + value + "' must be greater than zero.");
                    return false;
                }
                break;

            case "cmi.learner_preference.language":

                if (!this.ValidLanguage(value, true)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.learner_preference.language value of '" + value + "' is not a valid language.");
                    return false;
                }
                break;

            case "cmi.learner_preference.delivery_speed":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.learner_preference.delivery_speed value of '" + value + "' is not a valid real number.");
                    return false;
                }

                if (parseFloat(value) < 0) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR, "The cmi.learner_preference.delivery_speed value of '" + value + "' must be greater than zero.");
                    return false;
                }
                break;

            case "cmi.learner_preference.audio_captioning":

                if (value != "-1" &&
                    value != "0" &&
                    value != "1") {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.learner_preference.audio_captioning value of '" + value + "' must be -1, 0 or 1.");
                    return false;
                }
                break;

                //CMI

            case "cmi.location":

                if (!this.ValidCharString(value, 1000)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.location value of '" + value + "' is not a valid char string SPM 1000.");
                    return false;
                }
                break;

            case "cmi.max_time_allowed":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.max_time_allowed element is read only");
                return false;
                //break;

            case "cmi.mode":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.mode element is read only");
                return false;
                //break;

                //Objectives

            case "cmi.objectives._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.objectives._children element is read only");
                return false;
                //break;

            case "cmi.objectives._count":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.objectives._count element is read only");
                return false;
                //break;

            case "cmi.objectives.n.id":


                if (!this.ValidLongIdentifier(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives.n.id value of '" + value + "' is not a valid long identifier.");
                    return false;
                }

                if (this.RunTimeData.Objectives[primaryIndex] != undefined && this.RunTimeData.Objectives[primaryIndex].Identifier != null) {
                    if (this.RunTimeData.Objectives[primaryIndex].Identifier !== null && this.RunTimeData.Objectives[primaryIndex].Identifier != value) {
                        this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Objective identifiers may only be set once and may not be overwritten. The objective at index " + primaryIndex + " already has the identifier " + this.RunTimeData.Objectives[primaryIndex].Identifier);
                        return false;
                    }
                }

                for (i = 0; i < this.RunTimeData.Objectives.length; i++) {
                    if ((this.RunTimeData.Objectives[i].Identifier == value) && (i != primaryIndex)) {
                        this.SetErrorState(SCORM2004_GENERAL_SET_FAILURE_ERROR, "Every objective identifier must be unique. The value '" + value + "' has already been set in objective #" + i);
                        return false;
                    }
                }
                break;

            case "cmi.objectives.n.score._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.objectives.n.score._children element is read only");
                return false;
                //break;

            case "cmi.objectives.n.score.scaled":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".score.scaled value of '" + value + "' is not a valid real number.");
                    return false;
                }

                if (parseFloat(value) < -1 || parseFloat(value) > 1) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR, "The cmi.objectives." + primaryIndex + ".score.scaled value of '" + value + "' must be between -1 and 1.");
                    return false;
                }
                break;

            case "cmi.objectives.n.score.raw":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".score.raw value of '" + value + "' is not a valid real number.");
                    return false;
                }
                break;

            case "cmi.objectives.n.score.min":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".score.min value of '" + value + "' is not a valid real number.");
                    return false;
                }
                break;

            case "cmi.objectives.n.score.max":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".score.max value of '" + value + "' is not a valid real number.");
                    return false;
                }
                break;

            case "cmi.objectives.n.success_status":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }
                if (value != SCORM_STATUS_PASSED &&
                    value != SCORM_STATUS_FAILED &&
                    value != SCORM_STATUS_UNKNOWN) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".success_status value of '" + value + "' is not a valid success status.");
                    return false;
                }
                break;

            case "cmi.objectives.n.completion_status":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }

                if (value != SCORM_STATUS_COMPLETED &&
                    value != SCORM_STATUS_INCOMPLETE &&
                    value != SCORM_STATUS_NOT_ATTEMPTED &&
                    value != SCORM_STATUS_UNKNOWN) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".completion_status value of '" + value + "' is not a valid completion status.");
                    return false;
                }
                break;

            case "cmi.objectives.n.progress_measure":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".progress_measure value of '" + value + "' is not a valid real number.");
                    return false;
                }

                if (parseFloat(value) < 0 || parseFloat(value) > 1) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR, "The cmi.objectives." + primaryIndex + ".progress_measure value of '" + value + "' must be between 0 and 1.");
                    return false;
                }
                break;

            case "cmi.objectives.n.description":

                if (this.RunTimeData.Objectives[primaryIndex] === undefined || this.RunTimeData.Objectives[primaryIndex].Identifier === null) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_DEPENDENCY_NOT_ESTABLISHED_ERROR, "The objectives.id element must be set before other elements can be set.");
                    return false;
                }
                if (!this.ValidLocalizedString(value, 250)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.objectives." + primaryIndex + ".description value of '" + value + "' is not a valid localized string SPM 250.");
                    return false;
                }
                break;

                //CMI

            case "cmi.progress_measure":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.progress_measure value of '" + value + "' is not a valid real number.");
                    return false;
                }

                if (parseFloat(value) < 0 || parseFloat(value) > 1) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR, "The cmi.pogress_measure value of '" + value + "' must be between 0 and 1.");
                    return false;
                }
                break;

            case "cmi.scaled_passing_score":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.scaled_passing_score element is read only");
                return false;
                //break;

            case "cmi.score._children":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.score._children element is read only");
                return false;
                //break;

            case "cmi.score.scaled":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.score.scaled value of '" + value + "' is not a valid real number.");
                    return false;
                }

                if (parseFloat(value) < -1 || parseFloat(value) > 1) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_VALUE_OUT_OF_RANGE_ERROR, "The cmi..score.scaled value of '" + value + "' must be between -1 and 1.");
                    return false;
                }
                break;

            case "cmi.score.raw":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.score.raw value of '" + value + "' is not a valid real number.");
                    return false;
                }
                break;

            case "cmi.score.max":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.score.raw value of '" + value + "' is not a valid real number.");
                    return false;
                }
                break;

            case "cmi.score.min":

                if (!this.ValidReal(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.score.raw value of '" + value + "' is not a valid real number.");
                    return false;
                }
                break;

            case "cmi.session_time":

                if (!this.ValidTimeInterval(value)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.session_time value of '" + value + "' is not a valid time intervals.");
                    return false;
                }
                break;

            case "cmi.success_status":

                if (value != SCORM_STATUS_PASSED &&
                    value != SCORM_STATUS_FAILED &&
                    value != SCORM_STATUS_UNKNOWN) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.success_status value of '" + value + "' is not a valid success status.");
                    return false;
                }
                break;

            case "cmi.suspend_data":

                if (!this.ValidCharString(value, Control.Package.Properties.SuspendDataMaxLength)) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The cmi.suspend_data value of '" + value + "' is not a valid char string SPM" + Control.Package.Properties.SuspendDataMaxLength + ".");
                    return false;
                }
                break;

            case "cmi.time_limit_action":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.time_limit_action element is read only");
                return false;
                //break;

            case "cmi.total_time":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The cmi.total_time element is read only");
                return false;
                //break;

            case "adl.nav.request":


                if (value.substring(0, 1) == "{") {

                    var target = value.substring(0, value.indexOf("}") + 1);

                    if (Control.IsTargetValid(target) === false) {
                        this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The value '" + target + "' is not a valid target of a choice request.");
                        return false;
                    }

                    // "choice" must follow the specified target
                    if (value.indexOf("choice") != target.length) {
                        this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "A target may only be provided for a choice request.");
                        return false;
                    }
                } else if (value != SCORM_RUNTIME_NAV_REQUEST_CONTINUE &&
                    value != SCORM_RUNTIME_NAV_REQUEST_PREVIOUS &&
                    value != SCORM_RUNTIME_NAV_REQUEST_CHOICE &&
                    value != SCORM_RUNTIME_NAV_REQUEST_EXIT &&
                    value != SCORM_RUNTIME_NAV_REQUEST_EXITALL &&
                    value != SCORM_RUNTIME_NAV_REQUEST_ABANDON &&
                    value != SCORM_RUNTIME_NAV_REQUEST_ABANDONALL &&
                    value != SCORM_RUNTIME_NAV_REQUEST_SUSPENDALL &&
                    value != SCORM_RUNTIME_NAV_REQUEST_NONE) {
                    this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_TYPE_MISMATCH_ERROR, "The adl.nav.request value of '" + value + "' is not a valid nav request.");
                    return false;
                }

                break;

            case "adl.nav.request_valid.continue":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The adl.nav.request_valid.continue element is read only");
                return false;
                //break;

            case "adl.nav.request_valid.previous":

                this.SetErrorState(SCORM2004_DATA_MODEL_ELEMENT_IS_READ_ONLY_ERROR, "The adl.nav.request_valid.previous element is read only");
                return false;
                //break;

            case "adl.nav.request_valid.choice":

                //will never get into here b/c of suffix on choice request. error set up above
                break;

            default:

                if (elementWithOutIndex.indexOf("ssp") === 0) {
                    if (SSP_ENABLED) {
                        return this.SSPApi.CheckForSetValueError(element, value, elementWithOutIndex, primaryIndex, secondaryIndex);
                    }
                }

                this.SetErrorState(SCORM2004_UNDEFINED_DATA_MODEL_ELEMENT_ERROR, "The data model element '" + element + "' is not defined in SCORM 2004");
                return false;
                //break;
        }



        return true;
    }


    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************
    //************************************************************************



    function RunTimeApi_ValidCharString(str, maxLength) {



        /*
    if (str.length > maxLength){
        return false;
    }
    */

        return true;
    }

    function RunTimeApi_ValidLocalizedString(str, maxLength) {



        //if we have a language delimiter, validate it and check the length against the remaining string
        //otherwise, just check the length

        var actualValue;
        //var languageDelimiter;
        var language = new String();
        var closingBracketPosition;

        actualValue = str;



        if (str.indexOf("{lang=") === 0) {

            closingBracketPosition = str.indexOf("}");
            if (closingBracketPosition > 0) {

                language = str.substr(0, closingBracketPosition);
                language = language.replace(/\{lang=/, "");
                language = language.replace(/\}/, "");

                if (!this.ValidLanguage(language, false)) {

                    return false;
                }

                if (str.length >= (closingBracketPosition + 2)) {
                    actualValue = str.substring(closingBracketPosition + 1);
                } else {
                    actualValue = "";
                }
            }
        }

        /*
    if (actualValue.length > maxLength){

        return false;
    }
    */

        return true;
    }

    function RunTimeApi_ExtractLanguageDelimiterFromLocalizedString(str) {

        var closingBracketPosition;
        var language = "";

        if (str.indexOf("{lang=") === 0) {
            closingBracketPosition = str.indexOf("}");
            if (closingBracketPosition > 0) {
                language = str.substr(0, closingBracketPosition + 1);
            }
        }

        return language;
    }

    function RunTimeApi_ValidLanguage(str, mayBeEmpty) {


        //don't try to perform detailed language type evaluation, they're too open-ended

        var aryCodes;

        if (str.length === 0) {
            if (mayBeEmpty) {
                return true;
            } else {

                return false;
            }
        }

        aryCodes = str.split("-");

        for (var i = 0; i < aryCodes.length; i++) {
            if (aryCodes[i].length > 8) {

                return false;
            }
            if (aryCodes[i].length < 2) {
                //TODO - improvement - use a regular expression here
                if (aryCodes[i] != "i" && aryCodes[i] != "x") {

                    return false;
                }
            }
        }


        //this strict validation of lang codes is required according to Jeff Falls of ADL Tech Team at Plugfest 9
        var Validator = new Iso639LangCodes_LangCodes();

        if (!Validator.IsValid(aryCodes[0].toLowerCase())) {


            return false;
        }


        //keep this in here just make absolutely sure we don't send anything bad to the server
        //if an extra long value gets into the XML sending, we can't just trim it because
        //that would mess up the formatting (Comment.Language particularly). Should never hurt anything
        //because a long language wouldn't pass the above check of aryCodes.length

        if (str.length > 250) {

            return false;
        }


        return true;
    }

    function RunTimeApi_ValidLongIdentifier(str) {



        str = str.trim();

        /*
    if (str.length > 4000){
        return false;
    }
    */

        if (!this.ValidIdentifier(str)) {
            return false;
        }

        return true;
    }

    function RunTimeApi_ValidShortIdentifier(str) {

        /*
    if (str.length > 250){
        return false;
    }
    */

        if (!this.ValidIdentifier(str)) {
            return false;
        }

        return true;

    }

    function RunTimeApi_ValidIdentifier(str) {

        str = str.trim();

        if (str.length === 0) {
            return false;
        }

        if (str.toLowerCase().indexOf("urn:") === 0) {
            return this.IsValidUrn(str);
        }

        //if there are no alpha-numeric characters, return false
        if (str.search(/\w/) < 0) {
            return false;
        }

        //urns may only contain the following characters: letters, numbers - ( ) + . : = @ ; $ _ ! * ' %
        if (str.search(/[^\w\-\(\)\+\.\:\=\@\;\$\_\!\*\'\%\/]/) >= 0) {
            return false;
        }


        return true;
    }


    function RunTimeApi_IsValidUrn(str) {


        //don't want to make this too strict b/c it's likely content developers won't know how to use it
        //just making it restrictive enough to pass the test suite...just check for spaces and the presense
        //of something other than the "urn:" prefix if it is used

        var aryParts = str.split(":");

        var nid = new String("");
        var nss = "";

        if (aryParts.length > 1) {
            nid = aryParts[1];
        } else {
            return false;
        }

        if (aryParts.length > 2) {
            nss = aryParts[2];
        }

        if (nid.length === 0) {
            return false;
        }

        if (nid.indexOf(" ") > 0 || nss.indexOf(" ") > 0) {
            return false;
        }

        return true;
    }


    function RunTimeApi_ValidReal(str) {

        //check for characters "0-9", ".", and "-" only
        if (str.search(/[^.\d-]/) > -1) {
            return false;
        }

        //if contains a dash, ensure it is first and that there is only 1
        if (str.search("-") > -1) {
            if (str.indexOf("-", 1) > -1) {
                return false;
            }
        }

        //ensure only 1 decimal point
        if (str.indexOf(".") != str.lastIndexOf(".")) {
            return false;
        }

        //ensure there is at least 1 digit
        if (str.search(/\d/) < 0) {
            return false;
        }

        return true;
    }

    function RunTimeApi_ValidTime(str) {

        //var REG_EX_ISO8601_TIME = /^((19[7-9]\d)|(20[0-3][0-8]))(-((0[1-9])|(1[0-2]))(-((0[1-9])|([1-2]\d)|([3][0-1]))(T([0-1]\d|2[0-3])((:[0-5]\d)((:([0-5]\d)((\.\d\d?)((Z|[+\-]\d\d(:\d\d)?))?)?)?)?)?)?)?)?$/;

        //return REG_EX_ISO8601_TIME.test(str);

        //YYYY-MM-DDThh:mm:ss.s
        //z or +hh:mm -hh:mm, minutes is optional

        var year = "";
        var month = "";
        var day = "";
        var hour = "";
        var minute = "";
        var second = "";
        var hundredths = "";

        var timezoneOffset = "";
        var timezoneOffsetHours = "";
        var timezoneOffsetMinutes = "";

        var currentChar;

        str = new String(str);

        var REG_EX_TIME = /^(\d\d\d\d)(-(\d\d)(-(\d\d)(T(\d\d)(:(\d\d)(:(\d\d))?)?)?)?)?/;

        if (str.search(REG_EX_TIME) !== 0) {
            //regular expressing covering date and time failed

            return false;
        }

        //if the last char is a "-" or "T" or ":", error
        if (str.substr(str.length - 1, 1).search(/[\-T\:]/) >= 0) {

            return false;
        }

        var len = str.length;

        //check the valid lengths for strings that top before the second fractions
        if (len != 4 &&
            len != 7 &&
            len != 10 &&
            len != 13 &&
            len != 16 &&
            len < 19) {


            return false;
        }


        if (len >= 5) {
            if (str.substr(4, 1) != "-") {

                return false;
            }
        }

        if (len >= 8) {
            if (str.substr(7, 1) != "-") {

                return false;
            }
        }
        if (len >= 11) {
            if (str.substr(10, 1) != "T") {

                return false;
            }
        }
        if (len >= 14) {
            if (str.substr(13, 1) != ":") {

                return false;
            }
        }
        if (len >= 17) {
            if (str.substr(16, 1) != ":") {

                return false;
            }
        }


        var aryParts = str.match(REG_EX_TIME);

        /*
        for (var i=0; i < aryParts.length; i++){

        }
        */

        year = aryParts[1];
        month = aryParts[3];
        day = aryParts[5];
        hour = aryParts[7];
        minute = aryParts[9];
        second = aryParts[11];


        if (str.length > 19) {
            //we have fractions of a second and a timezone offset

            if (str.length < 21) {
                //there must be at least a . and a single digit

                return false;
            }

            if (str.substr(19, 1) != ".") {
                //we're past the seconds, there has to be a decimal portion of the seconds (note we can't go straight to time zone offset)

                //NOTE - currently 4/5/05 IEEE requires there to be a decimal portion of seconds if a time zone offset is used
                ///         ADL is attempting to get this behavior modified and an upcoming releas of SCORM is likely to drop this requirement


                return false;
            }

            currentChar = str.substr(20, 1);

            if (currentChar.search(/\d/) < 0) {
                //the first decimal digit must be a number

                return false;
            } else {
                hundredths += currentChar;
            }

            for (var i = 21; i < str.length; i++) {
                currentChar = str.substr(i, 1);
                if ((i == 21) && (currentChar.search(/\d/) === 0)) {
                    hundredths += currentChar;
                } else {
                    timezoneOffset += currentChar;
                }
            }

        }

        if (timezoneOffset.length === 0) {
            //do nothing, we're fine
        } else if (timezoneOffset.length == 1) {
            if (timezoneOffset != "Z") {

                return false;
            }
        } else if (timezoneOffset.length == 3) {
            if (timezoneOffset.search(/[\+\-]\d\d/) !== 0) {

                return false;
            } else {
                timezoneOffsetHours = timezoneOffset.substr(1, 2);
            }
        } else if (timezoneOffset.length == 6) {
            if (timezoneOffset.search(/[\+\-]\d\d:\d\d/) !== 0) {

                return false;
            } else {
                timezoneOffsetHours = timezoneOffset.substr(1, 2);
                timezoneOffsetMinutes = timezoneOffset.substr(4, 2);
            }
        } else {

            return false;
        }

        if (year < 1970 || year > 2038) {

            return false;
        }

        if (month !== undefined && month !== "") {
            month = parseInt(month, 10);
            if (month < 1 || month > 12) {

                return false;
            }
        }

        //check for a correct day of the month...if it is not correct for the given month (including leap year),
        //then the Data object will contain a different date
        if (day !== undefined && day !== "") {
            var dtm = new Date(year, (month - 1), day);
            if (dtm.getDate() != day) {

                return false;
            }
        }

        if (hour !== undefined && hour !== "") {
            hour = parseInt(hour, 10);
            if (hour < 0 || hour > 23) {

                return false;
            }
        }

        if (minute !== undefined && minute !== "") {
            minute = parseInt(minute, 10);
            if (minute < 0 || minute > 59) {

                return false;
            }
        }

        if (second !== undefined && second !== "") {
            second = parseInt(second, 10);
            if (second < 0 || second > 59) {

                return false;
            }
        }

        if (timezoneOffsetHours !== undefined && timezoneOffsetHours !== "") {
            timezoneOffsetHours = parseInt(timezoneOffsetHours, 10);
            if (timezoneOffsetHours < 0 || timezoneOffsetHours > 23) {

                return false;
            }
        }

        if (timezoneOffsetMinutes !== undefined && timezoneOffsetMinutes !== "") {
            timezoneOffsetMinutes = parseInt(timezoneOffsetMinutes, 10);
            if (timezoneOffsetMinutes < 0 || timezoneOffsetMinutes > 59) {

                return false;
            }
        }

        return true;
    }

    function RunTimeApi_ValidTimeInterval(str) {

        var REG_EX_TIME_INTERVAL = /^P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(.\d\d?)?S)?)?$/;

        //if just = "P", return false
        //if ends with "T" return false

        if (str == "P") {
            return false;
        }

        if (str.lastIndexOf("T") == (str.length - 1)) {
            return false;
        }

        if (str.search(REG_EX_TIME_INTERVAL) < 0) {

            return false;
        }

        return true;
    }

    function RunTimeApi_ValidTrueFalseResponse(str) {

        var REG_EX_TRUE_FALSE_RESPONSE = /^(true|false)$/;

        if (str.search(REG_EX_TRUE_FALSE_RESPONSE) < 0) {

            return false;
        }

        return true;
    }

    function RunTimeApi_ValidMultipleChoiceResponse(str) {


        if (str.length === 0) {
            return true;
        }

        //MR 8/17/06 - added a check to allow these responses to be delimited by , instead of [,]
        //to accomodate Lectora. There is an error in the 2004 test suite that allows content to pass
        //data in with , instead of [,]

        //return this.IsValidArrayOfShortIdentifiers(str, 36, true);

        return (this.IsValidArrayOfShortIdentifiers(str, 36, true) || this.IsValidCommaDelimitedArrayOfShortIdentifiers(str, 36, true));
    }


    function RunTimeApi_IsValidCommaDelimitedArrayOfShortIdentifiers(str, maxArrayLength, requireUniquness) {

        var DELIMITER = ",";

        var aryItems = str.split(DELIMITER);

        /*
    if (aryItems.length > maxArrayLength){
        return false;
    }
    */

        for (var i = 0; i < aryItems.length; i++) {

            if (!this.ValidShortIdentifier(aryItems[i])) {
                return false;
            }

            //ensure that each item is only in the array once
            if (requireUniquness) {
                for (var j = 0; j < aryItems.length; j++) {
                    if (j != i) {
                        if (aryItems[j] == aryItems[i]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    function RunTimeApi_IsValidArrayOfShortIdentifiers(str, maxArrayLength, requireUniquness) {

        var DELIMITER = "[,]";

        var aryItems = str.split(DELIMITER);

        /*
    if (aryItems.length > maxArrayLength){
        return false;
    }
    */

        for (var i = 0; i < aryItems.length; i++) {

            if (!this.ValidShortIdentifier(aryItems[i])) {
                return false;
            }

            //ensure that each item is only in the array once
            if (requireUniquness) {
                for (var j = 0; j < aryItems.length; j++) {
                    if (j != i) {
                        if (aryItems[j] == aryItems[i]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    function RunTimeApi_IsValidArrayOfLocalizedStrings(str, maxArrayLength, requireUniquness) {

        var DELIMITER = "[,]";

        var aryItems = str.split(DELIMITER);

        /*
    if (aryItems.length > maxArrayLength){
        return false;
    }
    */

        for (var i = 0; i < aryItems.length; i++) {

            if (!this.ValidLocalizedString(aryItems[i], 0)) {
                return false;
            }

            //ensure that each item is only in the array once
            if (requireUniquness) {
                for (var j = 0; j < aryItems.length; j++) {
                    if (j != i) {
                        if (aryItems[j] == aryItems[i]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    function RunTimeApi_ValidFillInResponse(str, checkPrefixes) {



        //var REG_EX_FILL_IN_PREFIXES = /(\{case_matters=(true|false)\})?(\{order_matters=(true|false)\})?/;

        /*
    if starts with case_matters
        validate that it is TF
        strip case_matters prefix
    if starts with order_matters
        validate that it is TF
        strip order matters prefix
    if it now starts with case_matters
        validate that is it TF
        strip case_matters prefix

    remainder is the array of localized sting types - validate it (RunTimeApi_IsValidArrayOfShortIdentifiers(str, maxArrayLength))
    */

        if (str.length === 0) {
            return true;
        }

        var REG_EX_STARTS_WITH_CASE_MATTERS = /^\{case_matters=/;
        var REG_EX_STARTS_WITH_ORDER_MATTERS = /^\{order_matters=/;
        var REG_EX_STARTS_WITH_LANG_BEFORE_OTHER_DELIMITER = /^\{lang=[\w\-]+\}\{/;

        var REG_EX_STARTS_WITH_VALID_CASE_MATTERS = /^\{case_matters=(true|false)\}/;
        var REG_EX_STARTS_WITH_VALID_ORDER_MATTERS = /^\{order_matters=(true|false)\}/;

        var strWorking = new String(str);

        if (checkPrefixes) {

            /*
        if (strWorking.search(REG_EX_STARTS_WITH_LANG_BEFORE_OTHER_DELIMITER) >= 0){
            //Test Suite requires you to declare this invalid...personally, I would just consider this a string with "{lang=" in it, but the test suite disagrees

            //WRONG - the test

            Attempting to call SetValue("cmi.interactions.3.correct_responses.0.pattern",
            "{lang=eng}{order_matters=true}{case_matters=invalid}a[,]asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50[,]asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50[,]a[,]asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50fdsatyuioplkjhgfdsazxcvbnm0987654321qwertyuiopl49[,]{case_matters=true}{case_matters=invalid}a[,]asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50[,]asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50[,]a[,]asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50asdftyuioplkjhgfdsazxcvbnm0987654321qwertyuioplk50fdsatyuioplkjhgfdsazxcvbnm0987654321qwertyuiopl49")

            //expects the response to be true

            return false;
        }
        */

            if (strWorking.search(REG_EX_STARTS_WITH_CASE_MATTERS) >= 0) {

                if (strWorking.search(REG_EX_STARTS_WITH_VALID_CASE_MATTERS) < 0) {
                    return false;
                }
                strWorking = strWorking.replace(REG_EX_STARTS_WITH_VALID_CASE_MATTERS, "");
            }

            if (strWorking.search(REG_EX_STARTS_WITH_ORDER_MATTERS) >= 0) {

                if (strWorking.search(REG_EX_STARTS_WITH_VALID_ORDER_MATTERS) < 0) {
                    return false;
                }
                strWorking = strWorking.replace(REG_EX_STARTS_WITH_VALID_ORDER_MATTERS, "");
            }

            if (strWorking.search(REG_EX_STARTS_WITH_CASE_MATTERS) >= 0) {

                if (strWorking.search(REG_EX_STARTS_WITH_VALID_CASE_MATTERS) < 0) {
                    return false;
                }
                strWorking = strWorking.replace(REG_EX_STARTS_WITH_VALID_CASE_MATTERS, "");
            }
        }

        return this.IsValidArrayOfLocalizedStrings(strWorking, 10, false);
    }



    function RunTimeApi_ValidLongFillInResponse(str, checkPrefixes) {


        var REG_EX_STARTS_WITH_CASE_MATTERS = /^\{case_matters=/;
        var REG_EX_STARTS_WITH_VALID_CASE_MATTERS = /^\{case_matters=(true|false)\}/;

        var strWorking = new String(str);

        if (checkPrefixes) {
            if (strWorking.search(REG_EX_STARTS_WITH_CASE_MATTERS) >= 0) {

                if (strWorking.search(REG_EX_STARTS_WITH_VALID_CASE_MATTERS) < 0) {
                    return false;
                }
                strWorking = strWorking.replace(REG_EX_STARTS_WITH_VALID_CASE_MATTERS, "");
            }
        }

        return this.ValidLocalizedString(strWorking, 4000);
    }


    function RunTimeApi_ValidLikeRTResponse(str) {

        return this.ValidShortIdentifier(str);
    }


    function RunTimeApi_ValidMatchingResponse(str) {


        //Can't use regular expressions here because of a JavaScript bug with the split function. When using
        //regular expressions for the split function, split does not return empty elements to represent instances
        //of the delimiter at the start or end of the string

        //var REG_EX_DELIMITER = /\[\,\]/;
        //var REG_EX_PAIR_ITEM_DELIMITER = /\[\.\]/;

        var REG_EX_DELIMITER = "[,]";
        var REG_EX_PAIR_ITEM_DELIMITER = "[.]";

        var aryPairs;
        var aryPairItems;

        aryPairs = str.split(REG_EX_DELIMITER);

        for (var i = 0; i < aryPairs.length; i++) {

            aryPairItems = aryPairs[i].split(REG_EX_PAIR_ITEM_DELIMITER);

            if (aryPairItems.length != 2) {
                return false;
            }

            if (!this.ValidShortIdentifier(aryPairItems[0])) {
                return false;
            }

            if (!this.ValidShortIdentifier(aryPairItems[1])) {
                return false;
            }
        }

        return true;
    }

    function RunTimeApi_ValidPerformanceResponse(str, checkPrefixes) {



        //valid begins with order matters delimiter
        var REG_EX_STARTS_WITH_ORDER_MATTERS = /^\{order_matters=/;
        var REG_EX_STARTS_WITH_VALID_ORDER_MATTERS = /^\{order_matters=(true|false)\}/;

        var arySteps;
        var strStep;
        var aryStepParts;
        var strStepName;
        var strStepAnswer;

        var strWorking = new String(str);

        if (str.length === 0) {

            return false;
        }

        if (checkPrefixes) {

            if (strWorking.search(REG_EX_STARTS_WITH_ORDER_MATTERS) >= 0) {

                if (strWorking.search(REG_EX_STARTS_WITH_VALID_ORDER_MATTERS) < 0) {

                    return false;
                }
                strWorking = strWorking.replace(REG_EX_STARTS_WITH_VALID_ORDER_MATTERS, "");
            }

        }

        //array seperated by [,]
        arySteps = strWorking.split("[,]");

        //if array length === 0, return false
        if (arySteps.length === 0) {

            return false;
        }

        //for each array element
        for (var i = 0; i < arySteps.length; i++) {



            strStep = arySteps[i];

            if (strStep.length === 0) {

                return false;
            }

            //seperate by [.]
            aryStepParts = strStep.split("[.]");

            //if has 2 parts
            if (aryStepParts.length == 2) {
                //first part must be valid short identifier, or empty string
                //step answer = second part, (don't validate it, it's just a char string, even if numeric fails, you could still consider that just a charstring

                strStepName = aryStepParts[0];
                strStepAnswer = aryStepParts[1];

                //either step name or step answer (or both must be specified)
                if (strStepName.length === 0 && strStepAnswer === 0) {

                    return false;
                }

                if (strStepName.length > 0) {
                    if (!this.ValidShortIdentifier(strStepName)) {

                        return false;
                    }
                }
            } else {
                //else - error, return false, must contain 2 parts, even if step id == empty string

                return false;
            }
        }


        return true;
    }

    function RunTimeApi_ValidSequencingResponse(str) {

        return this.IsValidArrayOfShortIdentifiers(str, 36, false);
    }

    function RunTimeApi_ValidNumericResponse(str, allowMinMax) {


        //var REG_EX_REAL_DELIMITER = /\[\:\]/;
        var REG_EX_REAL_DELIMITER = "[:]";

        var aryValues = str.split(REG_EX_REAL_DELIMITER);

        if (allowMinMax) {
            if (aryValues.length > 2) {
                return false;
            }
        } else {
            if (aryValues.length > 1) {
                return false;
            }
        }

        for (var i = 0; i < aryValues.length; i++) {
            if (!this.ValidReal(aryValues[i])) {
                return false;
            }
        }

        //check that the min value is less than the max (if they both exist)
        if (aryValues.length >= 2) {
            if (aryValues[0].length > 0 && aryValues[1].length > 0) {
                if (parseFloat(aryValues[0]) > parseFloat(aryValues[1])) {
                    return false;
                }
            }
        }

        return true;
    }

    function RunTimeApi_ValidOtheresponse(str) {



        //TODO - make sure that if the SCO sets more than one correct response for an Other interaction that we set an error
        //as described on RTE page 4-72

        /*
    if (str.length > 4000){
        return false;
    }
    */

        return true;
    }


    function RunTimeApi_TranslateBooleanIntoCMI(booleanValue) {

        if (booleanValue === true) {
            return SCORM_TRUE;
        } else if (booleanValue === false) {
            return SCORM_FALSE;
        } else {
            return SCORM_UNKNOWN;
        }
    }


    function RunTimeApi_GetCompletionStatus() {

        //determine completion status based on progress measure and completion threshold
        if (this.LearningObject.CompletionThreshold !== null) {
            if (this.RunTimeData.ProgressMeasure !== null) {
                if (parseFloat(this.RunTimeData.ProgressMeasure) >= parseFloat(this.LearningObject.CompletionThreshold)) {


                    return SCORM_STATUS_COMPLETED;
                } else {

                    return SCORM_STATUS_INCOMPLETE;
                }
            } else {

                return SCORM_STATUS_UNKNOWN;
            }
        }


        return this.RunTimeData.CompletionStatus;

    }

    function RunTimeApi_GetSuccessStatus() {

        //determine success status based on scaled score and scaled passing score
        var scaledPassingScore = this.LearningObject.GetScaledPassingScore();

        if (scaledPassingScore !== null) {
            if (this.RunTimeData.ScoreScaled !== null) {
                if (parseFloat(this.RunTimeData.ScoreScaled) >= parseFloat(scaledPassingScore)) {

                    return SCORM_STATUS_PASSED;
                } else {

                    return SCORM_STATUS_FAILED;
                }
            } else {
                //new 2004 Addendum - if there is a mastery score, and the content does not set a score
                //then regardless of what success status the content set, the status is always unknown

                return SCORM_STATUS_UNKNOWN;
            }
        }


        return this.RunTimeData.SuccessStatus;
    }


    // This is a public function that exists mainly to get around a "bug" in IE where if you set this.TrackedStartTime directly
    // with a new Date() object created in a different frame/window, you get an error.

    function RunTimeApi_InitTrackedTimeStart(activity) {
        this.TrackedStartDate = new Date();
        this.StartSessionTotalTime = activity.RunTime.TotalTime;
    }

    function RunTimeApi_AccumulateTotalTimeTracked() {

        this.TrackedEndDate = new Date();
        var trackedSessionTimeHundredths = Math.round((this.TrackedEndDate - this.TrackedStartDate) / 10);
        var previousTrackedTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.RunTimeData.TotalTimeTracked);

        var totalTrackedHundredths = trackedSessionTimeHundredths + previousTrackedTimeHundredths;

        this.RunTimeData.TotalTimeTracked = ConvertHundredthsToIso8601TimeSpan(totalTrackedHundredths);

        // Update absolute durations
        // Store end date to assist rollup
        this.Activity.ActivityEndedDate = this.TrackedEndDate;

        var startActivityDateObj = GetDateFromUtcIso8601Time(this.Activity.GetActivityStartTimestampUtc());
        var startAttemptDateObj = GetDateFromUtcIso8601Time(this.Activity.GetAttemptStartTimestampUtc());

        this.Activity.SetActivityAbsoluteDuration(ConvertHundredthsToIso8601TimeSpan((this.TrackedEndDate - startActivityDateObj) / 10));
        this.Activity.SetAttemptAbsoluteDuration(ConvertHundredthsToIso8601TimeSpan((this.TrackedEndDate - startAttemptDateObj) / 10));

        // Update experienced durations

        // activity time tracked is current value + session tracked
        var previousActivityTrackedTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.Activity.GetActivityExperiencedDurationTracked());
        var activityTrackedTimeSpan = ConvertHundredthsToIso8601TimeSpan(previousActivityTrackedTimeHundredths + trackedSessionTimeHundredths);
        this.Activity.SetActivityExperiencedDurationTracked(activityTrackedTimeSpan);

        // activity time reported is current value + (runtime.totaltime - startsessiontotaltime)
        var previousActivityReportedTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.Activity.GetActivityExperiencedDurationReported());
        var sessionTotalTimeReportedHundredths = ConvertIso8601TimeSpanToHundredths(this.RunTimeData.TotalTime) - ConvertIso8601TimeSpanToHundredths(this.StartSessionTotalTime)
        var activityReportedTimeSpan = ConvertHundredthsToIso8601TimeSpan(previousActivityReportedTimeHundredths + sessionTotalTimeReportedHundredths);
        this.Activity.SetActivityExperiencedDurationReported(activityReportedTimeSpan);

        // attempt time tracked is same as runtime.totaltimetracked
        var previousAttemptTrackedTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.Activity.GetAttemptExperiencedDurationTracked());
        var attemptTrackedTimeSpan = ConvertHundredthsToIso8601TimeSpan(previousAttemptTrackedTimeHundredths + trackedSessionTimeHundredths);
        this.Activity.SetAttemptExperiencedDurationTracked(attemptTrackedTimeSpan);

        // attempt time reported is same as runtime.totaltime
        var previousAttemptReportedTimeHundredths = ConvertIso8601TimeSpanToHundredths(this.Activity.GetAttemptExperiencedDurationReported());
        var attemptReportedTimeSpan = ConvertHundredthsToIso8601TimeSpan(previousAttemptReportedTimeHundredths + sessionTotalTimeReportedHundredths);
        this.Activity.SetAttemptExperiencedDurationReported(attemptReportedTimeSpan);
    }


    function RunTimeApi_SetLookAheadDirtyDataFlagIfNeeded(oldValue, newValue) {
        if (this.IsLookAheadSequencerDataDirty == false && oldValue != newValue) {
            this.IsLookAheadSequencerDataDirty = true;
        }
    }

    function RunTimeApi_RunLookAheadSequencerIfNeeded(force) {
        if ((Control.Package.Properties.LookaheadSequencerMode != LOOKAHEAD_SEQUENCER_MODE_REALTIME && force !== true) || Control.Package.Properties.LookaheadSequencerMode == LOOKAHEAD_SEQUENCER_MODE_DISABLE) {
            return;
        }

        this.LookAheadSessionClose();
        if (this.IsLookAheadSequencerDataDirty === true && !this.IsLookAheadSequencerRunning) {
            this.IsLookAheadSequencerDataDirty = false;
            this.IsLookAheadSequencerRunning = true;
            window.setTimeout("Control.EvaluatePossibleNavigationRequests(true);", 150);
        }
    }

})();
