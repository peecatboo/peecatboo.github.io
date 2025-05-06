function ActivityObjective (
            Identifier,
            ProgressStatus,
            SatisfiedStatus,
            MeasureStatus,
            NormalizedMeasure,
            Primary,
            PrevProgressStatus,
            PrevSatisfiedStatus,
            PrevMeasureStatus,
            PrevNormalizedMeasure,
            FirstSuccessTimestampUtc,
            FirstNormalizedMeasure,
            ScoreRaw,
            ScoreMin,
            ScoreMax,
            CompletionStatus,
            CompletionStatusValue,
            ProgressMeasureStatus,
            ProgressMeasure){
    if (arguments.length > 1) {
        this.Identifier = Identifier;
        this.ProgressStatus = ProgressStatus;
        this.SatisfiedStatus = SatisfiedStatus;
        this.MeasureStatus = MeasureStatus;
        this.NormalizedMeasure = NormalizedMeasure;
        this.Primary = Primary;

        this.PrevProgressStatus = PrevProgressStatus;
        this.PrevSatisfiedStatus = PrevSatisfiedStatus;
        this.PrevMeasureStatus = PrevMeasureStatus;
        this.PrevNormalizedMeasure = PrevNormalizedMeasure;

        this.FirstSuccessTimestampUtc = FirstSuccessTimestampUtc;
        this.FirstNormalizedMeasure = FirstNormalizedMeasure;

        this.ScoreRaw = ScoreRaw;
        this.ScoreMin = ScoreMin;
        this.ScoreMax = ScoreMax;

        this.CompletionStatus = CompletionStatus;
        this.CompletionStatusValue = CompletionStatusValue;
        this.ProgressMeasureStatus = ProgressMeasureStatus;
        this.ProgressMeasure = ProgressMeasure;
    } else { // JSON data
        var data = arguments[0];
        this.Identifier = data.Identifier;
        this.ProgressStatus = data.ProgressStatus;
        this.SatisfiedStatus = data.SatisfiedStatus;
        this.MeasureStatus = data.MeasureStatus;
        this.NormalizedMeasure = data.NormalizedMeasure;
        this.Primary = data.Primary;

        this.PrevProgressStatus = data.PrevProgressStatus;
        this.PrevSatisfiedStatus = data.PrevSatisfiedStatus;
        this.PrevMeasureStatus = data.PrevMeasureStatus;
        this.PrevNormalizedMeasure = data.PrevNormalizedMeasure;

        this.FirstSuccessTimestampUtc = data.FirstSuccessTimestampUtc;
        this.FirstNormalizedMeasure = data.FirstNormalizedMeasure;

        this.ScoreRaw = data.ScoreRaw;
        this.ScoreMin = data.ScoreMin;
        this.ScoreMax = data.ScoreMax;

        this.CompletionStatus = data.CompletionStatus;
        this.CompletionStatusValue = data.CompletionStatusValue;
        this.ProgressMeasureStatus = data.ProgressMeasureStatus;
        this.ProgressMeasure = data.ProgressMeasure;
    }

    //initialize with these deafults since we need to simulate a primary objective but we don't insert one into the static data
    this.SatisfiedByMeasure = false;
    this.MinNormalizedMeasure = 1.0;

    this.Maps = new Array();

    this.DataState = DATA_STATE_CLEAN;

    this.Sequencer = null;
}

ActivityObjective.prototype.GetXml = ActivityObjective_GetXml;
ActivityObjective.prototype.toString = ActivityObjective_toString;
ActivityObjective.prototype.ResetAttemptState = ActivityObjective_ResetAttemptState;
ActivityObjective.prototype.Clear = ActivityObjective_Clear;

ActivityObjective.prototype.GetContributesToRollup = ActivityObjective_GetContributesToRollup;
ActivityObjective.prototype.GetMeasureStatus = ActivityObjective_GetMeasureStatus;
ActivityObjective.prototype.GetNormalizedMeasure = ActivityObjective_GetNormalizedMeasure;

