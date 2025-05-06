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
 * Interface for communication between JLP and XPE
 */
define(['module',
        'app/configuration',
        'scormdata',
        'app/events',
        'app/player/dataHandler',
        'app/utilities/XyTools',
        'lang/lang',
        'notification'
    ], function (module, configuration, scormdata, events, dataHandler, tools, lang, notification) {
        var config = {
            messages  : {
                confirmationMessage           : lang.t('components.exitButton.confirm') || 'Are you sure you want to exit the course? Your progress will be saved.',
                submitAllMessage              : lang.t('components.submitAllButton.confirm') || 'Do you really want to submit all your answers?',
                acceptanceCheckMessage        : lang.t('components.submitAllButton.acceptanceCheck') || 'I understand that any unanswered questions will also be submitted'
            }
        };

    if (Control == null) {
        ExternalConfig = 'CustomProperties|as:,cs:,lms:';
        ExternalRegistrationId = '';
        PathToCourse = '';
        RedirectOnExitUrl = '/NoddyLms/NoddyLms.html?configuration=CustomProperties|as:,cs:,lms:';

        LearnerName = 'Without Tracking, Preview';
        LearnerId = 'preview';

        IntermediatePage = new CosmeticPage(
            '',
            'intermediate.html',
            '?preventRightClick=false&cc=null&configuration=CustomProperties%7Cas%3A%2Ccs%3A%2Clms%3A'
        );
        PopupLauncherPage = new CosmeticPage(
            '',
            'popuplauncher.html',
            '?preventRightClick=false&cc=null&configuration=CustomProperties%7Cas%3A%2Ccs%3A%2Clms%3A'
        );

        RegistrationToDeliver = new Registration(
            '',
            null,
            false,
            'browse',
            new Package(
                '184',
                true,
                'SCORM 2004 3rd Edition',
                new PackageProperties(
                    true,
                    true,
                    true,
                    false,
                    false,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    660,
                    600,
                    false,
                    0,
                    0,
                    false,
                    300,
                    'frameset',
                    'frameset',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'message page',
                    'exit,no confirmation',
                    'message page',
                    'message page',
                    'message page',
                    'exit,no confirmation',
                    false,
                    false,
                    'separate',
                    'AVERAGE_SCORE_OF_ALL_UNITS_WITH_SCORES',
                    null,
                    'COMPLETE_WHEN_ALL_UNITS_COMPLETE_AND_NOT_FAILED',
                    null,
                    false,
                    false,
                    false,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    false,
                    true,
                    false,
                    true,
                    true,
                    true,
                    2,
                    10000,
                    'Disable',
                    false,
                    true,
                    'when exit is not suspend',
                    true,
                    'ENABLED',
                    false,
                    false,
                    false,
                    true,
                    'legacy',
                    true,
                    false,
                    false,
                    false,
                    false,
                    'unknown',
                    false,
                    false,
                    true,
                    true,
                    true,
                    true,
                    true,
                    true,
                    64000,
                    0
                ),
                true,
                new Array(
                    new LearningObject(scormdata.LearningObject[0])
                )
            ),
            scormdata.Activity.map(function (a) {
                return new Activity(a);
            }),
            scormdata.GlobalObjective.map(function (o) {
                return new GlobalObjective(o);
            }),
            new Array(),
            new Array()
        );

        QuerystringAdditions = new Array();

        API_1484_11 = new RunTimeApi(LearnerId, LearnerName);
        apiReference = API_1484_11;
        apiReference.playerName = 'scormengine';
        apiReference.playerVersion = '2012.1.0.396';

        IntegrationImplementation = new Integration();

        Control = new Controller();

        if (window.location.toString().toLowerCase().indexOf('preventrightclick=true') > 0) {
            window.document.oncontextmenu = function () {
                return false;
            };
        }
        isWebkit = false;
        isMobile = false;

        config = tools.extend(config, configuration.configure(module.id));
    }

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

        if (!param || typeof param !== 'string') {
            return null;
        }
        if (param.match(/name|title/i)) {
            return activity.GetTitle();
        }
        if (param.match(/guid/i)) {
            return activity.LearningObject.Href;
        }
        if (param.match(/^id$|identifier/i)) {
            return activity.GetItemIdentifier();
        }
        if (param.match(/^attempts$/i)) {
            return activity.ActivityAttemptCount;
        }
        if (param.match(/^score$/i)) {
            return getScore(activity);
        }
        if (param.match(/^passingscore$/i)) {
            return getPassingScore(activity);
        }
        if (param.match(/weight/i)) {
            return getWeight(activity);
        }
        if (param.match(/^availableChildren$/i)) {
            return activity.AvailableChildren.map(function (a) { return a.GetItemIdentifier() });
        }
        if (param === 'path') {
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
    }

    function getActivityBy(by, value, prop, skip) {
        var activities, activity;

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return null;
        }

        if (by === 'id') {
            activity = Control.Sequencer.Activities.ActivityList.find(function (a) {
                return a.GetItemIdentifier() === value;
            })
        }
        if (by === 'guid') {
            skip = skip || 0;

            activities = Control.Sequencer.Activities.ActivityList.filter(function (a) {
                return a.LearningObject.Href === value;
            });

            // skip parameter is used in case if there are many pages with the same guid in the course
            if (!activities.length || (skip && !activities[skip])) return null;

            activity = activities[skip];
        }

        return getActivity(activity, prop);
    }

    function getRootActivity(param) {
        if (typeof Control === 'undefined' || !Control.Initialized) {
            return null;
        }
        var root = Control.Sequencer.GetRootActivity();

        return getActivity(root, param);
    }

    function getCurrentActivity(param, wholeActivity) {
        var activity;

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return null;
        }
        activity = Control.Sequencer.GetCurrentActivity();
        wholeActivity = wholeActivity || typeof param === 'boolean' && param;

        return wholeActivity ? activity : getActivity(activity, param);
    }

    function getParentActivity(id, param, wholeActivity) {
        var activity = Control.Sequencer.Activities.GetActivityFromIdentifier(id);

        if (activity == null) { // first parameter was null or not an id
            activity = getCurrentActivity(true);
            if (typeof param === 'boolean') {
                wholeActivity = param;
            }
            if (typeof id === 'string') {
                param = id;
            } else if (!param && typeof id === 'boolean') {
                wholeActivity = id;
            }
        }

        if (typeof activity === 'undefined' || activity.ParentActivity == null) {
            return null;
        }
        activity = activity.ParentActivity;
        wholeActivity = wholeActivity || typeof param === 'boolean' && param;
        return wholeActivity ? activity : getActivity(activity, param);
    }

    function getPassingScore(activity) {
        var objective = activity.GetPrimaryObjective();

        if (objective) {
            return objective.GetMinimumSatisfiedNormalizedMeasure() * 100;
        } else {
            return 100;
        }
    }

    function getScore(activity) {
        var objective = activity.GetPrimaryObjective();

        if (objective) {
            return (objective.GetNormalizedMeasure(activity, false) * 100).toFixed(2);
        } else {
            return 0;
        }
    }

    function getWeight(activity) {
        return +activity.GetRollupObjectiveMeasureWeight() * 100;
    }

    function processScorecardContainer(containerId, isSubContainer) {
        var container = Control.Sequencer.Activities.GetActivityFromIdentifier(containerId);

        var dataActivity = container;
        // for subcontainers: check if container is the only questions container inside an assessment, and is not root
        // (has parent), in that case use parents title
        var parent = container.ParentActivity;
        if (parent && isSubContainer && getActivity(parent, 'ChildActivities').filter(function (child) {
            return !child.IsALeaf();
        }, this).length === 1) {
            dataActivity = parent;
        }

        var children = container.GetAvailableChildren(),
            data = {
                title: getActivity(dataActivity, 'title'),
                score: getActivity(container, 'score'),
                passingScore: getActivity(container, 'passingscore'),
                weight: getActivity(container, 'weight'),
                attempts: getActivity(container, 'attempts'),
                pages: [],
                containers: []
            };

        children.forEach(function (child) {
            if (hasQuestions(child)) {
                if (!child.IsALeaf()) {
                    data.containers.push(processScorecardContainer(child.ItemIdentifier, true));
                } else {
                    data.pages.push(processScorecardPage(child));
                }
            }
        }, this);

        return data;
    }

    function processScorecardPage(activity) {
        var objectives = activity.GetObjectives(),
            interactions = activity.RunTime.Interactions,
            data = {
                title: getActivity(activity, 'title'),
                id: getActivity(activity, 'id'),
                guid: getActivity(activity, 'guid'),
                link: getActivity(activity, 'guid') + '.html',
                questions: []
            };

        objectives.
        filter(function (objective) {
            return (/^q-/).test(objective.GetIdentifier());
        }).
        forEach(function (objective, i) {
            var interaction = interactions[i],
                description, result, response, status, flag, guid, remainingAttempts, order;

            result = (interaction) ? interaction.Result : '';

            if (interaction && interaction.LearnerResponse) {
                status = 'Attempted';
                response = interaction.LearnerResponse;
            } else {
                status = (activity.AttemptProgressStatus) ? 'Skipped' : 'Not Attempted';
                response = '';
            }
            if (interaction && interaction.Description) {
                try {
                    description = JSON.parse(interaction.Description);
                    flag = !!description.f;
                    remainingAttempts = description.a;
                    order = description.o ? description.o : [];
                } catch (e) {
                     // If description couldn't be parsed then it is not a question. Skip.
                     return;
                }
            } else {
                flag = false;
                order = [];
            }
            guid = (objective.GetIdentifier() || '').replace('q-', '');

            data.questions.push({
                result            : result,
                response          : response,
                status            : status,
                flag              : flag,
                guid              : guid,
                order             : order,
                remainingAttempts : remainingAttempts
            });
        });

        return data;
    }

    function getInteractionsData(guid) {
        var activity,
            interactions = [],
            preceding = this.getPrecedingLinkedPagesCount(guid),
            count, i;

        activity = Control.Sequencer.Activities.GetActivityFromIdentifier(getActivityBy('guid', guid, 'id', preceding));

        if (activity.RunTime == null) {
            return null;
        }

        count = activity.RunTime.Interactions.length;

        // read questions
        for (i = 0; i < count; i++) {
            interactions[i] = {};
            interactions[i].id = i;
            interactions[i].result = activity.RunTime.Interactions[i].Result;
            interactions[i].response = activity.RunTime.Interactions[i].LearnerResponse;
            interactions[i].description = activity.RunTime.Interactions[i].Description;
        }

        return interactions;
    }

    function setActivityAsCompleted(activity, recursive) {
        var currentActivity = getCurrentActivity(true),
            primaryObjective;

        activity = activity || getCurrentActivity(true);
        if (activity.GetItemIdentifier() === currentActivity.GetItemIdentifier()) {
            return;
        }

        activity.Active = false;
        activity.SetAttemptCompletionStatus(true);
        activity.SetAttemptProgressStatus(true);
        activity.SetActivityProgressStatus(true);
        activity.Suspended = true;
        primaryObjective = activity.GetPrimaryObjective();
        // if the page was notvisited, not satisfied by measure and there are no questions, mark it as satisfied
        if (!primaryObjective.ProgressStatus && !primaryObjective.SatisfiedByMeasure &&
            !activity.GetObjectives().some(function (objective) {
                return (/^q-/).test(objective.GetIdentifier());
            })) {
            primaryObjective.SatisfiedStatus = true;
        }
        primaryObjective.ProgressStatus = true;

        if (recursive && !activity.IsALeaf()) {
            activity.GetAvailableChildren().forEach(function (a) {
                setActivityAsCompleted(a, true);
            });
        }
    }

    function getSortedActivityList(allChildren) {
        var root, sortedList = [];

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return [];
        }
        if (typeof allChildren !== 'boolean') {
            allChildren = false;
        }
        root = Control.Sequencer.Activities.GetRootActivity();

        addChildren(root);

        return sortedList;

        function addChildren(parent) {
            var children = allChildren ? parent.GetChildren() : parent.GetAvailableChildren();

            sortedList.push(parent.ItemIdentifier);
            for (var i = 0, n = children.length; i < n; i++) {
                addChildren(children[i]);
            }
        }

    }

    function getMenuItems(allChildren) {
        return getSortedActivityList(allChildren).
        map(function (activityId) {
            return Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        }).
        map(function (activity) {
            if (activity.MenuItem) {
                return {
                    id                : activity.MenuItem.ActivityId,
                    title             : activity.MenuItem.Title,
                    isLeaf            : activity.MenuItem.Children.length === 0,
                    allChildrenHidden : activity.MenuItem.Children.filter(function (item) { return item.Visible; }).length === 0,
                    active            : activity.MenuItem.Active,
                    enabled           : activity.MenuItem.Enabled,
                    satisfied         : activity.MenuItem.Satisfied,
                    completed         : activity.MenuItem.Completed,
                    progress          : activity.MenuItem.Progress,
                    visible           : activity.MenuItem.Visible,
                    href              : activity.LearningObject.Href,
                    inaccessible      : checkIfUnreachable(activity)
                };
            } else {
                return {
                    id                : activity.GetItemIdentifier(),
                    title             : activity.GetTitle(),
                    isLeaf            : activity.IsALeaf(),
                    allChildrenHidden : true,
                    active            : false,
                    enabled           : false,
                    visible           : false,
                    href              : activity.LearningObject.Href,
                    inaccessible      : true
                }
            }
        });

        function checkIfUnreachable(activity) {
            var isSkipped = false;

            // scorecard is unreachable only if its parent is unreachable
            if (isScorecard(activity.GetItemIdentifier())) {
                return checkIfUnreachable(activity.ParentActivity);
            }

            if (activity.ParentActivity && !activity.ParentActivity.GetSequencingControlFlow() && !activity.ParentActivity.GetSequencingControlChoice()) {
                return true;
            }

            while (activity) {
                // definitely available through the tree
                if (activity.MenuItem.Enabled && activity.MenuItem.Visible) {
                   return false;
                }

                if (Control.Sequencer.SequencingRulesCheckProcess(activity, RULE_SET_DISABLED) != null) {
                    return true;
                }
                if (Control.Sequencer.SequencingRulesCheckProcess(activity, RULE_SET_SKIPPED) != null ||
                    (activity.ParentActivity && !activity.ParentActivity.GetSequencingControlFlow())) {
                    isSkipped = true;
                }
                if (!activity.MenuItem.Visible && isSkipped) {
                    return true;
                }
                activity = activity.ParentActivity;
            }

            return false;
        }
    }

    function getPrecedingLinkedPagesCount(guid) {
        var result = 0,
            currentId = getCurrentActivity('id'),
            currentFound = false;

        getMenuItems(true).forEach(function (item) {
            if (currentFound) return;

            if (item.id === currentId) {
                currentFound = true;
                return;
            };

            if (item.href === guid) {
                result += 1;
            }
        });

        // searching not for current activity - return the last occurrence before current activity
        if (guid !== getCurrentActivity('guid')) {
            result -= 1;
        }

        return result;
    }

    function checkCourseCompletion() {
        var currentActivity = getCurrentActivity(true);

        events.trigger('communication.saveQuestionData');
        currentActivity.TransferRteDataToActivity();
        triggerRollup(currentActivity);

        return Control.Activities.GetRootActivity().IsCompleted(null, false) === true;
    }

    function getExitMessage(contextAwareness) {
        var bookmarkType,
            assessment = contextAwareness === false ? isSubmitAllMode() : isAssessment();

        //no message if the course is already completed
        if (checkCourseCompletion()) {
            return;
        }

        if (assessment && !isSubmitAllStatusSaved() && hasAttemptedQuestions()) {
            bookmarkType = getBookmarkType();
            if (/Retake/.test(bookmarkType) || /Review/.test(bookmarkType)) {
                return config.messages.submitAllMessage;
            } else if (/Resume/.test(bookmarkType)) {
                return config.messages.confirmationMessage;
            }
        } else {
            return config.messages.confirmationMessage;
        }
    }

    function getExitConfirmation(callback, contextAwareness) {
        var root = this,
            bookmarkType = getBookmarkType(),
            assessment = contextAwareness === false ? isSubmitAllMode() : isAssessment(),
            confirmDialogCheckboxSelector = 'input[type=checkbox]',
            confirmDialogOKButtonSelector = '.ConfirmOkButton',
            confirmDialogLabelSelector = 'label',
            submitAllTemplate = '<div class="SubmitAllConfirmationDialog">' +
                                      '<p><b>' + config.messages.submitAllMessage + '</b></p>' +
                                      '<label><input type="checkbox" /> '+ config.messages.acceptanceCheckMessage + '</label>' +
                                      '</div>';

        // no message if the course is already completed
        if (checkCourseCompletion()) {
            callback();
            return;
        }

        if (assessment && !isSubmitAllStatusSaved() && (/Retake/.test(bookmarkType) || /Review/.test(bookmarkType)) && hasAttemptedQuestions()) {
            notification.confirm(submitAllTemplate, callback, {
                open: function () {
                    var button, checkbox;

                    button = this.popup.find(confirmDialogOKButtonSelector);
                    checkbox = this.content.find(confirmDialogCheckboxSelector);

                    events.trigger('communication.saveQuestionData');

                    if (!hasUnansweredQuestions()) {
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
            notification.confirm(config.messages.confirmationMessage, callback);
        }
    }

    function getPageIndexInCourse(activityId) {
        if (typeof Control === 'undefined' || !Control.Initialized) {
            return 0;
        }
        var activity = activityId ? Control.Sequencer.Activities.GetActivityFromIdentifier(activityId) : getCurrentActivity(true);

        return Control.Sequencer.Activities.GetSortedIndexOfActivity(activity);
    }

    function checkPageExistence(activityId) {
        if (typeof Control === 'undefined' || !Control.Initialized) {
            return true; // fallback if there is no scorm palyer
        }
        return !!Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
    }

    function exitContainer(scorecardId) {
        var activity = scorecardId ? Control.Sequencer.Activities.GetActivityFromIdentifier(scorecardId) : getCurrentActivity(true),

            currentActivity = activity,
            siblings = activity.ParentActivity.GetChildren(),
            i = 0,
            n = siblings.length;

        if (!scorecardId) {
            exitParent(activity);
        } else {
            choose(scorecardId);
        }

        function exitParent(activity) {
            var parent = getActivity(activity, 'ParentActivity'),
                parentSiblings = getActivity(parent, 'ParentActivity') !== null ? getActivity(parent, 'ParentActivity').ChildActivities : [];

            // if parent isn't the last item
            if (parentSiblings.length && parentSiblings[parentSiblings.length - 1] !== parent) {
                var nextId;
                // finding in a loop because of stupid IE no Array.indexOf method
                for (var i = 0, n = parentSiblings.length; i < n; i++) {
                    if (parentSiblings[i] === parent) {
                        nextId = getActivity(parentSiblings[i + 1], 'identifier');
                    }
                }

                setActivityAsCompleted(parent);
                choose(nextId);
            } else {
                if (parentSiblings.length !== 0) {
                    exitParent(parent);
                } else {
                    // we're at the top, nowhere to move next
                    // just refresh the current activity
                    choose(currentActivity.GetItemIdentifier());
                }
            }
        }
    }

    function isScorecard(activityId) {
        var objective = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId).GetPrimaryObjective();

        return objective && objective.GetIdentifier() === 'EnhancedScorecard';
    }

    function isSubmitAllMode(activityId) {
        var activity = null;

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return false;
        }

        if (activityId) {
            activity = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        }

        return Control.isSubmitAllMode(activity);
    }

    function isAssessment(activityId) {
        var activity = null;

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return false;
        }

        if (activityId) {
            activity = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        }

        return Control.isAssessment(activity);
    }

    function isAnyAssessment(activityId) {
        var activity = null;

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return false;
        }

        if (activityId) {
            activity = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        }

        return Control.isAnyAssessment(activity);
    }

    function hasSubassessments(activityId) {
        var activity;

        if (!activityId) {
            activityId = findScorecard();
        }

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return false;
        }

        if (activityId) {
            activity = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        }

        if (!activity) {
            return false;
        }

        return Control.hasSubassessments(activity);
    }

    function saveSubmitAllStatus(scorecardId) {
        if (typeof Control === 'undefined' || !Control.Initialized) {
            return;
        }
        tools.log("playerInterface: saveSubmitAllStatus id-" + scorecardId);
        // set "submit all button clicked" status as passed
        var currentActivity = scorecardId ? Control.Sequencer.Activities.GetActivityFromIdentifier(scorecardId) : getCurrentActivity(true),
            parentActivity = getActivity(currentActivity, 'ParentActivity'),
            siblings = getActivity(parentActivity, 'ChildActivities'),
            objectives = currentActivity.GetObjectives(),
            globalObjective,
            globalObjectiveId,
            i, n;

        // get target global objective Id and set status
        for (i = 0, n = objectives.length; i < n; i++) {
            if (/^Submit/.test(objectives[i].GetIdentifier())) {
                globalObjectiveId = objectives[i].GetMaps()[0].TargetObjectiveId;
                // clear global objective
                globalObjective = Control.Sequencer.GetGlobalObjectiveByIdentifier(globalObjectiveId);
                globalObjective.ProgressStatus = true;
                globalObjective.SatisfiedStatus = true;
                break;
            }
        }

        // set all siblings and parent container as completed
        for (i = 0, n = siblings.length; i < n; i++) {
            setActivityAsCompleted(siblings[i], true);
            triggerRollup(siblings[i]);
        }
        setActivityAsCompleted(parentActivity);
    }

    function triggerRollup(activity) {
        var children;
        if (activity.IsALeaf()) {
            Control.Sequencer.OverallRollupProcess(activity);
            return;
        }

        // container - look for inner containers
        children = getActivity(activity, 'ChildActivities').filter(function (a) {
            return !a.IsALeaf();
        });

        if (children.length > 0) {
            children.forEach(function (a) {
                triggerRollup(a);
            });
        } else {
            Control.Sequencer.OverallRollupProcess(activity);
        }
    }

    function isSubmitAllStatusSaved() {
        // get "submit all button clicked" status

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return;
        }

        return Control.isSubmitAllStatusSaved();
    }

    function getCurrentTime() {
        return new Date();
    }

    function hasQuestions(activity) {
        var objectives, children, child, containsQuestions;

        activity = activity || getCurrentActivity(true);

        if (!activity) { // no player
            return false;
        }

        if (activity.IsALeaf()) {
            objectives = activity.GetObjectives();

            return objectives.some(function (objective) {
                return (/^q-/).test(objective.GetIdentifier());
            });
        } else {
            children = activity.GetAvailableChildren();
            for (i = 0, n = children.length; i < n; i++) {
                child = children[i];
                containsQuestions = hasQuestions(child);
                if (containsQuestions) {
                    return true;
                }
            }
            return false;
        }
    }

    function findScorecard() {
        if (!Control) {
            return null;
        }

        return Control.findScorecard();
    }

    function getCurrentPageNumberInContainer() {
        var current = getCurrentActivity(true),
            siblings = getParentActivity(true).GetAvailableChildren(),
            i, n;
        for (i = 0, n = siblings.length; i < n; i++) {
            if (siblings[i] === current) {
                return i + 1;
            }
        }
        return 0;
    }

    function getContainerPagesCount() {
        return getParentActivity(true).GetAvailableChildren().length;
    }

    function getCoursePagesCount() {
        return getSortedActivityList().length;
    }

    function isSibling(activity) {
        var currentActivity = getCurrentActivity(true);

        if (typeof (activity) === 'string') {
            // we've got the id
            activity = Control.Sequencer.Activities.GetActivityFromIdentifier(activity);
            if (activity == null) {
                return false;
            }
        }

        return currentActivity.ParentActivity === activity.ParentActivity;
    }

    function getBookmarkType() {
        var curActivity = getCurrentActivity(true),
            type = 'Resume',
            attemptLimit = NaN;

        if (curActivity.GetObjectives() && curActivity.GetObjectives().length > 1) {
            for (var i = 1; i < curActivity.GetObjectives().length; i++) {
                var objIden = curActivity.GetObjectives()[i].GetIdentifier();
                if (/Retake/.test(objIden)) {
                    type = 'Retake';
                    attemptLimit = parseInt(objIden.match(/^.*-(.*)/)[1]);
                    break;
                }
                if (/Review/.test(objIden)) {
                    type = 'Review';
                    break;
                }
            }
        }
        return type;
    }

    function wasRandomizationApplied(activityId) {
        var activity;

        if (activityId) {
            activity = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        } else {
            activity = getCurrentActivity(true);
        }

        return activity.RandomizedChildren || false;
    }

    function comesAfterCurrent(activityId) {
        var activities, current, target, i, n;

        if (typeof Control === 'undefined' || !Control.Initialized) {
            return false;
        }
        current = getCurrentActivity(true);
        target = Control.Sequencer.Activities.GetActivityFromIdentifier(activityId);
        if (current === target) { // don't waste the time
            return false;
        }

        // this list is updated after randomization, unlike Control.Activities.SortedActivities
        activities = Control.Sequencer.GetOrderedListOfActivities();
        n = activities.length;
        for (i = 0; i < n; i++) {
            // the current activity comes before the target
            if (activities[i] === current) {
                return true;
            }
            // the current activity comes after the target
            if (activities[i] === target) {
                return false;
            }
        }
        // something was not found
        return null;
    }

    function retake(activityId) {
        if (typeof Control !== 'undefined' || !Control.Initialized) {
            tools.log("playerInterface: retake id-" + activityId);
            Control.retake(activityId, true);
        }
    }

    function resetChoiceBranch() {
        if (typeof Control !== 'undefined' || !Control.Initialized) {
            tools.log("playerInterface: reset Choice Branch");
            Control.resetChoiceBranch();
        }
    }

    function getSectionStatusData(nodeId) {
        var questionList = {},
            data = processScorecardContainer(nodeId ? nodeId : getParentActivity('id')),
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
            questionStatusMap = getSectionStatusData(getParentActivity(findScorecard(), 'id'));

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
            questionStatusMap = getSectionStatusData(getParentActivity(findScorecard(), 'id'));

        for (guid in questionStatusMap) {
            status = questionStatusMap[guid];
            if (status && status !== 'Not Attempted') {
                return true;
            }
        }

        return hasQuestions(); // check if there are any questions on current page that user may have seen
    }

    function saveSuspendData() {
        var dataSet = Control.GetSuspendData();

        if (dataSet && dataSet.suspendData) {
            dataHandler.saveSuspendData(dataSet);
        }
    }

    function getNextPage() {
        var nextPage = Control.getNextPage();

        if (nextPage && nextPage.GetItemIdentifier) {
            return nextPage.GetItemIdentifier();
        }
        return null;
    }

    function getPreviousPage() {
        var previousPage = Control.getPreviousPage();

        if (previousPage && previousPage.GetItemIdentifier) {
            return previousPage.GetItemIdentifier();
        }
        return null;
    }

    function getFollowingPageId () {
        return Control.getFollowingPageId();
    }

    function getPrecedingPageId() {
        return Control.getPrecedingPageId();
    }

    // Navigation functions
    function initialize() {
        var result;

        if (Control == null) {
            throw 'Player not found';
            return;
        }
        tools.log("playerInterface: initialize");
        result = Control.Initialize(this, dataHandler);
        events.on('navigation.completePageLoad:after', saveSuspendData);

        return result;
    }

    function unload() {
        tools.log("playerInterface: unload");
        return Control.Unload();
    }

    function next() {
        tools.log("playerInterface: next");
        Control.Next();
        return Control.ScoUnloaded();
    }

    function previous() {
        tools.log("playerInterface: previous");
        Control.Previous();
        return Control.ScoUnloaded();
    }

    function choose(id) {
        tools.log("playerInterface: choose id-" + id);
        Control.ChoiceRequest(id);
        return Control.ScoUnloaded();
    }

    function triggerContentRemove() {
        events.trigger('content.remove');
    }

    function triggerPlayerStart() {
        dataHandler.bookmark = '';
        events.trigger('player.start', true, this);
    }

    function triggerPlayerUnload(dataSet) {
        events.trigger('player.unload:after');

        dataSet = dataSet || {};
        dataHandler.saveData(dataSet);
    }

    function urlChanged(url, treeId) {
        events.trigger('content.url:changed', false, url, treeId);
    }

    function updateControls(state) {
        events.trigger('navigationButtons.state:changed', true, state);
    }

    function storeAdditionalData(data) {
        Control.Timers = data;
    }

    function retrieveAdditionalData() {
        return Control.Timers;
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
        getActivityBy                   : getActivityBy,
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
        hasSubassessments               : hasSubassessments,
        getCurrentTime                  : getCurrentTime,
        findScorecard                   : findScorecard,
        isScorecard                     : isScorecard,
        getSectionStatusData            : getSectionStatusData,
        hasUnansweredQuestions          : hasUnansweredQuestions,
        hasAttemptedQuestions           : hasAttemptedQuestions,
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
        getExitMessage                  : getExitMessage,
        getExitConfirmation             : getExitConfirmation,
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
        resetChoiceBranch               : resetChoiceBranch,
        unload                          : unload,

        /**
        * METHODS WHICH ARE BEING CALLED FROM PLAYER SIDE
        */
        urlChanged                      : urlChanged,
        updateControls                  : updateControls,
        triggerPlayerStart              : triggerPlayerStart,
        triggerPlayerUnload             : triggerPlayerUnload,
        // JLP specific methods
        triggerContentRemove            : triggerContentRemove,

        // /**
        // * SCORM 2004 API
        // */
        API_1484_11: API_1484_11
    };
});
