describe('controllers.TicketController', function () {

  "use strict";

  var $scope, $config, TicketController, ApiServiceProvider;

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

    TicketController = $controller('TicketController', {$scope: $scope});
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Tickets');
  });

  it('should create response object', function () {

    expect($scope.response).toEqual({
      error: {}
    });
  });

  describe('get needed data from local storage', function () {
    var StorageProvider;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;
    }));

    it('should have event data', function () {

      expect($scope.event).toBeDefined();
    });

    it('should have mobile settings', function () {
      var settings = StorageProvider.get('settings');

      expect(typeof settings).toBe('object');
    });

    it('should have purchase data', function () {

      expect($scope.purchase).toBeDefined();
    });

  });

  describe('api calls made by controller', function () {
    var baseUrl, $httpBackend;

    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');

    }));

    it('should not throw exception', function () {

      $httpBackend.expect('GET', baseUrl + 'events/1?with[]=ticketsInventory').respond({success: true});

      expect($httpBackend.flush).not.toThrow();
    });

    afterEach(function() {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

});
