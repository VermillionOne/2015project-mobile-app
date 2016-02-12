describe('controllers.CrowdController', function () {

  // Invoke strict mode
  "use strict";

  var $scope, $config, CrowdController;

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

    CrowdController = $controller('CrowdController', {
      $scope: $scope
    });
  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Crowd');
  });

  it('should have event detail method', function () {

    expect($scope.goToEventDetail).toBeDefined();
  });

  describe('api calls made by controller', function () {
    var baseUrl, $httpBackend;
    
    beforeEach(inject(function ($injector) {

      baseUrl = $config.api[suarayEnv].baseUrl;

      $httpBackend = $injector.get('$httpBackend');
    }));
    
    it('should not throw exception', function () {

      $httpBackend.expect('GET', baseUrl + 'events?with[]=tags&with[]=times&filter[and][][is_published]=1&filter[and][][is_banned]=0&filter[and][][is_private]=0?&fields[]=id&fields[]=title&fields[]=city&fields[]=state&fields[]=venueName&fields[]=featuredPhoto&fields[]=isSponsored&fields[]=userId').respond({success:true});

      expect($httpBackend.flush).not.toThrow();
    });

    afterEach(function () {

      $httpBackend.verifyNoOutstandingExpectation();

      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe('grabbing featured events', function () {

    it('should have api method', function () {

      expect(CrowdController.getFeaturedEvents).toBeDefined();
    });

    it('should return event data to scope', function () {

      expect($scope.eventsInCrowd).not.toBe(null);
    });

  });

});
