/*jslint unparam: true, indent: 2*/
/*global angular*/
angular
  .module('suaray')
  .controller('CategoryController', function ($scope, supersonic, HelperProvider, ApiProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // Set navbar title
    $scope.navbarTitle = "Categories";

    // initialize auth variable
    var auth, i, search;

    search = StorageProvider.get('search');

    $scope.query = search.query;

    // Get logged in users ID
    auth = StorageProvider.get('auth');

    // Set auth data in scope
    $scope.auth = auth;
    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    $scope.loadContent = function () {

      /*global escape*/
      ApiProvider
        .index('tags?limit=35&filter[and][][is_category]=1')
        .success(function (response) {

          // If we have events data
          if (response.data && response.data.tags) {

            $scope.tags = response.data.tags;

            for (i = 0; i <= $scope.tags.length; i += 1) {

            }
          }

        });

    };

    $scope.loadContent();

    // Capture search query from form submit
    $scope.setCategory = function (query) {

      // Save Category in Storage provider
      StorageProvider.set('search', {
        query: query
      });

      // Go to search results view
      HelperProvider.showView('search-results');
    };

  });
