describe('controllers.AboutController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, AboutController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    AboutController = $controller('AboutController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('About');
  });

  describe('show view methods', function () {

    it('should have show settings', function () {

      expect($scope.showSettings).toBeDefined();
    });

    it('should have show terms', function () {

      expect($scope.showTerms).toBeDefined();
    });

  });

});
