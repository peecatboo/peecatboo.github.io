
var SCORM_MODE_NORMAL = "normal";
var SCORM_MODE_REVIEW = "review";
var SCORM_MODE_BROWSE = "browse";

var SCORM_STATUS_PASSED        = "passed";
var SCORM_STATUS_COMPLETED     = "completed";
var SCORM_STATUS_FAILED        = "failed";
var SCORM_STATUS_INCOMPLETE    = "incomplete";
var SCORM_STATUS_BROWSED       = "browsed";
var SCORM_STATUS_NOT_ATTEMPTED = "not attempted";
var SCORM_STATUS_UNKNOWN       = "unknown";

var SCORM_EXIT_TIME_OUT = "time-out";
var SCORM_EXIT_SUSPEND  = "suspend";
var SCORM_EXIT_LOGOUT   = "logout";
var SCORM_EXIT_NORMAL   = "normal";        //NOTE: in SCORM 1.2, "" is actually considered normal rather than unknown
var SCORM_EXIT_UNKNOWN   = "";

var SCORM_CREDIT    = "credit";
var SCORM_CREDIT_NO = "no-credit";

var SCORM_ENTRY_AB_INITO = "ab-initio";
var SCORM_ENTRY_RESUME   = "resume";
var SCORM_ENTRY_NORMAL   = "";

var SCORM_TRUE_FALSE = "true-false";
var SCORM_CHOICE = "choice";
var SCORM_FILL_IN = "fill-in";
var SCORM_MATCHING = "matching";
var SCORM_PERFORMANCE = "performance";
var SCORM_SEQUENCING = "sequencing";
var SCORM_LIKERT = "likert";
var SCORM_NUMERIC = "numeric";
var SCORM_LONG_FILL_IN = "long-fill-in";
var SCORM_OTHER = "other";

var SCORM_CORRECT = "correct";
var SCORM_WRONG = "wrong";            //1.2
var SCORM_INCORRECT = "incorrect";    //2004
var SCORM_UNANTICIPATED = "unanticipated";
var SCORM_NEUTRAL = "neutral";

var SCORM_RUNTIME_NAV_REQUEST_CONTINUE = "continue";
var SCORM_RUNTIME_NAV_REQUEST_PREVIOUS = "previous";
var SCORM_RUNTIME_NAV_REQUEST_CHOICE = "choice";
var SCORM_RUNTIME_NAV_REQUEST_JUMP = "jump";
var SCORM_RUNTIME_NAV_REQUEST_EXIT = "exit";
var SCORM_RUNTIME_NAV_REQUEST_EXITALL = "exitAll";
var SCORM_RUNTIME_NAV_REQUEST_ABANDON = "abandon";
var SCORM_RUNTIME_NAV_REQUEST_ABANDONALL = "abandonAll";
var SCORM_RUNTIME_NAV_REQUEST_SUSPENDALL = "suspendAll";
var SCORM_RUNTIME_NAV_REQUEST_NONE = "_none_";

//note - these values are always stored internally as SCORM 2004 values

