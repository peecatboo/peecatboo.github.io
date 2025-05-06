(function() {
    'use strict';

    window.Integration = Integration;

    function Integration() {
        this.CONTENT_FRAME_NAME = 'content';
    }

    function DisplayState() {
        this.Active    = null;
        this.Enabled   = null;
        this.Completed = null;
        this.Satisfied = null;
    }

    Integration.prototype.PopulateMenuItemDivTag = function () {
        return new DisplayState();
    };

    Integration.prototype.UpdateMenuStateDisplay= function (
                                                activity,
                                                activityIdentifier,
                                                deliverable,
                                                currentActivity,
                                                navigationRequestInfo,
                                                learningStandard,
                                                statusDisplay,
                                                currentDisplayState,
                                                useLookAheadActivityStatus){



        var newDisplayState = new DisplayState();

        newDisplayState.Active = (currentActivity !== null && currentActivity !== undefined && activity.GetItemIdentifier() === currentActivity.GetItemIdentifier());

        newDisplayState.Enabled = navigationRequestInfo.WillSucceed === true;


        if (activity.WasAutoCompleted === true && activity.LookAheadActivity === true && useLookAheadActivityStatus === true) {
            newDisplayState.Completed = 'unknown';
        } else {
            newDisplayState.Completed = activity.IsCompleted();
        }

        if (activity.WasAutoSatisfied === true && activity.LookAheadActivity === true && useLookAheadActivityStatus === true) {
            newDisplayState.Satisfied = 'unknown';
        } else {
            newDisplayState.Satisfied = activity.IsSatisfied();
        }

        return newDisplayState;
    };



    Integration.prototype.GetString = function (str){
        // Substitute variables if this is a formatted string with {0}, {1}, etc
        for (var i = 1; i < arguments.length; i++) {
            var regExToReplace = new RegExp('\\{' + (i-1) + '\\}', 'g');
            //str = str.replace('{' + (i-1) + '}', arguments[i].toString());
            if (arguments[i] == null){arguments[i]='';}

            str = str.replace(regExToReplace, arguments[i].toString());
        }

        return str;
    };
})();