ActivityObjective.prototype.SetMeasureStatus = ActivityObjective_SetMeasureStatus;
ActivityObjective.prototype.SetNormalizedMeasure = ActivityObjective_SetNormalizedMeasure;
ActivityObjective.prototype.SetProgressStatus = ActivityObjective_SetProgressStatus;
ActivityObjective.prototype.SetSatisfiedStatus = ActivityObjective_SetSatisfiedStatus;

ActivityObjective.prototype.GetSatisfiedByMeasure = ActivityObjective_GetSatisfiedByMeasure;
ActivityObjective.prototype.GetMinimumSatisfiedNormalizedMeasure = ActivityObjective_GetMinimumSatisfiedNormalizedMeasure;

ActivityObjective.prototype.GetProgressStatus = ActivityObjective_GetProgressStatus;
ActivityObjective.prototype.GetSatisfiedStatus = ActivityObjective_GetSatisfiedStatus;

ActivityObjective.prototype.GetScoreRaw = ActivityObjective_GetScoreRaw;
ActivityObjective.prototype.GetScoreMin = ActivityObjective_GetScoreMin;
ActivityObjective.prototype.GetScoreMax = ActivityObjective_GetScoreMax;
ActivityObjective.prototype.GetCompletionStatus = ActivityObjective_GetCompletionStatus;
ActivityObjective.prototype.GetCompletionStatusValue = ActivityObjective_GetCompletionStatusValue;
ActivityObjective.prototype.GetProgressMeasureStatus = ActivityObjective_GetProgressMeasureStatus;
ActivityObjective.prototype.GetProgressMeasure = ActivityObjective_GetProgressMeasure;
ActivityObjective.prototype.SetScoreRaw = ActivityObjective_SetScoreRaw;
ActivityObjective.prototype.SetScoreMin = ActivityObjective_SetScoreMin;
ActivityObjective.prototype.SetScoreMax = ActivityObjective_SetScoreMax;
ActivityObjective.prototype.SetCompletionStatus = ActivityObjective_SetCompletionStatus;
ActivityObjective.prototype.SetCompletionStatusValue = ActivityObjective_SetCompletionStatusValue;
ActivityObjective.prototype.SetProgressMeasureStatus = ActivityObjective_SetProgressMeasureStatus;
ActivityObjective.prototype.SetProgressMeasure = ActivityObjective_SetProgressMeasure;

ActivityObjective.prototype.GetIdentifier = ActivityObjective_GetIdentifier;

ActivityObjective.prototype.GetMaps = ActivityObjective_GetMaps;

ActivityObjective.prototype.SetDirtyData = ActivityObjective_SetDirtyData;

ActivityObjective.prototype.SetSequencer = ActivityObjective_SetSequencer;
ActivityObjective.prototype.Clone = ActivityObjective_Clone;
ActivityObjective.prototype.TearDown = ActivityObjective_TearDown;

ActivityObjective.prototype.GetSuccessStatusChangedDuringRuntime = ActivityObjective_GetSuccessStatusChangedDuringRuntime;

function ActivityObjective_GetXml(activityId, index){

    var ServerFormat = new ServerFormater();

    var xml = new XmlElement("AO");

    xml.AddAttribute("AI", activityId);
    xml.AddAttribute("AOI", index);

    xml.AddAttribute("I", this.Identifier);
    xml.AddAttribute("PS", ServerFormat.ConvertBoolean(this.ProgressStatus));
    xml.AddAttribute("SS", ServerFormat.ConvertBoolean(this.SatisfiedStatus));
    xml.AddAttribute("MS", ServerFormat.ConvertBoolean(this.MeasureStatus));
    xml.AddAttribute("NM", this.NormalizedMeasure);

    xml.AddAttribute("PPS", ServerFormat.ConvertBoolean(this.PrevProgressStatus));
    xml.AddAttribute("PSS", ServerFormat.ConvertBoolean(this.PrevSatisfiedStatus));
    xml.AddAttribute("PMS", ServerFormat.ConvertBoolean(this.PrevMeasureStatus));
    xml.AddAttribute("PNM", this.PrevNormalizedMeasure);

    if (this.FirstSuccessTimestampUtc !== null) {
        xml.AddAttribute("FSTU", this.FirstSuccessTimestampUtc);
    }

    if (this.FirstNormalizedMeasure !== null) {
        xml.AddAttribute("FNM", this.FirstNormalizedMeasure);
    }

    xml.AddAttribute("P", ServerFormat.ConvertBoolean(this.Primary));

    xml.AddAttribute("CS", ServerFormat.ConvertBoolean(this.CompletionStatus));
    xml.AddAttribute("CSV", ServerFormat.ConvertBoolean(this.CompletionStatusValue));

    if (this.ScoreRaw !== null){
        xml.AddAttribute("SR", this.ScoreRaw);
    }
    if (this.ScoreMax !== null){
        xml.AddAttribute("SM", this.ScoreMax);
    }
    if (this.ScoreMin !== null){
        xml.AddAttribute("SMi", this.ScoreMin);
    }
    xml.AddAttribute("PrMS", ServerFormat.ConvertBoolean(this.ProgressMeasureStatus));
    if (this.ProgressMeasure !== null){
        xml.AddAttribute("PM", this.ProgressMeasure);
    }

    return xml.toString();
}


