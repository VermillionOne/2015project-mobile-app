/*jslint unparam: true*/
/*jshint unused: true, node: true */
angular
  .module('suaray')
  .controller('CrowdController', function ($scope, supersonic, ApiServiceProvider, StorageProvider, HelperProvider) {

    // Invoke strict mode
    "use strict";

    // Variable Declaration
    var $this = this;

    // resize crowd search depending on device size
    HelperProvider.resizeWindow($('.suaray-body'), true);

    /**
      * Make API call for featured events
      *
      * @return void
    **/
    $this.getFeaturedEvents = function () {
      // Make Api request for featured events
      ApiServiceProvider
        .events
        .featured(function (data) {
          var events = {}, key,  eventsWithFeaturedPhoto, eventsWithFeaturedPhotoIndex;

          events = data;

          eventsWithFeaturedPhoto = [];
          eventsWithFeaturedPhotoIndex = 0;

          for (key in events) {
            if (events.hasOwnProperty(key)) {
              // Make sure we have featuredPhoto
              if (events[key].hasOwnProperty('featuredPhoto')) {

                // Add to new array
                eventsWithFeaturedPhoto[eventsWithFeaturedPhotoIndex] = events[key];
                eventsWithFeaturedPhotoIndex += 1;
              }
            }
          }

          $scope.eventsInCrowd = eventsWithFeaturedPhoto;
        });
    };

    // Grab featured events data
    $this.getFeaturedEvents();

    // Refrence event detail function in helper
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // Set navbar title
    $scope.navbarTitle = "Crowd";

    $('#carousel-slide').carousel({
      interval: 15000
    });

    // Initiates home featured events carousel
    $('#carousel-slide').swipe({
      //Generic swipe handler for all directions
      swipeLeft: function () {
        $(this).carousel('next');
      },
      swipeRight: function () {
        $(this).carousel('prev');
      },
      //Default is 75px, set to 0 for demo so any distance triggers swipe
      threshold: 55
    });

    // arrow handlers
    $('.crowd-prev-btn').click(function(e) {
      e.preventDefault();
      $('#carousel-slide').carousel('prev');
    });
    $('.crowd-next-btn').click(function(e) {
      e.preventDefault();
      $('#carousel-slide').carousel('next');
    });

    // Request updated API call data when drawer closed
    supersonic.ui.drawers.whenDidClose(function () {
      // Get featured events
      $this.getFeaturedEvents();
    });
  });
