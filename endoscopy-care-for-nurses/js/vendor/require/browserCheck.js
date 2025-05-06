function browserCheck(userAgent, modalText, config) {
    var browserCheckConfig;
    //flag, that client use unsupported Browser
    var unsupportedBrowserClient = false;

    //if checkBrowser is not exist in JsConfig, use default object for config
    if (!config) {
        browserCheckConfig = {
            "enabled": true,
            "unsupportedBrowser": [
                {
                    "browser": "IE",
                    "version": "10",
                    "description": "Internet Explorer 10"
                },
                {
                    "browser": "IE",
                    "version": "11",
                    "description": "Internet Explorer 11"
                },
                {
                    "browser": "Edge",
                    "description": "Legacy MS Edge"
                }
            ]
        }
    } else {
        browserCheckConfig = config;
    }

    //if module enabled
    if (browserCheckConfig.enabled) {
        //Check IE < 10v
        if (!unsupportedBrowserClient && userAgent.browser.family.toLowerCase()=="IE".toLowerCase() && parseInt(userAgent.browser.version)<10) {
            unsupportedBrowserClient = true;
        }

        //check unsupportedBrowser List form jsConfig
        browserCheckConfig.unsupportedBrowser.forEach(function(browser) {
            if (userAgent.browser.family.toLowerCase() == browser.browser.toLowerCase()) {
                if (browser.version) {
                    if (parseInt(userAgent.browser.version) == parseInt(browser.version)) {
                        unsupportedBrowserClient = true;
                        return;
                    }
                } else {
                    unsupportedBrowserClient = true;
                    return;
                }
            }
        })

    }

    if (unsupportedBrowserClient) {
        alert(modalText)
        return {"browserCheckModalShow": true}
    } else {
        return {"browserCheckModalShow": false}
    }

}


