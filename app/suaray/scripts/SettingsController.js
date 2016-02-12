/*jslint unparam: true*/
/*global */
angular
  .module('suaray')
  .controller('SettingsController', function ($scope, supersonic, HelperProvider, StorageProvider) {
    // Invoke strict mode
    "use strict";

    // Set navbar title
    $scope.navbarTitle = "Settings";

    // Show tutorial
    $scope.showTutorial = function () {

      var tutorial;

      tutorial = StorageProvider.get('tutorial');

      // Go to view
      tutorial.toView = 'settings';
      StorageProvider.set('tutorial', tutorial);
      HelperProvider.showView('tutorial');
    };

    // Show tutorial
    $scope.showAbout = function () {
      // Go to view
      HelperProvider.showView('about');
    };

    // Show tutorial
    $scope.showDebugInfo = function () {
      // Go to view
      HelperProvider.showView('debug-info');
    };

    // show new payment modal
    $scope.showPayment = function () {
      // Go to view
      var modal, options;

      modal = new supersonic.ui.View("suaray#payment");

      options = {animate: true};

      supersonic.ui.modal.show(modal, options);
    };

    // Clear app data
    $scope.clearData = function () {

      // Show data wipe confirmation
      supersonic.ui.dialog.confirm("SUARAY", {
        message: "All SUARAY app data will be deleted and you will be logged out",
        buttonLabels: ["Confirm", "Cancel"]
      }).then(function (index) {

        // If first button was pressed
        if (index === 0) {

          // Clear data
          StorageProvider.clear();

          // Clear scope auth data
          $scope.auth = {};

          // Disable drawer side swipe from login screen
          HelperProvider.drawerDisableGestures();

          // Go to index view
          HelperProvider.showView('sign-in');

          // Log message
          supersonic.logger.log("SUARAY app data deleted");
        }
      });
    };

  });
