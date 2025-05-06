(function() {
    SequencingData = function(
        Identifier,
        Identifierref,
        ControlChoice,
        ControlChoiceExit,
        ControlFlow,
        ControlForwardOnly,
        UseCurrentAttemptObjectiveInformation,
        UseCurrentAttemptProgressInformation,
        ConstrainChoice,
        PreventActivation,
        PreConditionSequencingRules,
        PostConditionSequencingRules,
        ExitSequencingRules,
        LimitConditionAttemptControl,
        LimitConditionAttemptLimit,
        LimitConditionAttemptAbsoluteDurationControl,
        LimitConditionAttemptAbsoluteDurationLimit,
        RollupRules,
        RollupObjectiveSatisfied,
        RollupObjectiveMeasureWeight,
        RollupProgressCompletion,
        MeasureSatisfactionIfActive,
        RequiredForSatisfied,
        RequiredForNotSatisfied,
        RequiredForCompleted,
        RequiredForIncomplete,
        PrimaryObjective,
        Objectives,
        SelectionTiming,
        SelectionCountStatus,
        SelectionCount,
        RandomizationTiming,
        RandomizeChildren,
        Tracked,
        CompletionSetByContent,
        ObjectiveSetByContent,
        HidePrevious,
        HideContinue,
        HideExit,
        HideAbandon,
        HideSuspendAll,
        HideAbandonAll,
        HideExitAll) {
        if (arguments.length > 1) {
            this.Identifier = Identifier;
            this.Identifierref = Identifierref;
            this.ControlChoice = ControlChoice;
            this.ControlChoiceExit = ControlChoiceExit;
            this.ControlFlow = ControlFlow;
            this.ControlForwardOnly = ControlForwardOnly;
            this.UseCurrentAttemptObjectiveInformation = UseCurrentAttemptObjectiveInformation;
            this.UseCurrentAttemptProgressInformation = UseCurrentAttemptProgressInformation;
            this.ConstrainChoice = ConstrainChoice;
            this.PreventActivation = PreventActivation;
            this.PreConditionSequencingRules = PreConditionSequencingRules;
            this.PostConditionSequencingRules = PostConditionSequencingRules;
            this.ExitSequencingRules = ExitSequencingRules;
            this.LimitConditionAttemptControl = LimitConditionAttemptControl;
            this.LimitConditionAttemptLimit = LimitConditionAttemptLimit;
            this.LimitConditionAttemptAbsoluteDurationControl = LimitConditionAttemptAbsoluteDurationControl;
            this.LimitConditionAttemptAbsoluteDurationLimit = LimitConditionAttemptAbsoluteDurationLimit;
            this.RollupRules = RollupRules;
            this.RollupObjectiveSatisfied = RollupObjectiveSatisfied;
            this.RollupObjectiveMeasureWeight = RollupObjectiveMeasureWeight;
            this.RollupObjectiveMeasureWeightBackup = RollupObjectiveMeasureWeight; // added for select count processing
            this.RollupProgressCompletion = RollupProgressCompletion;
            this.MeasureSatisfactionIfActive = MeasureSatisfactionIfActive;
            this.RequiredForSatisfied = RequiredForSatisfied;
            this.RequiredForNotSatisfied = RequiredForNotSatisfied;
            this.RequiredForCompleted = RequiredForCompleted;
            this.RequiredForIncomplete = RequiredForIncomplete;
            this.PrimaryObjective = PrimaryObjective;
            this.Objectives = Objectives;
            this.SelectionTiming = SelectionTiming;
            this.SelectionCountStatus = SelectionCountStatus;
            this.SelectionCount = SelectionCount;
            this.RandomizationTiming = RandomizationTiming;
            this.RandomizeChildren = RandomizeChildren;
            this.Tracked = Tracked;
            this.CompletionSetByContent = CompletionSetByContent;
            this.ObjectiveSetByContent = ObjectiveSetByContent;
            this.HidePrevious = HidePrevious;
            this.HideContinue = HideContinue;
            this.HideExit = HideExit;
            this.HideAbandon = HideAbandon;
            this.HideSuspendAll = HideSuspendAll;
            this.HideAbandonAll = HideAbandonAll;
            this.HideExitAll = HideExitAll;
        } else { //JSON data
            var data = arguments[0];
            this.Identifier = data.Identifier;
            this.Identifierref = data.Identifierref;
            this.ControlChoice = data.ControlChoice;
            this.ControlChoiceExit = data.ControlChoiceExit;
            this.ControlFlow = data.ControlFlow;
            this.ControlForwardOnly = data.ControlForwardOnly;
            this.UseCurrentAttemptObjectiveInformation = data.UseCurrentAttemptObjectiveInformation;
            this.UseCurrentAttemptProgressInformation = data.UseCurrentAttemptProgressInformation;
            this.ConstrainChoice = data.ConstrainChoice;
            this.PreventActivation = data.PreventActivation;
            this.PreConditionSequencingRules = data.PreConditionSequencingRules.map(function (rule) {
                return new SequencingRule(rule);
            });
            this.PostConditionSequencingRules = data.PostConditionSequencingRules.map(function (rule) {
                return new SequencingRule(rule);
            });
            this.ExitSequencingRules = data.ExitSequencingRules.map(function (rule) {
                return new SequencingRule(rule);
            });
            this.LimitConditionAttemptControl = data.LimitConditionAttemptControl;
            this.LimitConditionAttemptLimit = data.LimitConditionAttemptLimit;
            this.LimitConditionAttemptAbsoluteDurationControl = data.LimitConditionAttemptAbsoluteDurationControl;
            this.LimitConditionAttemptAbsoluteDurationLimit = data.LimitConditionAttemptAbsoluteDurationLimit;
            this.RollupRules = data.RollupRules.map(function (rule) {
                return new SequencingRollupRule(rule);
            });
            this.RollupObjectiveSatisfied = data.RollupObjectiveSatisfied;
            this.RollupObjectiveMeasureWeight = data.RollupObjectiveMeasureWeight;
            this.RollupObjectiveMeasureWeightBackup = data.RollupObjectiveMeasureWeight; // added for select count processing
            this.RollupProgressCompletion = data.RollupProgressCompletion;
            this.MeasureSatisfactionIfActive = data.MeasureSatisfactionIfActive;
            this.RequiredForSatisfied = data.RequiredForSatisfied;
            this.RequiredForNotSatisfied = data.RequiredForNotSatisfied;
            this.RequiredForCompleted = data.RequiredForCompleted;
            this.RequiredForIncomplete = data.RequiredForIncomplete;
            this.PrimaryObjective = data.PrimaryObjective ? new SequencingObjective(data.PrimaryObjective) : null;
            this.Objectives = data.Objectives.map(function (rule) {
                return new SequencingObjective(rule);
            });
            this.SelectionTiming = data.SelectionTiming;
            this.SelectionCountStatus = data.SelectionCountStatus;
            this.SelectionCount = data.SelectionCount;
            this.RandomizationTiming = data.RandomizationTiming;
            this.RandomizeChildren = data.RandomizeChildren;
            this.Tracked = data.Tracked;
            this.CompletionSetByContent = data.CompletionSetByContent;
            this.ObjectiveSetByContent = data.ObjectiveSetByContent;
            this.HidePrevious = data.HidePrevious;
            this.HideContinue = data.HideContinue;
            this.HideExit = data.HideExit;
            this.HideAbandon = data.HideAbandon;
            this.HideSuspendAll = data.HideSuspendAll;
            this.HideAbandonAll = data.HideAbandonAll;
            this.HideExitAll = data.HideExitAll;
        }

    }

})();
