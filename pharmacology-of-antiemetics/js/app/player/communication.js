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
 * Module to deal with the player, either JLP or BCP
 * @module
 * @exports app/player/communication
 * @fires player.communication:loaded
 */
define([
    'module',
    'questionData',
    'app/player/dataHandler',
    'app/courseApi',
    'app/configuration',
    'app/events',
    'app/utilities/XyTools',
    'app/submitAll',
    'app/completionApi'
], function(module, questionData, dataHandler, courseApi, config, events, tools, submitAll, completionApi) {
    'use strict';
    var Communication, communication, Interaction;


    /**
     * @constructor
     */
    Communication = function () {

        /** the default configuration of the object */
        this.config = {
            autoPageCompletion : true
        };

    };

    Interaction = function () {
        this.id = '';
        this.reportId = '';
        this.type = 'other';
        this.answer = '';
        this.result = '';
        this.response = '';
        this.attemptLimit = '';
        this.optionsOrder = '';
        this.flag = false;
        this.weight = 1.0;
        this.hadAnswer = false;
        this.keys = {
            ATTEMPT_LIMIT : 'a',
            OPTION_ORDER  : 'o',
            FLAG          : 'f',
            QUESTION_STEM : 'q'
        };
    };
    Interaction.prototype.parseData = function (data) {
        data = JSON.parse(data);
        if (typeof data[this.keys.ATTEMPT_LIMIT] !== 'undefined') {
            this.attemptLimit = data[this.keys.ATTEMPT_LIMIT];
        }
        if (data[this.keys.OPTION_ORDER]) {
            this.optionsOrder = data[this.keys.OPTION_ORDER];
        }
        if (data[this.keys.FLAG]) {
            this.flag = data[this.keys.FLAG];
        }
    };
    Interaction.prototype.saveData = function () {
        var data = {};
        if (this.attemptLimit !== '') {
            data[this.keys.ATTEMPT_LIMIT] = this.attemptLimit;
        }
        if (this.optionsOrder) {
            data[this.keys.OPTION_ORDER] = this.optionsOrder;
        }
        if (this.flag) {
            data[this.keys.FLAG] = 1;
        }
        if (this.questionStem) {
            data[this.keys.QUESTION_STEM] = this.questionStem;
        }
        return JSON.stringify(data);
    };

    Communication.prototype.init = function () {

        this.config = tools.extend(this.config, config.configure(module.id));

        this.dataSet = {
            questions : [],
            other     : {},
            moreData  : false,
            completed : false,

            clean     : function () {
                this.questions = [];
                this.other = {};
                this.moreData = false;
                this.completed = false;
            }
        };

        if (typeof API_1484_11 !== 'undefined') {
            this.api = API_1484_11;
        }
        this.initialized = false;
        if (!this.api) {
            tools.log('Failed to find SCORM API.');
        }

        // save data
        events.on('navigation.removeContent:before', this.saveAllData.bind(this));
        // save only questions
        events.on('communication.saveQuestionData', this.saveQuestionData.bind(this));
        // save only questions without terminating
        events.on('communication.saveQuestionsToPlayer', this.saveQuestionsToPlayer.bind(this));
        // load data
        events.on('content.url:changed', this.loadAllData.bind(this));

        events.on('completionApi.allPageActivitiesComplete', function () {
            communication.dataSet.completed = true;
        });

        events.on('player.unload:before', this.courseUnload.bind(this));

        events.trigger('communication.init:after', this);
    };

    Communication.prototype.saveQuestionsToPlayer = function () {
        var i, j, interaction, id, score,
            questionsCompleted = false,
            interactionCount = 0, // interactions in the player
            questionCount = 0,    // questions in Question Data
            isPageCompleted = false,
            isSubmitAll = submitAll.isSubmitAll(),
            isStatusSaved = submitAll.isStatusSaved();

        // trigger save data event
        events.trigger('player.data:save', this);

        interactionCount = this.api.GetValue('cmi.interactions._count');
        if (interactionCount === '') interactionCount = 0;

        this.dataSet.questions.forEach(function (interaction, i) {
            if (i >= interactionCount) {
                this.api.SetValue('cmi.interactions.' + i + '.id', this.currentGuid + '-' + interaction.id);
            }

            this.api.SetValue('cmi.interactions.' + i + '.type', interaction.type);
            this.api.SetValue('cmi.interactions.' + i + '.learner_response', interaction.response);
            this.api.SetValue('cmi.interactions.' + i + '.description', interaction.saveData());
            // optional data
            if (interaction.result)
                this.api.SetValue('cmi.interactions.' + i + '.result', interaction.result);
            if (interaction.timestamp)
                this.api.SetValue('cmi.interactions.' + i + '.timestamp', interaction.timestamp);
            if (interaction.latency)
                this.api.SetValue('cmi.interactions.' + i + '.latency', interaction.latency);
            if (interaction.weight)
                this.api.SetValue('cmi.interactions.' + i + '.weighting', interaction.weight);
            if (interaction.correctResponses) {
                for (j = 0; j < interaction.correctResponses.length; j++) {
                    this.api.SetValue('cmi.interactions.' + i + '.correct_responses.' + j + '.pattern',
                                               interaction.correctResponses[j]);
                }
            }

            dataHandler.addInteraction(interaction);
        }, this);

        questionCount = this.dataSet.questions.length;

        // save any other data
        if (this.dataSet.moreData) {
            i = questionCount;
            for (id in this.dataSet.other) {
                this.api.SetValue('cmi.interactions.' + i + '.id', communication.currentGuid + '-' + i);
                this.api.SetValue('cmi.interactions.' + i + '.type', 'other');
                this.api.SetValue('cmi.interactions.' + i + '.description', id + '=' + this.dataSet.other[id]);
                i++;
            }
        }

        // save score
        score = this.getTotalScore();
        // in submit all mode, the assessment has to become failed after submission if there were no answers to questions
        if (score === '' && submitAll.isAssessment() && courseApi.hasQuestions() && (isSubmitAll || submitAll.hasContextAwareness())) {
            score = 0;
        }

        if (score !== '') {
            this.api.SetValue('cmi.score.scaled', score);
        }

        // check if all questions are completed
        questionsCompleted = true;
        if (isSubmitAll) {
            for (i = 0; i < questionCount; i++) {
                if (this.dataSet.questions[i].response === '') {
                    questionsCompleted = false;
                }
            }
        } else {
            for (i = 0; i < questionCount; i++) {
                if (this.dataSet.questions[i].result === '' ||
                    (this.dataSet.questions[i].attemptLimit > 0 && this.dataSet.questions[i].result === 'incorrect')) {
                    questionsCompleted = false;
                }
            }
        }

        if (isStatusSaved) {
            questionsCompleted = true;
        }

        // set satisfied status explicitly for pages with no questions
        if (questionCount === 0) {
            this.api.SetValue('cmi.success_status', 'passed');
        }

        communication.dataSet.completed = completionApi.checkRequiredActivities();

        isPageCompleted = this.dataSet.completed && questionsCompleted;

        return isPageCompleted;
    };

    /**
     * Save question data to the api
     */
    Communication.prototype.saveQuestionData = function (leaving) {
        var isPageCompleted,
            isSubmitAll = submitAll.isSubmitAll(),
            isStatusSaved = submitAll.isStatusSaved();

        if (!this.initialized) return;

        isPageCompleted = this.saveQuestionsToPlayer();

        if (this.config.autoPageCompletion || isPageCompleted) {
            this.api.SetValue('cmi.completion_status', 'completed');
        } else {
            this.api.SetValue('cmi.completion_status', 'incomplete');
        }

        if (leaving || (isPageCompleted && (!isSubmitAll || isStatusSaved))) {
            this.api.SetValue('cmi.exit', 'suspend');
            this.api.Terminate('');
            this.initialized = false;
        }
    };

    /**
     * Save all data to the api
     * including questions, elements, etc.
     */
    Communication.prototype.saveAllData = function () {
        if (!this.initialized) return;

        this.saveQuestionData(true);

        this.dataSet.clean();
    };

    /**
     * Will be triggered when course unload procedure has started but before content.remove, which terminates API
     */
    Communication.prototype.courseUnload = function () {
        if (this.initialized && !submitAll.isSubmitAll() && /Retake/.test(courseApi.getBookmarkType()) && !this.api.GetValue('cmi.score.scaled')) {
            // if no score - set score to 0 to avoid reporting unknown score for submitted assessment
            this.api.SetValue('cmi.score.scaled', 0);
        }
    };

    /**
     * Load all data from the api based on page url
     * @param  {String} url - page url
     */
    Communication.prototype.loadAllData = function (url) {
        var i, interaction, id, entry,
            interactionCount = 0, // interactions in the player
            questionCount = 0,    // questions in Question Data
            questions, dataItems, linked, attempts,
            isSubmitAll = submitAll.isSubmitAll() && !submitAll.isStatusSaved();

        if (this.api == null) {
            this.initialized = false;
            events.trigger('player.data:load', url, this);
            return;
        }

        if (!this.initialized) {
            url = url.replace('.html', '');
            if (/lcmsXmlGuid/i.test(url)) {
                url = url.match(/lcmsXmlGuid\/([^/]*)/i)[1];
            }
            this.currentGuid = url;
            questions = questionData.files[url].questions;

            this.api.Initialize('');
            this.initialized = true;
            this.dataSet.clean();
            interactionCount = this.api.GetValue('cmi.interactions._count');
            if (interactionCount === '') {
                interactionCount = 0;
            }
            questionCount = questions.length;

            linked = courseApi.getPrecedingLinkedPagesCount(url) + 1;
            attempts = courseApi.processScorecard();
            attempts = (attempts && attempts.attempts) ? attempts.attempts : '';

            // read questions
            for (i = 0; i < questionCount; i++) {
                interaction =  new Interaction();
                interaction.id = i;
                if (i < interactionCount) { // restore data
                    interaction.result = this.api.GetValue('cmi.interactions.' + i + '.result');
                    interaction.response = this.api.GetValue('cmi.interactions.' + i + '.learner_response');
                    interaction.parseData(this.api.GetValue('cmi.interactions.' + i + '.description'));
                    interaction.hadAnswer = !isSubmitAll &&
                        (interaction.attemptLimit > 0 && interaction.result === 'correct' || interaction.attemptLimit == 0);
                }
                interaction.weight = questionData.questions[questions[i].question].weight || 1.0;
                interaction.internalType = questionData.questions[questions[i].question].type;

                interaction.reportId = url;
                if (linked > 1) {
                    interaction.reportId += '_' + linked;
                }
                interaction.reportId += '_' + questions[i].question;
                if (attempts !== '') {
                    interaction.reportId += '_' + attempts;
                }

                this.dataSet.questions.push(interaction);
            }

            // read other data
            if (questionCount < interactionCount) {
                for (i = questionCount; i < interactionCount; i++) {
                    dataItems = this.api.GetValue('cmi.interactions.' + i + '.description');
                    id = dataItems.split('=')[0];
                    entry = dataItems.substring(dataItems.indexOf('=')+1);
                    this.dataSet.other[id] = entry;
                }
                this.dataSet.moreData = true;
            }
        }

        // trigger load data event
        events.trigger('player.data:load', url, this);
    };

    /**
     * NOTE: To be used from ScoreCard, not safe to use anywhere else
     * Load data for particular Page
     * overrides loaded ".dataSet" of currectPage with data specific to another Page
     * @param {String} guid - guid or url of a page to load data from
     */

    Communication.prototype.loadPageData = function(guid) {
        var questions, questionCount, interactions, interactionCount, interaction,
            i, id, entry;

        if (!guid) {
            throw 'Guid should be passed';
        }
        guid = guid.replace('.html', '');
        if (/lcmsXmlGuid/i.test(guid)) {
            guid = guid.match(/lcmsXmlGuid\/([^/]*)/i)[1];
        }

        if (!communication.initialized) {
            return;
        }

        questions = questionData.files[guid].questions;

        interactions     = courseApi.getInteractionsData(guid);
        if (!interactions || !interactions.length) {
            return;
        }

        communication.dataSet.clean();
        interactionCount = interactions.length;
        questionCount    = questions.length;

        // read questions
        for (i = 0; i < questionCount; i++) {
            interaction =  new Interaction();
            interaction.id = i;
            if (i < interactionCount) { // restore data
                interaction.result = interactions[i].result;
                interaction.response = interactions[i].response;
                interaction.parseData(interactions[i].description);
            }
            interaction.weight = questionData.questions[questions[i].question].weight;
            interaction.internalType = questionData.questions[questions[i].question].type;
            interaction.isScorecard = true;
            communication.dataSet.questions.push(interaction);
        }

        // read other data
        if (questionCount < interactionCount) {
            for (i = questionCount; i < interactionCount; i++) {
                id = interactions[i].Id;
                entry = interactions[i].Description;
                communication.dataSet.other[id] = entry;
            }
            communication.dataSet.moreData = true;
        }

        events.trigger('player.data:load', guid, communication);
        events.on('popup.close', communication.clearScorecardData);
    };

    Communication.prototype.setAnswer = function (id, answer) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].response = answer;
            return true;
        }
        return false;
    };

    Communication.prototype.getAnswer = function (id) {
        if (this.dataSet.questions[id] && this.dataSet.questions[id].response) {
            return this.dataSet.questions[id].response;
        }
        return false;
    };

    Communication.prototype.addCorrectResponse = function (id, response) {
        var question = this.dataSet.questions[id];
        if (question) {
            if (!question.correctResponses) {
                question.correctResponses = [];
            }
            question.correctResponses.push(response);
            return true;
        }
        return false;
    };

    Communication.prototype.setResult = function (id, result) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].result = result;
            return true;
        }
        return false;
    };

    Communication.prototype.getResult = function (id) {
        if (this.dataSet.questions[id]) {
            return this.dataSet.questions[id].result;
        }
        return false;
    };

    Communication.prototype.setType = function (id, type) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].type = type;
            return true;
        }
        return false;
    };

    Communication.prototype.setAttemptLimit = function (id, limit) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].attemptLimit = limit;
            return true;
        }
        return false;
    };

    Communication.prototype.getAttemptLimit = function (id) {
        if (this.dataSet.questions[id]) {
            return this.dataSet.questions[id].attemptLimit;
        }
        return false;
    };

    Communication.prototype.setFlag = function (id, flag) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].flag = flag;
            return true;
        }
        return false;
    };

    Communication.prototype.getFlag = function (id) {
        if (this.dataSet.questions[id]) {
            return this.dataSet.questions[id].flag;
        }
        return false;
    };

    Communication.prototype.setOptionsOrder = function (id, order) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].optionsOrder = order;
            return true;
        }
        return false;
    };

    Communication.prototype.getOptionsOrder = function (id) {
        if (this.dataSet.questions[id] && this.dataSet.questions[id].optionsOrder) {
            if (this.dataSet.questions[id].optionsOrder.split) { // it's a string
                return this.dataSet.questions[id].optionsOrder.split(',');
            } else { // it's an array
                return this.dataSet.questions[id].optionsOrder;
            }
        }
        return false;
    };

    Communication.prototype.setQuestionStem = function (id, questionStem) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].questionStem = questionStem;
            return true;
        }
        return false;
    };

    Communication.prototype.setWeight = function (id, weight) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].weight = weight;
            return true;
        }
        return false;
    };

    Communication.prototype.setTimestamp = function (id, timestamp) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].timestamp = timestamp;
            return true;
        }
        return false;
    };

    Communication.prototype.setLatency = function (id, latency) {
        if (this.dataSet.questions[id]) {
            this.dataSet.questions[id].latency = latency;
            return true;
        }
        return false;
    };

    Communication.prototype.setData = function (id, data) {
        if (data != null && data !== '') {
            this.dataSet.other[id] = data;
            this.dataSet.moreData = true;
            return true;
        } else if (typeof this.dataSet.other[id] !== 'undefined') {
            delete this.dataSet.other[id];
        }
        return false;
    };

    Communication.prototype.getData = function (id) {
        return this.dataSet.other[id];
    };

    Communication.prototype.getTotalScore = function () {
        var i, totalScore = 0,
            weight = 0,
            totalWeight = 0,
            resultKnown = false,
            questionCount = this.dataSet.questions.length;

        for (i = 0; i<questionCount; i++) {
            weight = parseFloat(this.dataSet.questions[i].weight);
            totalWeight += weight;

            resultKnown |= !!this.dataSet.questions[i].result;
            if (this.dataSet.questions[i].result === 'correct') {
                totalScore += weight;
            }
        }

        // if there is no score to report, don't divide by 0
        if ((typeof totalWeight === 'number') && (totalWeight !== 0) && resultKnown) {
            return totalScore/totalWeight;
        }

        return '';
    };

    Communication.prototype.isScorecard = function (id) {
        if (this.dataSet.questions[id] && this.dataSet.questions[id].isScorecard) {
            return this.dataSet.questions[id].isScorecard;
        }
        return false;
    }

    Communication.prototype.clearScorecardData = function () {
        communication.dataSet.clean();
        events.off('popup.close', communication.clearScorecardData);
    };

    Communication.prototype.setObjectiveSuccess = function (objectiveId, status) {
        var i, count,
            statusString = 'failed';
        if (status === true || status === 'true' || status === 'passed') {
            statusString = 'passed';
        }
        count = this.api.GetValue('cmi.objectives._count');
        for (i = 0; i < count; i++) {
            if (this.api.GetValue('cmi.objectives.' + i + '.id') === objectiveId) {
                this.api.SetValue('cmi.objectives.' + i + '.success_status', statusString);
                return true;
            }
        }
        // objective not found. Create a new one
        this.api.SetValue('cmi.objectives.' + count + '.id', objectiveId);
        this.api.SetValue('cmi.objectives.' + count + '.success_status', statusString);
        return true;
    };

    Communication.prototype.getObjectiveSuccess = function (objectiveId) {
        var i, count, statusString;
        count = this.api.GetValue('cmi.objectives._count');
        for (i = 0; i < count; i++) {
            if (this.api.GetValue('cmi.objectives.' + i + '.id') === objectiveId) {
                statusString = this.api.GetValue('cmi.objectives.' + i + '.success_status');
                return (statusString === 'passed');
            }
        }
        return null;
    };

    Communication.prototype.setObjectiveScore = function (objectiveId, score) {
        var i, count;
        count = this.api.GetValue('cmi.objectives._count');
        for (i = 0; i < count; i++) {
            if (this.api.GetValue('cmi.objectives.' + i + '.id') === objectiveId) {
                this.api.SetValue('cmi.objectives.' + i + '.score.scaled', score);
                return true;
            }
        }
        // objective not found. Create a new one
        this.api.SetValue('cmi.objectives.' + count + '.id', objectiveId);
        this.api.SetValue('cmi.objectives.' + count + '.score.scaled', score);
        return true;
    };

    /**
     * Creates a new instance of the Communication object to return as a module
     * @type {Communication}
     */
    communication = new Communication();
    events.trigger('player.communication:loaded', true, communication);

    return communication;
});
