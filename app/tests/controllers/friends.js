describe('controllers.FriendsController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, FriendsController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

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

    FriendsController = $controller('FriendsController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Friends');
  });

  it('should have friend results array', function () {

    expect($scope.friendResults).toEqual([]);
  });

  it('should reference helper method', function () {

    expect($scope.goToPublicProfile).toBeDefined();
  });

  describe('scope methods that call the api service provider', function () {
    var ApiServiceProvider;

    beforeEach(inject(function (_ApiServiceProvider_) {

      ApiServiceProvider = _ApiServiceProvider_;
    }));

    describe('$scope.doSearch method', function () {

      it('should be defined', function () {

        expect($scope.doSearch).toBeDefined();
      });

    });

  });

  describe('api calls made for needed data', function () {
    var baseUrl, $httpBackend;
    
    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');
    }));
    
    it('should not throw exception', function () {

      $httpBackend.expect('GET', baseUrl + 'events?filter[and][][user_id]=0&sort[desc][]=created_at&fields[]=id&fields[]=title').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'users/0?with[]=friends&with[]=friendRequests&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=avatar&fields[]=friends&fields[]=friendRequests').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    });

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

});