function ActivityRunTime (
            CompletionStatus,
            Credit,
            Entry,
            Exit,
            Location,
            Mode,
            ProgressMeasure,
            ScoreRaw,
            ScoreMax,
            ScoreMin,
            ScoreScaled,
            SuccessStatus,
            SuspendData,
            TotalTime,
            TotalTimeTracked,
            AudioLevel,
            LanguagePreference,
            DeliverySpeed,
            AudioCaptioning,
            Comments,
            CommentsFromLMS,
            Interactions,
            Objectives){
    if (arguments.length > 1) {
        this.CompletionStatus = CompletionStatus;
        this.Credit = Credit;
        this.Entry = Entry;
        this.Exit = Exit;
        this.Location = Location;
        this.Mode = Mode;
        this.ProgressMeasure = ProgressMeasure;
        this.ScoreRaw = ScoreRaw;
        this.ScoreMax = ScoreMax;
        this.ScoreMin = ScoreMin;
        this.ScoreScaled = ScoreScaled;
        this.SuccessStatus = SuccessStatus;
        this.SuspendData = SuspendData;
        this.TotalTime = TotalTime;
        this.TotalTimeTracked = TotalTimeTracked;
        this.AudioLevel = AudioLevel;
        this.LanguagePreference = LanguagePreference;
        this.DeliverySpeed = DeliverySpeed;
        this.AudioCaptioning = AudioCaptioning;
        this.Comments = Comments;
        this.CommentsFromLMS = CommentsFromLMS;
        this.Interactions = Interactions;
        this.Objectives = Objectives;

        this.LookAheadCompletionStatus = CompletionStatus;
        this.LookAheadSuccessStatus = SuccessStatus;
    } else { // JSON data
        var data = arguments[0];
        this.CompletionStatus = data.CompletionStatus;
        this.Credit = data.Credit;
        this.Entry = data.Entry;
        this.Exit = data.Exit;
        this.Location = data.Location;
        this.Mode = data.Mode;
        this.ProgressMeasure = data.ProgressMeasure;
        this.ScoreRaw = data.ScoreRaw;
        this.ScoreMax = data.ScoreMax;
        this.ScoreMin = data.ScoreMin;
        this.ScoreScaled = data.ScoreScaled;
        this.SuccessStatus = data.SuccessStatus;
        this.SuspendData = data.SuspendData;
        this.TotalTime = data.TotalTime;
        this.TotalTimeTracked = data.TotalTimeTracked;
        this.AudioLevel = data.AudioLevel;
        this.LanguagePreference = data.LanguagePreference;
        this.DeliverySpeed = data.DeliverySpeed;
        this.AudioCaptioning = data.AudioCaptioning;
        this.Comments = data.Comments;
        this.CommentsFromLMS = data.CommentsFromLMS;
        this.Interactions = data.Interactions;
        this.Objectives = data.Objectives.map(function (o) {
            return new ActivityRunTimeObjective(o);
        });

        this.LookAheadCompletionStatus = data.CompletionStatus;
        this.LookAheadSuccessStatus = data.SuccessStatus;
    }

    this.CompletionStatusChangedDuringRuntime = false;
    this.SuccessStatusChangedDuringRuntime = false;

    this.SessionTime = "";
    this.SessionTimeTracked = "";
    this.NavRequest = SCORM_RUNTIME_NAV_REQUEST_NONE;

    this.DataState = DATA_STATE_CLEAN;
}

ActivityRunTime.prototype.ResetState = ActivityRunTime_ResetState;
ActivityRunTime.prototype.GetXml = ActivityRunTime_GetXml;
ActivityRunTime.prototype.toString = ActivityRunTime_toString;
ActivityRunTime.prototype.SetDirtyData = ActivityRunTime_SetDirtyData;

ActivityRunTime.prototype.IsValidObjectiveIndex = ActivityRunTime_IsValidObjectiveIndex;
ActivityRunTime.prototype.IsValidInteractionIndex = ActivityRunTime_IsValidInteractionIndex;
ActivityRunTime.prototype.IsValidInteractionObjectiveIndex = ActivityRunTime_IsValidInteractionObjectiveIndex;
ActivityRunTime.prototype.IsValidInteractionCorrectResponseIndex = ActivityRunTime_IsValidInteractionCorrectResponseIndex;

ActivityRunTime.prototype.AddObjective = ActivityRunTime_AddObjective;
ActivityRunTime.prototype.AddInteraction = ActivityRunTime_AddInteraction;
ActivityRunTime.prototype.AddComment = ActivityRunTime_AddComment;

ActivityRunTime.prototype.FindObjectiveWithId = ActivityRunTime_FindObjectiveWithId;


