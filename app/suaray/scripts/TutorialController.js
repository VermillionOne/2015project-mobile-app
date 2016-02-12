/*jslint unparam: true*/
/*global window,device,screen,document*/
angular
  .module('suaray')
  .controller('TutorialController', function ($scope, supersonic, StorageProvider, HelperProvider, DeviceTypeFactory) {

    // Invoke Strict Mode
    "use strict";

    var auth, mobileSettings;

    // Get auth data
    auth = StorageProvider.get('auth');

    // Get mobile settings data
    mobileSettings = StorageProvider.get('settings');

    // resize crowd search depending on device size
    HelperProvider.resizeWindow($('.suaray-body'), true);

    // figure out actual dimensions of device screen
    function determineScreenSize() {
      // variables
      var dimensions;

      dimensions = screen.width + 'x' + screen.height;

      return dimensions;
    }

    // called on page load
    function initCarousel() {

      angular.element(document).ready(function () {
        // make sure we have images for carousel
        if ($scope.tutorialScreens && $scope.tutorialScreens.length > 0) {

          // start carousel with 5 sec interval
          $('#carousel-slide').carousel({
            interval: 10000
          });

          // Initiates tutorial carousel
          $('#carousel-slide').swipe({
            swipeLeft: function (event, eventId, direction, distance, duration, fingerCount) {
              $(this).carousel('next');
            },
            swipeRight: function () {
              $(this).carousel('prev');
            },
            threshold: 75
          });
        }
      });
    }

    function getTutorialScreens() {
      // variables
      var screens = [], key, obj;

      // if we have mobile settings kdata
      if (mobileSettings && HelperProvider.isObj(mobileSettings)) {

        // determine device screen size
        device.screen = device ? determineScreenSize() : null;
        // attach to device object
        device.tutorial = mobileSettings.tutorial || null;

        for (key in device.tutorial) {

          if (device.tutorial.hasOwnProperty(key)) {
            // get object of resolutions / urls
            obj = device.tutorial[key];

            // get resolution based on device screen size
            if (obj !== undefined) {

              // retina on ios only
              if (device.platform === 'ios') {

                // determine if retina display
                if (device.isRetina()) {
                  // use retina resolutions if device has retina display
                  device.resolution = device.resMap[device.platform].retina[device.screen];
                } else {
                  // non-retina display resolutions
                  device.resolution = device.resMap[device.platform][device.screen];
                }
              } else if (device.platform === 'android') {

                // android display resolutions
                device.resolution = device.resMap[device.platform][device.screen];
              } else {
                // non android / ios 
                device.resolution = '480x800';
              }

              // grab image with correct resolution
              if (obj[device.resolution]) {
                // add url to screens array
                screens.push({
                  alt: device.platform,
                  url: obj[device.resolution]
                });
              }
            }

            if (screens.length === 0) {
              // add default images if no resolutions found
              screens.push({
                alt: device.platform,
                url: (device.platform === 'ios') ? obj['640x1136'] : obj['480x800']
              });
            }
          }
        }

        // add list of tutorial screens to $scope
        $scope.tutorialScreens = screens;
        // Start carousel
        initCarousel();
      }
    }

    // Add auth object to $scope
    $scope.auth = auth;

    // Set navbar title
    $scope.navbarTitle = "How It Works";

    // Leave tutorial
    $scope.showPrevView = function () {

      var tutorial, toView;

      tutorial = StorageProvider.get('tutorial');

      toView = tutorial.toView;

      // Go to view
      HelperProvider.showView(toView);
    };

    // Pull tutorial images via API call
    getTutorialScreens();

  });
