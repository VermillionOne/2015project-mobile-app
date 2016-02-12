describe('controllers.EventTicketController', function () {

  "use strict";

  var $scope, EventTicketController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $scope = $rootScope.$new();

    EventTicketController = $controller('EventTicketController', {
      $scope: $scope
    });

  }));

  it('should have correct title', function () {

    expect($scope.navbarTitle).toEqual('Event Tickets');
  });

  it('should have "refresh" method', function () {

    expect(typeof $scope.refresh).toBe('function');
  });

  describe('on page ready default values', function () {
    var StorageProvider;

    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      EventTicketController.onPageReady();

      $scope.$digest();
      
    }));

    it('should have event object', function () {

      expect($scope.event).toBeDefined();

      expect(typeof $scope.event).toBe('object');
    });

    it('should start on correct page', function () {

      expect($scope.page).toEqual('tickets');
    });

    it('should start with null update value', function () {

      expect($scope.isUpdate).toBe(null);
    });

    it('should create empty ticket array', function () {
    
      expect($scope.tickets).toEqual([]);
    });

    it('should create empty reservations array', function () {
    
      expect($scope.reservations).toEqual([]);
    });

  });


  describe('scope methods that change scope values', function () {
    var Mediator;

    beforeEach(inject(function (_Mediator_) {

      Mediator = _Mediator_;

    }));

    it('should change page to "tickets"', function () {
      $scope.showTickets();

      $scope.$digest();

      expect($scope.page).toEqual('tickets');
    });

    it('should change page to "reservations"', function () {
      $scope.showReservations();

      $scope.$digest();

      expect($scope.page).toEqual('reservations');
    });

    it('should change page to "create"', function () {
      $scope.showTicketForm();

      $scope.$digest();

      expect($scope.page).toEqual('create');
    });

  });

});
