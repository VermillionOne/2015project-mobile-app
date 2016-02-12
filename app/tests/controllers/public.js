describe('controllers.PublicProfileController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, PublicProfileController;

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

    PublicProfileController = $controller('PublicProfileController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Profile');
  });

  it('should define update object', function () {

    expect($scope.update).toBeDefined();
    expect($scope.update).toEqual({
      message: null
    });
  });

  describe('auth and calendar data', function () {
    var ApiServiceProvider, Storage, auth, eventData;

    beforeEach(inject(function (_StorageProvider_, _ApiServiceProvider_) {

      Storage = _StorageProvider_;
      ApiServiceProvider = _ApiServiceProvider_;

      auth = Storage.get('auth');

      spyOn(ApiServiceProvider, 'events');

    }));

    it('auth should be defined and object', function () {

      expect($scope.auth).toBeDefined();
      expect($scope.auth).toEqual(jasmine.any(Object));
    });

    it('should have id of logged in user', function () {

      expect($scope.auth.id).toBeDefined();
    });

    it('should return event data for calendar', function () {

      ApiServiceProvider
        .events
        .attending($scope.auth.id, function (data) {

          if (data && !data.error) {
            eventData = data;
          }

          expect(eventData).toBeDefined();
        });
    });

  });

  describe('api calls made with controller', function () {
    var baseUrl, $httpBackend;

    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');
    }));

    it('should not throw exception', inject(function ($http) {

      $httpBackend.expect('GET', baseUrl + 'events/attending/0?with[]=tags&with[]=times&fields[]=icon&auth_user_id=0').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'users/0?with[]=friends&with[]=friendRequests&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=avatar&fields[]=friends&fields[]=friendRequests&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=avatar&fields[]=friends&fields[]=friendRequests&fields[]=email&fields[]=social').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'users/0?with[]=updates.friend&fields[]=updates').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'events?filter[and][][user_id]=0&fields[]=id&fields[]=featuredPhoto&fields[]=title').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    }));

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe('initial load method call', function () {
    var http;

    beforeEach(inject(function ($http) {

      http = $http;
    }));

    it('should be defined', function () {

      expect(PublicProfileController.initialLoad).toBeDefined();
    });

    it('should define calendar data', function () {

      expect($scope.calendarData).toBeDefined();
      expect($scope.calendarData).toEqual({});
    });

  });

});
