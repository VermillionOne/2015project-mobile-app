/*jslint unparam: true */
/*global screen,window,steroids,suarayConfig */
/*global Evaporate,device,alert,suarayEnv */
angular
  .module('suaray')
  .controller('EventEditController', function ($scope, $filter, $timeout, supersonic, StorageProvider, ApiProvider, ApiServiceProvider, HelperProvider, Mediator) {

    // Invoke strict mode
    "use strict";

    // Variable delarations
    var screenHeight, evap, auth, stripeResponseHandler, $form, n, token, mobileSettings;

    /**
     * Action for back arrow on devices 
     *
     * @return void
    **/
    function onBackKeyDown() {
      $scope.closeModal();
    }

    /**
     * Called when device ready to apply back button action 
     * and set device platform 
     *
     * @return void
    **/
    function onDeviceReady() {
      document.addEventListener('backbutton', onBackKeyDown, false);
      suarayConfig.device = device.platform;
    }

    /**
     * Run actions once page is ready
     *
     * @return void
    **/
    function onPageReady() {
      $scope.showRequiredFields = 'false';
      $scope.free = "true";
      $scope.page = "details";

      // Set initial values for form
      window.scrollTo(0, 0);
    }

    /**
     * Run through tags array and return comma separated string 
     *
     * @param tags {array} - the tags array to iterate through
     * @return tstring {string} 
    **/
    function parseTags(tags) {
      var length, idx = 0, t, tstring = '';

      if (tags && tags.length > 0) {
        length = tags.length;

        do {
          t = tags[idx];

          if (idx === length) {
            tstring += t.tag;

          } else {
            tstring = (length > 1) ? t.tag + ', ' : t.tag;
          }

          idx++;
        } while (--length);
      }

      return tstring;
    }

    /**
     * Iterate through start / end dates so they are set correctly in $scope 
     *
     * @param event {object} - the event object to check start / end times
     * @return event {object} - updated event object 
    **/
    function parseDateAndTimes(event) {
      var time;

      if (event.times && event.times.length > 0) {

        time = event.times[0];

        event.startDate = new Date(time.start);
        event.endDate = new Date(time.end);

        event.startTime = new Date(time.start);
        event.endTime = new Date(time.end);
      }

      return event;
    }

    // Get auth data
    auth = StorageProvider.get('auth');

    $scope.page = "freemium";

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    // Get mobile settings data
    mobileSettings = StorageProvider.get('settings');

    // Linked to userPhoto() evap.add complete()
    $scope.completedUploads = 0;

    // Get Event Data to edit 
    $scope.event = StorageProvider.get('editEvent');
    // add date and times to form if any
    $scope.event = parseDateAndTimes($scope.event);
    // parse tags into string for form input
    $scope.event.tags = parseTags($scope.event.tags);

    // Get categories
    ApiServiceProvider
      .collections
      .categories(function (data) {
        var cat, categories;

        categories = data;
        // add to scope
        $scope.categories = categories;

        for (cat in categories) {

          if (categories.hasOwnProperty(cat)) {

            if ($scope.event.tags !== undefined) {

              if (categories[cat].tag === $scope.event.category1) {
                // this needs to be set to pre-select value of category dropdown
                $scope.event.category = categories[cat];
              }
            }
          }
        }

        // hide loader after all api calls
        $('.loading-overlay').fadeOut('fast');
      });

    // Get timezones data 
    ApiServiceProvider
      .collections
      .timezones(function (data) {
        var userTimezone;
        // add timezones to scope
        $scope.timezones = data;

        if (auth.timezoneId >= 0) {

          // check current user timezone
          userTimezone = parseInt(auth.timezoneId, 10) - 1;
          $scope.event.timezoneId = data[userTimezone];

        } else {

          $scope.event.timezoneId = data[5];
        }
      });

    // Grab states list from HelperProvider
    $scope.usStates = HelperProvider.getStatesList();
    // Defining repeat every interval as an array
    $scope.interval = [];

    // Finding screen height for proper background display
    screenHeight = screen.height;

    angular.element('[data-role="full-screen-height"]').css("min-height", screenHeight);

    // check mobile settings
    if (mobileSettings) {

      if (mobileSettings.paymentDisabled !== true) {
        // show premium event panel
        $scope.premium = true;
        // set billing info
        $scope.userBilling = {
          // Input fields
          name: ($scope.event.name) ? $scope.billing.name : null,
          address: $scope.event.address || null,
          city: $scope.event.city || null,
          state: $scope.event.state || null,
          zip: $scope.event.zip || null,
          email: $scope.event.email || null
        };
      }

      // keep evap settings current
      evap = HelperProvider.addUploadSettings();
    }

    document.addEventListener('deviceready', onDeviceReady, false);

    // Set as free event
    $scope.freeEvent = function () {
      $scope.free = "true";
      $scope.page = "details";
      $scope.freemiumVisited = "true";
      window.scrollTo(0, 0);
    };

    // Set event as a premium event
    $scope.premiumEvent = function () {
      $scope.free = 'null';
      $scope.page = "payment";
      $scope.freemiumVisited = "true";
      window.scrollTo(0, 0);
    };

    // Looping numbers through to 30 for a list of number options for interval
    for (n = 1; n <= 30; n += 1) {
      $scope.interval.push(n);
    }

    // Called from complete() in evap.add options via necessary dom element
    $scope.successfulUpload = function () {
      // add to completed uploads
      $scope.completedUploads += 1;

      // Causes upload button in form to disappear and is replaced with successful upload message
      $scope.imageUploaded = true;

      $timeout(function () {
        // hide upload message and show upload button
        $scope.imageUploaded = false;

      }, 2000);
    };

    // add evap settings
    evap = HelperProvider.addUploadSettings();

    // page init
    onPageReady();

    // Visited Payment view and moving to details
    $scope.paymentNext = function () {

      if (!$scope.userBilling.address || !$scope.userBilling.city || !$scope.userBilling.state) {

        $scope.addressRequired = (!$scope.userBilling.address) ? 'true' : 'false';

        $scope.cityRequired = (!$scope.userBilling.city) ? 'true' : 'false';

        $scope.stateRequired = (!$scope.userBilling.state) ? 'true' : 'false';

      } else {
        $scope.paymentVisited = 'true';
        $scope.addressRequired = 'false';
        $scope.cityRequired = 'false';
        $scope.stateRequired = 'false';
        $scope.page = "details";

        window.scrollTo(1, 0);
      }
    };

    // Visited Details view and moving to options
    $scope.detailsNext = function () {
      if (!$scope.event.title || !$scope.event.description || !$scope.event.tags) {

        $scope.titleRequired = (!$scope.event.title) ? 'true' : 'false';

        $scope.descriptionRequired = (!$scope.event.description) ? 'true' : 'false';

        $scope.tagsRequired = (!$scope.event.tags) ? 'true' : 'false';

      } else {
        $scope.detailsVisited = 'true';
        $scope.titleRequired = 'false';
        $scope.descriptionRequired = 'false';
        $scope.tagsRequired = 'false';
        $scope.imageUploadedRequired = 'false';
        $scope.page = "location";

        window.scrollTo(0, 0);
      }
    };

    // Visited Details view and moving to options
    $scope.locationNext = function () {

      if (!$scope.event.address1 || !$scope.event.zipcode) {

        $scope.showLocationRequiredFields = 'true';

      } else {

        $scope.detailsVisited = 'true';
        $scope.showLocationRequiredFields = 'false';
        $scope.page = "time";
        window.scrollTo(0, 0);
      }
    };

    // Visited Details view and moving to options
    $scope.timeNext = function () {
      // variables
      var endDate, startDate, startTime, endTime;

      endDate = $scope.event.endDate;
      startDate = $scope.event.startDate;
      startTime = $scope.event.startTime;
      endTime = $scope.event.endTime;

      if (!endDate || !startDate || !startTime || !endTime) {

        // $scope.showTimeRequiredFields = 'true';
        // temp 
        $scope.timeVisited = 'true';
        $scope.page = "options";

        window.scrollTo(0, 0);

      } else {
        $scope.showTimeRequiredFields = 'false';
        $scope.timeVisited = 'true';
        $scope.page = "options";

        window.scrollTo(0, 0);
      }
    };

    // Visited Options view and moving to details due to invalid form
    $scope.checkRequiredFields = function () {
      $scope.showRequiredFields = 'true';
      $scope.page = "details";
    };

    // Shows success message and next button once user has paid for premium
    $scope.showSuccess = function () {
      $scope.page = 'success';
    };

    $scope.userPhoto = function () {
      // Variable declaration
      var options, file, photo, slug;

      options = {
        quality: 100,
        allowEdit: true,
        targetWidth: 114,
        targetHeight: 88,
        encodingType: "jpeg",
        destinationType: "dataURL",
        mediaType: "picture",
      };

      // Calling for native image gallery
      supersonic.media.camera.getFromPhotoLibrary(options).then(function (result) {
        var index = $scope.completedUploads;
        // slugify title for unique identifier
        slug = HelperProvider.slugify($scope.event.title);

        // Set unique filename
        file = auth.id + '_' + slug + '_' + Math.floor(1000000000 * Math.random()) + '.jpg.b64';

        photo = {
          eventId: $scope.event.id,
          userId: auth.id,
          url: {
            '114x88': 'data:image/jpeg;base64,' + result
          }
        };

        $scope.event.photos.push(photo);

        // add file to Evaporate
        evap.add({
          name: file,
          file: result,
          fileIndex: index,
          complete: function (res) {
            // temp
            angular.element('[data-role="hide-upload"]').trigger('click');

            // make API call to update event with uploaded photo
            ApiServiceProvider
              .events
              .update($scope.event.id, function (data) {

                angular.element('[data-role="hide-upload"]').trigger('click');
              });
          }
        });
      });
    };

    // show new payment modal
    $scope.showPayment = function () {
      // Go to view
      var modal, options;

      modal = new supersonic.ui.View("suaray#payment");

      options = {animate: true};

      supersonic.ui.modal.show(modal, options);
    };

    // Closes Modal based on whether an event has been created
    $scope.closeModal = function (eventId) {
      var options = {animate: true, disableAnimation: false};

      // hide modal
      steroids.modal.hide(options, {
        onSuccess: function () {
          // fire updated event channel via event controller 
          Mediator.trigger('eventUpdated', true);
        }
      });

      // fire updated event channel via event controller 
      Mediator.trigger('eventUpdated', true);
    };

    // List for type of recurring event
    $scope.repeatList = [
      {name: 'daily',   value: 'Daily'},
      {name: 'weekly',  value: 'Weekly'},
      {name: 'monthly', value: 'Monthly'},
      {name: 'yearly',  value: 'Yearly'}
    ];

    $scope.doUpdateEvent = function () {
      var str, idx, switches, newStartDate, newEndDate, newStartTime, newEndTime, eventRepeat, repeatEvery, repeatEnd, repeatEndTime, oldEvnt;

      oldEvnt = StorageProvider.get('editEvent');
      oldEvnt = parseDateAndTimes(oldEvnt);

      if (oldEvnt.startDate || oldEvnt.endDate) {
        // compare dates to see if they have been changed
        if (oldEvnt.startDate.valueOf() !== $scope.event.startDate.valueOf()) {
          // format times and dates
          newStartDate = $filter('date')($scope.event.startDate, 'yyyy-MM-d');
          newStartTime = $filter('date')($scope.event.startTime, 'HH:mm:ss');
        }

        // compare dates to see if they have been changed
        if (oldEvnt.endDate.valueOf() !== $scope.event.endDate.valueOf()) {
          // format times and dates
          newEndDate = $filter('date')($scope.event.endDate, 'yyyy-MM-d');
          newEndTime = $filter('date')($scope.event.endTime, 'HH:mm:ss');
        }
      } else {
          newStartDate = $filter('date')($scope.event.startDate, 'yyyy-MM-d');
          newStartTime = $filter('date')($scope.event.startTime, 'HH:mm:ss');
          newEndDate = $filter('date')($scope.event.endDate, 'yyyy-MM-d');
          newEndTime = $filter('date')($scope.event.endTime, 'HH:mm:ss');
      }

      switches = ['polls', 'comments', 'reviews', 'rsvp', 'share', 'tickets', 'map', 'eventPictures', 'transportation'];
      // get meta options values
      for (idx in switches) {

        if (switches.hasOwnProperty(idx)) {
          // get switch key name
          str = switches[idx];

          if ($scope.event.meta[str]) {
            // set value for switch in meta 
            $scope.event.meta[str] = {enabled: $scope.event.meta[str].enabled};
          }
        }
      }

      // remove date objects as they are in meta schedules 
      delete $scope.event.startDate;
      delete $scope.event.endDate;
      delete $scope.event.startTime;
      delete $scope.event.endTime;

      // Retrieve Recurring Repeat value
      eventRepeat = $scope.event.repeats;
      // Retrieve Recurring interval value
      repeatEvery = $scope.event.repeatEvery;

      // Retrieve Recurring end date
      repeatEnd = $filter('date')($scope.event.repeatEnd, 'yyyy-MM-d');
      repeatEndTime = $filter('date')($scope.event.repeatEndTime, 'HH:mm:ss');

      // remove date objects
      delete $scope.event.repeatEnd;
      delete $scope.event.repeatEndTime;

      // set category
      $scope.event.category1 = $scope.event.category.tag;
      // Retrieves user billing address, city and state
      $scope.event.meta.billing = $scope.userBilling;
      // Set user email if avail from billing form
      $scope.event.email = ($scope.userBilling) ? $scope.userBilling.email : null;

      if (newStartDate || newEndDate) {

        // Set value for event schedule
        $scope.event.meta.schedules = [{
          // Example of recurring event
          timezoneId : $scope.event.timezoneId,
          start: {
            date: newStartDate || null,
            time: newStartTime || null
          },
          end: {
            date: newEndDate || null,
            time: newEndTime || null
          },
          repeat: {
            repeats: eventRepeat,
            every: repeatEvery,
            end: {
              date: repeatEnd,
              time: repeatEndTime 
            }
          }
        }];
      } else {
        
        $scope.event.meta.schedules = null;
      }

      // stringify meta object for server
      $scope.event.meta = JSON.stringify($scope.event.meta);

      // remove objects and arrays, that are not needed here
      delete $scope.event.photos;
      delete $scope.event.featuredPhoto;

      ApiServiceProvider
        .events
        .update($scope.event.id, $scope.event, function (data) {
          var evnt;

          if (!data.error) {

            evnt = data;

            // Save event data
            StorageProvider.set('event', evnt);

            // Enable drawer gestures
            HelperProvider.drawerEnableGestures();

            $scope.page = 'success';

            if (evnt.token) {
              $scope.successPremiumShow = true;

              $timeout(function () {
                $scope.closeModal(evnt.id);
              }, 3500);

            } else {

              $scope.successFreeShow = true;

              $timeout(function () {
                $scope.closeModal(evnt.id);
              }, 3500);
            }
          } else {

            // If form invalid, go to first form page
            $scope.page = 'details';
            $scope.error = data.error;
          }
        });
    };

  });
