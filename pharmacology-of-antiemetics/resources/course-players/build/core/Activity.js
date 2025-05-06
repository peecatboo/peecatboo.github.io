;
(function() {
    Activity = function(
        DatabaseId,
        ItemIdentifier,
        ScormObjectDatabaseId,
        ActivityProgressStatus,
        ActivityAttemptCount,
        AttemptProgressStatus,
        AttemptCompletionAmountStatus,
        AttemptCompletionAmount,
        AttemptCompletionStatus,
        Active,
        Suspended,
        Included,
        Ordinal,
        SelectedChildren,
        RandomizedChildren,
        ActivityObjectives,
        RunTime,
        PrevAttemptProgressStatus,
        PrevAttemptCompletionStatus,
        AttemptedDuringThisAttempt,
        FirstCompletionTimestampUtc,
        ActivityStartTimestampUtc,
        AttemptStartTimestampUtc,
        ActivityAbsoluteDuration,
        AttemptAbsoluteDuration,
        ActivityExperiencedDurationTracked,
        AttemptExperiencedDurationTracked,
        ActivityExperiencedDurationReported,
        AttemptExperiencedDurationReported,
        AiccSessionId) {

        //this is here purely to make this object easier to identify in the Quick Watch debugger window. It is initialized by the activity repository.
        this.StringIdentifier = null;

        if (arguments.length > 1) {
            //data initialized from server
            this.DatabaseId = DatabaseId;
            this.ItemIdentifier = ItemIdentifier;
            this.ScormObjectDatabaseId = ScormObjectDatabaseId;

            this.ActivityProgressStatus = ActivityProgressStatus;
            this.ActivityAttemptCount = ActivityAttemptCount;
            this.AttemptProgressStatus = AttemptProgressStatus;
            this.AttemptCompletionAmountStatus = AttemptCompletionAmountStatus;
            this.AttemptCompletionAmount = AttemptCompletionAmount;
            this.AttemptCompletionStatus = AttemptCompletionStatus;
            this.Active = Active;
            this.Suspended = Suspended;
            this.Included = Included;
            this.Ordinal = Ordinal;
            this.SelectedChildren = SelectedChildren;
            this.RandomizedChildren = RandomizedChildren;

            this.ActivityObjectives = ActivityObjectives;
            this.RunTime = RunTime;

            this.PrevAttemptProgressStatus = PrevAttemptProgressStatus;
            this.PrevAttemptCompletionStatus = PrevAttemptCompletionStatus;
            this.AttemptedDuringThisAttempt = AttemptedDuringThisAttempt;

            this.FirstCompletionTimestampUtc = FirstCompletionTimestampUtc;

            // NOTE: these timestamps are stored as strings. Make sure they 'sort' correctly so that rollup works by simple
            // string comparison
            this.ActivityStartTimestampUtc = ActivityStartTimestampUtc;
            this.AttemptStartTimestampUtc = AttemptStartTimestampUtc;

            this.ActivityAbsoluteDuration = ActivityAbsoluteDuration;
            this.AttemptAbsoluteDuration = AttemptAbsoluteDuration;
            this.ActivityExperiencedDurationTracked = ActivityExperiencedDurationTracked;
            this.AttemptExperiencedDurationTracked = AttemptExperiencedDurationTracked;
            this.ActivityExperiencedDurationReported = ActivityExperiencedDurationReported;
            this.AttemptExperiencedDurationReported = AttemptExperiencedDurationReported;

            this.AiccSessionId = AiccSessionId;

            // If ActivityAbsoluteDuration is negative then we know that this registration launched
            // before support for these durations was available.  In this case the runtime never
            // sends back fields
            this.IsDurations = ConvertIso8601TimeSpanToHundredths(ActivityAbsoluteDuration) >= 0;
        } else { // JSON data
            //data initialized from server
            var data = arguments[0];
            this.DatabaseId = data.DatabaseId;
            this.ItemIdentifier = data.ItemIdentifier;
            this.ScormObjectDatabaseId = data.ScormObjectDatabaseId;

            this.ActivityProgressStatus = data.ActivityProgressStatus;
            this.ActivityAttemptCount = data.ActivityAttemptCount;
            this.AttemptProgressStatus = data.AttemptProgressStatus;
            this.AttemptCompletionAmountStatus = data.AttemptCompletionAmountStatus;
            this.AttemptCompletionAmount = data.AttemptCompletionAmount;
            this.AttemptCompletionStatus = data.AttemptCompletionStatus;
            this.Active = data.Active;
            this.Suspended = data.Suspended;
            this.Included = data.Included;
            this.Ordinal = data.Ordinal;
            this.SelectedChildren = data.SelectedChildren;
            this.RandomizedChildren = data.RandomizedChildren;

            this.ActivityObjectives = data.ActivityObjective.map(function (o) {
                return new ActivityObjective(o);
            });
            this.RunTime = data.RunTime ? new ActivityRunTime(data.RunTime) : null;

            this.PrevAttemptProgressStatus = data.PrevAttemptProgressStatus;
            this.PrevAttemptCompletionStatus = data.PrevAttemptCompletionStatus;
            this.AttemptedDuringThisAttempt = data.AttemptedDuringThisAttempt;

            this.FirstCompletionTimestampUtc = data.FirstCompletionTimestampUtc;

            // NOTE: these timestamps are stored as strings. Make sure they 'sort' correctly so that rollup works by simple
            // string comparison
            this.ActivityStartTimestampUtc = data.ActivityStartTimestampUtc;
            this.AttemptStartTimestampUtc = data.AttemptStartTimestampUtc;

            this.ActivityAbsoluteDuration = data.ActivityAbsoluteDuration;
            this.AttemptAbsoluteDuration = data.AttemptAbsoluteDuration;
            this.ActivityExperiencedDurationTracked = data.ActivityExperiencedDurationTracked;
            this.AttemptExperiencedDurationTracked = data.AttemptExperiencedDurationTracked;
            this.ActivityExperiencedDurationReported = data.ActivityExperiencedDurationReported;
            this.AttemptExperiencedDurationReported = data.AttemptExperiencedDurationReported;

            this.AiccSessionId = data.AiccSessionId;

            // If ActivityAbsoluteDuration is negative then we know that this registration launched
            // before support for these durations was available.  In this case the runtime never
            // sends back fields
            this.IsDurations = ConvertIso8601TimeSpanToHundredths(data.ActivityAbsoluteDuration) >= 0;
        }

        // set when we close out this acitivity.  Helpful when rolling up
        // durations to detect 'child activity last exited'
        this.ActivityEndedDate = null;

        //data initialized on client side
        this.Sequencer = null;
        this.LookAheadActivity = false;
        this.LearningObject = null;
        this.ParentActivity = null;
        this.ChildActivities = new Array(); //maintain as an array indexed by integers, int indicies are used by selection and randomization
        this.AvailableChildren = null;

        this.DataState = DATA_STATE_CLEAN;

        this.MenuItem = null;

        this.CachedPrimaryObjective = null;
        this.HiddenFromChoice = false;

        //used by the scorm 2004 look ahead sequencer
        this.HasSeqRulesRelevantToChoice = null;
        this.HasChildActivitiesDeliverableViaFlow = false;

        //indicates whether this activity has been shown to the end user, i.e, the sco/asset's initial html page has been shown
        this.LaunchedThisSession = false;
    };

    Activity.prototype.GetXml = Activity_GetXml;
    Activity.prototype.toString = Activity_toString;

    Activity.prototype.GetTitle = Activity_GetTitle;
    Activity.prototype.GetItemIdentifier = Activity_GetItemIdentifier;
    Activity.prototype.GetDatabaseIdentifier = Activity_GetDatabaseIdentifier;
    Activity.prototype.GetLaunchPath = Activity_GetLaunchPath;
    Activity.prototype.IsDeliverable = Activity_IsDeliverable;

    Activity.prototype.TransferRteDataToActivity = Activity_TransferRteDataToActivity;

    Activity.prototype.IsTheRoot = Activity_IsTheRoot;
    Activity.prototype.IsALeaf = Activity_IsALeaf;

    Activity.prototype.IsActive = Activity_IsActive;
    Activity.prototype.IsSuspended = Activity_IsSuspended;
    Activity.prototype.HasSuspendedChildren = Activity_HasSuspendedChildren;

    Activity.prototype.SetActive = Activity_SetActive;
    Activity.prototype.SetSuspended = Activity_SetSuspended;

    Activity.prototype.IsTracked = Activity_IsTracked;
    Activity.prototype.IsCompletionSetByContent = Activity_IsCompletionSetByContent;
    Activity.prototype.IsObjectiveSetByContent = Activity_IsObjectiveSetByContent;

    Activity.prototype.GetAttemptProgressStatus = Activity_GetAttemptProgressStatus;
    Activity.prototype.SetAttemptProgressStatus = Activity_SetAttemptProgressStatus;

    Activity.prototype.SetAttemptCompletionStatus = Activity_SetAttemptCompletionStatus;
    Activity.prototype.GetAttemptCompletionStatus = Activity_GetAttemptCompletionStatus;

    Activity.prototype.GetChildren = Activity_GetChildren;

    Activity.prototype.GetSequencingControlFlow = Activity_GetSequencingControlFlow;
    Activity.prototype.GetSequencingControlChoice = Activity_GetSequencingControlChoice;
    Activity.prototype.GetSequencingControlChoiceExit = Activity_GetSequencingControlChoiceExit;
    Activity.prototype.GetSequencingControlForwardOnly = Activity_GetSequencingControlForwardOnly;

    Activity.prototype.GetPreventActivation = Activity_GetPreventActivation;
    Activity.prototype.GetConstrainedChoice = Activity_GetConstrainedChoice;

    Activity.prototype.GetSelectionTiming = Activity_GetSelectionTiming;
    Activity.prototype.GetSelectionCountStatus = Activity_GetSelectionCountStatus;
    Activity.prototype.GetSelectionCount = Activity_GetSelectionCount;

    Activity.prototype.GetRandomizationTiming = Activity_GetRandomizationTiming;
    Activity.prototype.GetRandomizeChildren = Activity_GetRandomizeChildren;

    Activity.prototype.GetLimitConditionAttemptControl = Activity_GetLimitConditionAttemptControl;
    Activity.prototype.GetActivityProgressStatus = Activity_GetActivityProgressStatus;
    Activity.prototype.SetActivityProgressStatus = Activity_SetActivityProgressStatus;
    Activity.prototype.GetAttemptCount = Activity_GetAttemptCount;
    Activity.prototype.GetLimitConditionAttemptLimit = Activity_GetLimitConditionAttemptLimit;

    Activity.prototype.GetPreConditionRules = Activity_GetPreConditionRules;
    Activity.prototype.GetPostConditionRules = Activity_GetPostConditionRules;
    Activity.prototype.GetExitRules = Activity_GetExitRules;

    Activity.prototype.IsSatisfied = Activity_IsSatisfied;
    Activity.prototype.IsObjectiveStatusKnown = Activity_IsObjectiveStatusKnown;
    Activity.prototype.IsObjectiveMeasureKnown = Activity_IsObjectiveMeasureKnown;
    Activity.prototype.IsObjectiveMeasureGreaterThan = Activity_IsObjectiveMeasureGreaterThan;
    Activity.prototype.IsObjectiveMeasureLessThan = Activity_IsObjectiveMeasureLessThan;
    Activity.prototype.GetObjectiveMeasure = Activity_GetObjectiveMeasure;

    Activity.prototype.IsCompleted = Activity_IsCompleted;
    Activity.prototype.IsActivityProgressKnown = Activity_IsActivityProgressKnown;
    Activity.prototype.IsAttempted = Activity_IsAttempted;
    Activity.prototype.IsAttemptLimitExceeded = Activity_IsAttemptLimitExceeded;

    Activity.prototype.GetObjectives = Activity_GetObjectives;
    Activity.prototype.FindObjective = Activity_FindObjective;
    Activity.prototype.GetPrimaryObjective = Activity_GetPrimaryObjective;

    Activity.prototype.GetRollupObjectiveMeasureWeight = Activity_GetRollupObjectiveMeasureWeight;
    Activity.prototype.GetMeasureSatisfactionIfActive = Activity_GetMeasureSatisfactionIfActive;

    Activity.prototype.GetRollupRules = Activity_GetRollupRules;
    Activity.prototype.ApplyRollupRule = Activity_ApplyRollupRule;

    Activity.prototype.GetRollupObjectiveSatisfied = Activity_GetRollupObjectiveSatisfied;
    Activity.prototype.GetRequiredForSatisfied = Activity_GetRequiredForSatisfied;
    Activity.prototype.GetRequiredForNotSatisfied = Activity_GetRequiredForNotSatisfied;
    Activity.prototype.RollupProgressCompletion = Activity_RollupProgressCompletion;
    Activity.prototype.GetRequiredForCompleted = Activity_GetRequiredForCompleted;
    Activity.prototype.GetRequiredForIncomplete = Activity_GetRequiredForIncomplete;

    Activity.prototype.IncrementAttemptCount = Activity_IncrementAttemptCount;

    Activity.prototype.SetRandomizedChildren = Activity_SetRandomizedChildren;
    Activity.prototype.SetSelectedChildren = Activity_SetSelectedChildren;
    Activity.prototype.GetRandomizedChildren = Activity_GetRandomizedChildren;
    Activity.prototype.GetSelectedChildren = Activity_GetSelectedChildren;

    Activity.prototype.GetActivityListBetweenChildren = Activity_GetActivityListBetweenChildren;

    Activity.prototype.IsActivityAnAvailableChild = Activity_IsActivityAnAvailableChild;
    Activity.prototype.IsActivityAnAvailableDescendent = Activity_IsActivityAnAvailableDescendent;

    Activity.prototype.IsActivityTheLastAvailableChild = Activity_IsActivityTheLastAvailableChild;
    Activity.prototype.IsActivityTheFirstAvailableChild = Activity_IsActivityTheFirstAvailableChild;

    Activity.prototype.GetFirstAvailableChild = Activity_GetFirstAvailableChild;
    Activity.prototype.GetFirstAvailableDescendantLeaf = Activity_GetFirstAvailableDescendantLeaf;

    Activity.prototype.GetNextActivity = Activity_GetNextActivity;
    Activity.prototype.GetPreviousActivity = Actvity_GetPreviousActivity;


    Activity.prototype.InitializeAvailableChildren = Activity_InitializeAvailableChildren;
    Activity.prototype.GetAvailableChildren = Activity_GetAvailableChildren;
    //Activity.prototype.GetUnAvailableChildren = Activity_GetUnAvailableChildren;
    Activity.prototype.SetAvailableChildren = Activity_SetAvailableChildren;
    Activity.prototype.IsAvailable = Activity_IsAvailable;

    //Activity.prototype.InitializeObjectives = Activity_InitializeObjectives;
    Activity.prototype.InitializeForNewAttempt = Activity_InitializeForNewAttempt;
    Activity.prototype.ResetAttemptState = Activity_ResetAttemptState;

    Activity.prototype.RollupDurations = Activity_RollupDurations;

    Activity.prototype.SetDirtyData = Activity_SetDirtyData;
    Activity.prototype.IsAnythingDirty = Activity_IsAnythingDirty;

    Activity.prototype.MarkPostedObjectiveDataDirty = Activity_MarkPostedObjectiveDataDirty;
    Activity.prototype.MarkPostedObjectiveDataClean = Activity_MarkPostedObjectiveDataClean;
    Activity.prototype.MarkDirtyObjectiveDataPosted = Activity_MarkDirtyObjectiveDataPosted;

    Activity.prototype.SetSequencer = Activity_SetSequencer;
    Activity.prototype.Clone = Activity_Clone;
    Activity.prototype.TearDown = Activity_TearDown;

    Activity.prototype.DisplayInChoice = Activity_DisplayInChoice;
    Activity.prototype.SetHiddenFromChoice = Activity_SetHiddenFromChoice;

    Activity.prototype.SetLaunchedThisSession = Activity_SetLaunchedThisSession;
    Activity.prototype.WasLaunchedThisSession = Activity_WasLaunchedThisSession;

    Activity.prototype.SetAttemptedDuringThisAttempt = Activity_SetAttemptedDuringThisAttempt;
    Activity.prototype.WasAttemptedDuringThisAttempt = Activity_WasAttemptedDuringThisAttempt;

    Activity.prototype.GetMinProgressMeasure = Activity_GetMinProgressMeasure;
    Activity.prototype.GetCompletionProgressWeight = Activity_GetCompletionProgressWeight;
    Activity.prototype.GetCompletedByMeasure = Activity_GetCompletedByMeasure;

    Activity.prototype.GetAttemptCompletionAmount = Activity_GetAttemptCompletionAmount;
    Activity.prototype.SetAttemptCompletionAmount = Activity_SetAttemptCompletionAmount;

    Activity.prototype.GetAttemptCompletionAmountStatus = Activity_GetAttemptCompletionAmountStatus;
    Activity.prototype.SetAttemptCompletionAmountStatus = Activity_SetAttemptCompletionAmountStatus;

    Activity.prototype.GetCompletionStatusChangedDuringRuntime = Activity_GetCompletionStatusChangedDuringRuntime;
    Activity.prototype.GetSuccessStatusChangedDuringRuntime = Activity_GetSuccessStatusChangedDuringRuntime;

    Activity.prototype.GetActivityStartTimestampUtc = Activity_GetActivityStartTimestampUtc;
    Activity.prototype.SetActivityStartTimestampUtc = Activity_SetActivityStartTimestampUtc;
    Activity.prototype.GetAttemptStartTimestampUtc = Activity_GetAttemptStartTimestampUtc;
    Activity.prototype.SetAttemptStartTimestampUtc = Activity_SetAttemptStartTimestampUtc;

    Activity.prototype.GetActivityAbsoluteDuration = Activity_GetActivityAbsoluteDuration;
    Activity.prototype.SetActivityAbsoluteDuration = Activity_SetActivityAbsoluteDuration;
    Activity.prototype.GetAttemptAbsoluteDuration = Activity_GetAttemptAbsoluteDuration;
    Activity.prototype.SetAttemptAbsoluteDuration = Activity_SetAttemptAbsoluteDuration;
    Activity.prototype.GetActivityExperiencedDurationTracked = Activity_GetActivityExperiencedDurationTracked;
    Activity.prototype.SetActivityExperiencedDurationTracked = Activity_SetActivityExperiencedDurationTracked;
    Activity.prototype.GetAttemptExperiencedDurationTracked = Activity_GetAttemptExperiencedDurationTracked;
    Activity.prototype.SetAttemptExperiencedDurationTracked = Activity_SetAttemptExperiencedDurationTracked;
    Activity.prototype.GetActivityExperiencedDurationReported = Activity_GetActivityExperiencedDurationReported;
    Activity.prototype.SetActivityExperiencedDurationReported = Activity_SetActivityExperiencedDurationReported;
    Activity.prototype.GetAttemptExperiencedDurationReported = Activity_GetAttemptExperiencedDurationReported;
    Activity.prototype.SetAttemptExperiencedDurationReported = Activity_SetAttemptExperiencedDurationReported;


    Activity.prototype.UsesDefaultSatisfactionRollupRules = Activity_UsesDefaultSatisfactionRollupRules;
    Activity.prototype.UsesDefaultCompletionRollupRules = Activity_UsesDefaultCompletionRollupRules;

    function Activity_GetXml() {

        var ServerFormat = new ServerFormater();

        var xml = new XmlElement("A");

        xml.AddAttribute("DI", this.DatabaseId);
        xml.AddAttribute("II", this.ItemIdentifier);

        xml.AddAttribute("APS", ServerFormat.ConvertBoolean(this.ActivityProgressStatus));

        xml.AddAttribute("AAC", this.ActivityAttemptCount);

        xml.AddAttribute("AtPS", ServerFormat.ConvertBoolean(this.AttemptProgressStatus));
        xml.AddAttribute("ACS", ServerFormat.ConvertBoolean(this.AttemptCompletionStatus));

        xml.AddAttribute("ACAS", ServerFormat.ConvertBoolean(this.AttemptCompletionAmountStatus));
        xml.AddAttribute("ACA", this.AttemptCompletionAmount);

        xml.AddAttribute("A", ServerFormat.ConvertBoolean(this.Active));
        xml.AddAttribute("S", ServerFormat.ConvertBoolean(this.Suspended));
        xml.AddAttribute("I", ServerFormat.ConvertBoolean(this.Included));
        xml.AddAttribute("O", this.Ordinal);
        xml.AddAttribute("SC", ServerFormat.ConvertBoolean(this.SelectedChildren));
        xml.AddAttribute("RC", ServerFormat.ConvertBoolean(this.RandomizedChildren));

        xml.AddAttribute("PAPS", ServerFormat.ConvertBoolean(this.PrevAttemptProgressStatus));
        xml.AddAttribute("PACS", ServerFormat.ConvertBoolean(this.PrevAttemptCompletionStatus));
        xml.AddAttribute("ADTA", ServerFormat.ConvertBoolean(this.AttemptedDuringThisAttempt));

        if (this.FirstCompletionTimestampUtc !== null) {
            xml.AddAttribute("FCTU", this.FirstCompletionTimestampUtc);
        }

        // If ActivityAbsoluteDuration is negative then we know that this registration launched
        // before support for these durations was available.  In this case the runtime never
        // sends back fields
        if (this.IsDurations) {
            if (this.ActivityStartTimestampUtc !== null) {
                xml.AddAttribute("ASTU", this.ActivityStartTimestampUtc);
            }

            if (this.AttemptStartTimestampUtc !== null) {
                xml.AddAttribute("AtSTU", this.AttemptStartTimestampUtc);
            }

            xml.AddAttribute("AAD", ServerFormat.ConvertTimeSpan(this.ActivityAbsoluteDuration));
            xml.AddAttribute("AtAD", ServerFormat.ConvertTimeSpan(this.AttemptAbsoluteDuration));
            xml.AddAttribute("AEDT", ServerFormat.ConvertTimeSpan(this.ActivityExperiencedDurationTracked));
            xml.AddAttribute("AtEDT", ServerFormat.ConvertTimeSpan(this.AttemptExperiencedDurationTracked));
            xml.AddAttribute("AEDR", ServerFormat.ConvertTimeSpan(this.ActivityExperiencedDurationReported));
            xml.AddAttribute("AtEDR", ServerFormat.ConvertTimeSpan(this.AttemptExperiencedDurationReported));
        }

        for (var i = 0; i < this.ActivityObjectives.length; i++) {
            xml.AddElement(this.ActivityObjectives[i].GetXml(this.DatabaseId, i));
        }

        if (this.RunTime !== null) {
            xml.AddElement(this.RunTime.GetXml(this.DatabaseId));
        }

        //we're intentionally not getting the XML for all the child activities...only want to submit what is dirty and no more

        return xml.toString();
    }

    function Activity_toString() {
        var str = this.GetTitle() + " (" + this.GetItemIdentifier() + ")";
        return str;
    }

    function Activity_GetTitle() {
        return this.LearningObject.Title;
    }

    function Activity_GetItemIdentifier() {

        //In SCORM 1.1 / 1.2 if the item identifier is null or "" or something...we need this to be intelligent enough
        //to return the DB id or something to ensure that other functionality which depends on this (such as DIV names) doesn't break

        if (this.LearningObject.ItemIdentifier !== null && this.LearningObject.ItemIdentifier !== "") {
            return this.LearningObject.ItemIdentifier;
        } else {
            return this.DatabaseId;
        }

    }

    function Activity_GetDatabaseIdentifier() {
        return this.DatabaseId;
    }

    function Activity_GetLaunchPath() {

        return MergeQueryStringParameters(this.LearningObject.Href, this.LearningObject.Parameters);

        //return this.LearningObject.Href + this.LearningObject.Parameters;
    }

    function Activity_IsDeliverable() {

        return (this.RunTime !== null);
    }


    function Activity_TransferRteDataToActivity() {

        var objectives = this.GetObjectives();
        var rtObjective;
        var primaryObjective = this.GetPrimaryObjective();
        var primaryObjectiveProgressMeasureSet = false;
        var id;

        if (this.IsTracked()) {

            for (var i = 0; i < objectives.length; i++) {

                id = objectives[i].GetIdentifier();

                rtObjective = this.RunTime.FindObjectiveWithId(id);

                //rt.objective.success_status goes to seq.objective.objective satisfied status / seq.objective.objective progress status
                if (rtObjective !== null) {

                    //only save data to the activity tree if it was changed during this runtime session
                    //we don't want to resave this data to the activity tree if it doesn't change at runtime, that would give a
                    //local objective known status, even though it was populated from a global objective

                    if (rtObjective.SuccessStatusChangedDuringRuntime === true) {
                        if (rtObjective.SuccessStatus == SCORM_STATUS_UNKNOWN) {
                            objectives[i].SetProgressStatus(false, false, this, true);
                        } else if (rtObjective.SuccessStatus == SCORM_STATUS_PASSED) {
                            objectives[i].SetProgressStatus(true, false, this, true);
                            objectives[i].SetSatisfiedStatus(true, false, this);
                        } else if (rtObjective.SuccessStatus == SCORM_STATUS_FAILED) {
                            objectives[i].SetProgressStatus(true, false, this, true);
                            objectives[i].SetSatisfiedStatus(false, false, this);
                        } else {
                        }
                    }

                    if (rtObjective.MeasureChangedDuringRuntime === true) {
                        //objectives.score.scaled -> seq.objective measure status / seq.objective.normalized measure
                        if (rtObjective.ScoreScaled === null) {
                            objectives[i].SetMeasureStatus(false, this);
                        } else {
                            objectives[i].SetMeasureStatus(true, this);
                            objectives[i].SetNormalizedMeasure(rtObjective.ScoreScaled, this);
                        }
                    }

                    // Can we just blindly copy these properties
                    objectives[i].SetScoreRaw(rtObjective.ScoreRaw);
                    objectives[i].SetScoreMin(rtObjective.ScoreMin);
                    objectives[i].SetScoreMax(rtObjective.ScoreMax);

                    if (rtObjective.ProgressMeasureChangedDuringRuntime === true) {
                        if (primaryObjective.GetIdentifier() === id) {
                            primaryObjectiveProgressMeasureSet = true;
                            if (rtObjective.ProgressMeasure === null) {
                                this.SetAttemptCompletionAmountStatus(false);
                            } else {
                                this.SetAttemptCompletionAmountStatus(true);
                                this.SetAttemptCompletionAmount(rtObjective.ProgressMeasure);
                            }
                        }

                        if (rtObjective.ProgressMeasure === null) {
                            objectives[i].SetProgressMeasureStatus(false);
                        } else {
                            objectives[i].SetProgressMeasureStatus(true);
                            objectives[i].SetProgressMeasure(rtObjective.ProgressMeasure);
                        }
                    }

                    if (rtObjective.CompletionStatusChangedDuringRuntime === true) {

                        var objComplStatus = false;
                        var objComplStatusValue = false;

                        if (rtObjective.CompletionStatus == SCORM_STATUS_UNKNOWN) {
                            objComplStatus = false;
                        } else if (rtObjective.CompletionStatus == SCORM_STATUS_NOT_ATTEMPTED) {
                            objComplStatus = true;
                            objComplStatusValue = false;
                        } else if (rtObjective.CompletionStatus == SCORM_STATUS_COMPLETED) {
                            objComplStatus = true;
                            objComplStatusValue = true;
                        } else if (rtObjective.CompletionStatus == SCORM_STATUS_INCOMPLETE) {
                            objComplStatus = true;
                            objComplStatusValue = false;
                        } else if (rtObjective.CompletionStatus == SCORM_STATUS_BROWSED) {
                            objComplStatus = true;
                            objComplStatusValue = false;
                        } else {
                        }

                        objectives[i].SetCompletionStatus(objComplStatus);
                        if (objComplStatus === true) {
                            objectives[i].SetCompletionStatusValue(objComplStatusValue);
                        }

                        if (primaryObjective.GetIdentifier() === id) {
                            this.SetAttemptProgressStatus(objComplStatus);
                            if (objComplStatus === true) {
                                this.SetAttemptCompletionStatus(objComplStatusValue);
                            }
                        }
                    }

                } else {
                    if (id.length > 0) { //there might be a primary objective with no id in here
                    }
                }
            }



            //rt.success status goes to objective progress status, objective satisfied status

            var successStatus;
            var completionStatus;

            if (this.Sequencer.LookAhead === true) {
                successStatus = this.RunTime.LookAheadSuccessStatus;
                completionStatus = this.RunTime.LookAheadCompletionStatus;
            } else {
                successStatus = this.RunTime.SuccessStatus;
                completionStatus = this.RunTime.CompletionStatus;
            }

            if (successStatus == SCORM_STATUS_UNKNOWN) {
                primaryObjective.SetProgressStatus(false, false, this);
            } else if (successStatus == SCORM_STATUS_PASSED) {
                primaryObjective.SetProgressStatus(true, false, this);
                primaryObjective.SetSatisfiedStatus(true, false, this);


            } else if (successStatus == SCORM_STATUS_FAILED) {
                primaryObjective.SetProgressStatus(true, false, this);
                primaryObjective.SetSatisfiedStatus(false, false, this);

            } else {
            }

            //Don't transfer score data if the score is zero and and the rudamentary rollup says not to count zero
            //scores.  By utilizing the package property here, we prevent the zero scores from getting onto the objective data.
            if (this.RunTime.ScoreRaw == 0 && Control.Package.Properties.ScoreRollupMode == SCORE_ROLLUP_METHOD_AVERAGE_SCORE_OF_ALL_UNITS_WITH_NONZERO_SCORES) {
                // Do nothing with score
            } else if (this.RunTime.ScoreScaled === null) {
                //rt.score.scaled goes to objective measure status / objective normalized measure
                primaryObjective.SetMeasureStatus(false, this);

                if (Control.Package.Properties.ScaleRawScore == true) {
                    var normalizedScore = NormalizeRawScore(this.RunTime.ScoreRaw, this.RunTime.ScoreMin, this.RunTime.ScoreMax);
                    if (normalizedScore !== null && normalizedScore !== undefined) {
                        primaryObjective.SetMeasureStatus(true, this);
                        primaryObjective.SetNormalizedMeasure(normalizedScore, this);
                    } else {
                    }
                }
                //if scalerawscore property is true
                //if runtime.scoreraw is not null
                //normalize / scale raw score if possible
                //if was able to normalize raw score
                //set measure status to true
                //set normalized measure to normalized raw score
                // if not able to normalize score write warning to debug log
            } else {
                primaryObjective.SetMeasureStatus(true, this);
                primaryObjective.SetNormalizedMeasure(this.RunTime.ScoreScaled, this);
            }

            // Can we just blindly copy these properties
            primaryObjective.SetScoreRaw(this.RunTime.ScoreRaw);
            primaryObjective.SetScoreMin(this.RunTime.ScoreMin);
            primaryObjective.SetScoreMax(this.RunTime.ScoreMax);

            if (this.RunTime.ProgressMeasure === null) {
                if (primaryObjectiveProgressMeasureSet !== true) {
                    this.SetAttemptCompletionAmountStatus(false);
                    primaryObjective.SetProgressMeasureStatus(false);
                }
            } else {
                this.SetAttemptCompletionAmountStatus(true);
                this.SetAttemptCompletionAmount(this.RunTime.ProgressMeasure);

                primaryObjective.SetProgressMeasureStatus(true);
                primaryObjective.SetProgressMeasure(this.RunTime.ProgressMeasure);
            }

            var attemptProgressStatus = false;
            var attemptCompletionStatus = false;

            //jmh - 05/17/2011 - There appears to be instances where this flag is false yet we actually need to transfer RT status
            //                   to the Activity data.  What's the problem with always doing this?  It appears this check was put
            //                   in place specifically to handle a 4th edition requirement so only using the flag in that case.
            if (Control.Package.LearningStandard.is20044thOrGreater() === false || this.RunTime.CompletionStatusChangedDuringRuntime === true) {

                //completion status -> AttemptProgressStatus / AttemptCompletionStatus
                if (completionStatus == SCORM_STATUS_UNKNOWN) {
                    attemptProgressStatus = false;
                    attemptCompletionStatus = false;

                } else if (completionStatus == SCORM_STATUS_NOT_ATTEMPTED) {
                    attemptProgressStatus = true;
                    attemptCompletionStatus = false;
                } else if (completionStatus == SCORM_STATUS_COMPLETED) {
                    attemptProgressStatus = true;
                    attemptCompletionStatus = true;
                } else if (completionStatus == SCORM_STATUS_INCOMPLETE) {
                    attemptProgressStatus = true;
                    attemptCompletionStatus = false;

                } else if (completionStatus == SCORM_STATUS_BROWSED) {
                    attemptProgressStatus = true;
                    attemptCompletionStatus = false;
                } else {
                }

                this.SetAttemptProgressStatus(attemptProgressStatus);
                if (attemptProgressStatus === true) {
                    this.SetAttemptCompletionStatus(attemptCompletionStatus);
                }
            }

            if (this.LookAheadActivity === false) {
                //make sure that all this get committed
                this.SetDirtyData();
            }
        } else {
        }
    }

    function Activity_IsTheRoot() {

        var parentActivity = this.ParentActivity;

        var activityIsRoot = (parentActivity === null);

        return activityIsRoot;
    }

    function Activity_IsALeaf() {
        if (this.ChildActivities.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    function Activity_IsActive() {
        var active;

        active = this.Active;

        return active;
    }

    function Activity_IsSuspended() {
        var suspended;

        suspended = this.Suspended;

        return suspended;
    }

    function Activity_HasSuspendedChildren() {

        var children = this.GetChildren();

        for (var i = 0; i < children.length; i++) {
            if (children[i].IsSuspended()) {
                return true;
            }
        }

        return false;
    }

    function Activity_SetActive(active) {
        this.Active = active;
        this.SetDirtyData();
    }

    function Activity_SetSuspended(suspended) {
        this.Suspended = suspended;
        this.SetDirtyData();
    }

    function Activity_IsTracked() {
        var tracked = this.LearningObject.SequencingData.Tracked;

        return tracked;
    }

    function Activity_IsCompletionSetByContent() {
        var completionSet = false;
        if (Control.Package.Properties.ForceObjectiveCompletionSetByContent == true) {
            completionSet = true;
        } else {
            completionSet = this.LearningObject.SequencingData.CompletionSetByContent;
        }

        return completionSet;
    }

    function Activity_IsObjectiveSetByContent() {
        var objectiveSet = false;
        if (Control.Package.Properties.ForceObjectiveCompletionSetByContent == true) {
            objectiveSet = true;
        } else {
            objectiveSet = this.LearningObject.SequencingData.ObjectiveSetByContent;
        }

        return objectiveSet;
    }

    function Activity_GetAttemptProgressStatus() {

        if (this.IsTracked() === false) {
            return false;
        }

        var attemptProgressStatus = this.AttemptProgressStatus;
        return attemptProgressStatus;
    }

    function Activity_SetAttemptProgressStatus(value) {

        this.AttemptProgressStatus = value;

        if (value === true) {
            this.SetAttemptedDuringThisAttempt();
        }

        var primaryObjective = this.GetPrimaryObjective();
        primaryObjective.SetCompletionStatus(value);

        this.SetDirtyData();
    }

    function Activity_SetAttemptCompletionStatus(value) {

        if (this.FirstCompletionTimestampUtc === null && value === true) {
            this.FirstCompletionTimestampUtc = ConvertDateToIso8601String(new Date());
        }

        this.AttemptCompletionStatus = value;

        var primaryObjective = this.GetPrimaryObjective();
        primaryObjective.SetCompletionStatusValue(value);

        this.SetDirtyData();
    }

    function Activity_GetAttemptCompletionStatus() {
        if (this.IsTracked() === false) {
            return false;
        }

        var attemptCompletionStatus = this.AttemptCompletionStatus;
        return attemptCompletionStatus;
    }

    function Activity_GetChildren() {
        return this.ChildActivities;
    }

    function Activity_GetSequencingControlFlow() {
        var controlFlow = this.LearningObject.SequencingData.ControlFlow;
        return controlFlow;
    }

    function Activity_GetSequencingControlChoice() {
        var controlChoice = this.LearningObject.SequencingData.ControlChoice;
        return controlChoice;
    }


    function Activity_GetSequencingControlChoiceExit() {
        var controlChoiceExit = this.LearningObject.SequencingData.ControlChoiceExit;
        return controlChoiceExit;
    }

    function Activity_GetSequencingControlForwardOnly() {
        var controlForwardOnly = this.LearningObject.SequencingData.ControlForwardOnly;
        return controlForwardOnly;
    }

    function Activity_GetPreventActivation() {
        var preventActivation = this.LearningObject.SequencingData.PreventActivation;
        return preventActivation;
    }

    function Activity_GetConstrainedChoice() {
        var constrainedChoice = this.LearningObject.SequencingData.ConstrainChoice;
        return constrainedChoice;
    }

    function Activity_GetSelectionTiming() {
        var timing = this.LearningObject.SequencingData.SelectionTiming;
        return timing;
    }

    function Activity_GetSelectionCountStatus() {
        var status = this.LearningObject.SequencingData.SelectionCountStatus;
        return status;
    }

    function Activity_GetSelectionCount() {
        var count = this.LearningObject.SequencingData.SelectionCount;
        return count;
    }

    function Activity_GetRandomizationTiming() {
        var timing = this.LearningObject.SequencingData.RandomizationTiming;
        return timing;
    }

    function Activity_GetRandomizeChildren() {
        var randomize = this.LearningObject.SequencingData.RandomizeChildren;
        return randomize;
    }


    function Activity_GetLimitConditionAttemptControl() {
        var control = this.LearningObject.SequencingData.LimitConditionAttemptControl;
        return control;
    }

    function Activity_GetActivityProgressStatus() {
        if (this.IsTracked() === false) {
            return false;
        }

        var progressData = this.ActivityProgressStatus;
        return progressData;
    }

    function Activity_SetActivityProgressStatus(status) {
        this.ActivityProgressStatus = status;
        this.SetDirtyData();
    }

    function Activity_GetAttemptCount() {
        var attemptCount = this.ActivityAttemptCount;
        return attemptCount;
    }

    function Activity_GetLimitConditionAttemptLimit() {
        var attemptLimit = this.LearningObject.SequencingData.LimitConditionAttemptLimit;
        return attemptLimit;
    }

    function Activity_GetPreConditionRules() {
        var rules = this.LearningObject.SequencingData.PreConditionSequencingRules;
        return rules;
    }

    function Activity_GetPostConditionRules() {
        var rules = this.LearningObject.SequencingData.PostConditionSequencingRules;
        return rules;
    }

    function Activity_GetExitRules() {
        var rules = this.LearningObject.SequencingData.ExitSequencingRules;
        return rules;
    }

    function Activity_IsSatisfied(referencedObjective, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
            canLookAtPreviousAttempt = false; //don't throw an error because this is called from integrations that were in place before we added this parameter for 3rd Edition
        }

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        var objective;

        if (referencedObjective === "" || referencedObjective === undefined || referencedObjective === null) {
            objective = this.GetPrimaryObjective();
        } else {
            objective = this.FindObjective(referencedObjective);
        }

        if (objective === null || objective === undefined) {
        }

        if (objective.GetProgressStatus(this, canLookAtPreviousAttempt) === true) {

            if (objective.GetSatisfiedStatus(this, canLookAtPreviousAttempt) === true) {
                return true;
            } else {
                return false;
            }

        } else {
            return RESULT_UNKNOWN;
        }

    }

    function Activity_IsObjectiveStatusKnown(referencedObjective, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
        }

        if (this.IsTracked() === false) {
            return false;
        }

        var objective = this.FindObjective(referencedObjective);

        if (objective.GetProgressStatus(this, canLookAtPreviousAttempt) === true) {
            return true;
        } else {
            return false;
        }
    }

    function Activity_IsObjectiveMeasureKnown(referencedObjective, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
        }

        if (this.IsTracked() === false) {
            return false;
        }

        var objective = this.FindObjective(referencedObjective);

        //change made to be consistent with Addendum 3.4 of SCORM 2004 2nd Edition
        //if (objective.GetProgressStatus(this) === true && objective.GetMeasureStatus() === true){
        if (objective.GetMeasureStatus(this, canLookAtPreviousAttempt) === true) {
            return true;
        } else {
            return false;
        }
    }


    function Activity_IsObjectiveMeasureGreaterThan(referencedObjective, measureThreshold, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
        }

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        var objective = this.FindObjective(referencedObjective);

        if (objective.GetMeasureStatus(this, canLookAtPreviousAttempt) === true) {
            if (objective.GetNormalizedMeasure(this, canLookAtPreviousAttempt) > measureThreshold) {
                return true;
            } else {
                return false;
            }
        } else {
            return RESULT_UNKNOWN;
        }
    }

    function Activity_IsObjectiveMeasureLessThan(referencedObjective, measureThreshold, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
        }

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        var objective = this.FindObjective(referencedObjective);


        if (objective.GetMeasureStatus(this, canLookAtPreviousAttempt) === true) {
            if (objective.GetNormalizedMeasure(this, canLookAtPreviousAttempt) < measureThreshold) {
                return true;
            } else {
                return false;
            }
        } else {
            return RESULT_UNKNOWN;
        }
    }

    function Activity_GetObjectiveMeasure(canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
        }

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        var objective = this.GetPrimaryObjective();

        if (objective.GetMeasureStatus(this, canLookAtPreviousAttempt) === true) {
            return objective.GetNormalizedMeasure(this, canLookAtPreviousAttempt);
        } else {
            return RESULT_UNKNOWN;
        }
    }

    function Activity_IsCompleted(referencedObjective, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
            canLookAtPreviousAttempt = false; //don't throw an error because this is called from integrations that were in place before we added this parameter for 3rd Edition
        }

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        var useObjectiveValues = false;
        var useProgressMeasureValues = false;

        if (Control.Package.LearningStandard.is20044thOrGreater()) {
            useObjectiveValues = true;
        }

        if (Control.Package.LearningStandard.is20044thOrGreater() === true && this.GetCompletedByMeasure() === true) {
            useProgressMeasureValues = true;
        }

        var attemptProgressStatus;
        var attemptCompletionStatus;
        var progressMeasureStatus;
        var progressMeasure;

        var objective = null;

        if (useObjectiveValues === true && referencedObjective !== "" && referencedObjective !== undefined && referencedObjective !== null) {
            objective = this.FindObjective(referencedObjective);
            if (objective === null || objective === undefined) {
            }
        }

        //first, try the referenced objective
        if (useObjectiveValues === true && objective !== null && objective !== undefined) {
            attemptProgressStatus = objective.GetCompletionStatus(this, canLookAtPreviousAttempt);
            attemptCompletionStatus = objective.GetCompletionStatusValue(this, canLookAtPreviousAttempt);

            if (useProgressMeasureValues === true) {
                progressMeasureStatus = objective.GetProgressMeasureStatus();
                progressMeasure = objective.GetProgressMeasure();
            }

        } else {
            //next, try the primary objective if there are readCompletion maps
            var primaryObjective = this.GetPrimaryObjective();
            var readCompletionMaps = primaryObjective.GetMaps("ReadCompletionStatus", true);

            if (useObjectiveValues === true && readCompletionMaps.length > 0) {
                attemptProgressStatus = primaryObjective.GetCompletionStatus(this, canLookAtPreviousAttempt);
                attemptCompletionStatus = primaryObjective.GetCompletionStatusValue(this, canLookAtPreviousAttempt);

                if (useProgressMeasureValues === true) {
                    progressMeasureStatus = primaryObjective.GetProgressMeasureStatus();
                    progressMeasure = primaryObjective.GetProgressMeasure();
                }

            } else {
                //otherwise, use the activity completion status

                //when evaluating sequencing rules, if there was a previous attempt, and the current activity hasn't been
                //attempted during the current attempt on the parent, use the previous attempt's data
                if (canLookAtPreviousAttempt === true && this.WasAttemptedDuringThisAttempt() === false) {
                    attemptProgressStatus = this.PrevAttemptProgressStatus;
                    attemptCompletionStatus = this.PrevAttemptCompletionStatus;
                } else {
                    attemptProgressStatus = this.AttemptProgressStatus;
                    attemptCompletionStatus = this.AttemptCompletionStatus;
                }

                if (useProgressMeasureValues === true) {
                    progressMeasureStatus = this.GetAttemptCompletionAmountStatus();
                    progressMeasure = this.GetAttemptCompletionAmount();
                }
            }
        }

        if (useProgressMeasureValues === true &&
            (this.IsActive() === false || this.GetMeasureSatisfactionIfActive() === true)) {

            if (progressMeasureStatus === true) {
                if (progressMeasure >= this.GetMinProgressMeasure()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return RESULT_UNKNOWN;
            }
        }

        if (attemptProgressStatus === true) {
            if (attemptCompletionStatus === true) {
                return true;
            } else {
                return false;
            }
        } else {
            return RESULT_UNKNOWN;
        }

    }

    function Activity_IsActivityProgressKnown(referencedObjective, canLookAtPreviousAttempt) {

        if (canLookAtPreviousAttempt === null || canLookAtPreviousAttempt === undefined) {
            //canLookAtPreviousAttempt = false;
        }

        if (this.IsTracked() === false) {
            return false;
        }

        var useObjectiveValues = false;

        if (Control.Package.LearningStandard.is20044thOrGreater()) {
            useObjectiveValues = true;
        }

        var activityProgressStatus = this.ActivityProgressStatus;
        var attemptProgressStatus;
        var progressMeasureStatus;
        var objective = null;

        if (Control.Package.LearningStandard.is20044thOrGreater() === true && this.GetCompletedByMeasure() === true) {
            attemptProgressStatus = this.GetAttemptCompletionAmountStatus();
        } else {

            if (useObjectiveValues === true && referencedObjective !== "" && referencedObjective !== undefined && referencedObjective !== null) {
                objective = this.FindObjective(referencedObjective);

                if (objective === null || objective === undefined) {
                }
            }

            if (useObjectiveValues === true && objective !== null && objective !== undefined) {

                attemptProgressStatus = objective.GetCompletionStatus(this, canLookAtPreviousAttempt);

            } else {
                //next, try the primary objective if there are readCompletion maps
                var primaryObjective = this.GetPrimaryObjective();
                var readCompletionMaps = primaryObjective.GetMaps("ReadCompletionStatus", true);

                if (useObjectiveValues === true && readCompletionMaps.length > 0) {

                    attemptProgressStatus = primaryObjective.GetCompletionStatus(this, canLookAtPreviousAttempt);

                } else {

                    if (canLookAtPreviousAttempt === true && this.WasAttemptedDuringThisAttempt() === false) {
                        attemptProgressStatus = this.PrevAttemptProgressStatus;

                    } else {
                        attemptProgressStatus = this.AttemptProgressStatus;
                    }
                }
            }
        }

        if (useObjectiveValues === true) {
            return attemptProgressStatus;
        } else {
            return (attemptProgressStatus === true && activityProgressStatus === true) ? true : false;
        }
    }

    function Activity_IsAttempted() {

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        if (this.ActivityProgressStatus === true || Control.Package.LearningStandard.is20044thOrGreater() === true) {

            if (this.GetAttemptCount() > 0) {
                return true;
            }
        } else {
            return RESULT_UNKNOWN;
        }

        return false;
    }


    function Activity_IsAttemptLimitExceeded() {

        if (this.IsTracked() === false) {
            return RESULT_UNKNOWN;
        }

        //[UP.1]2. If the Activity is Active for the activity is True Or the Activity is Suspended for the activity is True Then (Only need to check activities that will begin a new attempt)
        if (this.IsActive() || this.IsSuspended()) {
            return false;
        }
        //TODO - if LimitConditionAttemptControl === false, do we return false or unknown? is it unknown b/c (true && unknown) == unknown?

        if (this.ActivityProgressStatus === true) {

            if (this.GetLimitConditionAttemptControl() === true) {

                if (this.GetAttemptCount() >= this.GetLimitConditionAttemptLimit()) {
                    return true;
                }
            }
        } else {
            return RESULT_UNKNOWN;
        }

        return false;
    }

    function Activity_GetObjectives() {
        return this.ActivityObjectives;
    }

    function Activity_FindObjective(objectiveIdentifier) {

        //if the identifer is null or "", returns the primaryObjective

        var objectives = this.GetObjectives();

        for (var i = 0; i < objectives.length; i++) {

            if (objectiveIdentifier === "" || objectiveIdentifier === null) {
                if (objectives[i].GetContributesToRollup() === true) {
                    return objectives[i];
                }
            } else {
                if (objectives[i].GetIdentifier() == objectiveIdentifier) {
                    return objectives[i];
                }
            }
        }

        return null;
    }


    function Activity_GetPrimaryObjective() {

        if (this.CachedPrimaryObjective === null) {
            var targetObjective = null;

            var objectives = this.GetObjectives();
            for (var i = 0; i < objectives.length; i++) {

                if (objectives[i].GetContributesToRollup() === true) {

                    targetObjective = objectives[i];

                    break;
                }
            }

            this.CachedPrimaryObjective = targetObjective;
        }

        if (this.CachedPrimaryObjective === null) {
        }

        return this.CachedPrimaryObjective;
    }

    function Activity_GetRollupObjectiveMeasureWeight() {

        var weight = this.LearningObject.SequencingData.RollupObjectiveMeasureWeight;
        weight = parseFloat(weight);

        return weight;
    }

    function Activity_GetMeasureSatisfactionIfActive() {
        var measureSatisfiaction = this.LearningObject.SequencingData.MeasureSatisfactionIfActive;
        return measureSatisfiaction;
    }

    function Activity_GetRollupRules() {
        var rules = this.LearningObject.SequencingData.RollupRules;
        return rules;
    }

    function Activity_ApplyRollupRule(newRollupRule) {

        if (newRollupRule.Action == RULE_SET_SATISFIED || newRollupRule.Action == RULE_SET_NOT_SATISFIED) {
            this.LearningObject.UsesDefaultSatisfactionRollupRules = true;
        } else {
            this.LearningObject.UsesDefaultCompletionRollupRules = true;
        }

        var newRuleIdx = this.LearningObject.SequencingData.RollupRules.length;
        this.LearningObject.SequencingData.RollupRules[newRuleIdx] = newRollupRule;
    }

    function Activity_GetRollupObjectiveSatisfied() {
        var rollupObjectiveSatisfied = this.LearningObject.SequencingData.RollupObjectiveSatisfied;
        return rollupObjectiveSatisfied;
    }

    function Activity_GetRequiredForSatisfied() {
        var requiredForSatisfied = this.LearningObject.SequencingData.RequiredForSatisfied;
        return requiredForSatisfied;
    }

    function Activity_GetRequiredForNotSatisfied() {
        var requiredForNotSatisfied = this.LearningObject.SequencingData.RequiredForNotSatisfied;
        return requiredForNotSatisfied;
    }

    function Activity_RollupProgressCompletion() {
        var rollupProgressCompletion = this.LearningObject.SequencingData.RollupProgressCompletion;
        return rollupProgressCompletion;
    }

    function Activity_GetRequiredForCompleted() {
        var requiredForCompelted = this.LearningObject.SequencingData.RequiredForCompleted;
        return requiredForCompelted;
    }

    function Activity_GetRequiredForIncomplete() {
        var requiredForIncomplete = this.LearningObject.SequencingData.RequiredForIncomplete;
        return requiredForIncomplete;
    }

    function Activity_IncrementAttemptCount() {
        this.ActivityAttemptCount++;
    }

    function Activity_SetRandomizedChildren(value) {
        this.RandomizedChildren = value;
        this.SetDirtyData();
    }

    function Activity_SetSelectedChildren(value) {
        this.SelectedChildren = value;
        this.SetDirtyData();
    }

    function Activity_GetRandomizedChildren() {
        var randomized = this.RandomizedChildren;
        return randomized;
    }

    function Activity_GetSelectedChildren() {
        var selected = this.SelectedChildren;
        return selected;
    }

    function Activity_GetActivityListBetweenChildren(startActivity, endActivity, includeEndActivity) {

        var activityList = this.GetAvailableChildren();
        var aryReturn = new Array();

        var startActivityIndex = null;
        var endActivityIndex = null;

        for (var i = 0; i < activityList.length; i++) {
            if (startActivity == activityList[i]) {
                startActivityIndex = i;
            }

            if (endActivity == activityList[i]) {
                endActivityIndex = i;
            }
        }

        if (startActivityIndex == endActivityIndex) {
            if (includeEndActivity) {
                aryReturn[0] = activityList[startActivityIndex];
            }
        } else if (startActivityIndex < endActivityIndex) {
            if (includeEndActivity) {
                endActivityIndex++;
            }
            aryReturn = activityList.slice(startActivityIndex, endActivityIndex);
        } else if (startActivityIndex > endActivityIndex) {
            if (!includeEndActivity) {
                endActivityIndex++;
            }

            aryReturn = activityList.slice(endActivityIndex, startActivityIndex + 1);
        }

        return aryReturn;
    }


    function Activity_IsActivityAnAvailableChild(activity) {
        var availableChildren = this.GetAvailableChildren();

        for (var i = 0; i < availableChildren.length; i++) {
            if (availableChildren[i] == activity) {
                return true;
            }
        }

        return false;
    }

    function Activity_IsActivityAnAvailableDescendent(activityToFind) {

        return Activity_SearchAllAvailableDescendents(this, activityToFind);

    }

    function Activity_SearchAllAvailableDescendents(activityToSearch, activityToFind) {

        var availableChildren = activityToSearch.GetAvailableChildren();

        for (var i = 0; i < availableChildren.length; i++) {

            if (availableChildren[i] == activityToFind) {
                return true;
            }

            if (Activity_SearchAllAvailableDescendents(availableChildren[i], activityToFind)) {
                return true;
            }

        }

        return false;
    }

    function Activity_IsActivityTheLastAvailableChild(activity) {

        var availableChildren = this.GetAvailableChildren();

        if (availableChildren[availableChildren.length - 1] == activity) {
            return true;
        }

        return false;
    }

    function Activity_IsActivityTheFirstAvailableChild(activity) {

        var availableChildren = this.GetAvailableChildren();

        if (availableChildren[0] == activity) {
            return true;
        }

        return false;
    }

    function Activity_GetFirstAvailableChild() {
        var availableChildren = this.GetAvailableChildren();
        return availableChildren[0];
    }

    function Activity_GetFirstAvailableDescendantLeaf() {
        var availableChildren = this.GetAvailableChildren();
        for (var i = 0; i < availableChildren.length; i++) {
            if (availableChildren[i].IsALeaf()) {
                return availableChildren[i];
            } else {
                var leafActivity = availableChildren[i].GetFirstAvailableDescendantLeaf();
                if (leafActivity) {
                    return leafActivity;
                }
            }
        }
        return null;
    }

    function Activity_GetNextActivity(currentActivity) {

        var currentActivityIndex = null;

        var parentActivity = currentActivity.ParentActivity;
        var availableChildren = parentActivity.GetAvailableChildren();

        for (var i = 0; i < availableChildren.length; i++) {
            if (availableChildren[i] == currentActivity) {
                currentActivityIndex = i;
                break;
            }
        }

        if (currentActivityIndex !== null && currentActivityIndex < (availableChildren.length - 1)) {
            return availableChildren[currentActivityIndex + 1];
        }

        return null;
    }

    function Actvity_GetPreviousActivity(currentActivity) {

        var currentActivityIndex = null;

        var parentActivity = currentActivity.ParentActivity;
        var availableChildren = parentActivity.GetAvailableChildren();

        for (var i = 0; i < availableChildren.length; i++) {
            if (availableChildren[i] == currentActivity) {
                currentActivityIndex = i;
                break;
            }
        }

        if (currentActivityIndex !== null && currentActivityIndex > 0) {
            return availableChildren[currentActivityIndex - 1];
        }

        return null;
    }


    function Activity_InitializeAvailableChildren() {

        //go through and find all the children that are included
        //if none are included, then include them all

        var allChildren = this.GetChildren();
        var includedChildren = new Array();

        for (var i = 0; i < allChildren.length; i++) {
            if (allChildren[i].Included === true) {
                includedChildren[includedChildren.length] = allChildren[i];
            }
        }

        if (includedChildren.length === 0) {
            this.SetAvailableChildren(allChildren);
        } else {
            //sort the array based on the values of the ordinals
            includedChildren.sort(
                function(activity1, activity2) {
                    var ordinal1 = activity1.Ordinal;
                    var ordinal2 = activity2.Ordinal;

                    if (ordinal1 < ordinal2)
                        return -1;
                    if (ordinal1 > ordinal2)
                        return 1;
                    return 0;
                }
            );
            this.SetAvailableChildren(includedChildren);
        }

    }

    function Activity_GetAvailableChildren() {

        //we can't initialize these in the constructor because the constructor relies on the ObjectRepository being populated
        //Since the object repository is still being populated when these objects are created, we can't rely on it

        if (this.AvailableChildren === null) {
            this.InitializeAvailableChildren();
        }

        return this.AvailableChildren;
    }



    function Activity_SetAvailableChildren(childArray) {

        this.AvailableChildren = childArray;

        //reset all included and ordinal fields
        var allChildren = this.GetChildren();

        var i;

        for (i = 0; i < allChildren.length; i++) {
            allChildren[i].Ordinal = 0;
            allChildren[i].Included = false;
            if (childArray.length < allChildren.length) // selection count is present
                allChildren[i].LearningObject.SequencingData.RollupObjectiveMeasureWeight = 0;
        }

        for (i = 0; i < this.AvailableChildren.length; i++) {
            this.AvailableChildren[i].Ordinal = (i + 1);
            this.AvailableChildren[i].Included = true;
            if (childArray.length < allChildren.length)
                this.AvailableChildren[i].LearningObject.SequencingData.RollupObjectiveMeasureWeight = this.AvailableChildren[i].LearningObject.SequencingData.RollupObjectiveMeasureWeightBackup;
        }

        this.SetDirtyData();

    }

    function Activity_IsAvailable() {
        return this.Included;
    }

    function Activity_InitializeForNewAttempt(resetObjectives, resetAttemptState) {

        //Initialize Objective Progress Information and Attempt Progress Information required for the new attempt. Initialize tracking information for the new attempt.
        //We need to reset the attempt data if only the current attempt is relevent

        var i;

        this.AttemptedDuringThisAttempt = false;

        var objectives = this.GetObjectives();

        if (resetObjectives && this.LearningObject.SequencingData.UseCurrentAttemptObjectiveInformation === true) {

            resetObjectives = true;

            for (i = 0; i < objectives.length; i++) {
                objectives[i].ResetAttemptState();
            }
        } else {
            resetObjectives = false;
        }

        if (resetAttemptState && this.LearningObject.SequencingData.UseCurrentAttemptProgressInformation === true) {

            resetAttemptState = true;

            this.ResetAttemptState();
        } else {
            resetAttemptState = false;
        }


        var children = this.GetChildren();

        for (i = 0; i < children.length; i++) {
            children[i].InitializeForNewAttempt(resetObjectives, resetAttemptState);
        }

        if (SSP_ENABLED && Control.Api.SSPApi) {
            Control.Api.SSPApi.ResetBucketsForActivity(this.DatabaseId);
        }

        this.SetDirtyData();
    }



    function Activity_ResetAttemptState() {

        this.PrevAttemptProgressStatus = this.AttemptProgressStatus;
        this.PrevAttemptCompletionStatus = this.AttemptCompletionStatus;

        this.AttemptProgressStatus = false;
        this.AttemptCompletionAmountStatus = false;
        this.AttemptCompletionAmount = 0;
        this.AttemptCompletionStatus = false;

        this.SetDirtyData();
    }

    // Rollup Duration information  (only handles internal aggregation activities)
    // Aggregate nodes take the earliest start timestamp from their children.
    // Durations are taken as time of last child ended - earliest start timestamp

    function Activity_RollupDurations() {

        var EarliestChildActivityStartTimestampUtc = null;
        var EarliestChildAttemptStartTimestampUtc = null;
        var LatestChildEndDate = null;
        var LatestAttChildEndDate = null;

        var ChildrenActExperiencedDurationTracked = 0;
        var ChildrenActExperiencedDurationReported = 0;
        var ChildrenAttExperiencedDurationTracked = 0;
        var ChildrenAttExperiencedDurationReported = 0;

        var applicableChildren = this.GetChildren();

        for (var i = 0; i < applicableChildren.length; i++) {

            // remember earliest child activity start time
            if (applicableChildren[i].GetActivityStartTimestampUtc()) {
                if (!EarliestChildActivityStartTimestampUtc || applicableChildren[i].GetActivityStartTimestampUtc() < EarliestChildActivityStartTimestampUtc) {
                    EarliestChildActivityStartTimestampUtc = applicableChildren[i].GetActivityStartTimestampUtc();
                }
            }

            // remember latest child activity end time
            if (applicableChildren[i].ActivityEndedDate) {
                if (!LatestChildEndDate || applicableChildren[i].ActivityEndedDate > LatestChildEndDate) {
                    LatestChildEndDate = applicableChildren[i].ActivityEndedDate;
                }
            }

            // track children activity durations
            if (applicableChildren[i].GetActivityExperiencedDurationTracked()) {
                ChildrenActExperiencedDurationTracked += ConvertIso8601TimeSpanToHundredths(applicableChildren[i].GetActivityExperiencedDurationTracked());
            }
            if (applicableChildren[i].GetActivityExperiencedDurationReported()) {
                ChildrenActExperiencedDurationReported += ConvertIso8601TimeSpanToHundredths(applicableChildren[i].GetActivityExperiencedDurationReported());
            }

            // Is this child in the same attempt as this parent? (Did child's attempt start after our attempt start?)

            if (!this.GetAttemptStartTimestampUtc() || (applicableChildren[i].GetAttemptStartTimestampUtc() && applicableChildren[i].GetAttemptStartTimestampUtc() >= this.GetAttemptStartTimestampUtc())) {

                // child is in same attempt

                // remember earliest child activity start time
                if (!this.GetAttemptStartTimestampUtc() && applicableChildren[i].GetAttemptStartTimestampUtc()) {
                    if (!EarliestChildAttemptStartTimestampUtc || applicableChildren[i].GetAttemptStartTimestampUtc() < EarliestChildAttemptStartTimestampUtc) {
                        EarliestChildAttemptStartTimestampUtc = applicableChildren[i].GetAttemptStartTimestampUtc();
                    }
                }

                if (applicableChildren[i].ActivityEndedDate) {
                    if (!LatestAttChildEndDate || applicableChildren[i].ActivityEndedDate > LatestAttChildEndDate) {
                        LatestAttChildEndDate = applicableChildren[i].ActivityEndedDate;
                    }
                }
                if (applicableChildren[i].GetAttemptExperiencedDurationTracked()) {
                    ChildrenAttExperiencedDurationTracked += ConvertIso8601TimeSpanToHundredths(applicableChildren[i].GetAttemptExperiencedDurationTracked());
                }
                if (applicableChildren[i].GetAttemptExperiencedDurationReported()) {
                    ChildrenAttExperiencedDurationReported += ConvertIso8601TimeSpanToHundredths(applicableChildren[i].GetAttemptExperiencedDurationReported());
                }
            }
        }

        // We are only called for aggregation nodes, but it can't harm to check here
        // It is possible that we are called for an aggregation even though none of the
        // children have been loaded, so don't do anything in that case either.
        // (this can happen because of a dependent global objective being set by a
        //  separate activity)
        if (!this.IsALeaf() && EarliestChildActivityStartTimestampUtc !== null) {
            this.SetActivityStartTimestampUtc(EarliestChildActivityStartTimestampUtc);

            if (!this.GetAttemptStartTimestampUtc()) {
                this.SetAttemptStartTimestampUtc(EarliestChildAttemptStartTimestampUtc);
            }

            // Aggregate nodes take the earliest start timestamp from their children.
            // Durations are taken as time of last child ended - earliest start timestamp

            this.ActivityEndedDate = LatestChildEndDate;
            var startActivityDateObj = GetDateFromUtcIso8601Time(this.GetActivityStartTimestampUtc());
            var startAttemptDateObj = GetDateFromUtcIso8601Time(this.GetAttemptStartTimestampUtc());

            this.SetActivityAbsoluteDuration(ConvertHundredthsToIso8601TimeSpan((LatestChildEndDate - startActivityDateObj) / 10));
            this.SetAttemptAbsoluteDuration(ConvertHundredthsToIso8601TimeSpan((LatestAttChildEndDate - startAttemptDateObj) / 10));

            this.SetActivityExperiencedDurationTracked(ConvertHundredthsToIso8601TimeSpan(ChildrenActExperiencedDurationTracked));
            this.SetActivityExperiencedDurationReported(ConvertHundredthsToIso8601TimeSpan(ChildrenActExperiencedDurationReported));
            this.SetAttemptExperiencedDurationTracked(ConvertHundredthsToIso8601TimeSpan(ChildrenAttExperiencedDurationTracked));
            this.SetAttemptExperiencedDurationReported(ConvertHundredthsToIso8601TimeSpan(ChildrenAttExperiencedDurationReported));

        }
    }

    function Activity_SetDirtyData() {
        this.DataState = DATA_STATE_DIRTY;
    }

    function Activity_IsAnythingDirty() {
        if (this.DataState == DATA_STATE_DIRTY) {
            return true;
        }

        for (var i = 0; i < this.ActivityObjectives.length; i++) {
            if (this.ActivityObjectives[i].DataState == DATA_STATE_DIRTY) {
                return true;
            }
        }

        return false;
    }

    function Activity_MarkPostedObjectiveDataDirty() {
        for (var i = 0; i < this.ActivityObjectives.length; i++) {
            if (this.ActivityObjectives[i].DataState == DATA_STATE_POSTED) {
                this.ActivityObjectives[i].SetDirtyData();
            }
        }
    }

    function Activity_MarkPostedObjectiveDataClean() {
        for (var i = 0; i < this.ActivityObjectives.length; i++) {
            if (this.ActivityObjectives[i].DataState == DATA_STATE_POSTED) {
                this.ActivityObjectives[i].DataState = DATA_STATE_CLEAN;
            }
        }
    }

    function Activity_MarkDirtyObjectiveDataPosted() {
        for (var i = 0; i < this.ActivityObjectives.length; i++) {
            if (this.ActivityObjectives[i].DataState == DATA_STATE_DIRTY) {
                this.ActivityObjectives[i].DataState = DATA_STATE_POSTED;
            }
        }
    }

    function Activity_SetSequencer(sequencer, isLookAhead) {

        this.Sequencer = sequencer;
        this.LookAheadActivity = isLookAhead;

        for (var i = 0; i < this.ActivityObjectives.length; i++) {
            this.ActivityObjectives[i].SetSequencer(sequencer);
        }
    }


    function Activity_Clone() {

        var clone = new Activity(
            this.DatabaseId,
            this.ItemIdentifier,
            this.ScormObjectDatabaseId,
            this.ActivityProgressStatus,
            this.ActivityAttemptCount,
            this.AttemptProgressStatus,
            this.AttemptCompletionAmountStatus,
            this.AttemptCompletionAmount,
            this.AttemptCompletionStatus,
            this.Active,
            this.Suspended,
            this.Included,
            this.Ordinal,
            this.SelectedChildren,
            this.RandomizedChildren,
            null,
            null,
            this.PrevAttemptProgressStatus,
            this.PrevAttemptCompletionStatus,
            this.AttemptedDuringThisAttempt,
            this.FirstCompletionTimestampUtc,
            this.ActivityStartTimestampUtc,
            this.AttemptStartTimestampUtc,
            this.ActivityAbsoluteDuration,
            this.AttemptAbsoluteDuration,
            this.ActivityExperiencedDurationTracked,
            this.AttemptExperiencedDurationTracked,
            this.ActivityExperiencedDurationReported,
            this.AttemptExperiencedDurationReported
        );

        clone.StringIdentifier = this.toString();

        clone.ActivityObjectives = new Array();
        for (var objectiveId in this.ActivityObjectives) {
            if (!this.ActivityObjectives.hasOwnProperty(objectiveId)) {
                continue;
            }
            clone.ActivityObjectives[objectiveId] = this.ActivityObjectives[objectiveId].Clone();
        }

        clone.RunTime = this.RunTime;
        clone.LearningObject = this.LearningObject;

        clone.DataState = DATA_STATE_CLEAN;

        clone.LaunchedThisSession = this.LaunchedThisSession;
        clone.AttemptedDuringThisAttempt = this.AttemptedDuringThisAttempt;
        clone.UsesDefaultRollupRules = this.UsesDefaultRollupRules;

        return clone;

    }

    function Activity_TearDown() {

        this.StringIdentifier = null;
        this.DatabaseId = null;
        this.ScormObjectDatabaseId = null;
        this.ActivityProgressStatus = null;
        this.ActivityAttemptCount = null;
        this.AttemptProgressStatus = null;
        this.AttemptCompletionAmountStatus = null;
        this.AttemptCompletionAmount = null;
        this.AttemptCompletionStatus = null;

        this.FirstCompletionTimestampUtc = null;
        this.ActivityStartTimestampUtc = null;
        this.AttemptStartTimestampUtc = null;

        this.ActivityAbsoluteDuration = null;
        this.AttemptAbsoluteDuration = null;
        this.ActivityExperiencedDurationTracked = null;
        this.AttemptExperiencedDurationTracked = null;
        this.ActivityExperiencedDurationReported = null;
        this.AttemptExperiencedDurationReported = null;
        this.Active = null;
        this.Suspended = null;
        this.Included = null;
        this.Ordinal = null;
        this.SelectedChildren = null;
        this.RandomizedChildren = null;
        this.RunTime = null;
        this.Sequencer = null;
        this.LookAheadActivity = null;
        this.LearningObject = null;
        this.ParentActivity = null;
        this.AvailableChildren = null;
        this.DataState = null;
        this.MenuItem = null;
        this.ChildActivities = null;
        this.CachedPrimaryObjective = null;
        this.HiddenFromChoice = null;

        for (var objectiveId in this.ActivityObjectives) {
            if (!this.ActivityObjectives.hasOwnProperty(objectiveId)) {
                continue;
            }
            this.ActivityObjectives[objectiveId].TearDown();
            this.ActivityObjectives[objectiveId] = null;
        }

        this.ActivityObjectives = null;
    }

    function Activity_DisplayInChoice() {

        if (this.LearningObject.Visible === false) {
            return false;
        } else if (this.IsAvailable() === false) {
            return false;
        } else if (this.HiddenFromChoice === true) {
            return false;
        }

        return true;
    }

    function Activity_SetHiddenFromChoice(blnArg) {
        this.HiddenFromChoice = blnArg;
    }

    function Activity_WasLaunchedThisSession() {
        return this.LaunchedThisSession;
    }

    function Activity_SetLaunchedThisSession() {
        this.LaunchedThisSession = true;

        if (this.LearningObject.ScormType === SCORM_TYPE_ASSET) {
            Control.ScoLoader.ScoLoaded = true;
        }
    }

    function Activity_WasAttemptedDuringThisAttempt() {
        return this.AttemptedDuringThisAttempt;
    }

    function Activity_SetAttemptedDuringThisAttempt() {
        this.AttemptedDuringThisAttempt = true;
    }

    function Activity_GetMinProgressMeasure() {
        //value is called CompletionThreshhold for backwards compatibility and runtime use
        return this.LearningObject.CompletionThreshold;
    }

    function Activity_GetCompletionProgressWeight() {
        var weight = this.LearningObject.CompletionProgressWeight;
        weight = parseFloat(weight);

        return weight;

    }

    function Activity_GetCompletedByMeasure() {
        return this.LearningObject.CompletedByMeasure;
    }

    function Activity_GetAttemptCompletionAmount() {
        return this.AttemptCompletionAmount;
    }

    function Activity_SetAttemptCompletionAmount(value) {
        this.AttemptCompletionAmount = value;
    }

    function Activity_GetAttemptCompletionAmountStatus() {
        return this.AttemptCompletionAmountStatus;
    }

    function Activity_SetAttemptCompletionAmountStatus(value) {
        this.AttemptCompletionAmountStatus = value;
    }

    function Activity_GetCompletionStatusChangedDuringRuntime() {
        if (this.RunTime !== null) {
            return this.RunTime.CompletionStatusChangedDuringRuntime;
        }

        return false;
    }

    function Activity_GetSuccessStatusChangedDuringRuntime() {
        if (this.RunTime !== null) {
            return this.RunTime.SuccessStatusChangedDuringRuntime;
        }

        return false;
    }

    function Activity_GetActivityStartTimestampUtc() {
        return this.ActivityStartTimestampUtc;
    }

    function Activity_SetActivityStartTimestampUtc(value) {
        this.ActivityStartTimestampUtc = value;
        this.SetDirtyData();
    }

    function Activity_GetAttemptStartTimestampUtc() {
        return this.AttemptStartTimestampUtc;
    }

    function Activity_SetAttemptStartTimestampUtc(value) {
        this.AttemptStartTimestampUtc = value;
        this.SetDirtyData();
    }

    function Activity_GetActivityAbsoluteDuration() {
        return this.ActivityAbsoluteDuration;
    }

    function Activity_SetActivityAbsoluteDuration(value) {
        this.ActivityAbsoluteDuration = value;
        this.SetDirtyData();
    }

    function Activity_GetAttemptAbsoluteDuration() {
        return this.AttemptAbsoluteDuration;
    }

    function Activity_SetAttemptAbsoluteDuration(value) {
        this.AttemptAbsoluteDuration = value;
        this.SetDirtyData();
    }

    function Activity_GetActivityExperiencedDurationTracked() {
        return this.ActivityExperiencedDurationTracked;
    }

    function Activity_SetActivityExperiencedDurationTracked(value) {
        this.ActivityExperiencedDurationTracked = value;
        this.SetDirtyData();
    }

    function Activity_GetAttemptExperiencedDurationTracked() {
        return this.AttemptExperiencedDurationTracked;
    }

    function Activity_SetAttemptExperiencedDurationTracked(value) {
        this.AttemptExperiencedDurationTracked = value;
        this.SetDirtyData();
    }

    function Activity_GetActivityExperiencedDurationReported() {
        return this.ActivityExperiencedDurationReported;
    }

    function Activity_SetActivityExperiencedDurationReported(value) {
        this.ActivityExperiencedDurationReported = value;
        this.SetDirtyData();
    }

    function Activity_GetAttemptExperiencedDurationReported() {
        return this.AttemptExperiencedDurationReported;
    }

    function Activity_SetAttemptExperiencedDurationReported(value) {
        this.AttemptExperiencedDurationReported = value;
        this.SetDirtyData();
    }

    function Activity_UsesDefaultSatisfactionRollupRules() {
        return this.LearningObject.UsesDefaultSatisfactionRollupRules;
    }

    function Activity_UsesDefaultCompletionRollupRules() {
        return this.LearningObject.UsesDefaultCompletionRollupRules;
    }

})();
