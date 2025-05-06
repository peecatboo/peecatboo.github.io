require.config({
    config: {
        'app/configuration': {
            globalSelector: 'global'
        },
        '*': {
            globalSelector: 'global'
        }
    },
    waitSeconds: 0,
    baseUrl: './js',
    paths: {
        // vendors
        'jquery'            : 'vendor/jquery/jquery',
        'underscore'        : 'vendor/underscore/underscore',
        'backbone'          : 'vendor/backbone/backbone',
        'text'              : 'vendor/require/text',
        'mediaelement'      : 'vendor/mediaelement/mediaelement',
        'pikaday'           : 'vendor/pikaday/pikaday',
        'jquery.extensions' : 'vendor/jquery/extensions/jquery.extensions',
        'sortable'          : 'vendor/sortable/sortable',
        'jwerty'            : 'vendor/jwerty/jwerty',
        'chart'             : 'vendor/chart/Chart-min',
        'babel'             : 'vendor/require/babel.min',
        'es6'               : 'vendor/require/es6',

        // misc.
        // @TODO cleanup
        'questions'         : 'elements/questions/questions',
        'qusestionApi'      : 'app/questionApi',
        'tabs'              : 'elements/tabs/tabs',
        'configuration'     : 'app/configuration',
        'events'            : 'app/events',
        'XyTools'           : 'app/utilities/XyTools',
        'popup'             : 'elements/popup/popup',
        'notification'      : 'elements/notification/notification',
        'courseApi'         : 'app/courseApi',

        // resources
        'fileCache'         : '../resources/fileCache',
        'scormdata'         : '../resources/scorm',

        // player
        'jlp'               : 'players/JavascriptPlayer/PLAYER',
        'bcp'               : 'players/Server-sidePlayer/bcpGlobals',
        'usp'               : 'players/USPlayer/PLAYER',
        'cspModern'         : 'players/CSPModernPlayer/PLAYER',
    },
    es6: {
        fileExtension: '.js'
    },
    babel: {
        'presets': [
            'es2015'
        ]
    },
    shim : {
        'jwerty'            : {
            exports: 'jwerty'
        }
    },
    map: {
        '*': {
            'skin/components/visualQueue/visualQueue': 'skin/components/visualCue/visualCue'
        }
    },
    /*
     ***************************
     * r.js Optimizer properties
     ***************************
    */
    optimize: 'none',
    generateSourceMaps: true,
    preserveLicenseComments: false,
    uglify2: {
        output: {
            beautify: false
        },
        compress: {
            dead_code: true,
            drop_debugger: true,
            conditionals: true,
            comparisons: true,
            booleans: true,
            loops: true,
            unused: true,
            if_return: true,
            join_vars: true,
            cascade: true
            /*
             * NOTE: the "passes" property breaks promotion for some reason,
             * even if it is present and set to "1".
             */
        }
    },
    skipDirOptimization: true,
    optimizeCss: 'none',
    findNestedDependencies: true,
    stubModules: ['babel', 'es6']

});