function ActivityObjective_toString(){
    return this.Identifier;
}

function ActivityObjective_ResetAttemptState() {

    this.PrevProgressStatus = this.ProgressStatus;
    this.PrevSatisfiedStatus = this.SatisfiedStatus;
    this.PrevMeasureStatus = this.MeasureStatus;
    this.PrevNormalizedMeasure = this.NormalizedMeasure;

    this.ProgressStatus = false;
    this.SatisfiedStatus = false;
    this.MeasureStatus = false;
    this.NormalizedMeasure = 0;

    this.ScoreRaw = null;
    this.ScoreMin = null;
    this.ScoreMax = null;
    this.CompletionStatus = false;
    this.CompletionStatusValue = false;
    this.ProgressMeasureStatus = false;
    this.ProgressMeasure = null;

    this.SetDirtyData();
}

function ActivityObjective_Clear() {
    var maps = this.Maps;

    this.ResetAttemptState();

    this.PrevProgressStatus = false;
    this.PrevSatisfiedStatus = false;
    this.PrevMeasureStatus = false;
    this.PrevNormalizedMeasure = 0;

    for (var i=0; i < maps.length; i++) {

        if (maps[i].WriteNormalizedMeasure === true && this.Sequencer) {

            var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

            if (globalObjective === null) {
                this.Sequencer.AddGlobalObjective(maps[i].TargetObjectiveId, false, false, true, 0);
            } else{
                globalObjective.MeasureStatus = false;
                globalObjective.NormalizedMeasure = 0;
                globalObjective.SetDirtyData();
            }
        }

        if (maps[i].WriteSatisfiedStatus === true && this.Sequencer){

            var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

            if (globalObjective === null){
                this.Sequencer.AddGlobalObjective(maps[i].TargetObjectiveId, true, status, false, 0);
            }
            else{
                globalObjective.ProgressStatus = false;
                globalObjective.SatisfiedStatus = false;
                globalObjective.SetDirtyData();
            }
        }
    }
}

function ActivityObjective_GetContributesToRollup(){
    var contributes = this.Primary;

    return contributes;
}


function ActivityObjective_GetMeasureStatus(activity, canLookAtPreviousAttempt){

    if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined){
        // Debug.AssertError("ERROR - canLookAtPreviousAttempt must be passed into GetMeasureStatus");
        //canLookAtPreviousAttempt = false;
    }

    //if unknown, and there is a read map, read from the global objective

    var measureStatus;

    //when evaluating sequencing rules, if there was a previous attempt, and the current activity hasn't been
    //attempted during the current attempt on the parent, use the previous attempt's data
    if (canLookAtPreviousAttempt === true &&
        (activity != null && activity != undefined) &&            //note use of short circuit AND (be careful that activity is always passed in)
        activity.WasAttemptedDuringThisAttempt() === false
        ){
        measureStatus = this.PrevMeasureStatus;
    }
    else{
        measureStatus = this.MeasureStatus;
    }

    //In SCORM 2004 2nd Edition, a local status overrides a global status. In 3rd Edition and later
    //the global value is always used, even if a local value is known.
    var useGlobalStatus = (measureStatus === false) || Control.Package.LearningStandard.is20043rdOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadNormalizedMeasure === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null){
                    measureStatus = globalObjective.MeasureStatus;
                }

            }
        }
    }

    return measureStatus;
}

