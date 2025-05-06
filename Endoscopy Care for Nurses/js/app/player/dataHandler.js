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
 * Module to store and retrieve data to external LMS
 * @module
 * @exports app/player/dataHandler
 * @fires externaldata.recieved
 */
define([
    'module',
    'jquery',
    'app/configuration',
    'app/events',
    'app/utilities/XyTools'
], function (requireModule, $, config, events, tools) {
    var DataHandler, dataHandler, apiWrapper,

        //constants
        SEND_STATUS_ALWAYS        = 'always',
        SEND_STATUS_CREDIT        = 'forCredit',
        SEND_STATUS_MASTERY_SCORE = 'noMasteryScore',
        SEND_STATUS_NEVER         = 'never';

    /**
     * @constructor
     */
    DataHandler = function () {

        /** the default configuration of the object
         *  useFailedStatus - if set to false then the course will be 'completed' instead of failed. Applies only to SCORM 1.2 and AICC.
         *  sendSuccessStatus - possible options are 'always', 'forCredit', 'noMasteryScore' and 'never'. Applies only to SCORM 1.2 and AICC.
         */
        this.config = {
            useFailedStatus   : true,
            sendSuccessStatus : SEND_STATUS_ALWAYS
        };

        this.initialized = false;
        this.bookmark = '';
        this.suspendData = '';
        this.score = '';
        this.completionStatus = '';
        this.successStatus = '';
        this.interactions = [];
        this.startTime = null;
        this.noLMS = false;
        this.userId = '';
        this.userName = '';
        this.scrollPosition = null;

    };

    DataHandler.prototype.init = function () {
        var module = '';

        this.config = $.extend(this.config, config.configure(requireModule.id));

        if (typeof IS_AICC === 'undefined' && typeof SCORM_TYPE === 'undefined' || SCORM_TYPE === 'non-scorm-player') {
            // not a scorm package
            events.trigger('externaldata.recieved', true, dataHandler);
            return;
        }

        if (SCORM_TYPE.indexOf('2004') >= 0) {
            this.config.useFailedStatus = true;
            this.config.sendSuccessStatus = SEND_STATUS_ALWAYS;
        }

        if (IS_AICC) {
            module = 'app/player/aiccAPIWrapper';
        } else if (SCORM_TYPE.indexOf('1.2') >= 0) {
            module = 'app/player/scorm12APIWrapper';
        } else if (SCORM_TYPE.indexOf('2004') >= 0) {
            module = 'app/player/scorm2004APIWrapper';
        }

        if (!window.Xyleme.environment.IS_DEPLOY) {
            if (sessionStorage) {
                this.initialized = true;
                if (sessionStorage.getItem('xyNewSession') === 'true' &&
                        sessionStorage.getItem('xyUrl') === window.location.pathname) { // don't try to restore data of a different course

                    this.suspendData = sessionStorage.getItem('xySuspendData');
                    this.bookmark = sessionStorage.getItem('xyBookmark');

                    // Delete old session data, unneeded
                    sessionStorage.removeItem('xyNewSession');
                    sessionStorage.removeItem('xySuspendData');
                    sessionStorage.removeItem('xyBookmark');
                    sessionStorage.removeItem('xyUrl');

                    if (/Retake|Review/.test(this.bookmark)) { // cut off bookmarking information. We don't need it in preview
                        this.bookmark = this.bookmark.substring(0, this.bookmark.indexOf('_'));
                    }
                }
            }
            events.trigger('externaldata.recieved', true, dataHandler);
            return;
        }

        require([module], function (wrapper) {
            var suspendData, bookmark;
            apiWrapper = wrapper;

            if (!apiWrapper || !apiWrapper.isProxySco()) {
                tools.log("Failed to find external SCORM API");
                dataHandler.noLMS = true;
                events.trigger('externaldata.recieved', true, dataHandler);
                return;
            }

            if (apiWrapper.ProxyScoLMSInitialize() === 'true') {
                dataHandler.initialized = true;
            } else {
                events.trigger('externaldata.recieved', true, dataHandler);
                return;
            }

            dataHandler.suspendData = apiWrapper.getSuspendData();
            dataHandler.bookmark = apiWrapper.getBookmark();
            dataHandler.userId = apiWrapper.getLearnerId();
            dataHandler.userName = apiWrapper.getLearnerName();

            events.trigger('externaldata.recieved', true, dataHandler);
        });

        this.startTime = performance.now();
    };

    DataHandler.prototype.saveDataToLMS = function (dataSet) {
        var sendSuccess = true,
            is2004 = SCORM_TYPE.indexOf('2004') >= 0;

        if (window.Xyleme.environment.IS_DEPLOY && (typeof apiWrapper !== 'undefined')) {
            if (dataSet.completionStatus !== '') {
                if (dataSet.completionStatus) {
                    apiWrapper.setCompletionStatus('completed');
                } else {
                    apiWrapper.setCompletionStatus('incomplete');
                }
            }

            apiWrapper.setSuspendData(dataSet.suspendData);
            apiWrapper.setCmiExitMode(dataSet.cmiExitMode);
            apiWrapper.setBookmark(dataSet.bookmark);
            if (typeof dataSet.score === 'number') {
                apiWrapper.setScore(dataSet.score);
            }

            if (this.config.sendSuccessStatus === SEND_STATUS_CREDIT) {
                sendSuccess = apiWrapper.getCredit();
            } else if (this.config.sendSuccessStatus === SEND_STATUS_MASTERY_SCORE) {
                sendSuccess = apiWrapper.getMasteryScore() === '';
            } else if (this.config.sendSuccessStatus === SEND_STATUS_NEVER) {
                sendSuccess = false;
            }

            if ((is2004 && typeof dataSet.score === 'number') || (dataSet.completionStatus && (dataSet.successStatus !== '') && sendSuccess)) {
                if (dataSet.successStatus) {
                    apiWrapper.setSuccessStatus('passed');
                } else if (this.config.useFailedStatus) {
                    apiWrapper.setSuccessStatus('failed');
                }
            }

            apiWrapper.setTime(performance.now() - this.startTime);

            // store interactions
            apiWrapper.setInteractions(this.interactions.filter(function (interaction) {
                return !interaction.hadAnswer;
            }));

            apiWrapper.ProxyScoLMSCommit();
        }
    };

    DataHandler.prototype.saveData = function (dataSet) {
        if (window.Xyleme.environment.IS_DEPLOY && (typeof apiWrapper !== 'undefined')) {
            // deploy, save all the data
            this.saveDataToLMS(dataSet);
            apiWrapper.ProxyScoLMSFinish();
        } else {  // store general data if we're being redirected and in preview mode
            if (sessionStorage && (/^true$/i).test(sessionStorage.getItem('xyNewSession'))) {
                // preview
                sessionStorage.setItem('xySuspendData', dataSet.suspendData);
                sessionStorage.setItem('xyBookmark', dataSet.bookmark);
                sessionStorage.setItem('xyUrl', window.location.pathname);
            }
        }
    };

    DataHandler.prototype.saveSuspendData = function (dataSet) {
        if (window.Xyleme.environment.IS_DEPLOY && (typeof apiWrapper !== 'undefined')) {
            apiWrapper.setSuspendData(dataSet.suspendData);
            apiWrapper.setCmiExitMode(dataSet.cmiExitMode);
            apiWrapper.setBookmark(dataSet.bookmark);
            apiWrapper.setCompletionStatus('incomplete');
            apiWrapper.ProxyScoLMSCommit();
        }
    };

    DataHandler.prototype.addInteraction = function (interaction) {
        var exists = false;
        this.interactions.forEach(function (element, i, array) {
            if (element.reportId === interaction.reportId) {
                interaction.hadAnswer = element.hadAnswer;
                array[i] = interaction;
                exists = true;
            }
        });
        if (!exists) {
            tools.log("Interaction added: " + JSON.stringify(interaction));
            this.interactions.push(interaction);
        }
    };

    /**
     * Creates a new instance of the DataHandler object to return as a module
     * @type {DataHandler}
     */
    dataHandler = new DataHandler();
    events.trigger('player.dataHandler:loaded', true, dataHandler);

    return dataHandler;
});
