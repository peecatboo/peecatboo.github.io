//****************************************************************************************************************

//Content Delivery Environment Process [DB.2]
//For a delivery request; may return an exception code
//Reference:
//Activity Progress Status TM.1.2.1
//Activity Attempt Count TM.1.2.1
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Attempt Absolute Duration TM.1.2.2
//Attempt Experienced Duration TM.1.2.2
//Attempt Progress Information TM.1.2.2
//Clear Suspended Activity Subprocess DB.2.1
//Current Activity AM.1.2
//Objective Progress Information TM.1.1
//Suspended Activity AM.1.2
//Terminate Descendent Attempts Process UP.4
//Tracked SM.11

function Sequencer_ContentDeliveryEnvironmentProcess(activityForDelivery, callingLog) {

    var isLaunchAfterClick = (Control.Package.Properties.ScoLaunchType === LAUNCH_TYPE_POPUP_AFTER_CLICK ||
        Control.Package.Properties.ScoLaunchType === LAUNCH_TYPE_POPUP_AFTER_CLICK_WITHOUT_BROWSER_TOOLBAR);

    var currentActivity = this.GetCurrentActivity();
    var suspendedActivity = this.GetSuspendedActivity();
    var rootActivity = this.GetRootActivity();

    var activityPath = null;

    var returnValue;

    if (currentActivity !== null && currentActivity.IsActive()) {

        returnValue = new Sequencer_ContentDeliveryEnvironmentProcessResult(false, "DB.2.1", IntegrationImplementation.GetString("The previous activity must be terminated before a new activity may be attempted"));
        return returnValue;
    }

    // JMH - 01/22/07 - If launch after click, the PopupLauncher will make this call, otherwise call here as usual.
    if (!isLaunchAfterClick) {
        this.ContentDeliveryEnvironmentActivityDataSubProcess(activityForDelivery, callingLog);
    } else {}

    activityPath = this.GetPathToAncestorInclusive(activityForDelivery, rootActivity);

    for (var i = (activityPath.length - 1); i >= 0; i--) {

        if (isLaunchAfterClick) {
            activityPath[i].WasActiveBeforeLaunchOnClick = activityPath[i].IsActive();
        }

        if (activityPath[i].IsActive() === false) {

            activityPath[i].SetActive(true);
        }
    }

    if (isLaunchAfterClick) {
        this.PreviousActivity = currentActivity;
    }
    this.SetCurrentActivity(activityForDelivery);

    //nothing to do here, 7.1.1 happens in activity.TransferRteDataToActivity, we're not tracking durations
    //[DB.2]7.     Once the delivery of the activity's content resources and auxiliary resources begins (The delivery environment is assumed to deliver the content resources associated with the identified activity. While the activity is assumed to be active, the sequencer may track learner status )
    //[DB.2]7.1.    If Tracked for the activity identified for delivery is False Then
    //[DB.2]7.1.1.         The Objective and Attempt Progress information for the activity should not be recorded during delivery
    //[DB.2]7.1.2.         The delivery environment begins tracking the Attempt Absolute Duration and the Attempt Experienced Duration
    //[DB.2]        End If

    returnValue = new Sequencer_ContentDeliveryEnvironmentProcessResult(true, null, "");

    //put this call last (after the LogSeqReturn) to keep it from being included in the time tracking (relative to code execution, it's a time hog)
    Control.DeliverActivity(activityForDelivery);

    return returnValue;

}

function Sequencer_ContentDeliveryEnvironmentProcessResult(valid, exception, exceptionText) {
    this.Valid = valid;
    this.Exception = exception;
    this.ExceptionText = exceptionText;
}

Sequencer_ContentDeliveryEnvironmentProcessResult.prototype.toString = function() {
    return "Valid=" + this.Valid +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