function ActivityObjective_GetNormalizedMeasure(activity, canLookAtPreviousAttempt){

    if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined){
        // Debug.AssertError("ERROR - canLookAtPreviousAttempt must be passed into GetNormalizedMeasure");
        //canLookAtPreviousAttempt = false;
    }

    //if unknown, and there is a read map, read from the global objective

    var measureStatus;
    var normalizedMeasure;

    //when evaluating sequencing rules, if there was a previous attempt, and the current activity hasn't been
    //attempted during the current attempt on the parent, use the previous attempt's data
    if (canLookAtPreviousAttempt === true &&
        (activity != null && activity != undefined) &&            //note use of short circuit AND (be careful that activity is always passed in)
        activity.WasAttemptedDuringThisAttempt() === false){

        measureStatus = this.PrevMeasureStatus;
        normalizedMeasure = this.PrevNormalizedMeasure;
    }
    else{
        measureStatus = this.MeasureStatus;
        normalizedMeasure = this.NormalizedMeasure;
    }

    //In SCORM 2004 2nd Edition, a local status overrides a global status. In 3rd Edition and later
    //the global value is always used, even if a local value is known.
    var useGlobalStatus = (measureStatus === false) || Control.Package.LearningStandard.is20043rdOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadNormalizedMeasure === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null && globalObjective.MeasureStatus === true){
                    normalizedMeasure = globalObjective.NormalizedMeasure;
                }

            }
        }
    }

    return normalizedMeasure;
}


//TODO - improvement - should we consolidate the reading and writing of these pairs? that might simplify the global objectives code and be more logical,
//this would also ensure that the unknown flag is always set before the data value (necessary for maintaining global data properly)

function ActivityObjective_SetMeasureStatus(status, activity){

    if (activity === null || activity === undefined){
        // Debug.AssertError("ERROR - activity must be passed into SetMeasureStatus");
    }

    //if not unknown, and there is a write map, write to the global objective

    this.MeasureStatus = status;

    if (status === true){

        activity.SetAttemptedDuringThisAttempt();

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].WriteNormalizedMeasure === true && this.Sequencer){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective === null){
                    this.Sequencer.AddGlobalObjective(maps[i].TargetObjectiveId, false, false, true, 0);
                }
                else{
                    globalObjective.MeasureStatus = true;
                    globalObjective.SetDirtyData();
                }

            }
        }
    }
    this.SetDirtyData();
}


function ActivityObjective_SetNormalizedMeasure(measure, activity){

    //if not unknown, and there is a write map, write to the global objective

    this.NormalizedMeasure = measure;

    if (this.MeasureStatus === true){        //only overwrite global data if the local data is known

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].WriteNormalizedMeasure === true && this.Sequencer){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective === null){
                    this.Sequencer.AddGlobalObjective(maps[i].TargetObjectiveId, false, false, true, measure);
                }
                else {
                    globalObjective.NormalizedMeasure = measure;
                    globalObjective.SetDirtyData();
                }
            }
        }
    }

    //if satisfied by measure is true, then the only way the objective can be satisifed is through a
    //score exceeding the mastery score, so make sure that when this happens, we set the progress and success status

    if (activity === null || activity === undefined){
        // Debug.AssertError("ERROR - activity must be passed into SetNormalizedMeasure");
    }

    if (this.GetSatisfiedByMeasure() === true &&
        (activity.IsActive() === false || activity.GetMeasureSatisfactionIfActive() === true)){

        var progressStatus = true;
        var satisfiedStatus;

        if (this.GetNormalizedMeasure(activity, false) >= this.GetMinimumSatisfiedNormalizedMeasure()){
            satisfiedStatus = true;
        }
        else{
            satisfiedStatus = false;
        }

        this.SetProgressStatus(progressStatus, true, activity);
        this.SetSatisfiedStatus(satisfiedStatus, true, activity);
    }

    if (this.ProgressStatus === true && this.FirstNormalizedMeasure == 0) {
        this.FirstNormalizedMeasure = measure;
    }

    this.SetDirtyData();
}



