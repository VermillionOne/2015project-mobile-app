describe('controllers.EventSetupController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, auth, EventSetupController, StorageProvider, settings;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller, _StorageProvider_) {

    StorageProvider = _StorageProvider_;

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

    EventSetupController = $controller('EventSetupController', {
      $scope: $scope
    });

    settings = StorageProvider.get('settings');

  }));

  it('should start on correct page', function () {

    expect($scope.page).toEqual('freemium');
  });

  it('should have correct premium value', function () {
    if (settings && settings.paymentDisabled !== true) {
      expect($scope.premium).toBe(true);
    }

    if (settings && settings.paymentDisabled === true) {
      expect($scope.premium).toBe(false);
    }
  });

  it('should have correct interval', function () {

    expect($scope.interval).toEqual([1,2,3,4,5,6,7,8,9,10,
      11,12,13,14,15,16,17,18,19,20,
      21,22,23,24,25,26,27,28,29,30
    ]);
  });

  it('should have base user billing object', function () {

    expect($scope.userBilling).toEqual({
      address: null,
      city: null,
      state: null,
      zip: null,
      email: null
    });
  });

  describe('on page load', function () {

    it('should have blank event object', function () {

      expect($scope.event).toEqual({
        metaObject: {},
        poll: false,
        comments: false,
        maps: false,
        eventPictures: false,
        reviews: false,
        tickets: false,
        transportation: false
      });
    });

    it('event should have meta object', function () {

      expect($scope.event.metaObject).toEqual({});
    });

    it('should define image uploaded scope variable', function () {

      expect($scope.imageUploaded).toBeDefined();
      expect($scope.imageUploaded).toBe(false);
    });

  });

  describe('api calls for needed data', function () {
    var baseUrl, $httpBackend, ApiServiceProvider;
    
    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');
    }));

    it('should not throw exception', inject(function ($http) {

      $httpBackend.expect('GET', baseUrl + 'collections/categories').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'collections/timezones?limit=200&fields[]=id&fields[]=zoneName').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    }));

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe('setting the premium event flag', function () {

    it('should default to false (for free event)', function () {
      $scope.freeEvent();

      expect($scope.isPremium).toBe(false);
      expect($scope.free).toEqual("true");
    });

    it('should set isPremium flag to true', function () {
      $scope.premiumEvent();

      expect($scope.isPremium).toBe(true);
    });

    it('should set isPremium flag to false', function () {
      $scope.freeEvent();

      expect($scope.isPremium).toBe(false);
    });

  });

});
