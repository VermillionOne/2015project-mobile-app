describe('controller.MyTicketsController', function () {

  // Invoke strict mode
  "use strict";

  var auth, $scope, $config, ApiServiceProvider, MyTicketsController, StorageProvider;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

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

    MyTicketsController = $controller('MyTicketsController', {
      $scope: $scope
    });
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('My Tickets');
  });

  it('should have base search', function () {

    expect($scope.myTicketsSearch).toBe(null);
  });

  it('should have auth object', inject(function (_StorageProvider_) {
    StorageProvider = _StorageProvider_;

    auth = StorageProvider.get('auth');

    expect(auth).toEqual(jasmine.any(Object));
  }));

  describe('api calls made by controller', function () {
    var baseUrl, $httpBackend, ApiServiceProvider;

    beforeEach(inject(function ($injector, _ApiServiceProvider_) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');

      ApiServiceProvider = _ApiServiceProvider_;
    }));

    it('should have order data', function () {
      ApiServiceProvider
        .users
        .codes(auth.id, function (data) {

          var i, orders;

          orders = [];

          for (i = 0; i < data.length; i += 1) {
            if (data[i].types !== null) {
              orders.push(data[i]);
            }

            if (i > 0) {
              $scope.ticketsPresent = true;
            }

            $scope.orders = orders;
          }

          expect($scope.orders).toBeDefined();
          expect(typeof $scope.orders).toBe('array');
        });
    });

    it('should not throw error', function () {

      $httpBackend.expect('GET', baseUrl + 'tickets/user/0/codes').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    });

  });

});