function ActivityRunTime_ResetState(leaveObjectives){

    this.CompletionStatus = SCORM_STATUS_UNKNOWN;
    //this.Credit = Credit;        //credit shouldn't have to change
    this.Entry = SCORM_ENTRY_AB_INITO;
    this.Exit = SCORM_EXIT_UNKNOWN;
    this.Location = null;

    if (RegistrationToDeliver.LessonMode !== SCORM_MODE_REVIEW && RegistrationToDeliver.LessonMode !== SCORM_MODE_BROWSE){
        this.Mode = SCORM_MODE_NORMAL;
    }

    this.ProgressMeasure = null;
    this.ScoreRaw = null;
    this.ScoreMax = null;
    this.ScoreMin = null;
    this.ScoreScaled = null;
    this.SuccessStatus = SCORM_STATUS_UNKNOWN;
    this.SuspendData = null;
    this.TotalTime = "PT0H0M0S";
    this.TotalTimeTracked = "PT0H0M0S";

    if (Control.Package.Properties.MakeStudentPrefsGlobalToCourse !== true){
        this.AudioLevel = 1;
        this.LanguagePreference = "";
        this.DeliverySpeed = 1;
        this.AudioCaptioning = 0;
    }
    this.Comments = new Array();
    this.CommentsFromLMS = new Array();
    this.Interactions = new Array();
    if(!leaveObjectives){
        this.Objectives = new Array();
    }
    this.LookAheadCompletionStatus = this.CompletionStatus;
    this.LookAheadSuccessStatus = this.SuccessStatus ;

    this.SessionTime = "";
    this.NavRequest = SCORM_RUNTIME_NAV_REQUEST_NONE;

    this.CompletionStatusChangedDuringRuntime = false;
    this.SuccessStatusChangedDuringRuntime = false;

    this.SetDirtyData();
}

function ActivityRunTime_GetXml(activityId){

    //TODO - report session time to server - remember to tell John to change his stuff

    var ServerFormat = new ServerFormater();

    var xml = new XmlElement("ART");

    xml.AddAttribute("AI", activityId);

    xml.AddAttribute("CS", ServerFormat.ConvertCompletionStatus(this.CompletionStatus));
    xml.AddAttribute("C", ServerFormat.ConvertCredit(this.Credit));
    xml.AddAttribute("E", ServerFormat.ConvertEntry(this.Entry));
    xml.AddAttribute("Ex", ServerFormat.ConvertExit(this.Exit));

    if (this.Location !== null){
        xml.AddAttribute("L", ServerFormat.TrimToLength(this.Location, 1000));
    }

    xml.AddAttribute("M", ServerFormat.ConvertMode(this.Mode));

    if (this.ProgressMeasure !== null){
        xml.AddAttribute("PM", this.ProgressMeasure);
    }
    if (this.ScoreRaw !== null){
        xml.AddAttribute("SR", this.ScoreRaw);
    }
    if (this.ScoreMax !== null){
        xml.AddAttribute("SM", this.ScoreMax);
    }
    if (this.ScoreMin !== null){
        xml.AddAttribute("SMi", this.ScoreMin);
    }
    if (this.ScoreScaled !== null){
        xml.AddAttribute("SS", this.ScoreScaled);
    }

    xml.AddAttribute("SuS", ServerFormat.ConvertSuccessStatus(this.SuccessStatus));

    if (this.SuspendData !== null){
        xml.AddAttribute("SD", ServerFormat.TrimToLength(this.SuspendData, Control.Package.Properties.SuspendDataMaxLength));
    }
    xml.AddAttribute("TT", ServerFormat.ConvertTimeSpan(this.TotalTime));
    xml.AddAttribute("TTT", ServerFormat.ConvertTimeSpan(this.TotalTimeTracked));
    xml.AddAttribute("AL", this.AudioLevel);
    xml.AddAttribute("LP", ServerFormat.TrimToLength(this.LanguagePreference, 250));
    xml.AddAttribute("DS", this.DeliverySpeed);
    xml.AddAttribute("AC", this.AudioCaptioning);

    var i;
    for (i=0; i < this.Comments.length; i++){
        xml.AddElement(this.Comments[i].GetXml(activityId, i, false));
    }

    for (i=0; i < this.CommentsFromLMS.length; i++){
        xml.AddElement(this.CommentsFromLMS[i].GetXml(activityId, i, true));
    }

    for (i=0; i < this.Interactions.length; i++){
        xml.AddElement(this.Interactions[i].GetXml(activityId, i));
    }

    for (i=0; i < this.Objectives.length; i++){
        xml.AddElement(this.Objectives[i].GetXml(activityId, i));
    }

    return xml.toString();
}

