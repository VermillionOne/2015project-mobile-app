/*global angular,console,escape,location,screen,escape*/
/*jslint unparam: true, indent: 2*/
angular
  .module('suaray')
  .controller('SearchResultsController', function ($scope, $timeout, supersonic, HelperProvider, ApiServiceProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var auth, totalWidth, screenHeight;

    // Get logged in users ID
    auth = StorageProvider.get('auth');

    // Set auth data in scope
    $scope.auth = auth;

    // Set navbar title
    $scope.navbarTitle = "Search Results";

    // Determines screen width for proper image size to display
    totalWidth = screen.width;

    if (totalWidth >= 661) {
      $scope.totalWidth = 'large';
    } else if (totalWidth >= 461 && totalWidth <= 660) {
      $scope.totalWidth = 'medium';
    } else if (totalWidth >= 320 && totalWidth <= 460) {
      $scope.totalWidth = 'small';
    } else if (totalWidth <= 320) {
      $scope.totalWidth = 'xSmall';
    }

    // Determines screen height for proper background size
    screenHeight = screen.height;

    $('[data-role="search-events-background"]').css({'height': screenHeight});

    /**
     * Do search and update search view
     *
     * @param  {object} search    Usually this is storage provider get "search" which holds the query property
     * @return {void}
     */
    $scope.doSearchAndUpdate = function (search) {
      var filterquery, running;

      // show loading bar
      $('.load-bar').show();
      running = true;

      // set query from Drawer and Filter View
      $scope.query = search.query;
      // set variables from search storage provider
      $scope.dateFrom = search.dateFrom;
      $scope.dateTo = search.dateTo;
      $scope.city = search.city;
      $scope.featured = search.featured;
      $scope.outdoor = search.outdoor;
      $scope.indoor = search.indoor;
      $scope.adult = search.adult;

      // set filter query variable
      filterquery = '';
      filterquery += (!search.upcoming) ? '&upcoming=0' : '&upcoming=1';

      // verify if date to field has text
      if (search.dateTo && search.dateTo !== '') {
        search.dateTo = search.dateTo.split('T')[0];
        filterquery += '&filter[and][][start]=' + escape(search.dateTo);
      }

      // verify if date from field has text
      if (search.dateFrom && search.dateFrom !== '') {
        search.dateFrom = search.dateFrom.split('T')[0];
        filterquery += '&filter[and][][end]=' + escape(search.dateFrom);
      }

      // verify if city field has text
      if (search.city && search.city !== '') {
        filterquery +=  '&filter[and][][city]=' + escape(search.city);
      }

      // verify if featured option is checked
      if (search.featured) {
        filterquery +=  '&filter[and][][isFeatured]=' + escape(search.featured);
      }

      // verify if 21 and Over option is checked
      if (search.adult) {
        filterquery +=  '&filter[and][][isAdult]=' + escape(search.adult);
      }

      // verify if outdoor option is checked
      if (search.outdoor) {
        filterquery +=  '&filter[and][][isOutdoor]=' + escape(search.outdoor);
      }

      // verify if indoor option is checked
      if (search.indoor) {
        filterquery += '&filter[and][][isIndoor]=' + escape(search.indoor);
      }

      // Call api endpoint
      ApiServiceProvider
        .events
        .search(search.query + filterquery, function (data) {
          var ev, evnt, idx, times, time, len, events = [], date, opts;

          running = false;
          opts = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
          };

          if (data && !data.error) {

            // add formatted start dates
            for (ev in data) {

              evnt = data[ev];
              times = evnt.times;

              // check and loop through times
              if (times && times.length > 0) {
                idx = 0;
                len = times.length;

                while (len--) {
                  time = times[idx];

                  // format date to human readable string
                  date = new Date(time.start);
                  date = date.toLocaleTimeString("en-us", opts);

                  // add date if time exists, otherwise default
                  evnt.startDate = (time) ? date : 'No Upcoming Dates';
                }
              }

              // add to new array
              events.push(evnt);
            }

            // hide error div
            $scope.showError = false;
            // Update view results
            $scope.eventSearchResults = events;

            // prevent flash on results div
            angular.element('.search-results').removeClass('hidden');
            angular.element('.card').addClass('hidden');
          } else {

            // Show error html markup to inform user
            $scope.showError = true;

            // Set error in $scope
            $scope.error = data.error;

            // prevent flash on results div
            angular.element('.search-results').addClass('hidden');
            angular.element('.card').removeClass('hidden');
          }

          if (!running) {
            $timeout(function () {
              // hide loading bar
              $('.load-bar').hide();
            }, 1500);
          }
        }, true);
    };

    $scope.searchFromStorageProvider = function () {
      // Variable declaration
      var search;
      // Get search
      search = StorageProvider.get('search');

      // Search and update
      $scope.doSearchAndUpdate(search);
    };

    // Show featured
    $scope.showSearch = function () {
      var search;

      search = StorageProvider.get('search');

      search.query = angular.element('[data-role="search-query"]').val();

      StorageProvider.set('search', search);

      // Go to view
      HelperProvider.showView('advanced-search');
    };

    $scope.searchFromSearchBar = function () {
      // Variable declaration
      var query, search;

      // Get query value
      query = angular.element('[data-role="search-results-form"] input').val();

      // Get search
      search = StorageProvider.get('search');

      // Update query property only
      search.query = query;

      // Update just the query property
      StorageProvider.set('search', search);

      // Search and update
      $scope.doSearchAndUpdate(search);
    };

    // Reference event detail helper function
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // When this view is visible refresh this search results page
    supersonic.ui.views.current.whenVisible(function () {
      // Perform search from storage provider
      $scope.searchFromStorageProvider();
    });

  });
