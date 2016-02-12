/*jslint unparam: true*/
/*jshint unused: true, node: true */
angular
  .module('suaray')
  .controller('AboutController', function ($scope, supersonic, HelperProvider) {
    // Invoke strict mode
    "use strict";

    // Set navbar title
    $scope.navbarTitle = "About";

    // Show tutorial
    $scope.showSettings = function () {
      // Go to view
      HelperProvider.showView('settings');
    };

    // Show tutorial
    $scope.showTerms = function () {
      // Go to view
      HelperProvider.showView('terms');
    };

  });
