/*jslint unparam: true*/
angular
  .module('suaray')
  // Terms controllers
  .controller('ForgotPasswordController', function ($scope, supersonic, ApiProvider, HelperProvider) {

    // Invoke strict mode
    "use strict";

    // Make login-body class append to the <body> tag for streching background image
    angular.element('body').addClass('login-body');

    // Disable drawer side swap from this login screen
    HelperProvider.drawerDisableGestures();

    var $this = this;

    $scope.navbarTitle = "Reset Password";

    $scope.showSignIn = function () {
      supersonic.ui.layers.pop();
    };

        // Set start event-detail page at its home screen
    $this.initialLoad = function () {
      $scope.page = "reset-password";
    };

    $this.initialLoad();

    // Show home
    $scope.resetPassword = function () {
      // Go to view
      $scope.page = "reset-password";
    };

    $scope.resetConfirmation = function () {
      // Go to view
      $scope.page = "reset-confirmation";
    };

    $scope.doResetPassword = function () {

      var data, userEmail;

      userEmail = $scope.user.email;

      data = [];

      data = {
        email: userEmail
      };

      $scope.resetConfirmation();

      ApiProvider
        .store('mobile/password/forgot', data)
        .success(function (response) {

        });
    };

  });
