describe('controllers.DrawerController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, auth, DrawerController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    DrawerController = $controller('DrawerController', {
      $scope: $scope
    });

  }));

  it('should not have a title', function () {

    expect($scope.navbarTitle).toEqual("");
  });

  it('should set up base auth object', function () {

    expect($scope.auth).toEqual({
      firstName: null,
      lastName: null,
      friendRequestsCount: 0
    });
  });

  it('should have update info method', function () {

    expect($scope.updateInfo).toBeDefined();
  });

  it('should have all show view methods', function () {
    expect($scope.showCrowd).toBeDefined();

    expect($scope.showSettings).toBeDefined();

    expect($scope.showCheckin).toBeDefined();

    expect($scope.showFeatured).toBeDefined();

    expect($scope.showFeatured).toBeDefined();

    expect($scope.showMyTickets).toBeDefined();

    expect($scope.showCategory).toBeDefined();

    expect($scope.showProfile).toBeDefined();

    expect($scope.showFriends).toBeDefined();
  });

  describe('custom events via Mediator', function () {
    var Mediator;

    beforeEach(inject(function (_Mediator_) {

      Mediator = _Mediator_;

      spyOn($scope, 'showCreate');

      $scope.showCreate();
    }));

    it('should fire showCreate on openCreate event', function () {

      expect($scope.showCreate).toHaveBeenCalled();
    });

  });

});
