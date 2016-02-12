/*jslint unparam: true*/
angular
  .module('suaray')
  // Terms controllers
  .controller('TermsController', function ($scope, DeviceTypeFactory, HelperProvider) {

    // Invoke strict mode
    "use strict";
    // Activate CSS class iOS for specific styles necessary for proper iOS render
    if (DeviceTypeFactory.android()) {
      $scope.iOSStyles = false;
    } else if (DeviceTypeFactory.iOS()) {
      $scope.iOSStyles = true;
    }
    // Set navbar title
    $scope.navbarTitle = "Terms";

    // Make login-body class append to the <body> tag for streching background image
    angular.element('body').addClass('login-body');

    // Show Sign-In
    $scope.showSignUp = function () {
      // Go to index view
      HelperProvider.showView('sign-up');
    };

  });