function ActivityObjective_SetProgressStatus(status, overrideSatByMeasureCheck, activity, progressStatusChangedDuringRuntime, isFromAutoSatisfiedProcess){

    if (activity === null || activity === undefined){
        // Debug.AssertError("ERROR - activity must be passed into SetMeasureStatus");
    }

    //if not unknown, and there is a write map, write to the global objective

    //if an objective is satisfied by measure, then it can ONLY be satisfied by measure
    if (this.GetSatisfiedByMeasure() === false || overrideSatByMeasureCheck === true){

        this.ProgressStatus = status;

        if (status === true)
        {
            activity.SetAttemptedDuringThisAttempt();
        }

        //For all learning standards other than SCORM 2004 4th Edition, we should always map globals if the progress status is "true"
        var shouldMapToGlobals = status;

        //4th ed change.  Map Unknown to global obj as well if it was explicitly set during runtime
        if (Control.Package.LearningStandard.is20044thOrGreater()) {
            shouldMapToGlobals = shouldMapToGlobals || (progressStatusChangedDuringRuntime === true);
        }

        if (shouldMapToGlobals) {

            var maps = this.Maps;

            for (var i=0; i < maps.length; i++){

                if (maps[i].WriteSatisfiedStatus === true && this.Sequencer){

                    var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                    if (globalObjective === null){
                        this.Sequencer.AddGlobalObjective(maps[i].TargetObjectiveId, status, false, false, 0);
                    }
                    else{
                        globalObjective.ProgressStatus = status;
                        globalObjective.SetDirtyData();
                    }

                }
            }
        }

        this.SetDirtyData();
    }
}


function ActivityObjective_SetSatisfiedStatus(status, overrideSatByMeasureCheck, activity){

    //if not unknown, and there is a write map, write to the global objective

    //if an objective is satisfied by measure, then it can ONLY be satisfied by measure
    if (this.GetSatisfiedByMeasure() === false || overrideSatByMeasureCheck === true){

        this.SatisfiedStatus = status;

        if (status === true && Control.Package.Properties.SatisfiedCausesCompletion === true) {
            activity.SetAttemptProgressStatus(true);
            activity.SetAttemptCompletionStatus(true);
        }

        if (this.ProgressStatus === true){        //only overwrite global data if the local data is known

            if (this.FirstSuccessTimestampUtc === null && status === true) {
                this.FirstSuccessTimestampUtc = ConvertDateToIso8601String(new Date());
            }

            var maps = this.Maps;

            for (var i=0; i < maps.length; i++){

                if (maps[i].WriteSatisfiedStatus === true && this.Sequencer){

                    var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                    if (globalObjective === null){
                        this.Sequencer.AddGlobalObjective(maps[i].TargetObjectiveId, true, status, false, 0);
                    }
                    else{
                        globalObjective.SatisfiedStatus = status;
                        globalObjective.SetDirtyData();
                    }
                }
            }
        }

        this.SetDirtyData();
    }
}

function ActivityObjective_GetSatisfiedByMeasure(){
    var satisfiedByMeasure = this.SatisfiedByMeasure;
    return satisfiedByMeasure;
}

function ActivityObjective_GetMinimumSatisfiedNormalizedMeasure(){
    var minimumMeasure = this.MinNormalizedMeasure;
    minimumMeasure = parseFloat(minimumMeasure);
    return minimumMeasure;
}


