describe('controllers.ForgotPasswordController', function () {

  "use strict";

  var $scope, ForgotController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    ForgotController = $controller('ForgotPasswordController', {$scope: $scope});
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Reset Password');
  });

  it('should have initial load method', function () {

    expect(typeof ForgotController.initialLoad).toEqual('function');
  });

  it('should start on correct page', function () {

    expect($scope.page).toEqual('reset-password');
  });

  describe('scope methods that change current page', function () {

    it('reset password should show "reset-password"', function () {
      $scope.resetPassword();

      $scope.$digest();

      expect($scope.page).toEqual('reset-password');
    });

    it('reset confirmation should show "reset-confirmation"', function () {
      $scope.resetConfirmation();

      $scope.$digest();

      expect($scope.page).toEqual('reset-confirmation');
    });

  });

});
