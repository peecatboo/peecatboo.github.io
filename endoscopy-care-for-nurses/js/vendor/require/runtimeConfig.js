(function (require, window) {
    var cloudFrontUrl = window.Xyleme.environment.CLOUDFRONT_BASE_URL,
        urlArguments = [], setupPath, questionDataPath, localesPath,
        legacyPlayerPath, playerPath, legacyJlpPath, jlpPath, jlpLoadPath,
        playerLoadPath, bcpLoadPath, globalSelector, legacyBcpPath, bcpPath,
        uspLoadPath, scormdata;

    globalSelector = require.s.contexts._.config.config['*'].globalSelector || 'global';

    /*
     * Catch errors when loading a require.js module, usually due to session timeouts
     */
    require.onError = function (err) {
        var cookieSearch = document.cookie.match(/authenticationRefreshAttempt=(\d+);/i),
            attemptLimit = 1,
            attemptsUsed  = (cookieSearch) ? +cookieSearch[1] : 0;

        if (err.requireType === 'scripterror') {
            // Our script seems to have failed to load

            if (attemptsUsed >= attemptLimit) {
                // We've attempted enough reloads, so just give an error.
                if (window.console) {
                    if (typeof window.console.error === 'function' || typeof window.console.error === 'object') {
                        console.error('Could not load module: ' + err.requireModules[0]);
                    }
                }

                // Reset our cookie counter.
                document.cookie = "authenticationRefreshAttempt=";
            } else {
                // Set our cookie counter and refresh the page.
                document.cookie = "authenticationRefreshAttempt=" + (attemptsUsed += 1);

                window.location.href = window.location.href;
            }
        }
    };

    if (typeof PLAYER_TYPE === 'undefined') {
        PLAYER_TYPE = '';
    }

    // Build our URL arguments:
    // Build-time cache busting for deployed courses
    if (
         (/^true$/i).test(window.Xyleme.environment.IS_DEPLOY) &&
        !(/^true$/i).test(window.location.href.match(new RegExp(/([?&])ignoreCacheBust=.*?(&|$)/i))) &&
        !(/^true$/i).test(window.XYLEME_IGNORE_CACHE_BUST)
    ) {
        urlArguments.push(window.Xyleme.environment.BUILD_TIME_CACHE_BUST);
    }

    // Document version
    if (window && window.location && window.location.search.match(/[\?,\&]v=([^&]+)/i)) {
        urlArguments.push('v=' + window.encodeURI(window.location.search.match(/[\?,\&]v=([^&]+)/i)[1]));
    }

    urlArguments = urlArguments.join('&');

    /*
     * Notes about the configuration below:
     * - Certain paths with conditional values will check the CloudFront URL value,
     *   use a certain path if available, or attempt to load via the standard path
     *   if empty.
     *
     * - Only assets which have the ability of being loaded from CloudFront are
     *   configured in the above way. Not all assets are suited for this.
     *
     * - urlArgs ensures that questionData gets the proper version for the document
     *   and also allows for context-sensitive cache busting.
     *
     * - We have to put this configuration here as the logic will not work during pre-compilation of the build file.
     */
    setupPath        = (cloudFrontUrl) ?  cloudFrontUrl + 'js/setup' : 'setup';

    /*
     *  Determine the proper locales-<lang>.js file to load based on language in the Output Profile.
     *  This language value is determined in "templates/js/core/environmentInfo.html" using the
     *  <xy:lang /> directive.
     */
    localesPath      = (cloudFrontUrl) ?  cloudFrontUrl + 'resources/locales-' + window.Xyleme.environment.lang :
                     '../resources/locales-' + window.Xyleme.environment.lang;

    // Legacy path before implementation of WPS-4528, which should take precedence, if configured
    legacyPlayerPath = (cloudFrontUrl) ?  cloudFrontUrl + 'js/players/' + PLAYER_TYPE + 'Player/playerInterface' :
                     'players/' + PLAYER_TYPE + 'Player/playerInterface';
    playerPath       =  (cloudFrontUrl) ?  cloudFrontUrl + '../resources/course-players/' + PLAYER_TYPE + 'Player/playerInterface' :
                     '../resources/course-players/' + PLAYER_TYPE + 'Player/playerInterface';

    questionDataPath = (cloudFrontUrl) ?  cloudFrontUrl + '../resources/questionData' : '../resources/questionData';

    // Legacy path before implementation of WPS-4528, which should take precedence, if configured
    legacyJlpPath    = (cloudFrontUrl) ? cloudFrontUrl + 'js/players/JavascriptPlayer/PLAYER' :
                     'players/JavascriptPlayer/PLAYER';
    jlpPath          = (cloudFrontUrl) ? cloudFrontUrl + '../resources/course-players/JavascriptPlayer/PLAYER' :
                     '../resources/course-players/JavascriptPlayer/PLAYER';

                     // Legacy path before implementation of WPS-4528, which should take precedence, if configured
    legacyBcpPath    = (cloudFrontUrl) ? cloudFrontUrl + 'js/players/Server-sidePlayer/bcpGlobals' :
                     'players/Server-sidePlayer/bcpGlobals';
    bcpPath          = (cloudFrontUrl) ? cloudFrontUrl + '../resources/course-players/Server-sidePlayer/bcpGlobals' :
                     '../resources/course-players/Server-sidePlayer/bcpGlobals';

    uspLoadPath      = (cloudFrontUrl) ? cloudFrontUrl + '../resources/course-players/USPlayer/PLAYER' :
                     '../resources/course-players/USPlayer/PLAYER';

    if (window.XYLEME_MODULES_CONFIG[globalSelector].useLegacyPlayer ||
        window.XYLEME_MODULES_CONFIG[globalSelector].useLegacyPlayers) {
        playerLoadPath = [legacyPlayerPath, playerPath];
        jlpLoadPath = [legacyJlpPath, jlpPath];
        bcpLoadPath = [legacyBcpPath, bcpPath];

    } else {
        playerLoadPath = [playerPath, legacyPlayerPath];
        jlpLoadPath = [jlpPath, legacyJlpPath];
        bcpLoadPath = [bcpPath, legacyBcpPath];
    }

    scormdata = {};
    if (PLAYER_TYPE !== 'US' && PLAYER_TYPE !== 'CSPModern') {
        scormdata = {
            exports : 'Control',
            deps    : ['players/JavascriptPlayer/PLAYER']
        }
    }

    require.config({
        urlArgs: urlArguments,
        paths: {
            'setup' : setupPath,
            'locales' : localesPath,
            'questionData': questionDataPath,
            'player' : playerLoadPath,
            'jlp' : jlpLoadPath,
            'players/JavascriptPlayer/PLAYER': jlpLoadPath,
            'bcp': bcpLoadPath,
            'usp': uspLoadPath,
        },
        shim:{
         'scormdata' : scormdata
        }
    });
    require(['setup']);
}(require, this));
