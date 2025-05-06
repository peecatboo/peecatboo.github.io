/*!
 * @license
 * Copyright c 2019 Xyleme, Inc., 700 17th Street, Suite 1950 Denver, CO. 80202 USA.
 * All rights reserved.
 *
 * This file and related documentation are protected by copyright and
 * are distributed under licenses regarding their use, copying, distribution,
 * and decompilation. No part of this product or related documentation may
 * be reproduced or transmitted in any form or by any means, electronic or
 * mechanical, for any purpose, without the express written permission of
 * Xyleme, Inc.
*/

/**
 * Module to communicate between LMS and the course
 * @module
 * @exports app/player/scorm2004APIWrapper
 */
define(['jquery', 'app/configuration', 'app/events', 'app/utilities/XyTools'], function ($, config, events, tools) {

    var wrapper, Wrapper,
        _Debug = false, // set this to false to turn debugging off

        // local variable definitions
        ProxyScoApiHandle = null,
        findAPITries = 0;

    /**
     * @constructor
     */
    Wrapper = function () {

        /** the default configuration of the object */
        this.config = {};

        // Define exception/error codes
        this._NoError = 0;
        this._GeneralException = 101;
        this._ServerBusy = 102;
        this._InvalidArgumentError = 201;
        this._ElementCannotHaveChildren = 202;
        this._ElementIsNotAnArray = 203;
        this._NotInitialized = 301;
        this._NotImplementedError = 401;
        this._InvalidSetValue = 402;
        this._ElementIsReadOnly = 403;
        this._ElementIsWriteOnly = 404;
        this._IncorrectDataType = 405;

        this.api = null;
        this.isInitialized = false;

    };



    /*******************************************************************************
     **
     ** Function: isProxySco()
     ** Inputs:  None
     ** Return:  JavaScript boolean true if Europa RTS runs within 3rd party API Adapter, or
     **          JavaScript boolean false if not.
     **
     ** Description:
     ** Try to find out if Europa RTS runs as SCO for some other LMS
     **
     *******************************************************************************/
    Wrapper.prototype.isProxySco = function () {
        return this.getProxyScoApiHandle() != null;
    };

    /*******************************************************************************
     **
     ** Function: ProxyScoLMSInitialize()
     ** Inputs:  None
     ** Return:  CMIBoolean true if the initialization was successful, or
     **          CMIBoolean false if the initialization failed.
     **
     ** Description:
     ** Initialize communication with LMS by calling the LMSInitialize
     ** function which will be implemented by the LMS.
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSInitialize = function () {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
            return "false";
        }

        var result = api.Initialize("");

        if (result === true || result === "true") {
            // there is no direct method for determining if the LMS API is initialized
            // for example an LMSIsInitialized function defined on the API so we'll try
            // a simple LMSGetValue and trap for the LMS Error
            value = api.GetValue("cmi.learner_name");
            errCode = api.GetLastError().toString();
            this.isInitialized = errCode == this._NoError;
        }

        if (result.toString() !== "true") {
                this.ErrorHandler();
            }

        return result.toString();
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSFinish()
     ** Inputs:  None
     ** Return:  CMIBoolean true if successful
     **          CMIBoolean false if failed.
     **
     ** Description:
     ** Close communication with LMS by calling the LMSFinish
     ** function which will be implemented by the LMS
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSFinish = function () {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
            return "false";
        } else {
            // call the LMSFinish function that should be implemented by the API

            var result = api.Terminate("");
            this.isInitialized = false;
            if (result.toString() !== "true") {
                this.ErrorHandler();

                // in case of termination failure don't drop isInitialized if we still can use API
                value = api.GetValue("cmi.learner_name");
                errCode = api.GetLastError().toString();
                this.isInitialized = errCode != this._NoError;
            }

        }

        return result.toString();
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSGetValue(name)
     ** Inputs:  name - string representing the cmi data model defined category or
     **             element (e.g. cmi.core.student_id)
     ** Return:  The value presently assigned by the LMS to the cmi data model
     **       element defined by the element or category identified by the name
     **       input value.
     **
     ** Description:
     ** Wraps the call to the LMS LMSGetValue method
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSGetValue = function (name) {
        var api = this.getProxyScoApiHandle(),
            value, errCode;
        if (api == null) {
            tools.log("SCORM API object was not found");
            return "";
        } else {
            value = api.GetValue(name);
            tools.log("SCORM Get: " + name + ": " + value);
            errCode = api.GetLastError().toString();
            if (errCode != this._NoError) {
                // an error was encountered so display the error description
                var errDescription = api.GetErrorString(errCode);
                tools.log("SCORM ProxySco: GetValue(" + name + ") failed. \n" + errDescription);
                return "";
            } else {
                return value.toString();
            }
        }
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSSetValue(name, value)
     ** Inputs:  name -string representing the data model defined category or element
     **          value -the value that the named element or category will be assigned
     ** Return:  CMIBoolean true if successful
     **          CMIBoolean false if failed.
     **
     ** Description:
     ** Wraps the call to the LMS LMSSetValue function
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSSetValue = function (name, value) {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
            return;
        } else {
            tools.log("SCORM Set: " + name + ": " + value);
            var result = api.SetValue(name, value);
            if (result.toString() != "true") {
                var err = this.ErrorHandler();
            }
        }

        return;
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSCommit()
     ** Inputs:  None
     ** Return:  None
     **
     ** Description:
     ** Call the LMSCommit function
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSCommit = function () {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
            return "false";
        } else {
            var result = api.Commit("");
            if (result != "true") {
                var err = this.ErrorHandler();
            }
        }

        return result.toString();
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSGetLastError()
     ** Inputs:  None
     ** Return:  The error code that was set by the last LMS function call
     **
     ** Description:
     ** Call the LMSGetLastError function
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSGetLastError = function () {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
            //since we can't get the error code from the LMS, return a general error
            return this._GeneralError;
        }

        return api.GetLastError().toString();
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSGetErrorString(errorCode)
     ** Inputs:  errorCode - Error Code
     ** Return:  The textual description that corresponds to the input error code
     **
     ** Description:
     ** Call the LMSGetErrorString function
     **
     ********************************************************************************/
    Wrapper.prototype.ProxyScoLMSGetErrorString = function (errorCode) {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
        }

        return api.GetErrorString(errorCode).toString();
    };

    /*******************************************************************************
     **
     ** Function ProxyScoLMSGetDiagnostic(errorCode)
     ** Inputs:  errorCode - Error Code(integer format), or null
     ** Return:  The vendor specific textual description that corresponds to the
     **          input error code
     **
     ** Description:
     ** Call the LMSGetDiagnostic function
     **
     *******************************************************************************/
    Wrapper.prototype.ProxyScoLMSGetDiagnostic = function (errorCode) {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            tools.log("SCORM API object was not found");
        }

        return api.GetDiagnostic(errorCode).toString();
    };

    /*******************************************************************************
     **
     ** Function LMSIsInitialized()
     ** Inputs:  none
     ** Return:  true if the LMS API is currently initialized, otherwise false
     **
     ** Description:
     ** Determines if the LMS API is currently initialized or not.
     **
     *******************************************************************************/
    Wrapper.prototype.LMSIsInitialized = function () {
        var api = this.getProxyScoApiHandle(),
            value, errCode;
        if (api == null) {
            tools.log("SCORM API object was not found");
            return false;
        } else {
            return this.isInitialized;
        }
    };

    /*******************************************************************************
     **
     ** Function ErrorHandler()
     ** Inputs:  None
     ** Return:  The current value of the LMS Error Code
     **
     ** Description:
     ** Determines if an error was encountered by the previous API call
     ** and if so, displays a message to the user.  If the error code
     ** has associated text it is also displayed.
     **
     *******************************************************************************/
    Wrapper.prototype.ErrorHandler = function () {
        var api = this.getProxyScoApiHandle();
        if (api == null) {
            // TODO log error
            return;
        }

        // check for errors caused by or from the LMS
        var errCode = api.GetLastError().toString();
        if (errCode != this._NoError) {
            // an error was encountered so display the error description
            var errDescription = api.GetErrorString(errCode);

            if (_Debug == true) {
                errDescription += "\n";
                errDescription += api.GetDiagnostic(null);
                // by passing null to GetDiagnostic, we get any available diagnostics
                // on the previous error.
            }

            tools.log("ProxySco: " + errDescription);
        }

        return errCode;
    };

    /******************************************************************************
     **
     ** Function getProxyScoApiHandle()
     ** Inputs:  None
     ** Return:  value contained by ProxyScoApiHandle
     **
     ** Description:
     ** Returns the handle to API object if it was previously set,
     ** otherwise it returns null
     **
     *******************************************************************************/
    Wrapper.prototype.getProxyScoApiHandle = function () {
        if (this.api == null) {
            this.api = GetAPI(window);
        }

        return this.api;
    };

    /*******************************************************************************
     **
     ** Function ScanForAPI(win)
     ** Inputs:  win - a Window Object
     ** Return:  If an API object is found, it's returned, otherwise null is returned
     **
     ** Description:
     ** This function looks for an object named API in parent and opener windows
     **
     *******************************************************************************/
    function ScanForAPI(win)
    {
        var nFindAPITries = 0,
            maxTries = 10;
        while ((win.API_1484_11 == null) && (win.parent != null)
               && (win.parent != win))
       {
          nFindAPITries++;
          if (nFindAPITries > maxTries)
          {
             return null;
          }
          win = win.parent;
       }
       return win.API_1484_11;
    }

    function GetAPI(win)
    {
       var API = null;
       if ((win.parent != null) && (win.parent != win))
       {
          API = ScanForAPI(win.parent);
       }
       if ((API == null) && (top.opener != null))
       {
          API = ScanForAPI(top.opener);
       }
       return API;
    }

    /**
     * Interface function to get suspend data
     */
    Wrapper.prototype.getSuspendData = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.suspend_data');
        } else {
            tools.warn('Failed to get suspend data');
            return '';
        }
    };

    /**
     * Interface function to set suspend data
     */
    Wrapper.prototype.setSuspendData = function (data) {
        if (this.LMSIsInitialized()) {
           return this.ProxyScoLMSSetValue('cmi.suspend_data', data);
        } else {
            tools.warn('Failed to set suspend data');
            return '';
        }
    };

    /**
     * Interface function to set cmi exit mode
     */
    Wrapper.prototype.setCmiExitMode = function (mode) {
        if (this.LMSIsInitialized()) {
            if (mode) {
                this.ProxyScoLMSSetValue('cmi.exit', mode);
            } else {
                this.ProxyScoLMSSetValue('cmi.exit', 'suspend');
            }
        } else {
            tools.warn('Failed to set exit mode');
        }
    };

    /**
     * Interface function to get bookmark
     */
    Wrapper.prototype.getBookmark = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.location');
        } else {
            tools.warn('Failed to get bookmark');
            return '';
        }
    };

    /**
     * Interface function to set bookmark
     */
    Wrapper.prototype.setBookmark = function (bookmark) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.location', bookmark);
        } else {
            tools.warn('Failed to set bookmark');
            return '';
        }
    };

    /**
     * Interface function to get score
     */
    Wrapper.prototype.getScore = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.score.scaled');
        } else {
            tools.warn('Failed to get score');
            return '';
        }
    };

    /**
     * Interface function to set score
     */
    Wrapper.prototype.setScore = function (score) {
        if (this.LMSIsInitialized()) {
            this.ProxyScoLMSSetValue('cmi.score.min', '0');
            this.ProxyScoLMSSetValue('cmi.score.max', '100');
            this.ProxyScoLMSSetValue('cmi.score.raw', score);
            return this.ProxyScoLMSSetValue('cmi.score.scaled', '' + (score/100));
        } else {
            tools.warn('Failed to set score');
            return '';
        }
    };

    /**
     * Interface function to set completion status
     */
    Wrapper.prototype.setCompletionStatus = function (status) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.completion_status', status);
        } else {
            tools.warn('Failed to set lesson status');
            return '';
        }
    };

    /**
     * Interface function to set success status
     */
    Wrapper.prototype.setSuccessStatus = function (status) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.success_status', status);
        } else {
            tools.warn('Failed to set lesson status');
            return '';
        }
    };

    Wrapper.prototype.setInteractions = function (interactions) {
        var startIndex, i, lmsIndex,
            count = interactions.length;
        startIndex = parseInt(this.ProxyScoLMSGetValue('cmi.interactions._count'));
        for (i = 0; i < count; i++) {
            lmsIndex = i + startIndex;
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.id', interactions[i].reportId);
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.type', 'other');
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.result', interactions[i].result);
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.learner_response', interactions[i].response);
            //this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '')
        }
    };

    Wrapper.prototype.getCredit = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.credit') === 'credit';
        } else {
            tools.warn('Failed to get credit');
            return true;
        }
    };

    Wrapper.prototype.setTime = function (time) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.session_time', tools.convertMillisToSCORM2004Time(time));
        } else {
            tools.warn('Failed to set session time');
            return '';
        }
    };

    /**
     * Interface function to get learner name
     */
    Wrapper.prototype.getLearnerName = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.learner_name');
        } else {
            tools.warn('Failed to get user name');
            return '';
        }
    };

    /**
     * Interface function to get learner id
     */
    Wrapper.prototype.getLearnerId = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.learner_id');
        } else {
            tools.warn('Failed to get user id');
            return '';
        }
    };

    /*******************************************************************************
     **
     ** Function getAPI()
     ** Inputs:  none
     ** Return:  If an API object is found, it's returned, otherwise null is returned
     **
     ** Description:
     ** This function looks for an object named API, first in the current window's
     ** frame hierarchy and then, if necessary, in the current window's opener window
     ** hierarchy (if there is an opener window).
     **
     *******************************************************************************/
    function getAPI() {
        var theAPI = null,
            topWin = window;
        if ((topWin.parent != null) && (topWin.parent != topWin)) {
            theAPI = findAPI(topWin.parent);
        }
        if ((theAPI == null) && (topWin.top.opener != null) && (typeof (topWin.top.opener) != "undefined")) {
            this.findAPITries = 0;
            theAPI = findAPI(topWin.top.opener);
        }
        return theAPI;
    };

    wrapper = new Wrapper();

    return wrapper;
});
