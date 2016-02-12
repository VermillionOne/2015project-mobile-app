/*jslint unparam: true, indent: 2*/
/*global angular,console,$ */
angular.module('suaray')
  .controller('SearchFilterController', function ($scope, $timeout, supersonic, HelperProvider, StorageProvider) {
    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var $this = this, auth, search;

    search = StorageProvider.get('search');

    $scope.events = {};

    $scope.events.upcoming = true;

    $scope.query = search.query;

    // Get logged in users ID
    auth = StorageProvider.get('auth');

    // Set auth data in scope
    $scope.auth = auth;

    // Set navbar title
    $scope.navbarTitle = "Search Results";

    $this.initialLoad = function () {

      // initialize auth variable
      var auth, search;

      search = StorageProvider.get('search');

      $timeout(function () {
        $scope.query = search.query;
      });

      // Get logged in users ID
      auth = StorageProvider.get('auth');

      // Set auth data in scope
      $scope.auth = auth;

      // set upcoming to true by default
      $scope.events.upcoming = true;

      // search method
      $scope.doSearch = function (e) {

        // set query from drawer view
        search.query = $scope.query;

        // set upcomming value (defaults to true)
        search.upcoming = $scope.events.upcoming;

        // set date from variable from input field
        search.dateFrom = $scope.events.dateFrom;

        // set date to variable from input field
        search.dateTo = $scope.events.dateTo;

        // set city variable from input field
        search.city = $scope.events.city;

        // set featured variable from checkbox
        search.featured = $scope.events.featured;

        // set outdoor variable from checkbox
        search.outdoor = $scope.events.isOutdoor;

        // set indoor variable from checkbox
        search.indoor = $scope.events.isIndoor;

        // set adult variable from checkbox
        search.adult = $scope.events.isAdult;

        // store information for the search view to pull
        StorageProvider.set('search', search);

        // Go to search results view
        HelperProvider.showView('search-results');
      };
    };

    $this.initialLoad();

    // When this view is visible refresh this search results page
    supersonic.ui.views.current.whenVisible(function () {
      // Perform search from storage provider
      $this.initialLoad();
    });

  });
