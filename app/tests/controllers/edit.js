describe('controllers.EventEditController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, auth, EventEditController;

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

    EventEditController = $controller('EventEditController', {
      $scope: $scope
    });
  }));

  it('should start on correct page', function () {

    expect($scope.page).toEqual('details');
  });

  it('should have event data to edit', function () {

    expect($scope.event).toBeDefined();
  });

  it('should have correct scope values', function () {

    expect($scope.free).toEqual("true");

    expect($scope.completedUploads).toEqual(0);
  });

  it('should have repeat list with correct values', function () {

    expect($scope.repeatList).toEqual([
      {name: 'daily',   value: 'Daily'},
      {name: 'weekly',  value: 'Weekly'},
      {name: 'monthly', value: 'Monthly'},
      {name: 'yearly',  value: 'Yearly'}
    ]);

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

    it('should have needed data after category api call', inject(function (_ApiServiceProvider_) {
      ApiServiceProvider = _ApiServiceProvider_;

      ApiServiceProvider
        .collections
        .categories(function (data) {

          $scope.categories = data;

          expect($scope.categories).toBeDefined();
        });
    }));

    it('should have needed data after category api call', inject(function (_ApiServiceProvider_) {
      ApiServiceProvider = _ApiServiceProvider_;

      ApiServiceProvider
        .collections
        .timezones(function (data) {

          $scope.timezones = data;

          expect($scope.timezones).toBeDefined();
        });
    }));

  });

});
