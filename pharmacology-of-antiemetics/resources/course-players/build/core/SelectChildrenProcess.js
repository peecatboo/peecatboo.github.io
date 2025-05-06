//****************************************************************************************************************
//Select Children Process [SR.1]

//    For an activity; may change the Available Children for the activity

//    Reference:
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Available Children AM.1.1
//Activity Progress Status TM.1.2.1
//Selection Count SM.9
//Selection Count Status SM.9
//Selection Timing SM.9

function Sequencer_SelectChildrenProcess(activity, callingLog) {

    if (activity.IsALeaf()) {

        return;
    }

    if (activity.IsActive() === true || activity.IsSuspended() === true) {

        return;
    }

    var selectionTiming = activity.GetSelectionTiming();

    switch (selectionTiming) {

        case TIMING_NEVER:
            break;

        case TIMING_ONCE:

            if (activity.GetSelectedChildren() === false) {

                if (activity.GetActivityProgressStatus() === false) {

                    if (activity.GetSelectionCountStatus() === true) {

                        var childList = new Array();

                        var activityChildren = activity.GetChildren();

                        var selectionCount = activity.GetSelectionCount();

                        if (selectionCount < activityChildren.length) {

                            var randomNumbers = Sequencer_GetUniqueRandomNumbersBetweenTwoValues(selectionCount, 0, activityChildren.length - 1);

                            for (var i = 0; i < randomNumbers.length; i++) {

                                childList[i] = activityChildren[randomNumbers[i]];
                            }

                        } else {
                            childList = activityChildren;
                        }

                        activity.SetAvailableChildren(childList);

                        activity.SetSelectedChildren(true);

                        //this process only happens once and it is only from a start command after which the display will be updated anyway
                        //Control.RedrawChildren(activity);
                    }
                }

            }

            break;

        case TIMING_ON_EACH_NEW_ATTEMPT:

            if (activity.GetSelectionCountStatus() === true) {

                var childList = new Array();

                var activityChildren = activity.GetChildren();

                var selectionCount = activity.GetSelectionCount();

                if (selectionCount < activityChildren.length) {

                    var randomNumbers = Sequencer_GetUniqueRandomNumbersBetweenTwoValues(selectionCount, 0, activityChildren.length - 1);

                    for (var i = 0; i < randomNumbers.length; i++) {

                        childList[i] = activityChildren[randomNumbers[i]];
                    }

                } else {
                    childList = activityChildren;
                }

                activity.SetAvailableChildren(childList);

                activity.SetSelectedChildren(true);

                //this process only happens once and it is only from a start command after which the display will be updated anyway
                //Control.RedrawChildren(activity);
            }

            break;

        default:
            break;

    }

}

//TODO: put this someplace more logical

function Sequencer_GetUniqueRandomNumbersBetweenTwoValues(numberOfNumbersNeeded, minValue, maxValue) {

    if (numberOfNumbersNeeded === null || numberOfNumbersNeeded === undefined || numberOfNumbersNeeded < minValue) {
        numberOfNumbersNeeded = minValue;
    }
    if (numberOfNumbersNeeded > maxValue) {
        numberOfNumbersNeeded = maxValue;
    }

    var aryReturn = new Array(numberOfNumbersNeeded);

    var newRandomNumber;
    var numberIsAlreadyInUse;

    for (var i = 0; i < numberOfNumbersNeeded; i++) {

        numberIsAlreadyInUse = true;

        while (numberIsAlreadyInUse) {
            newRandomNumber = Sequencer_GetRandomNumberWithinRange(minValue, maxValue);
            numberIsAlreadyInUse = Sequencer_IsNumberAlreadyInArray(newRandomNumber, aryReturn);
        }

        aryReturn[i] = newRandomNumber;
    }

    aryReturn.sort();

    return aryReturn;
}

function Sequencer_GetRandomNumberWithinRange(minValue, maxValue) {
    var diff = maxValue - minValue;
    return Math.floor(Math.random() * (diff + minValue + 1));
}

function Sequencer_IsNumberAlreadyInArray(number, aryToCheck) {

    for (var i = 0; i < aryToCheck.length; i++) {
        if (aryToCheck[i] == number) {
            return true;
        }
    }

    return false;
}
