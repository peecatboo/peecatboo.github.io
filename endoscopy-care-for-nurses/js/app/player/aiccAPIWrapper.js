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
 * @exports app/player/aiccAPIWrapper
 */
define(['jquery', 'app/configuration', 'app/events', 'app/utilities/XyTools'], function ($, config, events, tools) {

    var wrapper, Wrapper,
        // local variable definitions
        _Debug = false,
        ProxyScoApiHandle = null,
        findAPITries = 0,
        aicc_url = "undefined",
        aicc_sid = "undefined",
        isHACP = false,
        isAPI = false,
        errorHACP = "0",
        errorTextHACP = "",
        paramHACP = "error",
        versionCMI = "4",
        savingHACPData = {
            "cmi.core.score.min": "0",
            "cmi.core.score.max": "100",
            "cmi.suspend_data": "",
            "cmi.core.score.raw": "0",
            "cmi.core.lesson_status": "",
            "cmi.core.lesson_location": "",
            "cmi.core.session_time": ""
        },
        _NoError = 0,
        _GeneralException = 101,
        _ServerBusy = 102,
        _InvalidArgumentError = 201,
        _ElementCannotHaveChildren = 202,
        _ElementIsNotAnArray = 203,
        _NotInitialized = 301,
        _NotImplementedError = 401,
        _InvalidSetValue = 402,
        _ElementIsReadOnly = 403,
        _ElementIsWriteOnly = 404,
        _IncorrectDataType = 405;

    /**
     * @constructor
     */
    Wrapper = function () {

        /** the default configuration of the object */
        this.config = {};

        // Define exception/error codes
    };

    function getUrlVars() {
        var vars = [],
            hash;
        var par = parent;
        for (var i = 0; i < 10; i++) {
            if (par.parent == 'undefined')
                break;
            par = par.parent;
        }
        var hashes = par.location.href.slice(par.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0].toLowerCase());
            vars[hash[0].toLowerCase()] = hash[1];
        }
        return vars;
    }

    function HACPGetParam() {
        if (isHACP) {
            var data = "command=GetParam&version=" + versionCMI + "&session_id=" + encodeURIComponent(aicc_sid);
            paramHACP = postData(aicc_url, data);
            if (paramHACP == "") {
                paramHACP = "error";
            }
        } else {
            return false;
        }
        if (paramHACP == "error") {
            return false;
        }
        if (getHACPValue("error") != "0") {
            return false;
        }
        return true;
    }

    function postData(aicc_url, data) {
        var objXMLHTTP = new XMLHttpRequest();
        objXMLHTTP.open("POST", aicc_url, false);
        objXMLHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        objXMLHTTP.send(data);
        return objXMLHTTP.responseText;
    }

    Wrapper.prototype.getCommunicationType = function () {
        var result = 0;
        if (isAPI) {
            result = result + 1;
        }
        if (isHACP) {
            result = result + 2;
        }
        return result;
    };

    function HACPExitAU() {
        HACPPushData();

        var result = "";
        var data = "command=ExitAU&version=" + versionCMI + "&session_id=" + encodeURIComponent(aicc_sid);
        result = postData(aicc_url, data);
        getErrorFromResult(result);
        if (errorHACP == "0") {
            return "true";
        }
        return "false";

    }

    function getHACPValue(name) {
        var result = "";
        var splitParams = paramHACP.split("\n");
        var params = "";

        for (var i = 0; i < splitParams.length; i++) {
            var ind = splitParams[i].indexOf(";");
            if (ind > 0) {
                params += "\n" + splitParams[i].substring(0, ind);
                splitParams[i] = splitParams[i].substring(0, ind);
            } else if (ind != 0) {
                params += "\n" + splitParams[i];
            }
            if (ind == 0) {
                splitParams[i] = "";
            }
        }
        if (name == "cmi.suspend_data") {
            var start = params.toUpperCase().indexOf("[CORE_LESSON]") + "[CORE_LESSON]".length;
            var end = params.indexOf("[", params.toUpperCase().indexOf("[CORE_LESSON]") + 1);
            if (end < start)
                end = params.length;
            result = params.substring(start, end);
        } else {
            var key = name.substring(name.lastIndexOf(".") + 1) + "=";
            for (var i = 0; i < splitParams.length; i++) {
                if (splitParams[i].toLowerCase().indexOf(key) >= 0) {
                    result = splitParams[i].substring(splitParams[i].indexOf("=") + 1);
                }
            }
        }
        return $.trim(result);
    }

    function HACPPutParam(name, value) {
        var result = "-1";
        savingHACPData[name] = value;
        return "true"
    }

    function HACPPushData() {
        var saveData = "[Core]\n" +
            "Lesson_Status=" + savingHACPData["cmi.core.lesson_status"].substring(0, 1).toUpperCase() + "\n" +
            "Score=" + savingHACPData["cmi.core.score.raw"] + "," + savingHACPData["cmi.core.score.max"] + "," + savingHACPData["cmi.core.score.min"] + "\n" +
            "Time=" + savingHACPData["cmi.core.session_time"] + "\n" +
            "Lesson_Location=" + savingHACPData["cmi.core.lesson_location"] + "\n" +
            "[Core_Lesson]\n" + savingHACPData["cmi.suspend_data"];
        var data = "command=PutParam&version=" + versionCMI + "&session_id=" + encodeURIComponent(aicc_sid) + "&AICC_data=" + encodeURIComponent(saveData);
        result = postData(aicc_url, data);
        getErrorFromResult(result);
        if (errorHACP == "0") {
            return "true";
        }
        return "false";
    }

    function getErrorFromResult(result) {
        var splitResult = result.split("\n");
        var result = "";
        for (var i = 0; i < splitResult.length; i++) {
            var ind = splitResult[i].indexOf(";");
            if (ind > 0) {
                splitResult[i] = splitResult[i].substring(0, ind);
            }
            if (ind == 0) {
                splitResult[i] = "";
            }
            if (splitResult[i].toUpperCase().indexOf("ERROR=") >= 0) {
                result = splitResult[i].substring(splitResult[i].indexOf("=") + 1, splitResult[i].length);
                errorHACP = $.trim(result);
            }
            if (splitResult[i].toUpperCase().indexOf("ERROR_TEXT") >= 0) {
                result = splitResult[i].substring(splitResult[i].indexOf("=") + 1, splitResult[i].length);
                errorTextHACP = $.trim(result);
            }

        }

    }


    Wrapper.prototype.isProxySco = function () {
        return this.LMSIsInitialized();
    };

    Wrapper.prototype.ProxyScoLMSInitialize = function () {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSInitialize was not successful.");
            return "false";
        }
        if (isAPI) {
            var result = api.LMSInitialize("");
            if (result.toString() != "true") {
                var err = this.ProxyScoErrorHandler();
            }
            return result.toString();
        }
        if (isHACP) {
            HACPGetParam();
            return "true";
        }

        return "false";
    };

    Wrapper.prototype.ProxyScoLMSFinish = function () {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSFinish was not successful.");
            return "false";
        }
        if (isAPI) {
            // call the LMSFinish function that should be implemented by the API
            var result = api.LMSFinish("");
            if (result.toString() != "true") {
                var err = this.ProxyScoErrorHandler();
            }
            return result;
        }
        if (isHACP) {
            return HACPExitAU();
        }
        return "false";
    }

    Wrapper.prototype.ProxyScoLMSGetValue = function (name) {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSInitialize was not successful.");
            return "";
        } else if (isHACP) {
            if (!HACPGetParam()) {
                isHACP = false;
                return "";
            }
            var result = getHACPValue(name);
            return result;
        } else if (isAPI) {
            var value = api.LMSGetValue(name);
            var errCode = api.LMSGetLastError('').toString();
            if (errCode != _NoError) {
                // an error was encountered so display the error description
                var errDescription = api.LMSGetErrorString(errCode);
                tools.log("AICC: LMSGetValue(" + name + ") failed. \n" + errDescription);
                return "";
            } else {
                return value.toString();
            }
        }
        return "";
    }

    Wrapper.prototype.ProxyScoLMSSetValue = function (name, value) {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSInitialize was not successful.");
            return "";
        } else if (isHACP) {
            var result = HACPPutParam(name, value);
            return result;
        } else if (isAPI) {
            tools.log("Set " + name + ": " + value);
            var result = api.LMSSetValue(name, value);
            if (result.toString() != "true") {
                var err = this.ProxyScoErrorHandler();
            }
        }
        return "";

    }

    Wrapper.prototype.ProxyScoLMSCommit = function () {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSCommit was not successful.");
            return "false";
        }
        if (isAPI) {
            var result = api.LMSCommit("");
            if (result != "true") {
                var err = this.ProxyScoErrorHandler();
            }
            return result;
        }
        if (isHACP) {
            return "true";
        }
        return "false";
    }

    Wrapper.prototype.ProxyScoLMSGetLastError = function () {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSGetLastError was not successful.");
            //since we can't get the error code from the LMS, return a general error
            return _GeneralError;
        }
        if (isAPI) {
            return api.LMSGetLastError('').toString();
        }
        if (isHACP) {
            return errorHACP;
        }
        return "";
    }

    Wrapper.prototype.ProxyScoLMSGetErrorString = function (errorCode) {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSGetErrorString was not successful.");
        }
        if (isAPI) {
            return api.LMSGetErrorString(errorCode).toString();
        }
        if (isHACP) {
            return errorTextHACP;
        }
        return "";
    }

    Wrapper.prototype.ProxyScoLMSGetDiagnostic = function (errorCode) {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nLMSGetDiagnostic was not successful.");
        }
        if (isAPI) {
            return api.LMSGetDiagnostic(errorCode).toString();
        }
        if (isHACP) {
            return errorTextHACP;
        }
        return "";
    }

    Wrapper.prototype.LMSIsInitialized = function () {
        // there is no direct method for determining if the LMS API is initialized
        // for example an AICCLMSIsInitialized function defined on the API so we'll try
        // a simple LMSGetValue and trap for the LMS Not Initialized Error

        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nAICCLMSIsInitialized() failed.");
            return false;
        }
        if (isAPI) {
            var value = api.LMSGetValue("cmi.core.student_name");
            var errCode = api.LMSGetLastError('').toString();
            if (errCode == _NotInitialized) {
                return false;
            } else {
                return true;
            }
        }
        if (isHACP) {
            return true;
        }
        return false;
    }

    Wrapper.prototype.ProxyScoErrorHandler = function () {
        var api = this.getProxyScoApiHandle();
        if (!isAPI && !isHACP) {
            tools.log("AICC: Unable to locate the LMS's API Implementation.\nCannot determine LMS error code.");
            return;
        }
        if (isAPI) {
            // check for errors caused by or from the LMS
            var errCode = api.LMSGetLastError('').toString();
            if (errCode != _NoError) {
                // an error was encountered so display the error description
                var errDescription = api.LMSGetErrorString(errCode);

                if (_Debug == true) {
                    errDescription += "\n";
                    errDescription += api.LMSGetDiagnostic(null);
                    // by passing null to LMSGetDiagnostic, we get any available diagnostics
                    // on the previous error.
                }

                tools.log("AICC: " + errDescription);
            }

            return errCode;
        }
        if (isHACP) {
            tools.log("AICC: " + errorTextHACP);
            return errorHACP;
        }
        return;
    }

    Wrapper.prototype.getProxyScoApiHandle = function () {
        var hashIndex;
        if (ProxyScoApiHandle == null) {
            ProxyScoApiHandle = ProxyScoGetAPI();
        }
        if (ProxyScoApiHandle == null) {
            isAPI = false;
        } else {
            isAPI = true;
            return ProxyScoApiHandle;
        }
        aicc_url = decodeURIComponent(getUrlVars()["aicc_url"]);
        hashIndex = aicc_url.indexOf('#');
        if (hashIndex >= 0) {
            aicc_url = aicc_url.substring(0, hashIndex);
        }
        try { // Created only for goldus.netdimensions.com (EKP) LMS. Becouse aicc_url parameter is double encoded on this LMS
            aicc_url = decodeURIComponent(aicc_url);
        } catch (e) {}
        aicc_sid = decodeURIComponent(getUrlVars()["aicc_sid"]);

        if (aicc_url != "undefined" && aicc_sid != "undefined") {
            isHACP = true;
        }
        return ProxyScoApiHandle;
    }

    /**
     * Interface function to get suspend data
     */
    Wrapper.prototype.getSuspendData = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.suspend_data');
        } else {
            tools.log('Failed to get suspend data');
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
            tools.log('Failed to set suspend data');
            return '';
        }
    };

    /**
     * Interface function to set cmi exit mode
     */
    Wrapper.prototype.setCmiExitMode = function (mode) {
        // is not being set for AICC course types
    };

    /**
     * Interface function to get bookmark
     */
    Wrapper.prototype.getBookmark = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.core.lesson_location');
        } else {
            tools.log('Failed to get bookmark');
            return '';
        }
    };

    /**
     * Interface function to set bookmark
     */
    Wrapper.prototype.setBookmark = function (bookmark) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.core.lesson_location', bookmark);
        } else {
            tools.log('Failed to set bookmark');
            return '';
        }
    };

    /**
     * Interface function to get score
     */
    Wrapper.prototype.getScore = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.core.score.raw');
        } else {
            tools.log('Failed to get score');
            return '';
        }
    };

    /**
     * Interface function to set score
     */
    Wrapper.prototype.setScore = function (score) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.core.score.raw', score);
        } else {
            tools.log('Failed to set score');
            return '';
        }
    };

    /**
     * Interface function to set completion status
     */
    Wrapper.prototype.setCompletionStatus = function (status) {
        if (this.LMSIsInitialized()) {
            this.currentLessonStatus = status;
            return this.ProxyScoLMSSetValue('cmi.core.lesson_status', status);
        } else {
            tools.log('Failed to set lesson status');
            return '';
        }
    };

    /**
     * Interface function to set success status
     */
    Wrapper.prototype.setSuccessStatus = function (status) {
        if (this.LMSIsInitialized() && this.currentLessonStatus === 'completed') {
            return this.ProxyScoLMSSetValue('cmi.core.lesson_status', status);
        } else {
            tools.log('Failed to set lesson status');
            return '';
        }
    };

    Wrapper.prototype.setInteractions = function (interactions) {
        var startIndex, i, result, lmsIndex,
            count = interactions.length;
        if (isHACP) {
            return; // don't send interactions to reduce browser close time. We don't support them is HACP mode anyway.
        }
        startIndex = parseInt(this.ProxyScoLMSGetValue('cmi.interactions._count'));
        for (i = 0; i < count; i++) {
            lmsIndex = i + startIndex;
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.id', 'q' + i);
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.type', 'performance'); // because 'other' is not supported by SCORM 1.2
            if (interactions[i].result === 'correct') {
                result = 'correct';
            } else if (interactions[i].result === 'incorrect') { // value not supported by SCORM 1.2
                result = 'wrong';
            } else {
                result = 'neutral';
            }
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.result', result);
            this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '.student_response', interactions[i].response);
            //this.ProxyScoLMSSetValue('cmi.interactions.' + lmsIndex + '')
        }
    };

    Wrapper.prototype.getCredit = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.core.credit') === 'credit';
        } else {
            tools.log('Failed to get credit');
            return true;
        }
    };

    Wrapper.prototype.getMasteryScore = function () {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSGetValue('cmi.student_data.mastery_score');
        } else {
            tools.log('Failed to get mastery score');
            return '';
        }
    };

    Wrapper.prototype.setTime = function (time) {
        if (this.LMSIsInitialized()) {
            return this.ProxyScoLMSSetValue('cmi.core.session_time', convertMillisToScormTime(time));
        } else {
            tools.log('Failed to set session time');
            return '';
        }
    };

    /**
     * Interface function to get learner name
     */
    Wrapper.prototype.getLearnerName = function () {
        // just stub
        return '';
    };

    /**
     * Interface function to get learner id
     */
    Wrapper.prototype.getLearnerId = function () {
        // just stub
        return '';
    };

    function ProxyScofindAPI(win) {
        try {
            while ((win.API == null) && (win.parent != null) && (win.parent != win) ||
                   (win.API && typeof (win.API.LMSInitialized) != 'undefined')) {
                findAPITries++;
                // Note: 7 is an arbitrary number, but should be more than sufficient
                if (findAPITries > 10) {
                    tools.log("AICC: Error finding API -- too deeply nested.");
                    return null;
                }

                win = win.parent;

            }
        } catch (e) {
            return null;
        }
        return win.API;
    }


    function ProxyScoGetAPI() {
        var theAPI = null;
        var topWin = window;
        if ((topWin.parent != null) && (topWin.parent != topWin)) {
            theAPI = ProxyScofindAPI(topWin.parent);
        }
        if ((theAPI == null) && (topWin.top.opener != null) && (typeof (topWin.top.opener) != "undefined")) {
            findAPITries = 0;
            theAPI = ProxyScofindAPI(topWin.top.opener);
        }
        return theAPI;
    }

    function convertMillisToScormTime(totalTime) {
        var hours, minutes, seconds, millis, hundreds, result;

        millis = totalTime % 1000;
        seconds = ((totalTime - millis) / 1000) % 60;
        minutes = ((totalTime - millis - (seconds * 1000)) / 60000) % 60;
        hours = (totalTime - millis - (seconds * 1000) - (minutes * 60000)) / 3600000;

        if (hours == 10000) {
            hours = 9999;
            minutes = (totalTime - (hours * 3600000)) / 60000;
            if (minutes == 100) {
                minutes = 99;
            }
            minutes = Math.floor(minutes);
            seconds = (totalTime - (hours * 3600000) - (minutes * 60000)) / 1000;
            if (seconds == 100) {
                seconds = 99;
            }
            seconds = Math.floor(seconds);
            millis = (totalTime - (hours * 3600000) - (minutes * 60000) - (seconds * 1000));
        }
        hundreds = Math.floor(millis / 10);
        result = zeroPad(hours, 4) + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2) + "." + hundreds;

        if (hours > 9999) {
            result = "9999:99:99.99";
        }
        return result;
    }

    function zeroPad(number, digits) {
        var result, length, decimalToPad, i,
            isNeg = false;
        result = new String(number);
        if (result.indexOf('-') != -1) {
            isNeg = true;
            result = result.substr(1, result.length);
        }
        if (result.indexOf('.') != -1) {
            result.replace('.', '');
            decimalToPad = result.substr(result.indexOf('.') + 1, result.length);
            result = result.substr(0, result.indexOf('.'));
        }
        length = result.length;
        if (length > digits) {
            result = result.substr(0, digits);
        } else {
            for (i = length; i < digits; i++) {
                result = "0" + result;
            }
        }
        if (isNeg == true) {
            result = '-' + result;
        }
        if (decimalToPad != null && decimalToPad != '') {
            if (decimalToPad.length == 1) {
                result += ':' + decimalToPad + '0';
            } else {
                result += ':' + decimalToPad;
            }
        }
        return result;
    }

    wrapper = new Wrapper();

    return wrapper;
});