function ActivityObjective_GetProgressStatus(activity, canLookAtPreviousAttempt){

    if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined){
        // Debug.AssertError("ERROR - canLookAtPreviousAttempt must be passed into GetProgressStatus");
    }

    if (activity === null || activity === undefined){
        // Debug.AssertError ("ERROR - activity must be passed into ActivityObjective_GetProgressStatus");
    }
    //if unknown, and there is a read map, read from the global objective
    //activity is passed in to help determine if we should be overriding the satisfaction status using the measure value

    var progressStatus;

    //when evaluating sequencing rules, if there was a previous attempt, and the current activity hasn't been
    //attempted during the current attempt on the parent, use the previous attempt's data
    if (canLookAtPreviousAttempt === true && activity.WasAttemptedDuringThisAttempt() === false){
        progressStatus = this.PrevProgressStatus;
    }
    else{
        progressStatus = this.ProgressStatus;
    }

    //In SCORM 2004 2nd Edition, a local status overrides a global status. In 3rd Edition and later
    //the global value is always used, even if a local value is known.
    var useGlobalStatus = (progressStatus === false) || Control.Package.LearningStandard.is20043rdOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadSatisfiedStatus === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null){
                    progressStatus = globalObjective.ProgressStatus;
                }
            }
        }
    }

    //if SatisfiedByMeasure && (activity.Active == false or activity.MeasureSatisfactionIfActive == true)
    //    override the objective's satisfied status based on the measure value



    if (this.GetSatisfiedByMeasure() === true &&
        (activity.IsActive() === false || activity.GetMeasureSatisfactionIfActive() === true)){

        if (this.GetMeasureStatus(activity, canLookAtPreviousAttempt) === true){
            progressStatus = true;
        }
        else{
            progressStatus = false;
        }
    }


    return progressStatus;
}

function ActivityObjective_GetSatisfiedStatus(activity, canLookAtPreviousAttempt){

    if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined){
        // Debug.AssertError("ERROR - canLookAtPreviousAttempt must be passed into GetSatisfiedStatus");
        //canLookAtPreviousAttempt = false;
    }

    //if unknown, and there is a read map, read from the global objective
    //activity is passed in to help determine if we should be overriding the satisfaction status using the measure value

    var satisfiedStatus;
    var progressStatus;

    //when evaluating sequencing rules, if there was a previous attempt, and the current activity hasn't been
    //attempted during the current attempt on the parent, use the previous attempt's data
    if (canLookAtPreviousAttempt === true && activity.WasAttemptedDuringThisAttempt() === false){
        progressStatus = this.PrevProgressStatus;
        satisfiedStatus = this.PrevSatisfiedStatus;
    }
    else{
        progressStatus = this.ProgressStatus;
        satisfiedStatus = this.SatisfiedStatus;
    }

    //In SCORM 2004 2nd Edition, a local status overrides a global status. In 3rd Edition and later
    //the global value is always used, even if a local value is known.
    var useGlobalStatus = (progressStatus === false) || Control.Package.LearningStandard.is20043rdOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadSatisfiedStatus === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null && globalObjective.ProgressStatus === true){
                    satisfiedStatus = globalObjective.SatisfiedStatus;
                }

            }
        }
    }

    //if SatisfiedByMeasure && (activity.Active == false or activity.MeasureSatisfactionIfActive == true)
    //    override the objective's satisfied status based on the measure value

    if (activity === null || activity === undefined){
        // Debug.AssertError ("ERROR - activity must be passed into ActivityObjective_GetSatisfiedStatus");
    }
    else{
        if (this.GetSatisfiedByMeasure() === true &&
            (activity.IsActive() === false || activity.GetMeasureSatisfactionIfActive() === true)){

            if (this.GetMeasureStatus(activity, canLookAtPreviousAttempt) === true){
                if (this.GetNormalizedMeasure(activity, canLookAtPreviousAttempt) >= this.GetMinimumSatisfiedNormalizedMeasure()){
                    satisfiedStatus = true;
                }
                else{
                    satisfiedStatus = false;
                }
            }
        }
    }

    return satisfiedStatus;
}

function ActivityObjective_GetScoreRaw(){

    var returnValue = this.ScoreRaw;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadRawScore === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null && globalObjective.ScoreRaw !== null) {
                    returnValue = globalObjective.ScoreRaw;
                }
            }
        }
    }

    return returnValue;
}

function ActivityObjective_SetScoreRaw(scoreRaw){

    this.ScoreRaw = scoreRaw;

    if (scoreRaw !== null) {

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].WriteRawScore === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null){
                    globalObjective.ScoreRaw = scoreRaw;
                    globalObjective.SetDirtyData();
                }
            }
        }
    }

    this.SetDirtyData();
}

