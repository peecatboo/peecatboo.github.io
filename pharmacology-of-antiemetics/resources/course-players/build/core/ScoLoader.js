;
(function() {
    ScoLoader = function(intermediatePage, popupLauncherPage, pathToCourse, scoLaunchType, wrapScoWindowWithApi, standard) {

        this.IntermediatePage = intermediatePage;
        this.PopupLauncherPage = popupLauncherPage;
        this.PathToCourse = pathToCourse;
        this.ScoLaunchType = scoLaunchType;
        this.WrapScoWindowWithApi = wrapScoWindowWithApi;
        this.Standard = standard;
        this.ScoLoaded = false;

        this.ContentFrame = ScoLoader_FindContentFrame(window);

        // if (this.ContentFrame === null) {
        //     Debug.AssertError("Unable to locate the content frame-" + IntegrationImplementation.CONTENT_FRAME_NAME);
        // }
    }

    ScoLoader.prototype.LoadSco = ScoLoader_LoadSco;
    ScoLoader.prototype.UnloadSco = ScoLoader_UnloadSco;
    ScoLoader.prototype.WriteHistoryLog = ScoLoader_WriteHistoryLog;
    ScoLoader.prototype.WriteHistoryReturnValue = ScoLoader_WriteHistoryReturnValue;

    ScoLoader.prototype.ConstructPreviewAiccSid = ScoLoader_ConstructPreviewAiccSid;

    function ScoLoader_WriteHistoryLog(str, atts) {
        // HistoryLog.WriteEventDetailed(str, atts);
    }

    function ScoLoader_WriteHistoryReturnValue(str, atts) {
        // HistoryLog.WriteEventDetailedReturnValue(str, atts);
    }

    function ScoLoader_LoadSco(activity) {

        // var historyAtts = {ev:'LoadSco'};
        // if (activity) {
        //    historyAtts.ai = activity.ItemIdentifier;
        //    historyAtts.at = activity.LearningObject.Title;
        // }
        // this.WriteHistoryLog("", historyAtts);


        activity.LaunchedThisSession = false;

        if (activity.GetActivityStartTimestampUtc() === null) {
            activity.SetActivityStartTimestampUtc(ConvertDateToIso8601String(new Date()));
        }

        if (activity.GetAttemptStartTimestampUtc() === null) {
            activity.SetAttemptStartTimestampUtc(ConvertDateToIso8601String(new Date()));
        }

        var aiccParams = "";
        if (this.Standard.isAICC()) {

            var isPreview = ExternalRegistrationId == '';

            if (isPreview) {
                var aiccSid = "AICC_SID=" + escape(this.ConstructPreviewAiccSid(activity) + escape(ExternalConfig));
            } else {
                var aiccSid = "AICC_SID=" + escape(activity.AiccSessionId);
                var isSessionIdIsAGuid = activity.AiccSessionId.length == 38;

                // Skip appending the external config for legacy registrations which have an AiccSessionId that actually contains
                // the external config embedded within it.
                if (isSessionIdIsAGuid) {
                    aiccSid += escape(escape(ExternalConfig));
                }
            }

            aiccParams += aiccSid + "&AICC_URL=" + escape(AICC_RESULTS_PAGE);
        }

        var pathToSco = "";

        // If activity url is relative then prepend pathToCourse
        if (this.PathToCourse.length > 0 && activity.GetLaunchPath().toLowerCase().indexOf("http://") != 0 && activity.GetLaunchPath().toLowerCase().indexOf("https://") != 0 && activity.GetLaunchPath().toLowerCase().indexOf("about:blank") != 0) {

            pathToSco = this.PathToCourse;

            if (this.PathToCourse.lastIndexOf("/") != (this.PathToCourse.length - 1)) {
                pathToSco += "/";
            }

            pathToSco += activity.GetLaunchPath();

        } else {
            pathToSco = activity.GetLaunchPath() + ".html";
        }

        var launchPath;

        if (aiccParams !== "") {

            pathToSco = MergeQueryStringParameters(pathToSco, aiccParams);
        }

        if (this.ScoLaunchType == LAUNCH_TYPE_FRAMESET) {

            // Control.WriteDetailedLog("Loading Sco In Frameset at: " + pathToSco);

            jQuery.ajax(pathToSco).done(function(data) {
                var page = jQuery(data);
                jQuery("#PageBody").append(page);
                Control.Events.trigger('content.loaded', false, '#PageBody');
                /*var links = page.filter("link[type='text/css']"),
            head = internalJQ("head"),
            link, href;
        for (var i=0; i<links.length; i++) {
            link = jQuery(links[i]),
            href = link.attr('href');
            //if (href.toLowerCase().indexOf("jquery") === -1 && !this.IsAlreadyAdded(href)) {
                link.attr('href', ScoLoader.RELATIVE_PATH + href);
                head.append(link);
            //}
        }
        links = page.filter("script");
        for (var i=0; i<links.length; i++) {
            var script = jQuery(links[i]);
            //script.attr('src', "../course/" + script.attr('src'));
            //head.append(script);
            if (script.attr('src'))
                internalJQ.getScript(ScoLoader.RELATIVE_PATH + script.attr('src'));
        }*/

                //internalJQ("#contentWrapper").append(page.filter("div"));
                //TODO content is loaded. Fire event
            });


        } else if (this.ScoLaunchType == LAUNCH_TYPE_POPUP ||
            this.ScoLaunchType == LAUNCH_TYPE_POPUP_WITHOUT_BROWSER_TOOLBAR ||
            this.ScoLaunchType == LAUNCH_TYPE_POPUP_WITH_MENU ||
            this.ScoLaunchType == LAUNCH_TYPE_POPUP_AFTER_CLICK ||
            this.ScoLaunchType == LAUNCH_TYPE_POPUP_AFTER_CLICK_WITHOUT_BROWSER_TOOLBAR) {

            if (this.ScoLaunchType == LAUNCH_TYPE_POPUP_WITHOUT_BROWSER_TOOLBAR || this.ScoLaunchType == LAUNCH_TYPE_POPUP_AFTER_CLICK_WITHOUT_BROWSER_TOOLBAR) {
                var showToolbar = "false";
            } else {
                var showToolbar = "true";
            }

            if (this.ScoLaunchType == LAUNCH_TYPE_POPUP_WITH_MENU) {
                var showMenubar = "yes";
            } else {
                var showMenubar = "no";
            }

            if (this.ScoLaunchType == LAUNCH_TYPE_POPUP_AFTER_CLICK || this.ScoLaunchType == LAUNCH_TYPE_POPUP_AFTER_CLICK_WITHOUT_BROWSER_TOOLBAR) {
                var launchAfterClick = "true";
            } else {
                var launchAfterClick = "false";
            }

            if (this.WrapScoWindowWithApi === true) {
                launchPath = MergeQueryStringParameters(this.PopupLauncherPage.PageHref,
                    this.PopupLauncherPage.Parameters,
                    "ScoUrl=" + escape(pathToSco),
                    "LaunchAfterClick=" + launchAfterClick,
                    "WrapApi=true",
                    "ShowToolbar=" + showToolbar,
                    "ShowMenubar=" + showMenubar);
            } else {
                launchPath = MergeQueryStringParameters(this.PopupLauncherPage.PageHref,
                    this.PopupLauncherPage.Parameters,
                    "ScoUrl=" + escape(pathToSco),
                    "LaunchAfterClick=" + launchAfterClick,
                    "ShowToolbar=" + showToolbar,
                    "ShowMenubar=" + showMenubar);
            }
            this.ContentFrame.location = launchPath;
        } else {
            // Debug.AssertError("Invalid Sco Launch Type");
        }
    }

    function ScoLoader_UnloadSco(messageToDisplay) {

        var path = "";

        if (Control.Package.Properties.MakeStudentPrefsGlobalToCourse === true) {
            Control.UpdateGlobalLearnerPrefs()
        }

        if (Control.DeliverFramesetUnloadEventCalled) {
            path = "about:blank";
        } else if (messageToDisplay === true) {
            path = MergeQueryStringParameters(this.IntermediatePage.PageHref, this.IntermediatePage.Parameters, "MessageWaiting=true");
        } else {
            path = MergeQueryStringParameters(this.IntermediatePage.PageHref, this.IntermediatePage.Parameters);
        }

        if ((this.ScoLaunchType == LAUNCH_TYPE_POPUP ||
                this.ScoLaunchType == LAUNCH_TYPE_POPUP_AFTER_CLICK) &&
            this.ContentFrame.CloseSco) {

            if (Control.DeliverFramesetUnloadEventCalled) {
                if (this.ContentFrame.scoWindow && this.ContentFrame.scoWindow !== null && !this.ContentFrame.scoWindow.closed) {
                    this.ContentFrame.scoWindow.close();
                }
                this.ContentFrame.location = path;
            } else {
                // Control.WriteDetailedLog("Closing Sco");
                this.ContentFrame.CloseSco();

                // Control.WriteDetailedLog("Launching intermediate page from " + path);
                window.setTimeout("Control.ScoLoader.ContentFrame.location = '" + path + "'", 250);
            }
        } else {
            // Control.WriteDetailedLog("UnLoading Sco and launching intermediate page from " + path);
            Control.Events.trigger('content.unload:before', false, '#PageBody');
            jQuery('#PageBody').html('');
            Control.Events.trigger('content.unload:after', false, '#PageBody');
            Control.ScoUnloaded();
        }
    }


    function ScoLoader_FindContentFrame(wnd) {
        //search all child frames recursively until we find the content frame
        var contentWindow = null;

        for (var i = 0; i < wnd.frames.length; i++) {

            if (wnd.frames[i].name == IntegrationImplementation.CONTENT_FRAME_NAME) {
                contentWindow = wnd.frames[i];
                return contentWindow;
            }

            contentWindow = ScoLoader_FindContentFrame(wnd.frames[i]);

            if (contentWindow !== null) {
                return contentWindow;
            }
        }

        return window; // no frames
    }

    function ScoLoader_ConstructPreviewAiccSid(activity) {

        // 2-digit lenghts are used so we can parse out these ids without the use of
        // delimeters which could cause encoding problems on the url

        var packageId = RegistrationToDeliver.Package.Id;
        if (packageId.length < 10)
            var packageIdLength = "0" + packageId.length.toString();
        else
            var packageIdLength = packageId.length.toString();

        var scormObjectId = activity.ScormObjectDatabaseId;
        if (scormObjectId.length < 10)
            var scormObjectIdLength = "0" + scormObjectId.length.toString();
        else
            var scormObjectIdLength = scormObjectId.length.toString();

        var aiccSid = "PREVIEW" + packageIdLength + packageId + scormObjectIdLength + scormObjectId;

        return aiccSid;
    }

})();
