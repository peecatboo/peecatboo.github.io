# Web Publisher JavaScript Application

This is the automatically-generated documentation for the Web Publisher JavaScript application. Use the menus or the search bar to explore. A global entry point is available using the ```events``` module via the ```window.Xyleme.App.on``` method; utilize this method and the various ```<module_name>.loaded``` events available to hook into the system.

Example:
```javascript
    window.Xyleme.App.on('configuration.loaded', function (config) {
        config.configure('XyTools', {debugMode: true});
    });
```

The above example would run the provided callback when the ```configuration.loaded``` event was fired (when the Configuration module is available to be used), it would then tell the Configuration module to configure the XyTool's debugMode to be ```true```. The file ```custom.js``` can also be utilized to connect directly into the system via an AMD module rather than through the events system. See the documentation for the ```custom``` module for more information.

### If you are accessing this ReadMe file directly in the Workspace Manager

You can access the documentation by locating the sibling directory named ```docs``` and download it by selecting "download" from its action menu. Once the archive has been downloaded to your local system, extract it and open ```index.html``` in your browser. You should now be able to explore the documentation fully.
