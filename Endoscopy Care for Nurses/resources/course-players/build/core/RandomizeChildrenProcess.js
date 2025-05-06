//****************************************************************************************************************

//Randomize Children Process [SR.2]
//For an activity; may change the Available Children for the activity

//Reference:
//Activity is Active AM.1.1
//Activity is Suspended AM.1.1
//Available Children AM.1.1
//Activity Progress Status TM.1.2.1
//Randomize Children SM.10
//Randomization Timing SM.10

function Sequencer_RandomizeChildrenProcess(activity, needRedraw, callingLog) {

    var randomizedChildren;

    if (activity.IsALeaf()) {

        return;
    }

    if (activity.IsActive() === true || activity.IsSuspended() === true) {

        return;
    }

    var randomizationTiming = activity.GetRandomizationTiming();

    switch (randomizationTiming) {

        case TIMING_NEVER:
            if (needRedraw === true) {
                Control.RedrawChildren(activity);
            }
            break;

        case TIMING_ONCE:

            if (activity.GetRandomizedChildren() === false) {

                if (activity.GetActivityProgressStatus() === false) {

                    if (activity.GetRandomizeChildren() === true) {

                        randomizedChildren = Sequencer_RandomizeArray(activity.GetAvailableChildren());
                        activity.SetAvailableChildren(randomizedChildren);

                        activity.SetRandomizedChildren(true);

                        //this will happen at the start before the menu items are actually created...no need to redraw
                        //Control.RedrawChildren(activity);
                    }
                }
            }

            break;

        case TIMING_ON_EACH_NEW_ATTEMPT:

            if (activity.GetRandomizeChildren() === true) {

                randomizedChildren = Sequencer_RandomizeArray(activity.GetAvailableChildren());
                activity.SetAvailableChildren(randomizedChildren);

                activity.SetRandomizedChildren(true);

                if (needRedraw === true) {
                    Control.RedrawChildren(activity);
                }
            }

            break;

        default:
            break;

    }

    return;
}

function Sequencer_RandomizeArray(ary) {

    var arySize = ary.length;
    var orig;
    var swap;

    for (var i = 0; i < arySize; i++) {

        var swapWith = Math.floor(Math.random() * arySize);

        orig = ary[i];
        swap = ary[swapWith];

        ary[i] = swap;
        ary[swapWith] = orig;
    }

    return ary;
}
