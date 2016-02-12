/* global device */
describe('controllers.TutorialController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, auth, TutorialController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    TutorialController = $controller('TutorialController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual("How It Works");
  });

  it('should have auth object', function () {

    expect($scope.auth).toBeDefined();
  });

  describe('tutorial screen data based on device', function () {
    var StorageProvider, settings;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      settings = StorageProvider.get('settings');

    }));

    it('should have mobile settings', function () {

      expect(settings).toBeDefined();
    });

    it('should have array of tutorial screens', function () {

      expect($scope.tutorialScreens).toBeDefined();
    });

  });

});
