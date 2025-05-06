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
    'b8ed7e8c-5be5-4439-990d-08b2b583d303.html': createPromise(), 
    'f374620a-a814-4923-b3d3-56f136fea56d.html': createPromise(), 
    '8d4556d2-2325-4881-9908-58dea01264c4.html': createPromise(), 
    'c52bbda1-a8c2-4b6f-b804-673524e6f24f.html': createPromise(), 
    '5c84be19-8eaa-494d-ae79-d986c17bbb65.html': createPromise(), 
    'b10a9a0c-c638-48ef-bfc0-2f3e9ad58ddb.html': createPromise(), 
    '1abb11b7-f2a4-4b5d-873e-dad0be17f318.html': createPromise(),  //<-- end of repeated part

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
        'b8ed7e8c-5be5-4439-990d-08b2b583d303.html' : 'resources/fileCacheBatch_1.js', 
        'f374620a-a814-4923-b3d3-56f136fea56d.html' : 'resources/fileCacheBatch_1.js', 
        '8d4556d2-2325-4881-9908-58dea01264c4.html' : 'resources/fileCacheBatch_1.js', 
        'c52bbda1-a8c2-4b6f-b804-673524e6f24f.html' : 'resources/fileCacheBatch_1.js', 
        '5c84be19-8eaa-494d-ae79-d986c17bbb65.html' : 'resources/fileCacheBatch_1.js', 
        'b10a9a0c-c638-48ef-bfc0-2f3e9ad58ddb.html' : 'resources/fileCacheBatch_2.js', 
        '1abb11b7-f2a4-4b5d-873e-dad0be17f318.html' : 'resources/fileCacheBatch_2.js' // <--end of repeated part
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
