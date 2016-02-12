describe('controllers.ProfileController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, ProfileController;

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

    ProfileController = $controller('ProfileController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Profile');
  });

  it('should define edit object', function () {

    expect($scope.editUser).toBeDefined();
    expect($scope.editUser).toEqual({});
  });

  it('should define update object', function () {

    expect($scope.update).toBeDefined();
    expect($scope.update).toEqual({
      message: null
    });
  });

  it('should start on correct page', function () {

    expect($scope.page).toEqual('profile-detail');
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

      $httpBackend.expect('GET', baseUrl + 'events?filter[and][][user_id]=0&sort[desc][]=created_at&limit=15&fields[]=id&fields[]=featuredPhoto&fields[]=title').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'collections/timezones?limit=200&fields[]=id&fields[]=zoneName').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'users/0?with[]=updates.friend&fields[]=updates').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'events/attending/0?with[]=tags&with[]=times&fields[]=icon&auth_user_id=0').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    }));

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

});
