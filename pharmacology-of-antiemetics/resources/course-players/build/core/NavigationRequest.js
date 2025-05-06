var NAVIGATION_REQUEST_START = "START";
var NAVIGATION_REQUEST_RESUME_ALL = "RESUME ALL";
var NAVIGATION_REQUEST_CONTINUE = "CONTINUE";
var NAVIGATION_REQUEST_PREVIOUS = "PREVIOUS";
var NAVIGATION_REQUEST_FORWARD = "FORWARD";
var NAVIGATION_REQUEST_BACKWARD = "BACKWARD";
var NAVIGATION_REQUEST_CHOICE = "CHOICE";
var NAVIGATION_REQUEST_EXIT = "EXIT";
var NAVIGATION_REQUEST_EXIT_ALL = "EXIT ALL";
var NAVIGATION_REQUEST_SUSPEND_ALL = "SUSPEND ALL";
var NAVIGATION_REQUEST_ABANDON = "ABANDON";
var NAVIGATION_REQUEST_ABANDON_ALL = "ABANDON ALL";
var NAVIGATION_REQUEST_NOT_VALID = "INVALID";
var NAVIGATION_REQUEST_JUMP = "JUMP";

var NAVIGATION_REQUEST_DISPLAY_MESSAGE = "DISPLAY MESSAGE";
var NAVIGATION_REQUEST_EXIT_PLAYER = "EXIT PLAYER";

(function() {
    NavigationRequest = function(type, targetActivity, messageToUser) {
        this.Type = type;
        this.TargetActivity = targetActivity;
        this.MessageToUser = messageToUser;
    }

    NavigationRequest.prototype.toString = function() {
        return "Type=" + this.Type + ", TargetActivity=" + this.TargetActivity + ", MessageToUser=" + this.MessageToUser;
    };

    NavigationRequest.prototype.toDescriptiveString = function() {
        var ret = "";

        ret += this.Type;

        if (this.TargetActivity !== null) {
            ret += " targeting \"" + this.TargetActivity + "\".";
        }

        return ret;
    };
})();
