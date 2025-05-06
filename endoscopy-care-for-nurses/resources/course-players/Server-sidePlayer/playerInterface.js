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


define(['bcp',
        'app/events',
        'app/player/dataHandler',
        'app/utilities/XyTools',
        'lang/lang',
        'notification'
        ], function (globals, _events, _dataHandler, _tools, _lang, _notification) {

    var config = {
            messages  : {
                confirmationMessage           : _lang.t('components.exitButton.confirm') || 'Are you sure you want to exit the course? Your progress will be saved.',
                confirmationMessageNoSave     : _lang.t('components.exitButton.confirmNoSave') || 'Are you sure you want to exit the course?',
                confirmationMessageTimerOn    : _lang.t('components.exitButton.confirmTimerOn') || 'Are you sure you want to exit the course? The timer will continue to count down, even if the course is closed.',
                proctorConfirmationMessage    : _lang.t('player.cloudPlayer.exitMessages.proctorConfirm') || 'Are you sure you want to exit the course?\nThis is a Proctored course, by leaving this page:\n  * The current attempt will terminate and registered as failed\n  * You will need a new authorization from a Proctor to re-attempt this course',
                submitAllMessage              : _lang.t('components.submitAllButton.confirm') || 'Do you really want to submit all your answers?',
                acceptanceCheckMessage        : _lang.t('components.submitAllButton.acceptanceCheck') || 'I understand that any unanswered questions will also be submitted'
            }
        };

    var TIMER_ID = 'timer';

    var BCPIntegration = parent.Integration;
        Activities     = null;

    /**
    * Is CDS deploy mode ("thin" package, shared url or launch url)
    * @return boolean
    */
    function isCDSDeploy() {
        var isDeploy = BCPIntegration.isDeploy();

        if (!isDeploy) {
            window.Xyleme.environment.ALLOW_PREVIEW_CACHING = true;
        }

        return isDeploy;
    }
    /**
    * Gets custom parameters added to course launching url
    * @return {*}
    */
    function getCustomParameters() {
        return BCPIntegration.getCustomParameters();
    }
    /**
    * Initialize communication
    *
    */
    function initialize() {
        // call BCP's init
        BCPIntegration.init();
    }
    /**
    * Trigger "next" action
    */
    function next() {
        BCPIntegration.next();
    }
    /**
    * Trigger "previous" action
    */
    function previous() {
        BCPIntegration.previous();
    }
    /**
    * Trigger "choice" action
    */
    function choice(id) {
        BCPIntegration.choice(id);
    }
    /**
    * Trigger "retake" action
    */
    function retake() {
        BCPIntegration.retake();
    }
    /**
     * Trigger "resetChoiceBranch" action
     */
    function resetChoiceBranch() {
      BCPIntegration.resetChoiceBranch();
    }
    /**
    * Trigger "exit" action
    */
    function exit() {
        BCPIntegration.exit();
    }
    /**
    * Contain current page question(s) or not
    * @return boolean
    */
    function hasQuestions() {
        return BCPIntegration.hasQuestions();
    }
    /**
    * Collect all data needed to proccess scorecard. This info is used by section status as well
    * @return {}
    */
    function collectScorecardData(containerId) {
        return BCPIntegration.collectScorecardData(containerId);
    }
    /**
    * Is assessment running in summitAll mode
    * @return boolean
    */
    function isSubmitAllMode(activityId) {
        return BCPIntegration.isSubmitAllMode(activityId) || false;
    }
    /**
    * Is assessment summitAll status already saved
    * @return boolean
    */
    function isSubmitAllStatusSaved() {
        return BCPIntegration.isSubmitAllStatusSaved() || false;
    }
    /**
    * Save submit all status
    *
    */
    function saveSubmitAllStatus(scorecardId) {
        BCPIntegration.saveSubmitAllStatus(scorecardId);
    }
    /**
    * Get type of bookmarking
    * @return string
    */
    function getBookmarkType() {
        return BCPIntegration.getBookmarkType();
    }
    /**
    * Check if activity is a part of the same assessment as current page
    * @return boolean
    */
    function isAssessment(activityId) {
        return BCPIntegration.isAssessment(activityId) || false;
    }
    /**
    * Check if activity is a part of any assessment
    * @return boolean
    */
    function isAnyAssessment(activityId) {
        return BCPIntegration.isAnyAssessment(activityId) || false;
    }
    /**
    * Check if activity's assessment has nested assessments
    * @return boolean
    */
    function hasSubassessments(activityId) {
        return BCPIntegration.hasSubassessments(activityId);
    }
    /**
    * Check if current assessment is submitted
    * @return boolean
    */
    function isAssessmentSubmitted() {
        return BCPIntegration.isAssessmentSubmitted() || false;
    }
    /**
    * Get server time in milliseconds, returned on last navigation request
    * @return int
    */
    function getCurrentTime() {
        return BCPIntegration.getSystemTime();
    }
    /**
    * Call exit container action
    *
    */
    function exitContainer() {
        BCPIntegration.exitContainer();
    }

    /**
    * Get scorecard id
    *
    */
    function findScorecard() {
        return BCPIntegration.findScorecard();
    }

    /**
    * Check if given activity is a scorecard
    *
    */
    function isScorecard(activityId) {
        return BCPIntegration.isScorecard(activityId);
    }

    /**
    * Get message to display on onBeforeUnload
    * @return string
    */
    function getExitMessage(contextAwareness) {
        var bookmarkType, assessment, confirmationMessage;

        if (!isCDSDeploy() || !BCPIntegration.wasReportingCommunicationEstablished()) {
            return;
        }

        if (!BCPIntegration.isLRSavailable()) {
            return config.messages.confirmationMessageNoSave;
        }

        if (BCPIntegration.isProctored()) {
            if (!BCPIntegration.isProctorAuthenticated('in')) {
                return;
            } else if (BCPIntegration.isProctorAuthenticated('out')) {
                if (BCPIntegration.isCourseCompleted() && BCPIntegration.wasCompletedStatusSaved()) {
                    return;
                }
                return config.messages.confirmationMessage;
            } else {
                return config.messages.proctorConfirmationMessage;
            }
        }

        if (BCPIntegration.isCourseCompleted() && BCPIntegration.wasCompletedStatusSaved()) {
            return;
        }

        if ( this.retrieveAdditionalData(TIMER_ID) ) {
            return config.messages.confirmationMessageTimerOn;
        }

        confirmationMessage = BCPIntegration.isNoLms() && BCPIntegration.isAnonymous()
                                ? config.messages.confirmationMessageNoSave
                                : config.messages.confirmationMessage;
        assessment = contextAwareness === false ? isSubmitAllMode() : isAssessment();
        if (assessment && hasAttemptedQuestions() && !isAssessmentSubmitted()) {
            bookmarkType = getBookmarkType();
            if (/Retake/.test(bookmarkType) || /Review/.test(bookmarkType)) {
                return config.messages.submitAllMessage;
            } else if (/Resume/.test(bookmarkType)) {
                return confirmationMessage;
            }
        } else {
            return confirmationMessage;
        }
    }

    /**
    * Display confirmation popup when user clicks Exit button
    * @param callback - function to be called to disable onUnload handlers and close browser window
    */
    function getExitConfirmation(callback, contextAwareness) {
        var bookmarkType = this.getBookmarkType(),
            confirmDialogCheckboxSelector = 'input[type=checkbox]',
            confirmDialogOKButtonSelector = '.ConfirmOkButton',
            confirmDialogLabelSelector = 'label',
            submitAllTemplate = '<div class="SubmitAllConfirmationDialog">' +
                                      '<p><b>' + config.messages.submitAllMessage + '</b></p>' +
                                      '<label><input type="checkbox" /> '+ config.messages.acceptanceCheckMessage + '</label>' +
                                      '</div>',
            proctorConfirmationMessagePartials = config.messages.proctorConfirmationMessage.split('\n'),
            proctorConfirmationMessageTemplate = '<div class="ProctoredConfirmationDialog">' +
                                                    '<p><b>' + proctorConfirmationMessagePartials[0] + '</b></p>' +
                                                    '<div class="ProctoredConfirmationDialogContent"><p>' + proctorConfirmationMessagePartials[1] + '</p>' +
                                                    '<ul><li>' + proctorConfirmationMessagePartials[2].replace('*', '').trim() + '</li>' +
                                                    '<li>' + proctorConfirmationMessagePartials[3].replace('*', '').trim() + '</li></ul>' +
                                                    '</div></div>',
            assessment, confirmationMessage;

        if (!isCDSDeploy() || !BCPIntegration.wasReportingCommunicationEstablished()) {
            return;
        }

        if (BCPIntegration.isProctored()) {
            if (!BCPIntegration.isProctorAuthenticated('in')) {
                // 'I have no proctor' case
                return;
            } else if (BCPIntegration.isProctorAuthenticated('out')) {
                if (BCPIntegration.isCourseCompleted() && BCPIntegration.wasCompletedStatusSaved()) {
                    callback();
                    return;
                }
                _notification.confirm(config.messages.confirmationMessage, callback);
            } else {
                _notification.confirm(proctorConfirmationMessageTemplate, callback);
            }
            return;
        }

        if (BCPIntegration.isCourseCompleted() && BCPIntegration.wasCompletedStatusSaved()) {
            callback();
            return;
        }

        if ( this.retrieveAdditionalData(TIMER_ID) ) {
            _notification.confirm(config.messages.confirmationMessageTimerOn, callback);
            return;
        }

        confirmationMessage = BCPIntegration.isNoLms() && BCPIntegration.isAnonymous()
                                ? config.messages.confirmationMessageNoSave
                                : config.messages.confirmationMessage;
        assessment = contextAwareness === false ? isSubmitAllMode() : isAssessment();
        if (assessment && hasAttemptedQuestions() && !isAssessmentSubmitted()
                && (/Retake/.test(bookmarkType) || /Review/.test(bookmarkType))) {
            _notification.confirm(submitAllTemplate, callback, {
                open: function () {
                    var button, checkbox;

                    button = this.popup.find(confirmDialogOKButtonSelector);
                    checkbox = this.content.find(confirmDialogCheckboxSelector);

                    if (!hasQuestions()) {
                        this.content.find(confirmDialogLabelSelector).hide();
                        return;
                    }

                    if (checkbox[0].disabled) return;
                    button.addClass('Disabled')[0].disabled = true;
                    checkbox.on('change', function () {
                        if (this.checked) {
                            this.disabled = true;
                        }
                        button.removeClass('Disabled')[0].disabled = false;
                    });
                }
            });
        } else {
            _notification.confirm(confirmationMessage, callback);
        }
    }

    function getSectionStatusData(nodeId) {
        var questionList = {},
            data = collectScorecardData(nodeId ? nodeId : Activities.GetParentActivity('id')),
            getData = function (container) {
                if (container) {
                    container.pages.forEach(function(page) {
                        page.questions.forEach(function(question) {
                            questionList[question.guid] = question.status;
                        });
                    });
                }

                container.containers.forEach(getData, this);
            }

        getData(data);
        return questionList;
    }

    function hasUnansweredQuestions() {
        var guid, status, allAnswered = true,
            questionStatusMap = getSectionStatusData(Activities.GetParentActivity(findScorecard(), 'id'));

        for (guid in questionStatusMap) {
            status = questionStatusMap[guid];
            if (status === 'Not Attempted' || status === 'Skipped') {
                allAnswered = false;
            }
        }

        return !allAnswered;
    }

    function hasAttemptedQuestions() {
        var guid, status,
            questionStatusMap = getSectionStatusData(Activities.GetParentActivity(findScorecard(), 'id'));

        for (guid in questionStatusMap) {
            status = questionStatusMap[guid];
            if (status && status !== 'Not Attempted') {
                return true;
            }
        }

        return hasQuestions(); // check if there are any questions on current page that user may have seen
    }

    /**
    * Get activity interactions
    * @param activity guid
    * @return [{},{}...{}]
    */
    function getInteractionsData(guid) {
        return BCPIntegration.getInteractionsData(guid);
    }
    /**
    * Get count of child pages for current container
    * @return int
    */
    function getContainerPagesCount() {
        return BCPIntegration.getContainerPagesCount();
    }
    /**
    * Get count of child pages of all course
    * @return int
    */
    function getCoursePagesCount() {
        return Activities.GetActivities().length;
    }
    /**
    * Get position of current page in container
    * @return int
    */
    function getCurrentPageNumberInContainer() {
        return BCPIntegration.getCurrentPageNumberInContainer();
    }
    /**
    * Is activity sibling of current activity
    * @return boolean
    */
    function isSibling(activityId) {
        var currentActivity = Activities.GetCurrentActivity(),
            activity = Activities.GetActivityById(activityId);
        if (currentActivity && activity) {
            return currentActivity.parent === activity.parent;
        }
        return false;
    }
    /**
    * Get position of current page in course
    * @return int
    */
    function getPageIndexInCourse() {
        return BCPIntegration.getPageIndexInCourse();
    }
    /**
    * Was randomization applied for activity
    * @return boolean
    */
    function wasRandomizationApplied(activityId) {
        return Activities.GetActivityById(activityId).randomized;
    }
    /**
    *
    * @return boolean
    */
    function comesAfterCurrent(activityId) { // TODO check this, looks like that this doesn't work properly
        var activities, current, target, i, n;
        current = Activities.GetCurrentActivity();
        target = Activities.GetActivityById(activityId);
        if (current == target) { // don't waste the time
            return false;
        }

        // this list is updated after randomization, unlike Control.Activities.SortedActivities
        activities = Activities.GetActivities();
        n = activities.length;
        for (i = 0; i < n; i++) {
            // the current activity comes before the target
            if (activities[i] == current) {
                return true;
            }
            // the current activity comes after the target
            if (activities[i] == target) {
                return false;
            }
        }
        // nothing was not found
        return null;
    }

    /**
    * Returns next activity ID(calculated by player) or null
    * @return String
    */
    function getNextPage() {
        return BCPIntegration.getNextPageId();
    }

    /**
    * Returns previous activity ID(calculated by player) or null
    * @return String
    */
    function getPreviousPage() {
        return BCPIntegration.getPreviousPageId();
    }

    /**
     * Returns following activity ID(following in manifest) or null
     * @return String
     */
    function getFollowingPageId() {
        return BCPIntegration.getFollowingPageId();
    }

    /**
     * Returns preceding activity ID(preceding in manifest) or null
     * @return String
     */
    function getPrecedingPageId() {
        return BCPIntegration.getPrecedingPageId();
    }

    /**
    * Stores course-wide data
    *
    */
    function storeAdditionalData(data) {
        BCPIntegration.storeAdditionalData(data);
    }
    /**
    * Retrieves course-wide data
    * @return Object
    */
    function retrieveAdditionalData(id) {
        if (id) {
            var allData = BCPIntegration.retrieveAdditionalData() || '{}';

            allData = JSON.parse(allData);

            return allData[id];
        }
        return BCPIntegration.retrieveAdditionalData();
    }
    //==========================================================================
    //
    // Events listeners
    //
    //==========================================================================

    // media state events
    _events.on('lrs.media:played', function (data) {
        if (typeof BCPIntegration.mediaPlayed === 'function') {
            BCPIntegration.mediaPlayed(data);
        }
    });

    // content has loaded
    _events.on('lrs.content:opened', function (data) {
        if (typeof BCPIntegration.contentOpened === 'function') {
            BCPIntegration.contentOpened(data);
        }
    });
    // assessment has started
    _events.on('lrs.assessment:started', function (data) {
        if (typeof BCPIntegration.assessmentStarted === 'function') {
            BCPIntegration.assessmentStarted(data);
        }
    });

    // assessment has ended
    _events.on('lrs.assessment:ended', function (data) {
        if (typeof BCPIntegration.assessmentEnded === 'function') {
            BCPIntegration.assessmentEnded(data);
        }
    });

    // question has answered
    _events.on('lrs.question:answered', function (data) {
        if (typeof BCPIntegration.questionAnswered === 'function') {
            BCPIntegration.questionAnswered(data);
        }
    });

    // questions has submitted
    _events.on('lrs.questions:submitall', function (data) {
        if (typeof BCPIntegration.submitAllQuestions === 'function') {
            BCPIntegration.submitAllQuestions(data);
        }
    });

    // course unload
    _events.on('course.unload', function() {
        BCPIntegration.setCourseExit(true);
    });

    // Choice Branch choice
    _events.on('lrs.choiceBranch:selected', function(data) {
        BCPIntegration.choiceBranchSelected(data);
    });

    // Choice Branch reset
    _events.on('lrs.choiceBranch:discarded', function(data) {
        BCPIntegration.choiceBranchDiscarded(data);
    });
    ////////////////////////////////////////////////////////////////////////////
    function urlChanged(url, treeId) {
        _events.trigger('content.url:changed', false, url, treeId);
    }

    function updateControls(state) {
        _events.trigger('navigationButtons.state:changed', true, state);
    }

    function triggerPlayerStart() {
        _dataHandler.bookmark = '';
        _events.trigger('player.start', true, this);
    }

    function triggerPlayerUnload() {
        _events.trigger('player.unload:after');
    }

    function closeCourse() {
        _events.trigger('course.unload'); // need to be sure that "course.unload" event is being called here
        jQuery('#FooterNavigationExit').click();
    }
    ////////////////////////////////////////////////////////////////////////////

    Activities = {
        /**
        * Get activity property or activity itself if param in not deffined
        * @param activity - activity {}
        * @param param - activity property value
        * @return activity property value | activity
        */
        GetActivity : function (activity, param) {
            if(!activity) {
                return null;
            }
            if (!param || typeof param !== 'string') {
                return activity;
            }
            if (param.match(/name|title/i)) {
                return activity.title;
            }
            if (param.match(/guid/i)) {
                if (/.html/.test(activity.href)) {
                    return activity.href.match(/([^\/]*).html.*$/)[1];
                }
                if (/lcmsXmlGuid/.test(activity.href)) {
                    return activity.href.match(/lcmsXmlGuid\/([^\/]*)\/.*$/)[1];
                }
                return "";
            }
            if (param.match(/^id$|identifier/i)) {
                return activity.id;
            }
            if (param.match(/^attempts$/i)) { //TODO
                return activity.ActivityAttemptCount;
            }
            if (param.match(/^score$/i)) { //TODO
                return this.getScore(activity);
            }
            if (param.match(/^passingscore$/i)) { //TODO
                return this.getPassingScore(activity);
            }
            if (param.match(/weight/i)) { // TODO
                return this.getWeight(activity);
            }
            if (param.match(/^menuitem$/i)) {
                return Control.Activities.GetMenuItems();
            }
            if (param === 'path') {// TODO
                if (Control) {
                    return Control.Sequencer.Activities.GetActivityPath(activity, true);
                } else {
                    return '';
                }
            }
            if (typeof activity[param] !== 'undefined') {
                return activity[param];
            }
            return activity;
        },
        /**
        * Get root activity property or root activity itself if param in not deffined
        * @return activity {}
        */
        GetRootActivity : function(param) {
            var root = BCPIntegration.getRootActivity();
            return Activities.GetActivity(root, param);
        },
        /**
        * Get parent property or parent activity itself if param in not deffined
        * @return activity {}
        */
        GetParentActivity : function(id, param) {
            var activity = Activities.GetActivityById(id);

            if (activity == null) {
                // first parameter is not an activity id
                param = id;
                activity = Activities.GetCurrentActivity();
            }

            if (activity && activity.parent) {
                return Activities.GetActivity(Activities.GetActivityById(activity.parent), param);
            }
            return null;
        },
        /**
        * Will check the existence of a given page in the course
        *
        * @param  {String} id The identifier of the page in the format of "Item#.#"
        * @return {Boolean}   Whether or not the page exists
        */
        CheckPageExistence : function(id) {
            return Activities.GetActivityById(id) ? true : false;
        },
        /**
        * Get activity by id
        * @return activity {}
        */
        GetActivityById : function(id) {
            return BCPIntegration.getActivityById(id);
        },
        /**
        * Get activity prop by diff params
        * @return activity {}
        */
        GetActivityBy : function(by, value, prop) {
            var activities, i, n;

            if (by === 'id') {
                return Activities.GetActivity(Activities.GetActivityById(value), prop);
            }
            if (by === 'guid') {
                activities = Activities.GetActivities();

                for (i = 0, n = activities.length; i < n; i++) {
                    if (Activities.GetActivity(activities[i], 'guid') === value) {
                        return Activities.GetActivity(activities[i], prop);
                    }
                }
            }
        },
        /**
        * Get current activity property or activity itself if param in not deffined
        * return {}
        */
        GetCurrentActivity : function(param) {
            var activity = BCPIntegration.getCurrentActivity();
            return Activities.GetActivity(activity, param);
        },
        /**
        * Get activities
        * return [{},{}...{}]
        */
        GetActivities : function(allChildren) {
            if (typeof allChildren !== 'boolean') {
                allChildren = false;
            }
            return BCPIntegration.getActivities(allChildren);
        },
        /**
        * Get only tracked activities
        * return [{},{}...{}]
        */
        GetTrackedActivities : function() {
            var activities = Activities.GetActivities(),
                trackedActivities = [];
            return trackedActivities = activities.filter(function(activity){ return activity.tracked});
        },
        /**
        * Generate MenuItems tree from activities
        * return {}
        */
        GetMenuItems : function(allChildren) {
            var activities = Activities.GetActivities(allChildren),
                hiddenNodes = {};

            activities.filter(function (a) {
                return !a.visible;
            }).forEach(function (a) {
                hiddenNodes[a.id] = a;
            });
            // look for containers with no visible children
            activities.forEach(function (a) {
                var allChildrenHidden = true;
                if (a.isLeaf) {
                    return;
                }

                a.children.forEach(function (id) {
                    if (Activities.GetActivityById(id).available && !hiddenNodes.hasOwnProperty(id)) {
                        allChildrenHidden = false;
                    }
                });

                a.allChildrenHidden = allChildrenHidden;
            })

            return activities.map(function (activity) {
                return {
                    id                : activity.id,
                    title             : activity.title,
                    isLeaf            : activity.isLeaf,
                    allChildrenHidden : activity.allChildrenHidden,
                    active            : activity.active,
                    enabled           : activity.enabled,
                    satisfied         : activity.satisfied,
                    completed         : activity.completed,
                    progress          : activity.progress,
                    visible           : activity.visible,
                    href              : activity.href,
                    parent            : activity.parent,
                    inaccessible      : activity.inaccessible
                };
            });
        },

        GetPrecedingLinkedPagesCount : function (guid) {
            var result = 0,
                currentId = this.getCurrentActivity('id'),
                currentFound = false;

            this.getMenuItems(true).forEach(function (item) {
                if (currentFound) return;

                if (item.id === currentId) {
                    currentFound = true;
                    return;
                };

                if (item.href && item.href.indexOf(guid) >= 0) {
                    result += 1;
                }
            });

            // searching not for current activity - return the last occurrence before current activity
            if (guid !== this.getCurrentActivity('guid')) {
                result -= 1;
            }

            return result;
        }
    };

    // set global API
    API_1484_11 = parent.Internal_API;

    window.PlayerInterface = {
        //=====================================================================================
        // return PUBLIC API
        // NOTE: IF YOU ARE GOING TO ADD SOME NEW METHOD
        //       TO PLAYER INTERFACE WHICH WILL BE CALLED FROM OUTSIDE
        //       PLEASE, CREATE NEW JIRA TICKET
        //       TO REPLICATE THIS METHOD IN ALL OTHER PLAYERS INTERFACES AS WELL.
        //       INTERFACES SHOULD BE THE SAME FOR ALL PLAYERS!!!
        // SUPPORTED PLAYERS: JLP, CloudPlayer and Shell
        //=====================================================================================
        cache : {},
        /**
        * METHODS WHICH ARE BEING CALLED FROM CONTENT SIDE
        */
        // general
        isCDSDeploy                     : isCDSDeploy,
        getCustomParameters             : getCustomParameters,
        // activities
        getRootActivity                 : Activities.GetRootActivity,
        getCurrentActivity              : Activities.GetCurrentActivity,
        getParentActivity               : Activities.GetParentActivity,
        getActivityBy                   : Activities.GetActivityBy,
        // assessments
        hasQuestions                    : hasQuestions,
        getInteractionsData             : getInteractionsData,
        processScorecardContainer       : collectScorecardData,
        exitContainer                   : exitContainer,
        isSubmitAllMode                 : isSubmitAllMode,
        saveSubmitAllStatus             : saveSubmitAllStatus,
        isSubmitAllStatusSaved          : isSubmitAllStatusSaved,
        getBookmarkType                 : getBookmarkType,
        isAssessment                    : isAssessment,
        isAnyAssessment                 : isAnyAssessment,
        hasSubassessments               : hasSubassessments,
        isAssessmentSubmitted           : isAssessmentSubmitted,
        findScorecard                   : findScorecard,
        isScorecard                     : isScorecard,
        getCurrentTime                  : getCurrentTime,
        getExitMessage                  : getExitMessage,
        getExitConfirmation             : getExitConfirmation,
        getSectionStatusData            : getSectionStatusData,
        hasUnansweredQuestions          : hasUnansweredQuestions,
        hasAttemptedQuestions           : hasAttemptedQuestions,
        // skin/tree
        getMenuItems                    : Activities.GetMenuItems,
        getPageIndexInCourse            : getPageIndexInCourse,
        getCurrentPageNumberInContainer : getCurrentPageNumberInContainer,
        getContainerPagesCount          : getContainerPagesCount,
        getCoursePagesCount             : getCoursePagesCount,
        isSibling                       : isSibling,
        wasRandomizationApplied         : wasRandomizationApplied,
        comesAfterCurrent               : comesAfterCurrent,
        checkPageExistence              : Activities.CheckPageExistence,
        getPrecedingLinkedPagesCount    : Activities.GetPrecedingLinkedPagesCount,
        getNextPage                     : getNextPage,
        getPreviousPage                 : getPreviousPage,
        getFollowingPageId              : getFollowingPageId,
        getPrecedingPageId              : getPrecedingPageId,
        // actions
        initialize                      : initialize,
        next                            : next,
        previous                        : previous,
        choose                          : choice,
        retake                          : retake,
        resetChoiceBranch               : resetChoiceBranch,
        unload                          : exit,
        storeAdditionalData             : storeAdditionalData,
        retrieveAdditionalData          : retrieveAdditionalData,
        /**
        * METHODS WHICH ARE BEING CALLED FROM PLAYER SIDE
        */
        urlChanged                      : urlChanged,
        updateControls                  : updateControls,
        triggerPlayerStart              : triggerPlayerStart,
        triggerPlayerUnload             : triggerPlayerUnload,
        // BCP specific methods
        closeCourse                     : closeCourse,

        /**
        * internal SCORM 2004 API
        */
        API_1484_11 : parent.Internal_API
    };

    return window.PlayerInterface;
});
