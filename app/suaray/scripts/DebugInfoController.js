/*jslint unparam: true*/
/*global steroids, alert*/
angular
  .module('suaray')
  .controller('DebugInfoController', function ($filter, $scope, supersonic, DeviceTypeFactory, HelperProvider, StorageProvider, ApiProvider, ApiServiceProvider) {
    // Invoke strict mode
    "use strict";

    var auth, data, debugInfo, debugInfoFiltered, description, url;

    // Activate CSS class iOS for specific styles necessary for proper iOS render
    if (DeviceTypeFactory.android()) {
      $scope.iOSStyles = false;
    } else if (DeviceTypeFactory.iOS()) {
      $scope.iOSStyles = true;
    }
    // Set navbar title
    $scope.navbarTitle = "Settings";

    function initialize() {

      // Get auth data
      auth = StorageProvider.get('auth');

      $scope.debugSuccess = false;

      // Set api key in api provider config
      ApiProvider.setConfig('apiKey', auth.apiKey);

      debugInfo = StorageProvider.debug();

      debugInfoFiltered = $filter('json')(debugInfo, 2);

      $scope.debugInfo = debugInfoFiltered;

      description = debugInfoFiltered;
      $scope.description = description;

      url = 'debug-info.html';
      $scope.url = url;

    }

    initialize();

    $scope.resetDebugInfo = function () {
      initialize();
      angular.element('[data-role="debug-name"]')[0].value = '';
      angular.element('[data-role="debug-email"]')[0].value = '';
      $scope.showSettings();
    };

    // Show tutorial
    $scope.showSettings = function () {
      // Go to view
      HelperProvider.showView('settings');
    };

    // Open email dialog
    $scope.sendDebugInfo = function () {

      data = {
        description: description,
        name: angular.element('[data-role="debug-name"]')[0].value,
        email: angular.element('[data-role="debug-email"]')[0].value,
        url: url
      };

      console.log(data);

      ApiProvider
        .store('feedback/mobile', data)
        .success(function (response) {
          $scope.debugSuccess = true;
        })
        .error(function (response) {
          console.log(response);
        });

    };

  });
