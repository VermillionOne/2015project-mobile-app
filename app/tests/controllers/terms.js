describe('controllers.TermsController', function () {

  // Invoke strict mode
  "use strict";

  var scope, TermsController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    scope = $rootScope.$new();

    TermsController = $controller('TermsController', {
      $scope: scope
    });

  }));

  it('should have correct title', function () {

    expect(scope.navbarTitle).toEqual('Terms');
  });

});