function ActivityObjective_GetScoreMin(){

    var returnValue = this.ScoreMin;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadMinScore === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null && globalObjective.ScoreMin !== null) {
                    returnValue = globalObjective.ScoreMin;
                }
            }
        }
    }

    return returnValue;
}

function ActivityObjective_SetScoreMin(scoreMin){

    this.ScoreMin = scoreMin;

    if (scoreMin !== null) {

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].WriteMinScore === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null){
                    globalObjective.ScoreMin = scoreMin;
                    globalObjective.SetDirtyData();
                }
            }
        }
    }

    this.SetDirtyData();
}

function ActivityObjective_GetScoreMax(){

    var returnValue = this.ScoreMax;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadMaxScore === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null && globalObjective.ScoreMax !== null) {
                    returnValue = globalObjective.ScoreMax;
                }
            }
        }
    }

    return returnValue;
}

function ActivityObjective_SetScoreMax(scoreMax){

    this.ScoreMax = scoreMax;

    if (scoreMax !== null) {

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].WriteMaxScore === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null){
                    globalObjective.ScoreMax = scoreMax;
                    globalObjective.SetDirtyData();
                }
            }
        }
    }

    this.SetDirtyData();
}

function ActivityObjective_GetCompletionStatus(activity, canLookAtPreviousAttempt){

    if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined){
        // Debug.AssertError("ERROR - canLookAtPreviousAttempt must be passed into GetCompletionStatus");
        //canLookAtPreviousAttempt = false;
    }

    if (activity === null || activity === undefined){
        // Debug.AssertError ("ERROR - activity must be passed into ActivityObjective_GetCompletionStatusValue");
    }

    var returnValue = this.CompletionStatus;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;
        var globalObjective;
        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadCompletionStatus === true){

                globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null) {
                    returnValue = globalObjective.CompletionStatus;
                }
            }
        }

    }

    return returnValue;
}

function ActivityObjective_GetCompletionStatusValue(activity, canLookAtPreviousAttempt){

    if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined){
        // Debug.AssertError("ERROR - canLookAtPreviousAttempt must be passed into GetCompletionStatusValue");
        //canLookAtPreviousAttempt = false;
    }
    if (activity === null || activity === undefined){
        // Debug.AssertError ("ERROR - activity must be passed into ActivityObjective_GetCompletionStatusValue");
    }

    var returnValue = this.CompletionStatusValue;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.GetMaps("ReadCompletionStatus", true);

        for (var i=0; i < maps.length; i++){

            var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

            if (globalObjective !== null) {
                returnValue = globalObjective.CompletionStatusValue;
            }
        }
    }


    return returnValue;
}

function ActivityObjective_SetCompletionStatus(completionStatus){

    this.CompletionStatus = completionStatus;


    var maps = this.GetMaps("WriteCompletionStatus", true);

    for (var i=0; i < maps.length; i++){

        var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

        if (globalObjective !== null){
            globalObjective.CompletionStatus = completionStatus;
            globalObjective.SetDirtyData();

        }
    }


    this.SetDirtyData();
}

function ActivityObjective_SetCompletionStatusValue(completionStatusValue){

    this.CompletionStatusValue = completionStatusValue;


    var maps = this.GetMaps("WriteCompletionStatus", true);

    for (var i=0; i < maps.length; i++){

        var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

        if (globalObjective !== null){
            globalObjective.CompletionStatusValue = completionStatusValue;
            globalObjective.SetDirtyData();
        }
    }


    this.SetDirtyData();
}

function ActivityObjective_GetProgressMeasureStatus(){

    var returnValue = this.ProgressMeasureStatus;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadProgressMeasure === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null) {
                    returnValue = globalObjective.ProgressMeasureStatus;
                }
            }
        }
    }

    return returnValue;
}

