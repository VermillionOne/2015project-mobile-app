describe('controllers.SettingsController', function () {

  "use strict";

  var $scope, ApiServiceProvider, SettingsController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    SettingsController = $controller('SettingsController', {$scope: $scope});
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Settings');
  });

  describe('scope methods', function () {

    it('should have method to show tutorial', function () {

      expect($scope.showDebugInfo).toBeDefined();

      expect(typeof $scope.showTutorial).toBe('function');
    });

    it('should have method to show debug info', function () {

      expect($scope.showDebugInfo).toBeDefined();

      expect(typeof $scope.showDebugInfo).toBe('function');
    });

    it('should have method to show about page', function () {

      expect($scope.showAbout).toBeDefined();

      expect(typeof $scope.showAbout).toBe('function');
    });

  });

  describe('no api calls made by controller', function () {
    var $httpBackend;

    beforeEach(inject(function ($injector) {

      $httpBackend = $injector.get('$httpBackend');

    }));

    it('should throw exception', function () {

      expect($httpBackend.flush).toThrow();
    });

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe('clear auth and storage data', function () {
    var StorageProvider, storageKey;

    beforeEach(inject(function (_StorageProvider_) {
      storageKey = 'com.shindiig.suaray.staging';

      StorageProvider = _StorageProvider_;

      spyOn($scope, 'clearData');

    }));

    it('should reset auth object', function () {
      $scope.clearData();

      expect($scope.auth).toBeUndefined();
    });

    it('should clear local storage', function () {
      var data;

      $scope.clearData();

      data = (localStorage) ? localStorage.getItem(storageKey) : null;

      expect(data).toBe(null);
    });

  });

});
