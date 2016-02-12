describe('FeaturedControllers.FeaturedController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $env, $config, ApiServiceProvider, FeaturedController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $env = suarayEnv;

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

    $scope = $rootScope.$new();

    FeaturedController = $controller('FeaturedController', {
      $scope: $scope
    });
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Home');
  });

  it('should have quantity set', function () {

    expect($scope.quantity).toEqual(6);
  });

  describe('mobile settings', function () {
    var Storage, mobileSettings;

    beforeEach(inject(function (_StorageProvider_) {

      Storage = _StorageProvider_;

      mobileSettings = Storage.get('settings');
    }));

    it('should have mobile settings data', function () {

      expect(mobileSettings).toBeDefined();
      expect(mobileSettings).toEqual(jasmine.any(Object));
    });

    describe('should set checkin value', function () {
      var Storage, mobileSettings;

      beforeEach(inject(function (_StorageProvider_) {

        Storage = _StorageProvider_;

        mobileSettings = Storage.get('settings');

        $scope.checkin = (mobileSettings.checkInDisabled) ? false : true;
      }));

      it('should equal true', function () {

        expect($scope.checkin).toEqual(true);
      });

    });

  });

  describe('featured events', function () {

    beforeEach(inject(function (_ApiServiceProvider_) {

      ApiServiceProvider = _ApiServiceProvider_;

      spyOn($scope, 'makeServiceRequest');

      $scope.makeServiceRequest();
    }));

    it('should have data from api', function () {

      expect($scope.makeServiceRequest).toHaveBeenCalled();

      ApiServiceProvider 
        .events
        .carousel(function (data) {

          $scope.eventsIsFeatured = data;

          $scope.$digest();

          expect($scope.eventsIsFeatured).toBeDefined();
        });
    });

    describe('events based on featured tags', function () {
      var size, HelperProvider, tag = 'parties';

      beforeEach(inject(function (_HelperProvider_) {

        HelperProvider = _HelperProvider_;

        spyOn($scope, 'makeEventsRequest');

        $scope.makeEventsRequest(tag);

        size = HelperProvider.getObjectSize($scope.featuredTagEvents);

        $scope.featuredTagsNumber = size;
      }));

      it('should have featured tag data', function () {

        expect($scope.makeEventsRequest).toHaveBeenCalled();

        ApiServiceProvider
          .events
          .eventsWithTag(tag, function (data) {

            $scope.featuredTagEvents = data;

            expect($scope.featuredTagEvents).toBeDefined();
        });

      });

      it('should have featured tag number', function () {

        expect($scope.featuredTagsNumber).toBeDefined();
      });

    });

  });

  describe('determine if user has created tickets', function () {
    var $httpBackend;

    beforeEach(inject(function ($injector, $rootScope, _ApiServiceProvider_) {
      
      ApiServiceProvider = _ApiServiceProvider_;

      spyOn($scope, 'determineCheckIn');

      spyOn(ApiServiceProvider.users, 'events');
    }));

    it('should have method on scope', function () {

      expect($scope.determineCheckIn).toBeDefined();
      expect(typeof $scope.determineCheckIn).toBe('function');
    });

    it('should call api for all user events', function () {
      $scope.determineCheckIn();

      expect($scope.determineCheckIn).toHaveBeenCalled();
    });
    
  });

  describe('api calls made by FeaturedController', function () {
    var $httpBackend, baseUrl;
    
    beforeEach(inject(function ($injector) {

      $httpBackend = $injector.get('$httpBackend');

      baseUrl = $config.api[$env].baseUrl;
    }));
    
    it('should not throw exception', function () {

      $httpBackend.expect('GET', baseUrl + 'events?filter[and][][user_id]=0&with[]=ticketsInventory&fields[]=id&fields[]=ticketsInventory').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'events/featured/carousel?&fields[]=id&fields[]=title&fields[]=city&fields[]=state&fields[]=venueName&fields[]=featuredPhoto&fields[]=isSponsored&fields[]=userId&offset=0&limit=6').respond({success:true});

      $httpBackend.expect('GET', baseUrl + 'events/featured/tags').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    });

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

});