function ActivityObjective_GetProgressMeasure(){

    var returnValue = this.ProgressMeasure;

    var useGlobalStatus = Control.Package.LearningStandard.is20044thOrGreater();

    if (useGlobalStatus === true){

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].ReadProgressMeasure === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null && globalObjective.ProgressMeasureStatus !== false) {
                    returnValue = globalObjective.ProgressMeasure;
                }
            }
        }
    }

    return returnValue;
}

function ActivityObjective_SetProgressMeasureStatus(progressMeasureStatus){

    this.ProgressMeasureStatus = progressMeasureStatus;

    var maps = this.Maps;

    for (var i=0; i < maps.length; i++){

        if (maps[i].WriteProgressMeasure === true){

            var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

            if (globalObjective !== null){
                globalObjective.ProgressMeasureStatus = progressMeasureStatus;
                globalObjective.SetDirtyData();
            }
        }
    }


    this.SetDirtyData();
}

function ActivityObjective_SetProgressMeasure(progressMeasure){

    this.ProgressMeasure = progressMeasure;

    if (this.ProgressMeasureStatus === true) {

        var maps = this.Maps;

        for (var i=0; i < maps.length; i++){

            if (maps[i].WriteProgressMeasure === true){

                var globalObjective = this.Sequencer.GetGlobalObjectiveByIdentifier(maps[i].TargetObjectiveId);

                if (globalObjective !== null){
                    globalObjective.ProgressMeasure = progressMeasure;
                    globalObjective.SetDirtyData();
                }
            }
        }
    }

    this.SetDirtyData();
}

function ActivityObjective_GetIdentifier(){
    var identifier = this.Identifier;
    return identifier;
}


function ActivityObjective_GetMaps(mapType, mapTypeValue){
    var maps = this.Maps;

    if (maps.length > 0 && mapType !== null && mapType !== undefined){

        if (mapTypeValue === null && mapTypeValue === undefined)
            mapTypeValue = true;

        var mapSubset = new Array();
        for (var i=0; i < maps.length; i++){

            if (maps[i][mapType] === mapTypeValue){
                mapSubset[mapSubset.length] = maps[i];
            }
        }
        return mapSubset;

    }

    return maps;
}


function ActivityObjective_SetDirtyData(){
    this.DataState = DATA_STATE_DIRTY;
}

function ActivityObjective_SetSequencer(sequencer){
    this.Sequencer = sequencer;
}

function ActivityObjective_Clone(){

    var clone = new ActivityObjective (this.Identifier,
                                        this.ProgressStatus,
                                        this.SatisfiedStatus,
                                        this.MeasureStatus,
                                        this.NormalizedMeasure,
                                        this.Primary,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        this.ScoreRaw,
                                        this.ScoreMin,
                                        this.ScoreMax,
                                        this.CompletionStatus,
                                        this.CompletionStatusValue,
                                        this.ProgressMeasureStatus,
                                        this.ProgressMeasure);

    clone.SatisfiedByMeasure = this.SatisfiedByMeasure;
    clone.MinNormalizedMeasure = this.MinNormalizedMeasure;
    clone.CompletionStatusSetAtRuntime = this.CompletionStatusSetAtRuntime;

    clone.Maps = this.Maps;

    return clone;
}

function ActivityObjective_TearDown(){

    this.Identifier = null;
    this.ProgressStatus = null;
    this.SatisfiedStatus = null;
    this.MeasureStatus = null;
    this.NormalizedMeasure = null;
    this.ScoreRaw = null;
    this.ScoreMin = null;
    this.ScoreMax = null;
    this.CompletionStatus = null;
    this.CompletionStatusValue = null;
    this.ProgressMeasure = null;
    this.Primary = null;
    this.SatisfiedByMeasure = null;
    this.MinNormalizedMeasure = null;
    this.Maps = null;
    this.DataState = null;
    this.Sequencer = null;
    this.ProgressMeasureStatus = null;
    this.ProgressMeasure = null;
}

function ActivityObjective_GetSuccessStatusChangedDuringRuntime(activity){

    var rtObjective = activity.RunTime.FindObjectiveWithId(this.Identifier);

    if (rtObjective !== null){
        if (rtObjective.SuccessStatusChangedDuringRuntime === true){
            return true;
        }
    }

    return false;
}
