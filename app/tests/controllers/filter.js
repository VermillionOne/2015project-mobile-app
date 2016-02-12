describe('controllers.SearchFilterController', function () {

  "use strict";

  var $scope, SearchFilterController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    SearchFilterController = $controller('SearchFilterController', {$scope: $scope});
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Search Results');
  });

  it('should have default query', function () {

    expect($scope.query).toBeDefined();

    expect($scope.query).toEqual('parties');
  });

  describe('default search values', function () {

    it('should have default events obj', function () {

      expect($scope.events).toBeDefined();

      expect(typeof $scope.events).toBe('object');
    });

    it('should have upcoming enabled by default', function () {

      expect($scope.events.upcoming).toBeDefined();

      expect($scope.events.upcoming).toBe(true);
    });

  });

  describe('api calls made by controller', function () {
    var $httpBackend;

    beforeEach(inject(function ($injector) {

      $httpBackend = $injector.get('$httpBackend');

    }));

    it('should not throw exception', function () {

      expect($httpBackend.flush).toThrow();
    });

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe('scope methods that configure search data', function () {
    var search, query, auth, StorageProvider;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      search = StorageProvider.get('search');

    }));

    it('should load last search into scope', inject(function ($timeout) {
      $timeout.flush();

      $scope.$digest();

      expect($scope.query).toEqual(search.query);
    }));

  });

});
