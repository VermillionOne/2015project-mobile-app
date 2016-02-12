describe('controllers.SearchResultsController', function () {

  "use strict";

  var $scope, SearchResultsController, ApiServiceProvider;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    SearchResultsController = $controller('SearchResultsController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Search Results');
  });

});
