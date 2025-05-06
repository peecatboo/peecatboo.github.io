/* eslint-disable prefer-template */
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

//=====================================================================================
// NOTE: IF YOU ARE GOING TO ADD SOME NEW METHOD
//       TO PLAYER INTERFACE WHICH WILL BE CALLED FROM OUTSIDE
//       PLEASE, CREATE NEW JIRA TICKET
//       TO REPLICATE THIS METHOD IN ALL OTHER PLAYERS INTERFACES AS WELL.
//       INTERFACES SHOULD BE THE SAME FOR ALL PLAYERS!!!
// SUPPORTED PLAYERS: JLP, CloudPlayer and Shell
//=====================================================================================

// eslint-disable-next-line no-undef
define([
    "bcp",
    "app/events",
    "app/player/dataHandler",
    "app/utilities/XyTools",
    "lang/lang",
    "notification",
], function (
    /**
     * Globals PlayerInterface dependency.
     * @exports globals
     */
    globals,
    /**
     * Events PlayerInterface dependency.
     * @exports events
     */
    _events,
    /**
     * DataHandler PlayerInterface dependency.
     * @exports dataHandler
     */
    _dataHandler,
    /**
     * Tools PlayerInterface dependency.
     * @exports tools
     */
    _tools,
    /**
     * Lang PlayerInterface dependency.
     * @exports lang
     */
    _lang,
    /**
     * Notification PlayerInterface dependency.
     * @exports notification
     */
    _notification
) {
    const config = {
        messages: {
            confirmationMessage:
                _lang.t("components.exitButton.confirm") ||
                "Are you sure you want to exit the course? Your progress will be saved.",
            confirmationMessageNoSave:
                _lang.t("components.exitButton.confirmNoSave") ||
                "Are you sure you want to exit the course?",
            confirmationMessageTimerOn:
                _lang.t("components.exitButton.confirmTimerOn") ||
                "Are you sure you want to exit the course? The timer will continue to count down, " +
                    "even if the course is closed.",
            proctorConfirmationMessage:
                _lang.t("player.cloudPlayer.exitMessages.proctorConfirm") ||
                "Are you sure you want to exit the course?\nThis is a Proctored course, by leaving " +
                    "this page:\n  * The current attempt will terminate and registered as failed\n  * You will " +
                    "need a new authorization from a Proctor to re-attempt this course",
            submitAllMessage:
                _lang.t("components.submitAllButton.confirm") ||
                "Do you really want to submit all your answers?",
            acceptanceCheckMessage:
                _lang.t("components.submitAllButton.acceptanceCheck") ||
                "I understand that any unanswered questions will also be submitted",
        },
    };

    const BOOKMARK_TYPES = {
        RESUME: "Resume",
        RETAKE: "Retake",
        REVIEW: "Review",
    };

    const PROCTORED_STATE = {
        PROCTORED_NONE: 0,
        PROCTORED_IN: 1,
        PROCTORED_OUT: 2,
        NOT_PROCTORED: 3,
    };

    const TIMER_ID = "timer";
    const USPIntegration = parent.PlayerIntegration;

    /**
     * Returns activity property value
     *
     * @param {object} activity  - activity to get property from
     * @param {string} param     - activity property name
     *
     @returns {(*|null)} Requested property value, Activity if requested property not found,
     Null if activity is null/undefined or param is missing/not a string,
     */
    function _getActivityParamValue(activity, param) {
        if (!activity || _isEmptyObject(activity)) {
            return null;
        }
        if (!param || typeof param !== "string") {
            return null;
        }
        if (param.match(/name|title/i)) {
            return activity.title;
        }
        if (param.match(/^guid$/i)) {
            return activity.guid;
        }
        if (param.match(/^attempts$/i)) {
            return activity.attempts;
        }
        if (param.match(/^score$/i)) {
            return USPIntegration.getActivityScore(activity);
        }
        if (param.match(/^passingscore$/i)) {
            return activity.minimumMeasure * 100;
        }
        if (param.match(/^weight$/i)) {
            return +activity.weight * 100;
        }
        if (param.match(/^completion$/i)) {
            return activity.completion === true;
        }
        if (param.match(/^satisfied$/i)) {
            return activity.satisfied === true;
        }
        if (param.match(/^parent$/i)) {
            return activity.parent;
        }
        if (param.match(/^availableChildren$/i)) {
            return activity.availableChildren;
        }
        if (param.match(/^leaf$/i)) {
            return activity.children.length === 0;
        }
        if (typeof activity[param] !== "undefined") {
            return activity[param];
        }
        return activity;
    }

    function _isEmptyObject(obj) {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }

    function _isCourseCompleted() {
        _events.trigger("communication.saveQuestionData");
        return USPIntegration.isCourseCompleted();
    }

    function _saveProgressData() {
        if (hasQuestions()) {
            _events.trigger("communication.saveQuestionsToPlayer");
        }
        const dataSet = USPIntegration.getCourseDataSet();
        _dataHandler.saveDataToLMS(dataSet);
    }

    /**
     * Checks if assessment was submitted (current activity is checked)
     *
     * @returns {boolean}
     */
    function _isAssessmentSubmitted() {
        return USPIntegration.isAssessmentSubmitted();
    }

    //==========================================================================
    //
    // Events listeners
    //
    //==========================================================================

    // media state events
    _events.on("lrs.media:played", function (data) {
        USPIntegration.mediaPlayed(data);
    });

    // content has loaded
    _events.on("lrs.content:opened", function (data) {
        USPIntegration.contentOpened(data);
    });
    // assessment has started
    _events.on("lrs.assessment:started", function (data) {
        USPIntegration.assessmentStarted(data);
    });

    // assessment has ended
    _events.on("lrs.assessment:ended", function (data) {
        USPIntegration.assessmentEnded(data);
    });

    // question has answered
    _events.on("lrs.question:answered", function (data) {
        USPIntegration.questionAnswered(data);
    });

    // questions has submitted
    _events.on("lrs.questions:submitall", function (data) {
        USPIntegration.submitAllQuestions(data);
    });

    // NOTE: defined here to support JSDoc, re-assigned with members later in this file
    /**
     * PlayerInterface API,
     * returns PUBLIC API
     * @exports PlayerInterface
     */
    PlayerInterface = {};

    /**
     * WPS-4304
     * Ensure that the window.Xyleme.environment.IS_DEPLOY value is correct
     * based upon its initial value and whether or not we are running a thin
     * package course.
     *
     * Note: This value will only ever return false in a deployed package
     *       if Cloud Player is being used and we are in a CDS preview. Otherwise,
     *       this will always return true in a deployed package.
     * Note: Self-invoking method so as to run immediately in order to correct deploy state info
     *
     * Checks if CDS deploy mode is true ("thin" package, shared url or launch url)
     * @returns {boolean} True for CDS deploy mode, otherwise False
     */
    isCDSDeploy = function () {
        const isDeploy = USPIntegration.isDeploy();

        if (!isDeploy) {
            window.Xyleme.environment.ALLOW_PREVIEW_CACHING = true;
        }

        return isDeploy;
    };

    /**
     * Returns custom parameters added to course launching url
     *
     * @returns {*} custom parameters
     */
    getCustomParameters = function () {
        return USPIntegration.getCustomParameters();
    };

    /**
     * Initializes player for future usage
     *
     * @returns {void}
     */
    initialize = function () {
        // call USP's init
        USPIntegration.init().then(function () {
            _saveProgressData();
            console.log('<<initialize>> request processed');
        }).catch((e) => {
            console.log('<<initialize>> request rejected');
        });
    };

    /**
     * Requests the "next" page in the course sequence according the course player
     *
     * @returns {void}
     */
    next = function () {
        USPIntegration.next().then(function () {
            _saveProgressData();
            console.log('<<next>> request processed');
        }).catch((e) => {
            console.log('<<next>> request rejected');
        });
    };

    /**
     * Requests the "previous" page in the course sequence according the course player
     *
     * @returns {void}
     */
    previous = function () {
        USPIntegration.previous().then(function () {
            _saveProgressData();
            console.log('<<previous>> request processed');
        }).catch((e) => {
            console.log('<<previous>> request rejected');
        });
    };

    /**
     * Requests the content of a page selected in course menu
     *
     * @param {string} treeItemId           - id of tree item, which was selected in course menu
     *
     * @returns {void}
     */
    choice = function (treeItemId) {
        USPIntegration.choice(treeItemId).then(function () {
            _saveProgressData();
            console.log('<<choice>> request processed');
        }).catch((e) => {
            console.log('<<choice>> request rejected');
        });
    };

    /**
     * Requests assessment retake
     *
     * @returns {void}
     */
    retake = function () {
        USPIntegration.retake().then(function () {
            _saveProgressData();
            console.log('<<retake>> request processed');
        }).catch((e) => {
            console.log('<<retake>> request rejected');
        });
    };

    /**
     * Requests course unload/exit
     *
     * @returns {void}
     */
    unload = function () {
        const dataSet = USPIntegration.getCourseDataSet();
        const result = USPIntegration.exit().then(function () {
            // store data to LMS
            console.log(
                'Processing course exit, Bookmark: ' +
                dataSet.bookmark + ', Suspend Data: ' +
                dataSet.suspendData
            );
            storeLMSdata(dataSet);
            console.log('<<unload>> request processed');
        });

        // if call to then() results in truthy object, it is a promise, so report rejection
        // otherwise, then() was a pseudo promise function, so do nothing
        if (result) {
          result.catch((e) => {
            console.log('<<unload>> request rejected');
          });
        }
    };

    /**
     * Tells if current page contains questions or not
     *
     * @returns {boolean} True if current page contains questions, otherwise False
     */
    hasQuestions = function () {
        return USPIntegration.hasQuestions();
    };

    /**
     * Collects all data needed to process scorecard. This info is used by section status as well
     *
     * @param {string} containerId  - container Id, relative to which the data should be gathered
     * @returns {(object|null)} Scorecard data or null
     */
    processScorecardContainer = function (containerId) {
        _events.trigger("communication.saveQuestionsToPlayer");
        return USPIntegration.processScorecardContainer(containerId);
    };

    /**
     * Returns whether or not SubmitAll mode is turned on activity with specified Id.
     *
     * @param  {string}  activityId - Id of activity to check if Submit all mode is on.
     *                                Current activity is used if not specified/null/undefined.
     * @returns {boolean}           - whether or not SubmitAll mode is on
     */
    isSubmitAllMode = function (activityId) {
        return USPIntegration.isSubmitAllMode(activityId);
    };

    /**
     * Checks if assessment was submitted (current activity is checked)
     *
     * @returns {boolean}          - whether or not assessment was submitted
     */
    isSubmitAllStatusSaved = function () {
        return _isAssessmentSubmitted();
    };

    /**
     * Submits assessment
     *
     * @param {string} scorecardId - ScoreCard ID. Current activity is used if not specified
     *
     * @returns {void}
     */
    saveSubmitAllStatus = function (scorecardId) {
        USPIntegration.submitAssessment(scorecardId);
    };

    /**
     * Returns Bookmark type of current activity
     *
     * @returns {string} - bookmark type ('Resume' | 'Retake' | 'Review')
     */
    getBookmarkType = function () {
        return USPIntegration.getBookmarkType();
    };

    /**
     * Checks if activity with specified Id is a part of the same assessment as current activity(page)
     *
     * @param {string}  activityId - Id of activity to check. Current activity is used if not specified/null/undefined.
     *                               In that case function returns if current activity belongs to assessment
     *
     * @returns {boolean}          - whether or not activity is a part of the assessment
     */
    isAssessment = function (activityId) {
        return USPIntegration.isAssessment(activityId);
    };

    /**
     * Checks whether or not activity with specified Id is a part of any assessment
     *
     * @param  {string}  activityId - Id of activity to check. Current activity is used if not specified
     * @returns {boolean}            - whether or not activity is a part of any assessment
     */
    isAnyAssessment = function (activityId) {
        return USPIntegration.isAnyAssessment(activityId);
    };

    /**
     * Checks if activity's assessment has nested assessments - it's aggregate scorecard then
     *
     * @param {string} activityId    - If not specified/null/undefined, scorecardId will be
     *                                 used (scorecard in current container or its parent).
     * @returns {boolean}            - whether or not activity's assessment has nested assessments
     */
    hasSubassessments = function (activityId) {
        return USPIntegration.hasSubassessments(activityId);
    };

    /**
     * Returns server time in milliseconds. Used to implement timer for timed assessments
     * @returns {number} server time
     */
    getCurrentTime = function () {
        return USPIntegration.getCurrentTime();
    };

    /**
     * Calls exit container action. Is used to exit container on submit all
     *
     * @param {string} scorecardId - Scorecard Id. Player will try to find it if not specified
     *
     * @returns {void}
     */
    exitContainer = function (scorecardId) {
        USPIntegration.exitContainer(scorecardId).then(function () {
            _saveProgressData();
            console.log('<<exitContainer>> request processed')
        }).catch((e) => {
            console.log('<<exitContainer>> request rejected')
        });
    };

    /**
     * Searches for scorecard in current container or its parent
     *
     * @returns {(string|undefined)}          - scorecard item id or undefined if not found
     */
    findScorecard = function () {
        return USPIntegration.findScorecard();
    };

    /**
     * Checks if given activity is a scorecard
     *
     * @param {string} activityId - Id of activity to check. Current activity is used if not specified/null/undefined.
     *
     * @returns {boolean} - whether or not checked activity is a scorecard
     */
    isScorecard = function (activityId) {
        return USPIntegration.isScorecard(activityId);
    };

    /**
     * Gets exit message from the player to display on onBeforeUnload
     *
     * @returns {string}      - message text
     */
    getExitMessage = function (contextAwareness) {
        if (!isCDSDeploy()) {
            return;
        }

        if (!USPIntegration.isLRSavailable()) {
            return config.messages.confirmationMessageNoSave;
        }

        if (USPIntegration.isProctored()) {
            if (
                !USPIntegration.isProctorAuthenticated(
                    PROCTORED_STATE.PROCTORED_IN
                )
            ) {
                return;
            } else if (
                USPIntegration.isProctorAuthenticated(
                    PROCTORED_STATE.PROCTORED_OUT
                )
            ) {
                if (_isCourseCompleted()) {
                    return;
                }
                return config.messages.confirmationMessage;
            } else {
                return config.messages.proctorConfirmationMessage;
            }
        }

        if (_isCourseCompleted()) {
            return;
        }

        if (retrieveAdditionalData(TIMER_ID)) {
            return config.messages.confirmationMessageTimerOn;
        }

        const confirmationMessage =
            USPIntegration.isNoLms() && USPIntegration.isAnonymous()
                ? config.messages.confirmationMessageNoSave
                : config.messages.confirmationMessage;
        const assessment =
            contextAwareness === false ? isSubmitAllMode() : isAssessment();
        if (
            assessment &&
            hasAttemptedQuestions() &&
            !_isAssessmentSubmitted()
        ) {
            const bookmarkType = getBookmarkType();
            if (
                new RegExp(BOOKMARK_TYPES.RETAKE).test(bookmarkType) ||
                new RegExp(BOOKMARK_TYPES.REVIEW).test(bookmarkType)
            ) {
                return config.messages.submitAllMessage;
            } else if (new RegExp(BOOKMARK_TYPES.RESUME).test(bookmarkType)) {
                return confirmationMessage;
            }
        } else {
            return confirmationMessage;
        }
    };

    /**
     * Displays confirmation popup when user clicks Exit button
     * @param {function} callback         - function to be called to disable onUnload handlers and close browser window
     * @param {boolean} contextAwareness  - submitAll context awareness
     *
     * @returns {void}
     */
    getExitConfirmation = function (callback, contextAwareness) {
        const bookmarkType = getBookmarkType(),
            confirmDialogCheckboxSelector = "input[type=checkbox]",
            confirmDialogOKButtonSelector = ".ConfirmOkButton",
            confirmDialogLabelSelector = "label",
            submitAllTemplate =
                '<div class="SubmitAllConfirmationDialog">' +
                "<p><b>" +
                config.messages.submitAllMessage +
                "</b></p>" +
                '<label><input type="checkbox" /> ' +
                config.messages.acceptanceCheckMessage +
                "</label>" +
                "</div>",
            proctorConfirmationMessagePartials =
                config.messages.proctorConfirmationMessage.split("\n"),
            proctorConfirmationMessageTemplate =
                '<div class="ProctoredConfirmationDialog">' +
                "<p><b>" +
                proctorConfirmationMessagePartials[0] +
                "</b></p>" +
                '<div class="ProctoredConfirmationDialogContent"><p>' +
                proctorConfirmationMessagePartials[1] +
                "</p>" +
                "<ul><li>" +
                proctorConfirmationMessagePartials[2].replace("*", "").trim() +
                "</li><li>" +
                proctorConfirmationMessagePartials[3].replace("*", "").trim() +
                "</li></ul>" +
                "</div></div>";

        if (!isCDSDeploy()) {
            return;
        }

        if (USPIntegration.isProctored()) {
            if (
                !USPIntegration.isProctorAuthenticated(
                    PROCTORED_STATE.PROCTORED_IN
                )
            ) {
                // 'I have no proctor' case
                return;
            } else if (
                USPIntegration.isProctorAuthenticated(
                    PROCTORED_STATE.PROCTORED_OUT
                )
            ) {
                if (_isCourseCompleted()) {
                    if (typeof callback === "function") {
                        callback();
                    }
                    return;
                }
                _notification.confirm(
                    config.messages.confirmationMessage,
                    callback
                );
            } else {
                _notification.confirm(
                    proctorConfirmationMessageTemplate,
                    callback
                );
            }
            return;
        }

        if (_isCourseCompleted()) {
            if (typeof callback === "function") {
                callback();
            }
            return;
        }

        if (retrieveAdditionalData(TIMER_ID)) {
            _notification.confirm(
                config.messages.confirmationMessageTimerOn,
                callback
            );
            return;
        }

        const confirmationMessage =
            USPIntegration.isNoLms() && USPIntegration.isAnonymous()
                ? config.messages.confirmationMessageNoSave
                : config.messages.confirmationMessage;
        const assessment =
            contextAwareness === false ? isSubmitAllMode() : isAssessment();
        if (
            assessment &&
            hasAttemptedQuestions() &&
            !_isAssessmentSubmitted() &&
            (new RegExp(BOOKMARK_TYPES.RETAKE).test(bookmarkType) ||
                new RegExp(BOOKMARK_TYPES.REVIEW).test(bookmarkType))
        ) {
            _notification.confirm(submitAllTemplate, callback, {
                open: function () {
                    const button = this.popup.find(
                        confirmDialogOKButtonSelector
                    );
                    const checkbox = this.content.find(
                        confirmDialogCheckboxSelector
                    );

                    if (!hasQuestions()) {
                        this.content.find(confirmDialogLabelSelector).hide();
                        return;
                    }

                    if (checkbox[0].disabled) return;
                    button.addClass("Disabled")[0].disabled = true;
                    checkbox.on("change", function () {
                        if (this.checked) {
                            this.disabled = true;
                        }
                        button.removeClass("Disabled")[0].disabled = false;
                    });
                },
            });
        } else {
            _notification.confirm(confirmationMessage, callback);
        }
    };

    /**
     * Returns Questions Status Map
     *
     * @param nodeId - node id, relative to which the data should be gathered. Current activity's parent is used if not specified
     *
     * @returns {(Record<string, string> | {})} Questions Status Map as <guid:status> pairs
     */
    getSectionStatusData = function (nodeId) {
        return USPIntegration.getSectionStatusData(nodeId);
    };

    /**
     * Checks if current assessment has unanswered questions
     *
     * @returns {boolean} True if current assessment has unanswered questions, otherwise False
     */
    hasUnansweredQuestions = function () {
        return USPIntegration.hasUnansweredQuestions();
    };

    /**
     * Checks if current assessment has attempted questions
     *
     * @returns {boolean} - True if there are attempted questions, otherwise False
     */
    hasAttemptedQuestions = function () {
        return USPIntegration.hasAttemptedQuestions();
    };

    /**
     * Returns interaction data for requested page
     *
     * @param {string} guid  - page guid to get interactions from
     * @returns {Array}      - array of interactions
     */
    getInteractionsData = function (guid) {
        return USPIntegration.getInteractionsData(guid);
    };

    /**
     * Returns number of pages within current container
     *
     * @returns {number} number of pages
     */
    getContainerPagesCount = function () {
        return USPIntegration.getContainerPagesCount();
    };

    /**
     * Returns count of child pages (activities) of whole course
     *
     * @returns {number} Count of child pages (activities) of whole course
     */
    getCoursePagesCount = function () {
        return USPIntegration.getCoursePagesCount();
    };

    /**
     * Gets index of current page inside it's parent container
     *
     * @returns {number} - index of current page inside it's parent container
     */
    getCurrentPageNumberInContainer = function () {
        return USPIntegration.getCurrentPageNumberInContainer();
    };

    /**
     * Checks if provided activity is sibling of current activity
     *
     * @param {string} activityId - Id of activity to check
     *
     * @returns {boolean} True if provided activity is sibling of current activity, otherwise False
     */
    isSibling = function (activityId) {
        const currentActivity = getCurrentActivity();
        const activity = USPIntegration.getActivityById(activityId);
        if (currentActivity && activity) {
            return currentActivity.parent === activity.parent;
        }
        return false;
    };

    /**
     * Returns index of page in course
     *
     * @param {string} activityId - page identifier, current page will be taken if not specified/null/undefined
     * @returns {number} - index of a page
     */
    getPageIndexInCourse = function (activityId) {
        return USPIntegration.getPageIndexInCourse(activityId);
    };

    /**
     * Checks whether or not randomization was applied to activity
     *
     * @param  {string} activityId - Id of activity to check. Current activity is used if not specified
     * @returns {boolean} True if randomization was applied for activity, otherwise False
     */
    wasRandomizationApplied = function (activityId) {
        return USPIntegration.wasRandomizationApplied(activityId);
    };

    /**
     * Determines if some activity comes after currentActivity
     * used to define direction of navigation in navigation tree
     *
     * @param  {string} activityId  - Id of activity to check
     * @returns {boolean} True if provided activity comes after current activity, otherwise False,
     *                                Null if currentActivity not found or activityId is undefined
     */
    comesAfterCurrent = function (activityId) {
        return USPIntegration.comesAfterCurrent(activityId);
    };

    /**
     * Returns item id of probable next page calculated by player
     *
     * @returns {(string|null)} - id of probable next page or null
     */
    getNextPage = function () {
        return USPIntegration.getNextPageId();
    };

    /**
     * Returns item id of probable previous page calculated by player
     *
     * @returns {(string|null)} - id of probable previous page or null
     */
    getPreviousPage = function () {
        return USPIntegration.getPreviousPageId();
    };

    /**
     * Returns following available activity ID (following in manifest) or null
     *
     * @returns {string} - id of a following page or null
     */
    getFollowingPageId = function () {
        return USPIntegration.getFollowingPageId();
    };

    /**
     * Returns preceding available activity ID (preceding in manifest) or null
     *
     * @returns {string} - id of a preceding page or null
     */
    getPrecedingPageId = function () {
        return USPIntegration.getPrecedingPageId();
    };

    /**
     * Stores course-wide data
     *
     * @param {*} data - data to be stored
     * @returns {void}
     */
    storeAdditionalData = function (data) {
        USPIntegration.storeAdditionalData(data);
    };

    /**
     * Retrieves course-wide data
     *
     * @param {string} id - property name. Required if data should be retrieved only partially by property
     *
     * @returns {object} course-wide data, or its part if id is defined
     */
    retrieveAdditionalData = function (id) {
        let allData = USPIntegration.retrieveAdditionalData();
        if (id) {
            allData = allData || "{}";
            allData = JSON.parse(allData);
            return allData[id];
        }
        return allData;
    };

    /**
     * Returns Root Activity property or root activity itself if param is invalid
     *
     * @param {string} param  - name of root activity property
     *
     * @returns {(*|null)} Requested property value, Root activity if param is null/undefined/not present in activity,
                                                   Null if param is not a string,
     */
    getRootActivity = function (param) {
        const root = USPIntegration.getRootActivity();
        return param ? _getActivityParamValue(root, param) : root;
    };

    /**
     * Returns Parent Activity property or parent activity itself if param is invalid
     *
     * @param {string} id     - name of activity, whose parent should be used
     * @param {string} param  - name of property
     *
     * @returns {(*|null)} Requested property value, Parent activity if param is null/undefined/not present in activity,
                                                   Null if param is not a string or activity has no parent,
     */
    getParentActivity = function (id, param) {
        let activity = USPIntegration.getActivityById(id);

        if (activity == null) {
            // first parameter is not an activity id
            param = id;
            activity = getCurrentActivity();
        }

        if (activity && activity.parent) {
            const parent = USPIntegration.getActivityById(activity.parent);
            return param ? _getActivityParamValue(parent, param) : parent;
        }
        return null;
    };

    /**
     * Returns Current Activity property or current activity itself if param is invalid
     *
     * @param {string} param  - name of property
     *
     * @returns {(*|null)} Requested property value, Current activity if param is null/undefined/not present in activity,
                                                   Null if param is not a string,
     */
    getCurrentActivity = function (param) {
        const current = USPIntegration.getCurrentActivity();
        return param ? _getActivityParamValue(current, param) : current;
    };

    /**
     * Get activity property by different parameters
     *
     * @param {string} by       - parameter name, by which activity should be searched for
     * @param {string} value    - parameter value, used for searching the activity
     * @param {string} param    - activity property name, which value is returned by this function
     *
     * @returns {*} Activity property value
     */
    getActivityBy = function (by, value, param) {
        if (by === "guid") {
            const activity = USPIntegration.getActivityBy(by, value);
            return param ? _getActivityParamValue(activity, param) : activity;
        }
        if (by === "id") {
            const activity = USPIntegration.getActivityById(value);
            return param ? _getActivityParamValue(activity, param) : activity;
        }
        return null;
    };

    /**
     * Checks the existence of a given page in the course
     *
     * @param  {string} id  - The identifier of the page in the format of "Item#.#"
     * @returns {boolean}   Whether or not the page exists
     */
    checkPageExistence = function (id) {
        return !!USPIntegration.getActivityById(id);
    };

    /**
     * Generates MenuItems tree from activities
     *
     * @param {boolean} allChildren   - if True, all activities are used, if False - only available
     *
     * @returns {Array} - array of MenuItems
     */
    getMenuItems = function (allChildren) {
        return USPIntegration.getMenuItems(allChildren);
    };

    /**
     * Gets count of preceding pages with the same guid
     *
     * @param {string} guid - guid of current page
     * @returns {number} - count of preceding linked pages
     */
    getPrecedingLinkedPagesCount = function (guid) {
        return USPIntegration.getPrecedingLinkedPagesCount(guid);
    };

    //==========================================================================
    //
    // METHODS WHICH ARE BEING CALLED FROM PLAYER SIDE
    //
    //==========================================================================

    /**
     * Notifies the course that content url has been changed
     *
     * @param {string} url - The url of the new content to be loaded
     * @param {string} treeId - The "treeId" (e.g. Item1.1) of page to load
     *
     * @returns {void}
     */
    urlChanged = function (url, treeId) {
        _events.trigger("content.url:changed", false, url, treeId);
    };

    /**
     * Tells the course to update navigation buttons states
     *
     * @param {object} state to be used for update
     *
     * @returns {void}
     */
    updateControls = function (state) {
        _events.trigger("navigationButtons.state:changed", true, state);
    };

    /**
     * Notifies the course that player was loaded
     *
     * @returns {void}
     */
    triggerPlayerStart = function () {
        _events.trigger("player.start", true, this);
    };

    /**
     * Notifies the course that player was unloaded
     *
     * @returns {void}
     */
    triggerPlayerUnload = function () {
        _events.trigger("communication.saveQuestionData");
        _events.trigger("player.unload:after");
    };

    /**
     * Transfer data to be saved to LMS
     * @param dataSet - data to be saved to LMS
     */
    storeLMSdata = function (dataSet) {
        _dataHandler.saveData(dataSet);
    };

    /**
     * Notifies the course that it should be unloaded
     *
     * @returns {void}
     */
    closeCourse = function () {
        _events.trigger("course.unload"); // need to be sure that "course.unload" event is being called here
        window.jQuery("#FooterNavigationExit").click();
    };

    /**
     * Checks if course proctored or not
     *
     * @returns {boolean}
     */
    isProctored = function () {
        return  USPIntegration.isProctored();
    };
    ////////////////////////////////////////////////////////////////////////////

    PlayerInterface = {
        cache: {},
        // METHODS WHICH ARE BEING CALLED FROM CONTENT SIDE
        // general
        isCDSDeploy: isCDSDeploy,
        getCustomParameters: getCustomParameters,
        // activities
        getRootActivity: getRootActivity,
        getCurrentActivity: getCurrentActivity,
        getParentActivity: getParentActivity,
        getActivityBy: getActivityBy,
        // assessments
        hasQuestions: hasQuestions,
        getInteractionsData: getInteractionsData,
        processScorecardContainer: processScorecardContainer,
        exitContainer: exitContainer,
        isSubmitAllMode: isSubmitAllMode,
        saveSubmitAllStatus: saveSubmitAllStatus,
        isSubmitAllStatusSaved: isSubmitAllStatusSaved,
        getBookmarkType: getBookmarkType,
        isAssessment: isAssessment,
        isAnyAssessment: isAnyAssessment,
        hasSubassessments: hasSubassessments,
        findScorecard: findScorecard,
        isScorecard: isScorecard,
        getCurrentTime: getCurrentTime,
        getExitMessage: getExitMessage,
        getExitConfirmation: getExitConfirmation,
        getSectionStatusData: getSectionStatusData,
        hasUnansweredQuestions: hasUnansweredQuestions,
        hasAttemptedQuestions: hasAttemptedQuestions,
        // skin/tree
        getMenuItems: getMenuItems,
        getPageIndexInCourse: getPageIndexInCourse,
        getCurrentPageNumberInContainer: getCurrentPageNumberInContainer,
        getContainerPagesCount: getContainerPagesCount,
        getCoursePagesCount: getCoursePagesCount,
        isSibling: isSibling,
        wasRandomizationApplied: wasRandomizationApplied,
        comesAfterCurrent: comesAfterCurrent,
        checkPageExistence: checkPageExistence,
        getPrecedingLinkedPagesCount: getPrecedingLinkedPagesCount,
        getNextPage: getNextPage,
        getPreviousPage: getPreviousPage,
        getFollowingPageId: getFollowingPageId,
        getPrecedingPageId: getPrecedingPageId,
        // actions
        initialize: initialize,
        next: next,
        previous: previous,
        choose: choice,
        retake: retake,
        unload: unload,
        storeAdditionalData: storeAdditionalData,
        retrieveAdditionalData: retrieveAdditionalData,
        // METHODS WHICH ARE BEING CALLED FROM PLAYER SIDE
        urlChanged: urlChanged,
        updateControls: updateControls,
        triggerPlayerStart: triggerPlayerStart,
        triggerPlayerUnload: triggerPlayerUnload,
        // USP specific methods
        storeLMSdata: storeLMSdata,
        closeCourse: closeCourse,
        isProctored: isProctored,

        /**
         * internal SCORM 2004 API
         */
        API_1484_11: USPIntegration.Internal_SCORM_2004_API,
    };

    window.PlayerInterface = PlayerInterface;
    // add internal SCORM 2004 API globally
    window.API_1484_11 = USPIntegration.Internal_SCORM_2004_API;

    return PlayerInterface;
});
/* eslint-enable prefer-template */
