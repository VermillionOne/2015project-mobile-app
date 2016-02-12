/*jslint unparam: true */
/*global screen */
angular
  .module('suaray')
  .controller('FeaturedController', function($scope, $window, $timeout, supersonic, ApiServiceProvider, StorageProvider, HelperProvider, Mediator) {

    // Invoke strict mode
    "use strict";

    // Variable declarations
    var auth, totalWidth, screenHeight, mobileSettings;

    auth = StorageProvider.get('auth');

    $scope.auth = auth;

    $scope.quantity = 6;

    // Set navbar title
    $scope.navbarTitle = "Home";

    // Set default featured tag index
    $scope.featuredTag = 0;

    // get mobile settings object from storage provider
    mobileSettings = StorageProvider.get('settings');

    // Fix screen size width and heights based on device
    screenHeight = screen.height;

    $('[data-role="home-events-background"]').css('height', screenHeight);

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

    $scope.showEvent = function () {
      // Go to view
      HelperProvider.showView('event-detail');
    };

    /**
      * Determine if user has tickets sold that they can check in others with
      * also checks database settings value to enable / disable the check in icon in navbar
      *
      * @return void
    **/
    $scope.determineCheckIn = function () {
      var userEvents;

      // hide check in by default
      $scope.checkin = false;

      // Get user created events
      ApiServiceProvider
        .users
        .events(auth.id, '&with[]=ticketsInventory&fields[]=id&fields[]=ticketsInventory', function (data) {
          var ti, idx, event, length, tickets, ticket;
 
          if (!data.error) {
            // Pulls in all owned events
            $scope.userEvents = data;

            for (idx in $scope.userEvents) {

              if ($scope.userEvents.hasOwnProperty(idx)) {

                event = $scope.userEvents[idx];

                if (event && event.ticketsInventory) {
                  length = event.ticketsInventory.length;

                  if (length > 0) {
                    ti = 0;

                    while (length--) {
                      ticket = event.ticketsInventory[ti];

                      // if at least one ticket is available to check in
                      if (ticket && ticket.isEnabled && !ticket.isReservation) {

                        // check for enabled check in and show accordingly
                        if (mobileSettings.checkInDisabled === false) {
                          // show the check in icon
                          $scope.checkin = true;
                        }

                        return;
                      }

                      ti++;
                    }
                  }
                }
              }
            }
          }
        });
    };

    /**
      * Make API call for carousel events and list of featured events for first featured tag
      *
      * @return void
    **/
    $scope.makeServiceRequest = function () {
      // determine if check in icon should be visible
      $scope.determineCheckIn();

      // Make call for featured events and tags
      ApiServiceProvider
        .events
        .carousel(function (data) {
          // Make tags available in $scope
          $scope.eventsIsFeatured = data;

          // Initiates home featured events carousel
          angular.element('.carousel').carousel();

          //Generic swipe handler for all directions
          angular.element('.carousel').swipe({
            swipeLeft: function (event, eventId, direction, distance, duration, fingerCount) {
              angular.element(this).carousel('next');
            },
            swipeRight: function () {
              angular.element(this).carousel('prev');
            },
            threshold: 75
          });

          // Grab list of featured tags
          ApiServiceProvider
            .events
            .tags(function (data) {
              // set featured tag list in $scope
              $scope.featuredTagList = data;
              $scope.currentTag = $scope.featuredTagList[0];

              // Grab events for first featured tag in list
              $scope.makeEventsRequest($scope.currentTag);
            });
        });
    };

    /**
      * Make API call for featured events by specified tag
      *
      * @param tag - string to pull featured events for
      * @return void
    **/
    $scope.makeEventsRequest = function (tag) {
      var running, featuredTagsNumber;

      if (!HelperProvider.isStr(tag)) {
        return false;
      }

      $('.load-bar').show();
      running = true;

      ApiServiceProvider
        .events
        .eventsWithTag(tag, function (data) {
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

            // Grab the number of keys from the returned function result
            featuredTagsNumber = HelperProvider.getObjectSize(data);

            // Add specified tag events and tags number to $scope
            $scope.featuredTagEvents = events;
            $scope.featuredTagsNumber = featuredTagsNumber;

            // make sure we have data
            if ($scope.featuredTagEvents) {
              // show featured events for current tag
              $('.home-category-events').removeClass('hidden');

              if (!running) {
                $timeout(function () {
                  // hide loading bar
                  $('.load-bar').hide();
                }, 1000);
              }
            }
          }

          // hide loader after all api calls
          $('.loading-overlay').fadeOut('fast');
        });
    };

    // Make initial Api request
    $scope.makeServiceRequest();

    // Request updated API call data when drawer closed
    supersonic.ui.drawers.whenDidClose(function() {
      // Make call for featured events and tags
      $scope.makeServiceRequest();
    });

    // Refrence event detail function in helper
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // Controls tab selection for Featured Tag event in lower section of home page
    $scope.featuredTab = function($tag, $index) {
      // Update featured tag for active class
      $scope.featuredTag = $index;

      // Update events list with selected tag
      $scope.makeEventsRequest($tag);
    };

    // Code for sticky nav
    angular.element(document).ready(function() {
      // Declaring variables for the nav and function
      var stickyNavTop, stickyNav, scrollTop, navTop;

      navTop = angular.element('[data-role="affix-top"]');

      stickyNavTop = (navTop && navTop.offset() !== undefined) ? navTop.offset().top - 50 : null;

      // keep tag nav at top when scrolling past carousel
      stickyNav = function() {

        scrollTop = angular.element($window).scrollTop();

        if (scrollTop > stickyNavTop) {

          angular.element('[data-role="affix-top"]').addClass('sticky');

        } else {

          angular.element('[data-role="affix-top"]').removeClass('sticky');
        }
      };

      stickyNav();

      angular.element($window).scroll(function() {
        stickyNav();
      });

    });

    // Opens Create Event Modal Through Drawer Controller
    $scope.showCreate = function() {
      // trigger event via Mediator
      Mediator.trigger('openCreate');
    };

    // go to check in view
    $scope.showCheckIn = function() {
      HelperProvider.showView('check-in');
    };

  });
