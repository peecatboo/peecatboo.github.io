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
 * @exports app/player/integration
 * @fires player.integration:loaded
 */
define([
    'module',
    'jquery',
    'app/configuration',
    'app/events',
    'app/utilities/XyTools',
    'app/player/dataHandler',
    'player'
], function (module, $, config, events, tools, dataHandler, player) {
    'use strict';
    var Integration, integration;


    /**
     * @constructor
     */
    Integration = function () {

        /** the default configuration of the object */
        this.config = {
            /**
             * The amount of levels to broadcast page/section change up in window/frame hierarchy. This should be
             * configured if content is wrapped multiple times and top window doesn't receive page/section change message
             * @type {Number}
             */
            levelsUpCountToBroadcast: 3
        };

    };

    Integration.prototype.init = function () {
        //events.trigger('beforePlayerIntegrationInit', this);

        this.config = $.extend(this.config, config.configure(module.id));
        this.courseLoaded = false;

        /*if (typeof window.PlayerInterface !== 'undefined') {
            this.control =  window.PlayerInterface;

            if (PLAYER_TYPE === 'Javascript') {
                this.control.setDependencies(integration, dataHandler, tools);
            } else if (PLAYER_TYPE === 'Server-side') {
                this.control.setDependencies(integration, dataHandler);
            } else { // no-scorm player
                this.control.setDependencies(integration, dataHandler, $, config, events);
            }
            dataHandler.init();
        } else {
            intervalScriptLoaded = setInterval(function() {
                if (window.Control != null) {
                    tools.log('Waiting for SCORM data to load...');
                    root.control =  window.Control;
                    dataHandler.init();
                    clearInterval(intervalScriptLoaded);
                }
            }, 300);
        }*/

        events.on('navigation.section:changed', function(page, section) {
            var currentLevel = 0,
                parentWindow = window.parent,
                currentWindow = window;

                while (currentLevel < integration.config.levelsUpCountToBroadcast) {
                    currentLevel++;

                    if (parentWindow !== currentWindow) {
                        parentWindow.postMessage({ page: page, section: section, typeMessage: 'navigation', playerType: PLAYER_TYPE }, '*');
                        // update values for next iteration
                        currentWindow = parentWindow;
                        parentWindow = parentWindow.parent;
                    } else {
                        break;
                    }
                }
        });

        dataHandler.init();

        events.on("externaldata.recieved", function (dataHandler) {
            var initialDestination;

            try {
                initialDestination = integration.determineCustomInitialDestination();
                if (initialDestination) {
                    dataHandler.bookmark = initialDestination;
                    dataHandler.isHashBookmark = true;
                    dataHandler.scrollPosition = window.location.hash.replace('#','');
                }

                player.initialize();
            } catch (error) {
                events.trigger('player.start:failed', error);
            }
            if (dataHandler.initialized) {
                events.on('course.unload', function exitCourse () {
                    events.trigger('course.unload:before');
                    events.trigger('content.remove');
                    events.trigger('player.unload:before');
                    player.unload();
                });
            }
        });

        //events.trigger('afterPlayerIntegrationInit', this);
    };

    Integration.prototype.requestNext = function () {
        player.next();
    };

    Integration.prototype.requestPrevious = function () {
        player.previous();
    };

    Integration.prototype.requestChoose = function (id) {
        player.choose(id);
    };

    Integration.prototype.exitContainer = function (id) {
        player.exitContainer(id);
    };

    Integration.prototype.retake = function(id) {
        player.retake(id);
        events.trigger('player.retake:triggered', id);
    };

    Integration.prototype.resetChoiceBranch = function() {
        player.resetChoiceBranch();
        events.trigger('player.resetChoiceBranch:triggered');
    };

    /**
     * Determine what the initial page to load should be, dependent on viewing mode
     * and query-string presence in the URL
     * @return {Boolean} or {pageId}
     *                   based on the URL query string.
     */
    Integration.prototype.determineCustomInitialDestination = function () {
        var query = this.getUrlQuery('destination');
            if (query) {
                query = Array.isArray(query) ? query[0].replace(/-/g, '.') : query.replace(/-/g, '.');
                return query;
            } else {
                return false;
            }
    };

    /**
     * Will provide the value of a given variable in the URL query strings
     * @param  {String} variable The name of the variable to search for in the query strings
     * @return {String|Boolean}  The value of the given variable or FALSE
     */
    Integration.prototype.getUrlQuery = function (variable) {
        var query = window.location.search.substring(1),
            vars = query.split("&"),
            pair, i, n;

       for (i = 0, n = vars.length; i < n; i += 1) {
                pair = vars[i].split("=");

                if (pair[0] === variable) {
                    return pair[1];
                }
       }

       return false;
    };

    /**
     * Creates a new instance of the Integration object to return as a module
     * @type {Integration}
     */
    integration = new Integration();
    events.trigger('player.integration:loaded', true, integration);

    return integration;
});
