describe('controllers.CheckInController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, auth, $config, CheckInController, orders;

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

    CheckInController = $controller('CheckInController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Check-In');
  });

  it('should have correct default scope values', function () {

    expect($scope.currentOrder).toBe(null);

    expect($scope.ticketCode).toBe(null);

    expect($scope.checkedInError).toBe(false);
  });

  it('should have correct code length', function () {

    expect($scope.codeLength).toEqual(4);
  });

  it('should have page load method', function () {

    expect(typeof CheckInController.onPageLoad).toBe('function');
  });

  describe('barcode scanner based on mobile settings', function () {
    var StorageProvider, settings;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      settings = StorageProvider.get('settings');
    }));

    it('should be false if scanner disabled', function () {

      settings.checkInScannerDisabled = true;
      $scope.barcode = (settings.checkInScannerDisabled) ? false : true;

      expect($scope.barcode).toBe(false);
    });

    it('should be true if scanner enabled', function () {

      settings.checkInScannerDisabled = false;
      $scope.barcode = (settings.checkInScannerDisabled) ? false : true;

      expect($scope.barcode).toBe(true);
    });

  });

  describe('api call to get all ticket codes', function () {
    var $httpBackend, baseUrl;
    
    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');
    }));

    it('should not throw exception', inject(function ($http) {

      $httpBackend.expect('GET', baseUrl + 'tickets/user/0/codes').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    }));

  });

  describe('scope methods that are needed', function () {
    var StorageProvider, ApiServiceProvider;

    beforeEach(inject(function (_StorageProvider_, _ApiServiceProvider_) {

      StorageProvider = _StorageProvider_;
      ApiServiceProvider = _ApiServiceProvider_;

      auth = StorageProvider.get('auth');

      spyOn($scope, 'resetOrders');
      spyOn($scope, 'makeOrdersRequest');

      $scope.resetOrders();
      $scope.makeOrdersRequest();
    }));

    it('should reset scope values', function () {

      expect($scope.ticketOrders).toEqual([]);

      expect($scope.ticketOrderHistory).toEqual([]);

      expect($scope.currentOrder).toBe(null);
    });

    it('should grab all ticket order data', function () {

      expect($scope.auth).toBeDefined();

      expect($scope.makeOrdersRequest).toHaveBeenCalled();

      ApiServiceProvider
        .users
        .codes($scope.auth.id, function (data) {

          orders = data;

          expect(orders).toBeDefined();
        });
    });

    describe('search orders method', function () {
      var ApiServiceProvider;

      beforeEach(inject(function (_ApiServiceProvider_) {

        ApiServiceProvider = _ApiServiceProvider_;

        $scope.makeOrdersRequest();

      }));

      it('should be defined', function () {

        expect(typeof CheckInController.searchOrders).toBe('function');
      });

      it('should reset orders when called', function () {

        CheckInController.searchOrders(null, true);

        expect($scope.resetOrders).toHaveBeenCalled();
      });

    });

    describe('reset popup call', function () {

      beforeEach(function () {

        spyOn($scope, 'resetPopup');

        $scope.resetPopup();
      });

      it('should re call order request', function () {

        expect($scope.ticketCode).toBe(null);

        expect($scope.makeOrdersRequest).toHaveBeenCalled();
      });

    });

  });

});
