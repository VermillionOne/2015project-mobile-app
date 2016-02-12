describe('controllers.EventPollsController', function () {

  "use strict";

  var $scope, $root, PollsController;

  beforeEach(module('suaray'));

  beforeEach(inject(function ($rootScope, $controller) {

    $root = $rootScope;

    $scope = $rootScope.$new();

    PollsController = $controller('EventPollsController', {
      $scope: $scope
    });

  }));

  it('should start on correct page', function () {

    expect($scope.page).toEqual('polls');
  });

  it('should default to not show poll answer', function () {

    expect($scope.showPollAnswer).toBe(false);
  });

  it('should create new poll object', function () {

    expect($scope.poll).toEqual({});
  });

  describe('scope methods that change visible page', function () {

    it('should change page to "polls"', function () {
      $scope.showPolls();

      $scope.$digest();

      expect($scope.page).toEqual('polls');
    });

    it('should change page to "create"', function () {
      $scope.showPollsForm();

      $scope.$digest();

      expect($scope.page).toEqual('create');
    });

    it('should change page to "answers"', function () {
      $scope.showAnswers();

      $scope.$digest();

      expect($scope.page).toEqual('answers');
    });

  });

  describe('data needed to create and update polls', function () {
    var polls, event, auth, StorageProvider;
    
    beforeEach(inject(function (_StorageProvider_) {

      StorageProvider = _StorageProvider_;

      polls = StorageProvider.get('polls');

      event = StorageProvider.get('event');

      auth = StorageProvider.get('auth');
    }));

    it('should have event id', function () {

      expect(event.id).toBeDefined();
    });

    it('should have array of available polls for given event', function () {

      $scope.polls = PollsController.parsePolls(polls);

      expect($scope.polls).toEqual(polls);
    });

  });

});
