describe('controllers.EventController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, auth, EventController;

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

    EventController = $controller('EventController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Event Details');
  });

  it('should have default scope values', function () {

    expect($scope.tickets).toBe(false);
  });

  it('should have ticket and reservations que', function () {
    expect($scope.ticketQueue).toEqual([]);

    expect($scope.reservations).toEqual([]);
  });

  describe('edit methods via event dropdown menu', function () {
    var auth, StorageProvider;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      auth = StorageProvider.get('auth');
    }));

    it('should have menu toggle method', function () {

      expect(typeof $scope.toggleEditDrawer).toBe('function');
    });

    it('should have edit event details method', function () {

      expect(typeof $scope.editEvent).toBe('function');
    });

    it('should have edit event tickets method', function () {

      expect(typeof $scope.editEventTickets).toBe('function');
    });

    it('should have edit event polls method', function () {

      expect(typeof $scope.editEventPolls).toBe('function');
    });

  });

  describe('features based on settings', function () {
    var StorageProvider, settings;
    
    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      settings = StorageProvider.get('settings');

    }));

    it('should show tickets option', function () {
      $scope.tickets = (settings.ticketsDisabled === false) ? true : false;

      expect($scope.tickets).toBe(false);
    });

  });

  describe('features based on isPremium flag', function () {
    var event, ApiProvider, eventId;

    beforeEach(inject(function (_ApiProvider_) {
      eventId = 30;

      ApiProvider = _ApiProvider_;

    }));

    it('should have menu options enabled', function () {
      ApiProvider
        .show('events', eventId + '?with[]=times&with[]=nextEvent&with[]=comments.user&with[]=reviews.user&with[]=nextEvent&with[]=photos&with[]=tags&with[]=ticketsInventory&with[]=polls.choices.votes&with[]=attendeesAndFriends.user')
        .success(function (response) {
          if (response.data && response.data.event) {
            
            $scope.event = response.data.event;
          }

          $scope.event.isPremium = true;

          $scope.polls = ($scope.event.isPremium) ? true : false;
          $scope.tickets = ($scope.event.isPremium) ? true : false;
          $scope.reviews = ($scope.event.isPremium) ? true : false;

          expect($scope.reviews).toBe(true);
          expect($scope.polls).toBe(true);
          expect($scope.tickets).toBe(true);
        });
    });

    describe('ticket purchases', function () {
      var auth, times, settings, StorageProvider;
      
      beforeEach(inject(function (_StorageProvider_) {

        StorageProvider = _StorageProvider_;

        auth = StorageProvider.get('auth');

        settings = StorageProvider.get('settings');
        settings.ticketsDisabled = false;
      }));

    });

  });

  describe('api calls for needed data', function () {
    var baseUrl, $httpBackend, ApiServiceProvider;
    
    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');
    }));

  });

  describe('google maps object', function () {
    var navigator, mapstring;

    beforeEach(function () {

      if (!navigator) {
        navigator = {
          userAgent: ''
        };
      }
    });

    it('should be defined', function () {

      expect(EventController.maps).toBeDefined();
    });

    it('should have init method', function () {

      expect(typeof EventController.maps.initialize).toBe('function');
    });

    it('should have set marker method', function () {

      expect(typeof EventController.maps.setMarker).toBe('function');
    });

    it('should have set handler method', function () {

      expect(typeof EventController.maps.setHandler).toBe('function');
    });

    describe('map string based on device', function () {
      var device, DeviceFactory;

      beforeEach(inject(function (_DeviceTypeFactory_) {

        DeviceFactory = _DeviceTypeFactory_;

        mapstring = '';

        device = {
          platform: null
        };

      }));

      it('should contain geo: if android', function () {
        navigator.userAgent = 'Android';

        if (DeviceFactory.android()) {
          device.platform = 'android';
          mapstring = 'geo:?q=';

          expect(device.platform).toEqual('android');
          expect(mapstring).toEqual('geo:?q=');
        }
      });

      it('should be regular url if ios', function () {
        navigator.userAgent = 'iPhone';

        if (DeviceFactory.iOS()) {
          device.platform = 'ios';
          mapstring = 'maps:q=';

          expect(device.platform).toEqual('ios');
          expect(mapstring).toEqual('maps:?q=');
        }
      });

    });

  });

});
