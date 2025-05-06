//Content Delivery Environment Process [DB.2] -- Subprocess that makes edits to activity data

function Sequencer_ContentDeliveryEnvironmentActivityDataSubProcess(activityForDelivery) {

    // if (logParent === undefined || logParent === null) {
    // }

    var isLaunchAfterClick = (Control.Package.Properties.ScoLaunchType === LAUNCH_TYPE_POPUP_AFTER_CLICK ||
        Control.Package.Properties.ScoLaunchType === LAUNCH_TYPE_POPUP_AFTER_CLICK_WITHOUT_BROWSER_TOOLBAR);

    if (isLaunchAfterClick) {
        var currentActivity = this.PreviousActivity;
    } else {
        var currentActivity = this.CurrentActivity;
    }
    var suspendedActivity = this.GetSuspendedActivity();
    var rootActivity = this.GetRootActivity();

    var activityPath = null;
    var startingFirstAttempt = false;

    if (suspendedActivity != activityForDelivery) {
        this.ClearSuspendedActivitySubprocess(activityForDelivery);
    }

    this.TerminateDescendentAttemptsProcess(activityForDelivery);

    activityPath = this.GetPathToAncestorInclusive(activityForDelivery, rootActivity);

    var nowDate = ConvertDateToIso8601String(new Date());
    for (var i = (activityPath.length - 1); i >= 0; i--) {

        if (isLaunchAfterClick) {
            var isActive = activityPath[i].WasActiveBeforeLaunchOnClick;
        } else {
            var isActive = activityPath[i].IsActive();
        }

        if (isActive === false) {

            if (activityPath[i].IsTracked()) {

                if (activityPath[i].IsSuspended()) {

                    activityPath[i].SetSuspended(false);
                } else {

                    //TODO - check that this is working right, it looks like we might be incrementing parent attmpt counts too much

                    activityPath[i].IncrementAttemptCount();

                    if (activityPath[i].GetAttemptCount() == 1) {

                        activityPath[i].SetActivityProgressStatus(true);

                        startingFirstAttempt = true;
                    } else if (activityPath[i].GetAttemptCount() > 1 && !activityPath[i].GetActivityProgressStatus()) {
                        // reset progress status back to true because Retry erases it
                        activityPath[i].SetActivityProgressStatus(true);
                    }

                    //TODO - improvement - would probably be more efficient to just call this on the common ancestor???? (check how this affects the calling parameters - resetObjectives & resetAttemptState)
                    activityPath[i].InitializeForNewAttempt(true, true);

                    // Reset attempt start timestamp and durations
                    var atts = {
                        ev: 'AttemptStart',
                        an: activityPath[i].GetAttemptCount(),
                        ai: activityPath[i].ItemIdentifier,
                        at: activityPath[i].LearningObject.Title
                    };
                    // this.WriteHistoryLog("", atts);

                    activityPath[i].SetAttemptStartTimestampUtc(nowDate);
                    // "PT0H0M0S" is ConvertHundredthsToIso8601TimeSpan(0)
                    activityPath[i].SetAttemptAbsoluteDuration("PT0H0M0S");
                    activityPath[i].SetAttemptExperiencedDurationTracked("PT0H0M0S");
                    activityPath[i].SetAttemptExperiencedDurationReported("PT0H0M0S");

                    if (Control.Package.Properties.ResetRunTimeDataTiming == RESET_RT_DATA_TIMING_ON_EACH_NEW_SEQUENCING_ATTEMPT) {
                        if (activityPath[i].IsDeliverable() === true) {

                            //only log the resetting of runtime data if there was previous data to reset
                            if (startingFirstAttempt === false) {
                                var atts = {
                                    ev: 'ResetRuntime',
                                    ai: activityPath[i].ItemIdentifier,
                                    at: activityPath[i].LearningObject.Title
                                };
                                this.WriteHistoryLog("", atts);
                            }

                            activityPath[i].RunTime.ResetState();
                        }
                    }

                    //In 3rd Edition we are required to clear all global objectives if obj global to system = false.
                    //The trigger we use for this is a new attempt starting on the root of the activity tree

                    if (Control.Package.ObjectivesGlobalToSystem === false && activityPath[i].IsTheRoot() === true) {
                        this.ResetGlobalObjectives();
                    }
                }
            }

            //indicate that this activity was delivered during the current attempt on the parent so we know which set of
            //data to use according to the Use Current Information sequencing settings
            activityPath[i].SetAttemptedDuringThisAttempt();
        }
    }
}
