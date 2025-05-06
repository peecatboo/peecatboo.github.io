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

define(function () {
    'use strict';

    return {
        getRoot : function () {
            return null;
        },

        getCurrentActivity : function () {
            return null;
        },

        getParentActivity : function () {
            return null;
        },

        getCourseName : function () {
            return 'mock course name';
        },

        getCoursePagesCount : function () {
            return 0;
        },

        getPageIndexInCourse : function() {
            return 0;
        },

        getActivityId : function () {
            return 'mock id';
        },

        getMenuItems: function () {
            return [];
        },

        getPrecedingLinkedPagesCount: function () {
            return 0;
        },

        checkPageExistence: function () {
            return false;
        },

        isPageAvailable: function () {
            return false;
        },

        processScorecard: function () {
            return {};
        },

        isSubmitAllMode: function () {
            return false;
        },

        saveSubmitAllStatus: function () {
            this.isSubmitAllSaved = true;
        },

        isSubmitAllStatusSaved: function () {
            return false;
        },

        isAssessment: function (param) {
            return false;
        },

        isAnyAssessment: function (param) {
            return false;
        },

        hasSubassessments: function (param) {
            return false;
        },

        hasQuestions: function () {
            return false;
        },

        getCurrentPageNumberInContainer: function () {
            return 1;
        },

        getContainerPagesCount: function () {
            return 1;
        },

        isSibling: function () {
            return false;
        },

        getBookmarkType: function () {
            return 'Resume';
        },

        wasRandomizationApplied: function () {
            return false;
        },

        comesAfterCurrent: function () {
            return false;
        },

        getInteractionsData: function () {
            return [];
        },

        getSectionStatusData: function () {
            return {};
        },

        hasUnansweredQuestions: function () {
            return true;
        },

        hasAttemptedQuestions: function () {
            return true;
        },

        getNextPage: function () {
            return 'next';
        },

        getPreviousPage: function () {
            return 'previous';
        },

        getFollowingPageId: function () {
            return 'next';
        },

        getPrecedingPageId: function () {
            return 'previous';
        },

        isScorecard: function (id) {
            return false;
        },

        findScorecard: function () {
            return 'scorecard';
        }
    };
});
