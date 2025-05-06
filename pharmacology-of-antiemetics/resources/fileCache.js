(function(global) {
  // fileCache.js without query param "guids"

  var fileCacheJS = {

    /**
    * The pattern below, everything between {_{#guids}_} and {_{/guids}_} will be repeated for every item of the "guids" collection.
    * {_{.}_} (without _) will be replaced with the item of the collection "guids", which is defined in the "context", see JsFileCacheWriter.java
    * the result will look like this:
    * '4ef18c14-40ec-4443-b0a5-1c0d5c7b8702.html': createPromise(),
    * 'a26a1d7d-7f7f-488e-b5dc-be9830c07db6.html': createPromise(),
    * .....
    * 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.html': createPromise(),
    * for more info see https://mustache.github.io/
    */
    // 
    '3404b1d6-035a-437b-88cc-9d2e35d542c5.html': createPromise(), 
    'f7077e3b-4a24-44bf-8cd2-c10712c6e008.html': createPromise(), 
    '92a10e43-0706-4f2e-8b84-6f29bd790c4c.html': createPromise(), 
    '281fe0ea-c66c-4f2e-a4db-5606bbc30f18.html': createPromise(), 
    '3003c927-3021-4b84-8e11-78a21a363eaf.html': createPromise(), 
    'e0d4d411-f4c5-4e9c-8dea-447143ed9227.html': createPromise(),  //<-- end of repeated part

    resolve: function fileCacheJSResolve(guid, content) {
      var promise = fileCacheJS[guid];

      if (!promise) {
        // log error
        return;
      }

      promise.resolve(content);
    }
  };

  function createPromise() {
    var resolve;
    var reject;

    var p = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    p.resolve = resolve;
    p.reject = reject;
    var then = p.then.bind(p);

    var listeners = [];

    p.onThen = function (listener) {
      listeners.push(listener);
    };

    p.then = function (success, failed) { // detect when called
      listeners.forEach(function (fn) {
        fn();
      });

      return then(success, failed);
    };

    return p;
  }


    /**
     * The pattern below, everything between {_{#batchPathNames}_} and {_{/batchPathNames}_} will be expanded to the array of string
     * using the content of the "batchPathNames" collection. The result will look like this:
     * batchPathNames = ['resources/fileCacheBatch_1.js', 'resources/fileCacheBatch_2.js', ...'resources/fileCacheBatch_N.js'];
     * see JsFileCacheWriter.java and https://mustache.github.io/
     */
  var batchPathNames = [
      // 
      'resources/fileCacheBatch_2.js', 
      'resources/fileCacheBatch_1.js'  //<--end of repeated part
      ];

    /**
     * The pattern below, everything between {_{#guidBatchMap}_} and {_{/guidBatchMap}_} will be expanded to the map of string to string
     * using the content of the "guidBatchMap" map. The result will look like this:
     * guidsBatchMap = {
     * '4ef18c14-40ec-4443-b0a5-1c0d5c7b8702.html' : 'resources/fileCacheBatch_1.js',
     * 'a26a1d7d-7f7f-488e-b5dc-be9830c07db6.html' : 'resources/fileCacheBatch_2.js',
     * ....
     * 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.html' : 'resources/fileCacheBatch_N.js'
     * };
     * see JsFileCacheWriter.java and https://mustache.github.io/
     */
  var guidsBatchMap = {
    // 
        '3404b1d6-035a-437b-88cc-9d2e35d542c5.html' : 'resources/fileCacheBatch_1.js', 
        'f7077e3b-4a24-44bf-8cd2-c10712c6e008.html' : 'resources/fileCacheBatch_1.js', 
        '92a10e43-0706-4f2e-8b84-6f29bd790c4c.html' : 'resources/fileCacheBatch_1.js', 
        '281fe0ea-c66c-4f2e-a4db-5606bbc30f18.html' : 'resources/fileCacheBatch_1.js', 
        '3003c927-3021-4b84-8e11-78a21a363eaf.html' : 'resources/fileCacheBatch_1.js', 
        'e0d4d411-f4c5-4e9c-8dea-447143ed9227.html' : 'resources/fileCacheBatch_2.js' // <--end of repeated part
  };

  // must run only once

  var isCalled = false;

  function startCachingGuids(firstGuid) {
      if (isCalled) {
          return;
      } else {
          isCalled = true;
      }

    var batchPath = guidsBatchMap[firstGuid];

    getDocumentBatch(batchPath)
      .then(function () {
        // load the rest of batches

        batchPathNames
          .filter(function (batchName) {
            return batchPath !== batchName;
          })
          .forEach(function (batchPath) {
            getDocumentBatch(batchPath)
          });
      })
  }

   Object.keys(fileCacheJS)
    .filter(function (guid) {
      return !!fileCacheJS[guid].then;
    })
    .forEach(function (guid) {
      var p = fileCacheJS[guid];

      p.onThen(function () {
        startCachingGuids(guid);
      });
    });

  function getDocumentBatch(path) {
    var promise = createPromise();
    var script = document.createElement('script');

    script.src = path;
    script.async = true;
    script.onload = function () {
      promise.resolve();
    };

    script.onerror = function(err) {
      console.error(err);
      // handle error
      guids.forEach(function(guid) {
        fileCacheJS[guid].reject();
      });

      promise.reject();
    };

    document.body.appendChild(script);

    return promise;
  }

  global.__fileCacheJS = fileCacheJS;

  global.define(fileCacheJS);
})(window);
