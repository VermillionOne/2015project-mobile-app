describe('controllers.SignInController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, controller;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    controller = $controller('SignInController', { $scope: $scope });
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Sign In');
  });

  describe('default scope values', function () {

    it('should start with loading being false', function () {

      expect($scope.loading).toBe(false);
    });

    it('should start with location error being false', function () {

      expect($scope.locationError).toBe(false);
    });

    it('should have login loading set', function () {

      expect($scope.loginLoading).toBe(true);
    });

    it('should start with signin object', function () {

      expect($scope.signin).toEqual({
        email: null,
        password: null,
        validationPattern: {
          email: /^([\w\-\.\+])+@([\w\-]+\.)+[\w\-]{2,4}$/
        }
      });

    });

  });

  describe('checks auth object from storage', function () {
    var $store, auth;

    beforeEach(inject(function (_StorageProvider_) {

      $store = _StorageProvider_;

      auth = $store.get('auth');
    }));

    it('should be object and defined', function () {

      expect(auth).toBeDefined();

      expect(auth).toEqual(jasmine.any(Object));
    });

    it('should have do login method', function () {

      expect(typeof $scope.doLogin).toBe('function');
    });

  });

});
