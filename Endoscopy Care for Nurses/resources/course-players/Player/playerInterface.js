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
 * Default player to be used if SCORM player is not available
 * @module
 * @exports app/player/shellPlayer
 * @fires
 */
define(['app/events',
        'app/player/dataHandler',
        'jquery',
        'underscore',
        'app/configuration',
        'app/utilities/XyTools'
], function (events, dataHandler, $, _, _config, tools) {
    'use strict';
    var Activities,
        /** the default configuration of the object */
        config  = {},
        activities,
        ROOT_ID = 'defaultOrganization';


    Activities = function () {
        var nodes = {},
            order = [],
            currentActivity = 0,
            firstActivity = null;

        this.getCurrentActivity = function () {
            return nodes[order[currentActivity]];
        };

        this.next = function () {
            var a = order[++currentActivity];
            while (nodes[a].href == null) { // if it is a container,
                a = order[++currentActivity]; // find any next activity to deliver
            }
            return nodes[a];
        };

        this.prev = function () {
            var a = order[--currentActivity];
            while (nodes[a].href == null) { // if it is a container,
                a = order[--currentActivity]; // find any next activity to deliver
            }
            return nodes[a];
        };

        this.choose = function (id) {
            var a;
            currentActivity = order.indexOf(id);
            a = order[currentActivity];
            if (typeof a === 'undefined') { // no such page
                return '';
            }
            while (nodes[a].href == null) { // if it is a container,
                a = order[++currentActivity]; // find any next activity to deliver
            }
            return nodes[a];
        };

        this.getNextPage = function () {
            var index = currentActivity,
                a = order[++index],
                count = order.length;
            if (index === count) {
                return null;
            }
            while (nodes[a].href == null && index < count - 1) { // if it is a container,
                a = order[++index]; // find any next activity
            }
            return nodes[a].href != null ? nodes[a] : null;
        };

        this.getPreviousPage = function () {
            var index = currentActivity,
                a = order[--index];
            while (nodes[a].href == null && index > 0) { // if it is a container,
                a = order[--index]; // find any next activity
            }
            return nodes[a].href != null ? nodes[a] : null;
        };

        this.addNode = function (id, title, href, type, parent, isLeaf) {
            id = id.replace(/-/g, '.');
            nodes[id] = {id     : id,
                         title  : title,
                         href   : href,
                         type   : type,
                         parent : parent,
                         isleaf : isLeaf
                        };
            order.push(id);
        };

        this.getActivitiesCount = function () {
            return order.length;
        };

        this.getFirstActivity = function () {
            var a,
                i = 0;
            if (firstActivity == null) {
                a = order[0];

                while (nodes[a].href == null) { // if it is a container,
                    a = order[++i]; // find any next activity to deliver
                }
                firstActivity = nodes[a];
            }
            return firstActivity;
        };

        this.getLastActivity = function () {
            return nodes[order[order.length - 1]];
        };

        this.findByGuid = function (guid) {
            var n;
            for (n in nodes) {
                if (nodes[n].href != null && nodes[n].href.indexOf(guid) === 0) {
                    return nodes[n].id;
                }
            }
            return null;
        };

        this.get = function (id) {
            return nodes[id];
        };

        this.filter = function (condition) {
            return order.filter(function (n, i) {
                return condition(nodes[n], i);
            });
        };

        this.getMenuItems = function () {
            var result = order.map(function (n, i) {
                return {
                    id                : nodes[n].id,
                    title             : nodes[n].title,
                    isLeaf            : nodes[n].isleaf,
                    allChildrenHidden : false,
                    active            : i === currentActivity,
                    enabled           : true,
                    satisfied         : 'unknown',
                    completed         : false,
                    progress          : false,
                    visible           : nodes[n].type !== 'hidden',
                    href              : nodes[n].href
                };
            });
            return result;
        };
    };

    activities = new Activities();

    /**
    * Is CDS deploy mode ("thin" package, shared url or launch url)
    * Currently a stub, only works in Cloud Player
    * @return {Boolean}
    */
    function isCDSDeploy() {
        return /^true$/i.test(window.Xyleme.environment.IS_DEPLOY);
    }

    /**
    * Gets custom parameters added to course launching url
    * Currently a stub, only works in Cloud Player
    * @return {*}
    */
    function getCustomParameters() {
        return {};
    }

    function getActivity(activity, param) {
        if (!activities.get(activity)) {
            return null;
        }
        if (param === 'id') {
            return activity;
        } else if (param === 'guid') {
            return (activities.get(activity).href != null) ?
                    activities.get(activity).href.split('.')[0] :
                    null;
        } else if (param === 'title') {
            return activities.get(activity).title;
        } else if (param === 'parent') {
            return activities.getCurrentActivity().parent;
        }
        return null;
    }

    function getActivityBy(by, value, prop) {
        if (by === 'guid') {
            return activities.findByGuid(value);
        }
        return null;
    }

    function getRootActivity(param) {
        return getActivity(ROOT_ID, param);
    }

    function getCurrentActivity(param, wholeActivity) {
        if (param === 'id') {
            return activities.getCurrentActivity().id;
        } else if (param === 'guid') {
            return (activities.getCurrentActivity().href != null) ?
                    activities.getCurrentActivity().href.split('.')[0] :
                    null;
        } else if (param === 'title') {
            return activities.getCurrentActivity().title;
        } else if (param === 'parent') {
            return activities.getCurrentActivity().parent;
        }
        return null;
    }

    function getParentActivity(param, wholeActivity) {
        if (wholeActivity) {
            return activities.getCurrentActivity().parent;
        }
        return getActivity(activities.getCurrentActivity().parent, param);
    }

    function wrapJlpActivity(activity) {
        return {};
    }

    function getPassingScore(activity) {
        return 100;
    }

    function getScore(activity) {
        return 0;
    }

    function getWeight(activity) {
        return 0;
    }

    function processScorecardContainer(containerId) {
        return null;
    }

    function processScorecardPage(activity) {
        return {};
    }

    function getInteractionsData(guid) {
        return {};
    }

    function setActivityAsCompleted(activity) {
    }

    function getCoursePagesCount() {
        return [];
    }

    function getMenuItems() {
        return activities.getMenuItems();
    }

    function getPrecedingLinkedPagesCount(guid) {
        var result = 0,
            links = getMenuItems().filter(function (item) {
                return item.href === guid; // find all pages linked to current
            });
        if (links.length > 1) { // count preceding linked pages
            while (links[result].id !== getCurrentActivity('id')) {
                result++;
            }
        }
        return result;
    }

    function storeAdditionalData() {
    }

    function retrieveAdditionalData() {
        return '{}';
    }

    function getPageIndexInCourse(activityId) {
        return 0;
    }

    function checkPageExistence(activityId) {
        return true; // fallback if there is no scorm palyer
    }

    function exitContainer() {
    }

    function isSubmitAllMode(activityId) {
        return false;
    }

    function saveSubmitAllStatus() {
        return;
    }

    function isSubmitAllStatusSaved() {
        return false;
    }

    function hasQuestions() {
        return false;
    }

    function findScorecard() {
        return '';
    }

    function isScorecard() {
        return false;
    }

    function getCurrentPageNumberInContainer() {
        var current = getCurrentActivity('id'),
            parent = getParentActivity('id'),
            siblings = activities.filter(function (a) {
                return a.parent == parent;
            });
        if (siblings.length > 0) {
            return _.indexOf(siblings, current) + 1;
        }
        return 0;
    }

    function getContainerPagesCount() {
        var parent = getParentActivity('id'),
            siblings = activities.filter(function (a) {
                return a.parent == parent;
            });
        return siblings.length;
    }

    function isSibling(activity) {
        return false;
    }

    function getBookmarkType() {
        return 'Resume';
    }

    function isAssessment() {
        return false;
    }

    function isAnyAssessment() {
        return false;
    }

    function getCurrentTime() {
        return new Date();
    }

    function getExitMessage() {
        return '';
    }

    function getExitConfirmation(callback) {
        callback();
    }

    function wasRandomizationApplied(activityId) {
        return false;
    }

    function comesAfterCurrent(activityId) {
        var current = activities.getCurrentActivity(),
            target = activities.get(activityId);

        function getActivityIdNumber(activity) {
            var activityId = activity && activity.id || '';

            return activityId.replace(/Item|[.-]/gi, '');
        }

        return getActivityIdNumber(target) > getActivityIdNumber(current);
    }

    function retake(activityId) {
    }

    function getSectionStatusData(nodeId) {
       return {};
    }

    function hasUnansweredQuestions() {
        return false;
    }

    function hasAttemptedQuestions() {
        return false;
    }

    function hasSubassessments() {
        return false;
    }

    function getNextPage() {
        var a = activities.getNextPage();
        return a != null ? a.id : null;
    }

    function getPreviousPage() {
        var a = activities.getPreviousPage();
        return a != null ? a.id : null;
    }

    function getFollowingPageId() {
        var a = activities.getNextPage();
        return a != null ? a.id : null;
    }

    function getPrecedingPageId() {
        var a = activities.getPreviousPage();
        return a != null ? a.id : null;
    }

    function init() {
        config = $.extend(config, _config.configure('shellPlayer'));

        if (typeof SCORM_TYPE === 'undefined' && typeof IS_AICC === 'undefined') {
            window.SCORM_TYPE = 'non-scorm-player';
            window.IS_AICC = false;
        }
    }

    function unload() {
        // added for compatibility
        events.trigger('content.remove');
    }

    function next() {
        var state, activity;

        activity = activities.next();
        events.trigger('content.url:changed', false, activity.href, activity.id);

        state = {
            origin: "ShellPlayer",
            next: {
                enabled: activities.getCurrentActivity() !== activities.getLastActivity(),
                visible: true
            },
            previous: {
                enabled: activities.getCurrentActivity() !== activities.getFirstActivity(),
                visible: true
            }
        };
        events.trigger('navigationButtons.state:changed', true, state);
    }

    function previous() {
        var state, activity;

        activity = activities.prev();
        events.trigger('content.url:changed', false, activity.href, activity.id);

        state = {
            origin: "ShellPlayer",
            next: {
                enabled: activities.getCurrentActivity() !== activities.getLastActivity(),
                visible: true
            },
            previous: {
                enabled: activities.getCurrentActivity() !== activities.getFirstActivity(),
                visible: true
            }
        };
        events.trigger('navigationButtons.state:changed', true, state);
    }

    function choose(id, scrollPosition) {
        var state, activity;

        activity = activities.choose(id);
        if (activity == null) { // no such page
            return;
        }
        events.trigger('content.url:changed', false, activity.href, activity.id, scrollPosition);

        state = {
            origin: "ShellPlayer",
            next: {
                enabled: activities.getCurrentActivity() !== activities.getLastActivity(),
                visible: true
            },
            previous: {
                enabled: activities.getCurrentActivity() !== activities.getFirstActivity(),
                visible: true
            }
        };
        events.trigger('navigationButtons.state:changed', true, state);
    }

    function initialize() {
        var activityId, state, rootTitle;

        init();

        // add root
        rootTitle = $('#PageHeader .Title').text();
        if (!rootTitle)
            rootTitle = '';
        activities.addNode(ROOT_ID, rootTitle, null, '', null, false);

        // find all navigation tree links and retrieve hrefs from them
        $('a.NavigationTreeItem').each(readLink.bind(this));

        // load the first activity
        if (dataHandler && dataHandler.bookmark) {
            activityId = dataHandler.bookmark;
        } else {
            activityId = activities.getFirstActivity().id;
        }

        choose(activityId, dataHandler.scrollPosition);
        events.trigger('player.start', true, this);
    }

    function readLink(i, link) {
        var $link = $(link),
            type = $link.attr('data-type'),
            $parent = $link.parent().parents("li:first").find("a.NavigationTreeItem:first"),
            parentId = $parent.attr('id') ? $parent.attr('id') : ROOT_ID,
            isLeaf = $link.siblings('ul.SubTree').length === 0;
        if (!type || type.indexOf('assessment') !== 0 || window.Xyleme.environment.ReviewSession) {
            // skip nodes marked as SSP assessments unless it is a review session
            if ($link.attr('data-hidden') === 'true') {
                type = 'hidden';
            }

            if ($link.attr('data-target')) {
                activities.addNode($link.attr('id'), $link.attr('title'), $link.attr('data-target'), type, parentId, isLeaf); // a page or a topic
            } else {
                activities.addNode($link.attr('id'), $link.attr('title'), null, type, parentId, isLeaf); // a container or a lesson
            }
        }
    }


    return {
        //=====================================================================================
        // return PUBLIC API
        // NOTE: IF YOU ARE GOING TO ADD SOME NEW METHOD
        //       TO PLAYER INTERFACE WHICH WILL BE CALLED FROM OUTSIDE
        //       PLEASE, CREATE NEW JIRA TICKET
        //       TO REPLICATE THIS METHOD IN ALL OTHER PLAYERS INTERFACES AS WELL.
        //       INTERFACES SHOULD BE THE SAME FOR ALL PLAYERS!!!
        // SUPPORTED PLAYERS: JLP, CloudPlayer and Shell
        //=====================================================================================
        cache: {},
        /**
        * METHODS WHICH ARE BEING CALLED FROM CONTENT SIDE
        */
        // general
        isCDSDeploy                     : isCDSDeploy,
        getCustomParameters             : getCustomParameters,
        // activities
        getRootActivity                 : getRootActivity,
        getCurrentActivity              : getCurrentActivity,
        getParentActivity               : getParentActivity,
        // assessments
        hasQuestions                    : hasQuestions,
        getInteractionsData             : getInteractionsData,
        processScorecardContainer       : processScorecardContainer,
        exitContainer                   : exitContainer,
        isSubmitAllMode                 : isSubmitAllMode,
        saveSubmitAllStatus             : saveSubmitAllStatus,
        isSubmitAllStatusSaved          : isSubmitAllStatusSaved,
        getBookmarkType                 : getBookmarkType,
        isAssessment                    : isAssessment,
        isAnyAssessment                 : isAnyAssessment,
        getCurrentTime                  : getCurrentTime,
        getExitMessage                  : getExitMessage,
        getExitConfirmation             : getExitConfirmation,
        findScorecard                   : findScorecard,
        isScorecard                     : isScorecard,
        getSectionStatusData            : getSectionStatusData,
        hasUnansweredQuestions          : hasUnansweredQuestions,
        hasAttemptedQuestions           : hasAttemptedQuestions,
        hasSubassessments               : hasSubassessments,
        // skin/tree
        getMenuItems                    : getMenuItems,
        getPageIndexInCourse            : getPageIndexInCourse,
        getCurrentPageNumberInContainer : getCurrentPageNumberInContainer,
        getContainerPagesCount          : getContainerPagesCount,
        getCoursePagesCount             : getCoursePagesCount,
        isSibling                       : isSibling,
        wasRandomizationApplied         : wasRandomizationApplied,
        comesAfterCurrent               : comesAfterCurrent,
        checkPageExistence              : checkPageExistence,
        getPrecedingLinkedPagesCount    : getPrecedingLinkedPagesCount,
        storeAdditionalData             : storeAdditionalData,
        retrieveAdditionalData          : retrieveAdditionalData,
        getNextPage                     : getNextPage,
        getPreviousPage                 : getPreviousPage,
        getFollowingPageId              : getFollowingPageId,
        getPrecedingPageId              : getPrecedingPageId,
        // actions
        initialize                      : initialize,
        next                            : next,
        previous                        : previous,
        choose                          : choose,
        retake                          : retake,
        unload                          : unload,
        // Shell specific methods
        getActivityBy                   : getActivityBy
    };
});
