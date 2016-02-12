describe('controllers.CategoryController', function () {

  "use strict";

  var $root, $scope, CategoryController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $root = $rootScope;

    $scope = $rootScope.$new();

    CategoryController = $controller('CategoryController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Categories');
  });

  it('should set auth to scope', function () {

    expect($scope.auth).toBeDefined();
  });

  describe('scope methods that update scope values', function () {
    var search, StorageProvider;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      spyOn($scope, 'setCategory');

      $scope.setCategory('nightlife');
    }));

    it('should update stored search value', function (done) {

      done();

      search = StorageProvider.get('search');

      expect($scope.query).toEqual(search.query);

      expect($scope.setCategory).toHaveBeenCalled();
    });

  });

  describe('api calls made by controller', function () {
    var $config, baseUrl, $httpBackend, ApiProvider;

    $config = suarayConfig || {
      api: {
        staging: {
          baseUrl: 'http://staging-api.suaray.com/v1/'
        },
        production: {
          baseUrl: 'https://api.suaray.com/v1/'
        }
      }
    };

    beforeEach(inject(function ($injector, _ApiProvider_) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');

      ApiProvider = _ApiProvider_;
    }));

    it('should not throw error', function () {

      $httpBackend.expect('GET', baseUrl + 'tags?limit=35&filter[and][][is_category]=1').respond({success:true,tags:[]});

      expect($httpBackend.flush).not.toThrow();
    });

    afterEach(function () {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

});
