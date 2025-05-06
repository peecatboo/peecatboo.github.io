//****************************************************************************************************************
//Limit Conditions Check Process [UP.1]
//    For an activity; returns True if any of the activity's limit conditions have been violated
//    Reference:
//Activity Attempt Count TM.1.2.1
//Activity Progress Status TM.1.2.1
//Activity Absolute Duration TM.1.2.1
//Activity Experienced Duration TM.1.2.1
//Attempt Progress Status TM.1.2.2
//Attempt Absolute Duration TM.1.2.2
//Attempt Experienced Duration TM.1.2.2
//Limit Condition Activity Absolute Duration Control SM.3
//Limit Condition Activity Absolute Duration Limit SM.3
//Limit Condition Activity Experienced Duration Control SM.3
//Limit Condition Activity Experienced Duration Limit SM.3
//Limit Condition Attempt Absolute Duration Control SM.3
//Limit Condition Attempt Absolute Duration Limit SM.3
//Limit Condition Attempt Experienced Duration Control SM.3
//Limit Condition Attempt Experienced Duration Limit SM.3
//Limit Condition Attempt Control SM.3
//Limit Condition Attempt Limit SM.3
//Limit Condition Begin Time Limit SM.3
//Limit Condition Begin Time Limit Control SM.3
//Limit Condition End Time Limit SM.3
//Limit Condition End Time Limit Control SM.3
//Tracked SM.11

function Sequencer_LimitConditionsCheckProcess(activity, callingLog) {

    if (activity.IsTracked() === false) {
        return false;
    }

    if (activity.IsActive() || activity.IsSuspended()) {
        return false;
    }

    if (activity.GetLimitConditionAttemptControl() === true) {

        var attemptCount = activity.GetAttemptCount();
        var attemptLimit = activity.GetLimitConditionAttemptLimit();

        if (activity.GetActivityProgressStatus() === true && (attemptCount >= attemptLimit)) {

            return true;

        }
    }

    //[UP.1]4.     If the Limit Condition Activity Absolute Duration Control for the activity is True Then
    //[UP.1]4.1.         If the Activity Progress Status for the activity is True And the Activity Absolute Duration for the activity is greater than or equal (>=) to Limit Condition Activity Absolute Duration Limit for the activity Then
    //[UP.1]4.1.1.         Exit Limit Conditions Check Process (Limit Condition Violated: True)     (Limit conditions have been violated)
    //[UP.1]        End If

    //[UP.1]5.     If the Limit Condition Activity Experienced Duration Control for the activity is True Then
    //[UP.1]5.1.         If the Activity Progress Status for the activity is True And the Activity Experienced Duration for the activity is greater than or equal (>=) to the Limit Condition Activity Experienced Duration Limitfor the activity Then
    //[UP.1]5.1.1.         Exit Limit Conditions Check Process (Limit Condition Violated: True)     (Limit conditions have been violated)
    //[UP.1]            End If
    //[UP.1]        End If

    //[UP.1]6.     If the Limit Condition Attempt Absolute Duration Control for the activity is True Then
    //[UP.1]6.1.        If the Activity Progress Status for the activity is True And the Attempt Progress Status for the activity is True And the Attempt Absolute Duration for the activity is greater than or equal (>=) to the Limit Condition Attempt Absolute Duration Limit for the activity Then
    //[UP.1]6.1.1.         Exit Limit Conditions Check Process (Limit Condition Violated: True)     (Limit conditions have been violated)
    //[UP.1]            End If
    //[UP.1]        End If

    //[UP.1]7.     If the Limit Condition Attempt Experienced Duration Control for the activity is True Then
    //[UP.1]7.1.         If the Activity Progress Status for the activity is True And the Attempt Progress Status for the activity is True And the Attempt Experienced Duration for the activity is greater than or equal (>=) to the Limit Condition Attempt Experienced Duration Limit for the activity Then
    //[UP.1]7.1.1.        Exit Limit Conditions Check Process (Limit Condition Violated: True)     (Limit conditions have been violated)
    //[UP.1]            End If
    //[UP.1]        End If

    //[UP.1]8.     If the Limit Condition Begin Time Limit Control for the activity is True Then
    //[UP.1]8.1.         If the current time point is before the Limit Condition Begin Time Limit for the activity Then
    //[UP.1]8.1.1.         Exit Limit Conditions Check Process (Limit Condition Violated: True)     (Limit conditions have been violated)
    //[UP.1]            End If
    //[UP.1]        End If

    //[UP.1]9.     If the Limit Condition End Time Limit Control for the activity is True Then
    //[UP.1]9.1.         If the current time point is after the Limit Condition End Time Limit for the activity Then
    //[UP.1]9.1.1.         Exit Limit Conditions Check Process (Limit Condition Violated: True)     (Limit conditions have been violated)
    //[UP.1]            End If
    //[UP.1]        End If

    return false;

}