function ActivityRunTime_toString(){
    return "RunTimeData - CompletionStatus=" + this.CompletionStatus + ", SuccessStatus=" + this.SuccessStatus;
}

function ActivityRunTime_SetDirtyData(){
    this.DataState = DATA_STATE_DIRTY;
}


function ActivityRunTime_IsValidObjectiveIndex(index){

    //we can only modify objectives that already exist and we can only add a new objective
    //at the slot right above the current max slot

    index = parseInt(index, 10);
    if (index <= this.Objectives.length){
        return true;
    }
    else{
        return false;
    }
}

function ActivityRunTime_IsValidInteractionIndex(index){

    //we can only modify interactions that already exist and we can only add a new interaction
    //at the slot right above the current max slot

    index = parseInt(index, 10);
    if (index <= this.Interactions.length){
        return true;
    }
    else{
        return false;
    }
}

function ActivityRunTime_IsValidInteractionObjectiveIndex(interactionIndex, objectiveIndex){

    interactionIndex = parseInt(interactionIndex, 10);
    objectiveIndex = parseInt(objectiveIndex, 10);

    if (this.Interactions[interactionIndex]){
        if (objectiveIndex <= this.Interactions[interactionIndex].Objectives.length){
            return true;
        }
        else{
            return false;
        }
    }
    else{    //if we haven't established this interaction yet, then the only valid objective index is 0
        if (objectiveIndex === 0){
            return true;
        }
        else{
            return false;
        }
    }
}


function ActivityRunTime_IsValidInteractionCorrectResponseIndex(interactionIndex, responseIndex){

    interactionIndex = parseInt(interactionIndex, 10);
    responseIndex = parseInt(responseIndex, 10);

    if (this.Interactions[interactionIndex]){
        if (responseIndex <= this.Interactions[interactionIndex].CorrectResponses.length){
            return true;
        }
        else{
            return false;
        }
    }
    else{    //if we haven't established this interaction yet, then the only valid response index is 0
        if (responseIndex === 0){
            return true;
        }
        else{
            return false;
        }
    }
}


function ActivityRunTime_AddObjective(){

    this.Objectives[this.Objectives.length] = new ActivityRunTimeObjective(null,
                                                                            SCORM_STATUS_UNKNOWN,
                                                                            SCORM_STATUS_UNKNOWN,
                                                                            null,
                                                                            null,
                                                                            null,
                                                                            null,
                                                                            null,
                                                                            null);
}

function ActivityRunTime_AddInteraction(){

    this.Interactions[this.Interactions.length] = new ActivityRunTimeInteraction(null,
                                                                                null,
                                                                                null,
                                                                                null,
                                                                                null,
                                                                                null,
                                                                                null,
                                                                                null,
                                                                                null,
                                                                                new Array(),
                                                                                new Array());
}

function ActivityRunTime_AddComment(){
    this.Comments[this.Comments.length] = new ActivityRunTimeComment(null,
                                                                    null,
                                                                    null,
                                                                    null,
                                                                    null);
}

function ActivityRunTime_FindObjectiveWithId(id){

    for (var i=0; i < this.Objectives.length; i++){

        if (this.Objectives[i].Identifier == id){
            return this.Objectives[i];
        }
    }

    return null;
}
