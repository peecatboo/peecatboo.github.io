(function() {

    PackageProperties = function(
        ShowFinishButton,
        ShowCloseItem,
        ShowHelp,
        ShowProgressBar,
        UseMeasureProgressBar,
        ShowCourseStructure,
        CourseStructureStartsOpen,
        ShowNavBar,
        ShowTitleBar,
        EnableFlowNav,
        EnableChoiceNav,
        DesiredWidth,
        DesiredHeight,
        DesiredFullScreen,
        RequiredWidth,
        RequiredHeight,
        RequiredFullScreen,
        CourseStructureWidth,
        ScoLaunchType,
        PlayerLaunchType,
        IntermediateScoSatisfiedNormalExitAction,
        IntermediateScoSatisfiedSuspendExitAction,
        IntermediateScoSatisfiedTimeoutExitAction,
        IntermediateScoSatisfiedLogoutExitAction,
        IntermediateScoNotSatisfiedNormalExitAction,
        IntermediateScoNotSatisfiedSuspendExitAction,
        IntermediateScoNotSatisfiedTimeoutExitAction,
        IntermediateScoNotSatisfiedLogoutExitAction,
        FinalScoCourseSatisfiedNormalExitAction,
        FinalScoCourseSatisfiedSuspendExitAction,
        FinalScoCourseSatisfiedTimeoutExitAction,
        FinalScoCourseSatisfiedLogoutExitAction,
        FinalScoCourseNotSatisfiedNormalExitAction,
        FinalScoCourseNotSatisfiedSuspendExitAction,
        FinalScoCourseNotSatisfiedTimeoutExitAction,
        FinalScoCourseNotSatisfiedLogoutExitAction,
        PreventRightClick,
        PreventWindowResize,
        StatusDisplay,
        ScoreRollupMode,
        NumberOfScoringObjects,
        StatusRollupMode,
        ThresholdScore,
        ApplyRollupStatusToSuccess,
        FirstScoIsPretest,
        WrapScoWindowWithApi,
        FinishCausesImmediateCommit,
        DebugControlAudit,
        DebugControlDetailed,
        DebugRteAudit,
        DebugRteDetailed,
        DebugSequencingAudit,
        DebugSequencingDetailed,
        DebugSequencingSimple,
        DebugLookAheadAudit,
        DebugLookAheadDetailed,
        DebugIncludeTimestamps,
        CaptureHistory,
        CaptureHistoryDetailed,
        CommMaxFailedSubmissions,
        CommCommitFrequency,
        InvalidMenuItemAction,
        AlwaysFlowToFirstSco,
        LogoutCausesPlayerExit,
        ResetRunTimeDataTiming,
        ValidateInteractionResponses,
        LookaheadSequencerMode,
        ScoreOverridesStatus,
        AllowCompleteStatusChange,
        ScaleRawScore,
        RollupEmptySetToUnknown,
        ReturnToLmsAction,
        UseQuickLookaheadSequencer,
        ForceDisableRootChoice,
        RollupRuntimeAtScoUnload,
        ForceObjectiveCompletionSetByContent,
        InvokeRollupAtSuspendAll,
        CompletionStatOfFailedSuccessStat,
        SatisfiedCausesCompletion,
        MakeStudentPrefsGlobalToCourse,
        LaunchCompletedRegsAsNoCredit,
        IsCompletionTracked,
        IsSatisfactionTracked,
        IsScoreTracked,
        IsIncompleteScoreMeaningful,
        IsIncompleteSatisfactionMeaningful,
        SuspendDataMaxLength,
        TimeLimit
    ) {
        this.ShowFinishButton = ShowFinishButton;
        this.ShowCloseItem = ShowCloseItem;
        this.ShowHelp = ShowHelp;
        this.ShowProgressBar = ShowProgressBar;
        this.UseMeasureProgressBar = UseMeasureProgressBar;
        this.ShowCourseStructure = ShowCourseStructure;
        this.CourseStructureStartsOpen = CourseStructureStartsOpen;
        this.ShowNavBar = ShowNavBar;
        this.ShowTitleBar = ShowTitleBar;
        this.EnableFlowNav = EnableFlowNav;
        this.EnableChoiceNav = EnableChoiceNav;
        this.DesiredWidth = DesiredWidth;
        this.DesiredHeight = DesiredHeight;
        this.DesiredFullScreen = DesiredFullScreen;
        this.RequiredWidth = RequiredWidth;
        this.RequiredHeight = RequiredHeight;
        this.RequiredFullScreen = RequiredFullScreen;
        this.CourseStructureWidth = CourseStructureWidth;
        this.ScoLaunchType = ScoLaunchType;
        this.PlayerLaunchType = PlayerLaunchType;
        this.IntermediateScoSatisfiedNormalExitAction = IntermediateScoSatisfiedNormalExitAction;
        this.IntermediateScoSatisfiedSuspendExitAction = IntermediateScoSatisfiedSuspendExitAction;
        this.IntermediateScoSatisfiedTimeoutExitAction = IntermediateScoSatisfiedTimeoutExitAction;
        this.IntermediateScoSatisfiedLogoutExitAction = IntermediateScoSatisfiedLogoutExitAction;
        this.IntermediateScoNotSatisfiedNormalExitAction = IntermediateScoNotSatisfiedNormalExitAction;
        this.IntermediateScoNotSatisfiedSuspendExitAction = IntermediateScoNotSatisfiedSuspendExitAction;
        this.IntermediateScoNotSatisfiedTimeoutExitAction = IntermediateScoNotSatisfiedTimeoutExitAction;
        this.IntermediateScoNotSatisfiedLogoutExitAction = IntermediateScoNotSatisfiedLogoutExitAction;
        this.FinalScoCourseSatisfiedNormalExitAction = FinalScoCourseSatisfiedNormalExitAction;
        this.FinalScoCourseSatisfiedSuspendExitAction = FinalScoCourseSatisfiedSuspendExitAction;
        this.FinalScoCourseSatisfiedTimeoutExitAction = FinalScoCourseSatisfiedTimeoutExitAction;
        this.FinalScoCourseSatisfiedLogoutExitAction = FinalScoCourseSatisfiedLogoutExitAction;
        this.FinalScoCourseNotSatisfiedNormalExitAction = FinalScoCourseNotSatisfiedNormalExitAction;
        this.FinalScoCourseNotSatisfiedSuspendExitAction = FinalScoCourseNotSatisfiedSuspendExitAction;
        this.FinalScoCourseNotSatisfiedTimeoutExitAction = FinalScoCourseNotSatisfiedTimeoutExitAction;
        this.FinalScoCourseNotSatisfiedLogoutExitAction = FinalScoCourseNotSatisfiedLogoutExitAction;
        this.PreventRightClick = PreventRightClick;
        this.PreventWindowResize = PreventWindowResize;
        this.StatusDisplay = StatusDisplay;
        this.ScoreRollupMode = ScoreRollupMode;
        this.NumberOfScoringObjects = NumberOfScoringObjects;
        this.StatusRollupMode = StatusRollupMode;
        this.ThresholdScore = ThresholdScore;
        this.ApplyRollupStatusToSuccess = ApplyRollupStatusToSuccess;
        this.FirstScoIsPretest = FirstScoIsPretest;
        this.WrapScoWindowWithApi = WrapScoWindowWithApi;
        this.FinishCausesImmediateCommit = FinishCausesImmediateCommit;
        this.DebugControlAudit = DebugControlAudit;
        this.DebugControlDetailed = DebugControlDetailed;
        this.DebugRteAudit = DebugRteAudit;
        this.DebugRteDetailed = DebugRteDetailed;
        this.DebugSequencingAudit = DebugSequencingAudit;
        this.DebugSequencingDetailed = DebugSequencingDetailed;
        this.DebugSequencingSimple = DebugSequencingSimple;
        this.DebugLookAheadAudit = DebugLookAheadAudit;
        this.DebugLookAheadDetailed = DebugLookAheadDetailed;
        this.DebugIncludeTimestamps = DebugIncludeTimestamps;
        this.CaptureHistory = CaptureHistory;
        this.CaptureHistoryDetailed = CaptureHistoryDetailed;
        this.CommMaxFailedSubmissions = CommMaxFailedSubmissions;
        this.CommCommitFrequency = CommCommitFrequency;
        this.InvalidMenuItemAction = InvalidMenuItemAction;
        this.AlwaysFlowToFirstSco = AlwaysFlowToFirstSco;
        this.LogoutCausesPlayerExit = LogoutCausesPlayerExit;
        this.ResetRunTimeDataTiming = ResetRunTimeDataTiming;
        this.ValidateInteractionResponses = ValidateInteractionResponses;
        this.LookaheadSequencerMode = LookaheadSequencerMode;
        this.ScoreOverridesStatus = ScoreOverridesStatus;
        this.AllowCompleteStatusChange = AllowCompleteStatusChange;
        this.ScaleRawScore = ScaleRawScore;
        this.RollupEmptySetToUnknown = RollupEmptySetToUnknown;
        this.ReturnToLmsAction = ReturnToLmsAction;
        this.UseQuickLookaheadSequencer = UseQuickLookaheadSequencer;
        this.ForceDisableRootChoice = ForceDisableRootChoice;
        this.RollupRuntimeAtScoUnload = RollupRuntimeAtScoUnload;
        this.ForceObjectiveCompletionSetByContent = ForceObjectiveCompletionSetByContent;
        this.InvokeRollupAtSuspendAll = InvokeRollupAtSuspendAll;
        this.CompletionStatOfFailedSuccessStat = CompletionStatOfFailedSuccessStat;
        this.SatisfiedCausesCompletion = SatisfiedCausesCompletion;
        this.MakeStudentPrefsGlobalToCourse = MakeStudentPrefsGlobalToCourse;
        this.LaunchCompletedRegsAsNoCredit = LaunchCompletedRegsAsNoCredit;
        this.IsCompletionTracked = IsCompletionTracked;
        this.IsSatisfactionTracked = IsSatisfactionTracked;
        this.IsScoreTracked = IsScoreTracked;
        this.IsIncompleteScoreMeaningful = IsIncompleteScoreMeaningful;
        this.IsIncompleteSatisfactionMeaningful = IsIncompleteSatisfactionMeaningful;
        this.SuspendDataMaxLength = SuspendDataMaxLength;
        this.TimeLimit = TimeLimit;
    }

})();
