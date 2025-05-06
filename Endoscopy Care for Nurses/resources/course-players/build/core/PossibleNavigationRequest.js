(function() {

    PossibleRequest = function(navigationRequest, targetActivityItemIdentifier, willSucceed, exception, exceptionText) {

        this.NavigationRequest = navigationRequest;
        this.TargetActivityItemIdentifier = targetActivityItemIdentifier;
        this.WillSucceed = willSucceed;
        this.Exception = exception;
        this.ExceptionText = exceptionText;

        this.TargetActivity = null; //use with caution, not initialized
        this.SequencingRequest = null;
        this.TerminationSequencingRequest = null;

        this.Hidden = false;
        this.Disabled = false;

        //MR additions for "quick" lookahead
        this.PreConditionSkipped = false;
        this.PreConditionStopForwardTraversal = false; //rule evaluates to true (on this activity, the choice request is still allowed)
        this.PreConditionStopForwardTraversalViolation = false; //is not allowed because rule evaluates to true
        this.PreConditionDisabled = false;
        this.PreConditionHiddenFromChoice = false;
        this.LimitConditionViolation = false;
        this.IsVisibleViolation = false;
        this.PreventActivationViolation = false;
        this.ControlChoiceViolation = false;
        this.ForwardOnlyViolation = false;
        this.ChoiceExitViolation = false;
        this.ConstrainedChoiceViolation = false;
        this.NoDeliverablieActivityViolation = false;

        this.WillAlwaysSucceed = false;
        this.WillNeverSucceed = false;
    }


    PossibleRequest.prototype.toString = function() {
        return "Navigation Request = " + this.NavigationRequest + ", TargetActivityItemIdentifier=" + this.TargetActivityItemIdentifier;
    };

    PossibleRequest.prototype.GetErrorString = function() {

        //when debugging or developing, it can be useful to display the Exception (which is essentially the sequencing line number)
        //var ret = this.Exception + " " + this.ExceptionText;

        var ret = this.ExceptionText;
        return ret.trim();
    };

    PossibleRequest.prototype.GetExceptionReason = function() {

        var ret = this.ExceptionText;
        ret.trim();

        ret += "[" + this.Exception + "], "

        ret += ", WillAlwaysSucceed = ";
        ret += this.WillAlwaysSucceed.toString();

        ret += ", WillNeverSucceed = ";
        ret += this.WillNeverSucceed.toString();

        ret += ", PreConditionSkipped = ";
        ret += this.PreConditionSkipped.toString();

        ret += ", PreConditionStopForwardTraversal = ";
        ret += this.PreConditionStopForwardTraversal.toString();

        ret += ", PreConditionDisabled = ";
        ret += this.PreConditionDisabled.toString();

        ret += ", PreConditionHiddenFromChoice = ";
        ret += this.PreConditionHiddenFromChoice.toString();

        ret += ", LimitConditionViolation = ";
        ret += this.LimitConditionViolation.toString();

        ret += ", IsVisibleViolation = ";
        ret += this.IsVisibleViolation.toString();

        ret += ", PreventActivationViolation = ";
        ret += this.PreventActivationViolation.toString();

        ret += ", ControlChoiceViolation = ";
        ret += this.ControlChoiceViolation.toString();

        ret += ", ForwardOnlyViolation = ";
        ret += this.ForwardOnlyViolation.toString();

        ret += ", ChoiceExitViolation = ";
        ret += this.ChoiceExitViolation.toString();

        ret += ", ConstrainedChoiceViolation = ";
        ret += this.ConstrainedChoiceViolation.toString();

        return ret;
    };

    PossibleRequest.prototype.ResetForNewEvaluation = function() {

        this.WillSucceed = true;
        this.Hidden = false;
        this.Disabled = false;

        this.PreConditionSkipped = false;
        this.PreConditionStopForwardTraversal = false;
        this.PreConditionDisabled = false;
        this.PreConditionHiddenFromChoice = false;
        this.LimitConditionViolation = false;
        this.IsVisibleViolation = false;
        this.PreventActivationViolation = false;
        this.ControlChoiceViolation = false;
        this.ForwardOnlyViolation = false;
        this.ChoiceExitViolation = false;
        this.ConstrainedChoiceViolation = false;
    };

})();
