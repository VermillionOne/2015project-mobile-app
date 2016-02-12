describe('controllers.MapController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, auth, MapController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    MapController = $controller('MapController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Map');
  });

});
