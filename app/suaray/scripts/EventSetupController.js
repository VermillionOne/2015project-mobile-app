/*jslint unparam: true, indent: 2 */
/*global screen,window,steroids,suarayConfig */
/*global Evaporate,angular,$,document,device,alert,suarayEnv */
angular
  .module('suaray')
  .controller('EventSetupController', function ($scope, $filter, $timeout, supersonic, StorageProvider, ApiProvider, ApiServiceProvider, HelperProvider, ScheduleProvider, Mediator) {

    // Invoke strict mode
    "use strict";

    // attach private methods to $this for access in unit tests
    // ------------------------------------------------------ //

    // Variable delarations
    var $this = this, screenHeight, evap, slug, auth, event, stripeResponseHandler, $form, completedUploads, n, token, mobileSettings, i;

    /**
     * Action for back arrow on devices
     * Disable back button on android
     *
     * @return void
    **/
    $this.onBackKeyDown = function () {
      $scope.closeModal(false);
    };

    /**
     * Called when device ready to apply back button action
     * and set device platform
     *
     * @return void
    **/
    $this.onDeviceReady = function () {
      suarayConfig.device = device.platform;
      document.addEventListener('backbutton', $this.onBackKeyDown, false);
    };

    /**
     * When payment form submitted submit to api add handler on page load
     *
     * @return void
    **/
    $this.onPageLoad = function () {
      // create blank event object
      $scope.event = {};

      $scope.event.metaObject = {};

      // Set Create event success message to false
      $scope.successPremiumShow = false;
      $scope.successFreeShow = false;

      // set screen height
      $('[data-role="full-screen-height"]').css("min-height", screenHeight);

      // submit payment direclty to api
      $('#payment-form').submit(function (e) {
        var billing;

        // grab billing data from scope
        billing = $scope.userBilling;

        // if form is valid
        if ($scope.form.$valid) {

          // add premium flag
          $scope.event.isPremium = true;
          // assign billing object
          $scope.event.billing = billing;

          // allow next button
          $scope.successShow = 'success';
        }

        // Prevent the form from submitting with the default action
        return false;
      });
    };

    event = 0;

    $this.onPageLoad();

    // reset scope value
    $scope.premium = false;

    // Finding screen height for proper background display
    screenHeight = screen.height;

    // Get auth data
    auth = StorageProvider.get('auth');

    // Get mobile settings data
    mobileSettings = StorageProvider.get('settings');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    // setting initital value for event options
    angular.element(document).ready(function () {
      $scope.event.poll = false;
      $scope.event.comments = false;
      $scope.event.maps = false;
      $scope.event.eventPictures = false;
      $scope.event.reviews = false;
      $scope.event.tickets = false;
      $scope.event.transportation = false;
      $scope.imageUploaded = false;

      // check for payment option and show / hide preimum panel
      if (mobileSettings && mobileSettings.paymentDisabled !== true) {
        // show premium event panel
        $scope.premium = true;
      }

    });

    // Grab states list from HelperProvider
    $scope.usStates = HelperProvider.getStatesList();

    // add evaporate upload settings
    evap = HelperProvider.addUploadSettings();

    $scope.userBilling = {
      // Input fields
      address: null,
      city: null,
      state: null,
      zip: null,
      email: null
    };

    // Get categories
    ApiServiceProvider
      .collections
      .categories(function (data) {
        var categories;

        categories = data;

        $scope.categories = categories;
      });

    // Get timezones
    ApiServiceProvider
      .collections
      .timezones(function (data) {
        var userTimezone;

        $scope.timezones = data;

        if (auth.timezoneId >= 0) {

          userTimezone = parseInt(auth.timezoneId, 10) - 1;

          $scope.event.timezone = data[userTimezone];
          $scope.defaultTimezone = data[userTimezone];
        } else {
          $scope.event.timezone = data[5];
          $scope.defaultTimezone = data[5];
        }
      });

    document.addEventListener('deviceready', $this.onDeviceReady, false);

    // Set event as a free event
    $this.initialLoad = function () {
      $scope.showRequiredFields = 'false';
      $scope.free = "true";
      $scope.page = "freemium";

      // Set initial values for form
      window.scrollTo(0, 0);
    };

    $this.initialLoad();

    // Continue as free event
    $scope.freeEvent = function () {
      $scope.free = "true";
      $scope.page = "details";
      $scope.freemiumVisited = "true";
      $scope.isPremium = false;

      window.scrollTo(0, 0);
    };

    // Set event as a premium event
    $scope.premiumEvent = function () {
      $scope.free = 'null';
      $scope.page = "payment";
      $scope.freemiumVisited = "true";
      $scope.isPremium = true;

      window.scrollTo(0, 0);
    };

    // Visited Payment view and moving to details
    $scope.paymentNext = function () {
      $scope.paymentVisited = 'true';
      $scope.addressRequired = 'false';
      $scope.cityRequired = 'false';
      $scope.stateRequired = 'false';
      $scope.page = "details";

      window.scrollTo(0, 0);
    };

    // Funcion for turning off and on recurring schedules
    angular.element('[data-role="recurringSchedule"]').change(function () {

      // Declare variable
      var repeats, fauxSelect;
      fauxSelect = {
        option : false
      };

      if (this.checked === true) {
        // Send through ScheduleProvider and grab resulting array
        repeats = ScheduleProvider.checkRepeats($scope.event.repeats);
        // Set schedule inputs accoriding to interval
        if (repeats.interval === 'weekly') {
          // Automatically set the weekly value to assist in successful form submission
          $scope.event.repeatEvery = 1;
        }
        // Assign string value of days selected to hidden input
        angular.element('input[data-role="daysOfWeek"]')[0].value = repeats.daysSelectedString;
      } else {
        repeats = ScheduleProvider.checkRepeats(fauxSelect);
        // Assign string value of days selected to hidden input
        angular.element('input[data-role="daysOfWeek"]')[0].value = '';
      }
    });

    // function for daysOfWeek string value concatenation
    // Upon a change of any of the days of the week checkboxes
    angular.element('[data-role^="day-of-week-"]').change(function () {
      // Declare Variables
      var daysSelectedString;
      // Get string value from Schedule Provider
      daysSelectedString = ScheduleProvider.checkDaysOfWeek(this);

      // Assign string value of days selected to hidden input
      angular.element('input[data-role="daysOfWeek"]')[0].value = daysSelectedString;
    });

    // Check repeating base interval
    // Controls schedule values dependant on whether repeating value is 'daily', 'weekly', etc.
    angular.element('[data-role="repeats"]').change(function () {
      // Declare variable
      var repeats;
      // Send through ScheduleProvider and grab resulting array
      repeats = ScheduleProvider.checkRepeats(this);
      // Set schedule inputs accoriding to interval
      if (repeats.interval === 'weekly') {
        // Automatically set the weekly value to assist in successful form submission
        $scope.event.repeatEvery = 1;
      }
      // Assign string value of days selected to hidden input
      angular.element('input[data-role="daysOfWeek"]')[0].value = repeats.daysSelectedString;
    });


    // Visited Details view and moving to options
    $scope.detailsNext = function () {
      if ($scope.event.title === undefined || $scope.event.description === undefined || $scope.event.tags === undefined || $scope.imageUploaded === false) {

        if ($scope.event.title === undefined) {
          $scope.titleRequired = 'true';
        } else if ($scope.event.title !== undefined) {
          $scope.titleRequired = 'false';
        }

        if ($scope.event.description === undefined) {
          $scope.descriptionRequired = 'true';
        } else if ($scope.event.description !== undefined) {
          $scope.descriptionRequired = 'false';
        }

        if ($scope.event.tags === undefined) {
          $scope.tagsRequired = 'true';
        } else if ($scope.event.tags !== undefined) {
          $scope.tagsRequired = 'false';
        }

        if ($scope.imageUploaded === false) {
          $scope.imageUploadedRequired = 'true';
        } else if ($scope.imageUploaded === true) {
          $scope.imageUploadedRequired = 'false';
        }

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
      if ($scope.event.address1 === undefined) {

        $scope.showLocationRequiredFields = 'true';

      } else if ($scope.event.zipcode === undefined) {

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

      var endDate, startDate, startTime, endTime;

      startDate = $scope.event.startDate;
      startTime = $scope.event.startTime;
      endDate = $scope.event.endDate;
      endTime = $scope.event.endTime;

      if (!endDate || !startDate || !startTime || !endTime) {

        $scope.showTimeRequiredFields = 'true';

      } else {
        $scope.showTimeRequiredFields = 'false';
        $scope.timeVisited = 'true';
        $scope.page = "options";

        window.scrollTo(0, 0);
      }
    };

    /**
     * Generic showPage method for going back and forth between filled out sections
     * params (string) Page name for intended page
     */
    $scope.showPage = function (page) {
      $scope.page = page;
      window.scrollTo(0, 0);
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

    $scope.doCreateEvent = function () {
      var str, idx, createEvent, switches, newStartDate, newEndDate, newStartTime, newEndTime, eventRepeat, repeatEvery, repeatEnd, repeatEndTime, repeatEnabled;

      // Define scope for repeat
      $scope.event.repeat = {};
      //Define scope for metaObject
      $scope.event.metaObject = {};
      // Retrieves user billing address, city and state
      $scope.event.billing = $scope.event.billing || $scope.userBilling;
      // set user email from billing form
      $scope.event.email = $scope.userBilling.email;
      // Retrieves stripe token to validate premium event
      $scope.event.token = token || null;
      // set category
      $scope.event.category1 = $scope.event.category.tag;
      // set timezone id
      $scope.event.timezoneId = $scope.event.timezone.id;

      switches = ['polls', 'comments', 'reviews', 'rsvp', 'share', 'tickets', 'maps', 'eventPictures', 'transportation'];

      // get meta options values
      for (idx in switches) {

        if (switches.hasOwnProperty(idx)) {
          // get switch key name
          str = switches[idx];

          if ($scope.event[str]) {
            // set value for switch in meta
            $scope.event.metaObject[str] = {enabled: $scope.event[str]};
          }
        }
      }

      // format dates
      newStartDate = $filter('date')($scope.event.startDate, 'yyyy-MM-d');
      newEndDate = $filter('date')($scope.event.endDate, 'yyyy-MM-d');
      newStartTime = $filter('date')($scope.event.startTime, 'HH:mm:ss');
      newEndTime = $filter('date')($scope.event.endTime, 'HH:mm:ss');

      // check if repeat is enabled
      repeatEnabled = angular.element('input[data-role="repeat-enabled"]')[0].checked;

      // Retrieve Recurring Repeat value
      eventRepeat = $scope.event.repeats;
      // Retrieve Recurring interval value
      repeatEvery = $scope.event.repeatEvery;
      // Retrieve Recurring end date
      repeatEnd = $filter('date')($scope.event.repeatEnd, 'yyyy-MM-d');
      repeatEndTime = $filter('date')($scope.event.repeatEndTime, 'HH:mm:ss');

      // Set value for user ID
      $scope.event.user_id = auth.id;
      // Set value for event schedule
      $scope.event.metaObject.schedules = [{
        // Example of recurring event
        timezoneId : $scope.event.timezone.id,
        daysOfWeek : (repeatEnabled) ? angular.element('input[data-role="daysOfWeek"]')[0].value : '',
        start : {
          date : newStartDate,
          time : newStartTime
        },
        end : {
          date : newEndDate,
          time : newEndTime
        },
        repeat : {
          repeats : (repeatEnabled) ? eventRepeat : '',
          every   : (repeatEnabled) ? repeatEvery : '',
          end: {
            date: repeatEnd,
            time: repeatEndTime
          }
        }
      }];
      // add is premium flag based on which event panel was chosen
      $scope.event.isPremium = $scope.isPremium || false;

      createEvent = $scope.event;
      // Convert Meta Fields into JSON String
      createEvent.meta = JSON.stringify($scope.event.metaObject);
      createEvent.metaObject = null;
      createEvent.isPublished = 1;

      ApiServiceProvider
        .events
        .create(createEvent, function (data) {

          if (data && !data.error) {
            event = $scope.event;

            // Save event data
            StorageProvider.set('event', event);

            // Enable drawer gestures
            HelperProvider.drawerEnableGestures();

            $scope.page = 'success';

            // Checks if event token exists for premium event and shows success message
            if (event.isPremium === true) {

              $scope.successPremiumShow = true;

              $timeout(function () {
                $scope.closeModal(true);
              }, 3500);

            } else {

              $scope.successFreeShow = true;

              $timeout(function () {
                $scope.closeModal(true);
              }, 3500);
            }
          } else {

            // If form invalid, go to first form page
            $scope.page = 'details';
            $scope.error = data.error;
          }
        });
    };

    // List for type of recurring event
    $scope.repeatList = [
      {name: 'daily',   value: 'Daily'},
      {name: 'weekly',  value: 'Weekly'},
      {name: 'monthly', value: 'Monthly'},
      {name: 'yearly',  value: 'Yearly'}
    ];

    // Defining repeat every interval as an array
    $scope.interval = [];

    // Looping numbers through to 30 for a list of number options for interval
    for (n = 1; n <= 30; n += 1) {
      $scope.interval.push(n);
    }

    // Linked to userPhoto() evap.add complete()
    // Increments value when photo upload has completed
    completedUploads = 0;
    $scope.completedUploads = completedUploads;
    // Called from complete() in evap.add options via necessary dom element
    $scope.successfulUpload = function () {
      completedUploads += 1;
      $scope.completedUploads = completedUploads;
      // Causes upload button in form to disappear and is replaced with successful upload message
      $scope.imageUploaded = true;
    };

    $scope.userPhoto = function () {

      // Passing parameters for photo options
      var options = {
        quality: 100,
        allowEdit: true,
        encodingType: "jpeg",
        destinationType: "dataURL",
        mediaType: "picture"
      };

      // Calling for native image gallery
      supersonic.media.camera.getFromPhotoLibrary(options).then(function (result) {
        // Variable declaration
        var newFileName, title;

        title = $scope.event.title;

        i = 0;

        slug = HelperProvider.slugify(title);

        // // Set unique filename
        newFileName = auth.id + '_' + slug + '_' + Math.floor(1000000000 * Math.random()) + '.jpg.b64';

        evap.add({
          name: newFileName,
          file: result,
          fileIndex: i,
          complete: function (r) {
            // Invokeds successfulUpload()
            angular.element('[data-role="hide-upload"]').trigger('click');
          }
        });
      });
    };

    // Closes Modal based on whether an event has been created
    $scope.closeModal = function (newEvent) {
      var options = {
        animate: true,
      };

      if (newEvent) {
        Mediator.trigger('eventCreated', true);

        supersonic.ui.modal.hide(options).then(function () {
          Mediator.trigger('eventCreated', true);
        });

      } else { 
        supersonic.ui.modal.hide(options);
      }
    };
  });
