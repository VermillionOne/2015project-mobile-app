/*jshint node: true */
/*jslint unparam: true*/
/*global location,moment*/
angular
  .module('suaray')
  .controller('ProfileController', function ($scope, $timeout, supersonic, StorageProvider, ApiProvider, ApiServiceProvider, HelperProvider, Mediator, $window) {

    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var auth, i, initialLoad, userData, evap, avatarUpdate, socialPlatform;

    // Reset user data object
    userData = {};

    // Set navbar title
    $scope.navbarTitle = "Profile";

    // update wall form
    $scope.update = {
      message: null
    };

    // Set edit user data object
    $scope.editUser = {};

    $scope.email = {text: 'me@example.com'};

    /**
      * Scroll to event element in calendar day view
      *
      * @return void
    **/
    function scrollToEvent() {
      // wait for calendar render
      $timeout(function () {
        // add scroll id
        $(".fc-time-grid-event").attr("id", "scrollTo");

        if ($("#scrollTo") && $("#scrollTo").offset() !== undefined) {
          // scroll to event start
          $(".fc-scroller").animate({
            scrollTop: $("#scrollTo").offset().top - 150
          }, 200);
        }
      }, 500);
    }

    /**
      * Initial page load, make needed API requests
      *
      * @return void
    **/
    initialLoad = function () {
      // Get auth from storage
      auth = StorageProvider.get('auth');

      // Set api key in api provider config
      ApiProvider.setConfig('apiKey', auth.apiKey);

      // Set auth data in scope
      $scope.auth = auth;

      // set initial avatar scopes
      $scope.newAvatarImage = false;
      $scope.avatarReady = false;
      $scope.showNewAvatar = false;
      $scope.currentlyUploading = false;

      $scope.page = "profile-detail";

      // Get user created events
      ApiServiceProvider
        .users
        .events(auth.id, function (data) {
          if (!data.error) {
            // Pulls in all owned events
            $scope.myEvents = data;
          }
        });

      // Get timezones list once
      ApiServiceProvider
        .collections
        .timezones(function (data) {
          var index = 0, length, timezone;
          // Add list of timezones to $scope
          $scope.timezones = data;
          // First time
          $scope.defaultTimezone = data[5];

          // Check timezones for current auth timezoneId
          if (auth.timezoneId) {
            length = data.length;

            do {
              timezone = data[index];

              if (timezone.id === auth.timezoneId) {
                // Set default timezone or users timezone
                $scope.defaultTimezone = timezone;
              }

              index += 1;
            } while (--length);
          }
        });

      // set upload evap settings
      evap = HelperProvider.addUploadSettings(evap);

      // Get any updated user data from API
      ApiServiceProvider
        .users
        .updates(auth.id, function (data) {
          // Shows Users Updates
          $scope.usersComments = data.updates;
          // Shows logged in users info
          $scope.update.loggedinuser = data;
        });

      // Pulling rsvp'd events from the logged in user
      ApiServiceProvider
        .events
        .attending(auth.id, function (data) {
          // variables
          var times, time, currentIndex, myEventsFormatted, icon, monthOpts, dayOpts, eventPhoto, isMulti, days, newDate, x, dateStart, dateEnd, color, defaultColor, title, eventId;

          defaultColor = '#3495CF';
          // If we have events data
          if (data && !data.error) {

            // make event info available threw times
            times = data;
            // declare new object
            myEventsFormatted = [];

            // loop threw all the rsvp'd events pulling from the database
            for (currentIndex in times) {

              if (times.hasOwnProperty(currentIndex)) {
                // reset icon
                icon = null;
                // get time obj
                time = times[currentIndex];

                // Do not iterate through functions
                if (!HelperProvider.isFunc(time)) {

                  if (time.event) {

                    eventPhoto = (time.event.featuredPhoto && time.event.featuredPhoto.url['360x360']) ? time.event.featuredPhoto.url['360x360'] : null;

                    if (time.event.icon) {
                      icon = time.event.icon.icon;
                      color = time.event.icon.color;
                    }
                  }

                  // set title and event id
                  title = (time.event) ? time.event.title : '';
                  eventId = (time.event) ? time.event.id : null;

                  // If we do not have an icon
                  if (!icon) {
                    // Set icon to default
                    icon = 'fa fa-star';
                    color = defaultColor;
                  }

                  // get start and end dates for calculations
                  dateStart = moment(time.start);
                  dateEnd = moment(time.end);

                  // check for multiple day events
                  isMulti = dateStart.get('date') < dateEnd.get('date');

                  // Format fullcalendar fields to pull event info from the database
                  myEventsFormatted.push({
                    title: title,
                    start: time.start,
                    end: (!isMulti) ? time.end : '',
                    eventId: eventId,
                    color: '#fff',
                    scrollTime: time.start,
                    textColor: color,
                    slotEventOverlap: false,
                    overlap: false,
                    photo: '<img src=' + '"' + eventPhoto + '"' + ' />',
                    icon: '&nbsp;&nbsp;' + '<i class="fa ' + icon + '"' + '></i>' + '&nbsp;&nbsp;'
                  });

                  // if we have multiple day event
                  if (isMulti) {
                    // get number of days
                    days = HelperProvider.dateDiffInDays(dateStart, dateEnd);

                    for (x = 1; x <= days; x += 1) {
                      newDate = moment(time.start).add(x, 'days');

                      // add single event for each day
                      myEventsFormatted.push({
                        title: title,
                        start: newDate,
                        end: '',
                        color: '#FFF',
                        textColor: color,
                        eventId: eventId,
                        photo: '<img src=' + '"' + eventPhoto + '"' + ' />',
                        icon: '&nbsp;&nbsp;' + '<i class="fa ' + icon + '"' + '></i>' + '&nbsp;&nbsp;'
                      });
                    }
                  }
                }
              }
            }

            // page is now ready, initialize the calendar...
            monthOpts = {
              header: {
                left: '',
                center: 'prev, title, next',
                right: ''
              },
              editable: false,
              eventLimit: true, // allow "more" link when too many events
              eventLimitClick: function (data, event) {
                $('#calendar').fullCalendar('destroy');
                $('#calendar').fullCalendar(dayOpts);
                $('#calendar').fullCalendar('gotoDate', data.date);
                // auto scroll to event
                scrollToEvent();
              },
              events: myEventsFormatted,
              defaultView: 'month',
              // hides default event styles, so icons can be only thing showing.
              // eventColor: 'transparent',
              eventRender: function (event, element) {
                if (event) {
                  element.find(".fc-time").css({'display': 'none'});
                  element.find(".fc-title").replaceWith(event.icon);
                }
              },
              // function for when you click a event out the calendar
              eventClick: function (date, event, view) {
                // Re-render calendar with day options
                $('#calendar').fullCalendar('destroy');
                $('#calendar').fullCalendar(dayOpts);
                $('#calendar').fullCalendar('gotoDate', date.start);
                // auto scroll to event
                scrollToEvent();
              }
            };

            dayOpts = {
              header: {
                left: '',
                center: 'prev, title, next',
                right: 'month'
              },
              editable: false,
              eventLimit: true, // allow "more" link when too many events
              defaultView: 'agendaDay',
              events: myEventsFormatted,
              slotEventOverlap: false,
              eventRender: function (event, element) {
                var diff;
                // get difference between start and end times
                diff = moment.utc(moment(event.end).diff(moment(event.start))).format('h');
                // insert featured photo
                element.find(".fc-title").before(event.photo);

                if (diff !== "Invalid date") {
                  // if event is only 1 to 4 hours long
                  if (diff === '1' || diff === '2' || diff === '3' || diff === '4') {
                    // add custom event grid class
                    element.addClass('fc-short-grid-event');
                  }
                }
              },
              eventAfterRender: function (event, element, view) {
                // reset colors
                element.css('color', '#FFF');
                element.css('background', event.textColor);

                if (event.end === null) {
                  // size event height to take up needed space
                  element.css('height', '950px');
                }
              },
              viewRender: function (view, element) {
                // re-render calendar with correct options
                if (view.name === 'month') {
                  $('#calendar').fullCalendar('destroy');
                  $('#calendar').fullCalendar(monthOpts);
                }
                // auto scroll to event on next / prev buttons
                $('.fc-next-button').click(function () {
                  scrollToEvent();
                });
                $('.fc-prev-button').click(function () {
                  scrollToEvent();
                });
              },
              eventClick: function (event, date, view) {
                if (view.name === 'agendaDay') {
                  // Call event detail Helper method
                  HelperProvider.goToEventDetail(event.eventId);
                }
              }
            };
            // Remove any existing calendar markup
            $('#calendar').fullCalendar('destroy');
            $('#calendar').fullCalendar(monthOpts);
            $('#calendar').fullCalendar('render');

          } else {

            // Remove any existing calendar markup
            $('#calendar').fullCalendar('destroy');

            // display calendar without data
            $('#calendar').fullCalendar({
              header: {
                left: '',
                center: 'prev, title, next',
                right: ''
              }
            });
          }

          // hide loader after all api calls
          $('.loading-overlay').fadeOut('fast');
        });

      $('#calendar').fullCalendar('render');
    };

    // page init
    initialLoad();

    Mediator.on('eventCreated', function (created) {
      if (created) {
        $window.location.reload();
      }
    });

    // Refresh views once request are accepted
    angular.element('[data-role="update-wall"]').submit(function () {

      var message, userId, msgData;

      // Get query value
      message = $scope.update.message;

      // User ID authenication
      userId = auth.id;

      // Define comment data
      msgData = {
        message: message,
        userId: userId
      };

      // Api Call to store update wall data
      ApiProvider
        .store('usersupdates', msgData)
        .success(function (response) {
          // if theres data
          if (response.success && response.success === true) {
            // Refresh views once comment is posted
            ApiServiceProvider
              .users
              .updates(userId, function (data) {
                // Shows users comments
                $scope.usersComments = data.updates;
                // Shows users data
                $scope.loggedinuser = data;
                // Clear input field after render
                $scope.update.message = null;
              });
          }
        });
    });

    // Set initial Scopes for profile-edit form in view
    $scope.setInitialScope = function () {
      $scope.newAvatarImage = false;
      $scope.avatarReady = false;
      $scope.showNewAvatar = false;
    };

    // Refrence event detail function in helper
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // Show home
    $scope.showProfileEdit = function () {
      // Go to view
      $scope.page = "profile-edit";
      // Reset avatar scopes
      $scope.setInitialScope();
      // Update edit profile form with latest auth values
      $scope.resetProfileEditForm();
      // attempt to keep settings updated
      evap = HelperProvider.addUploadSettings();
    };

    $scope.deleteUserComment = function (cid) {
      var $div = angular.element('#' + cid);

      // Call delete route via ApiProvider
      ApiProvider
        .destroy('usersupdates', cid)
        .success(function (response) {
          if (response && response.success) {
            // Remove div from markup
            // faster than making brand new call for user comments
            if ($div && $div.length) {
              $div.remove();
            }
          }
        })
        .error(function () {
          // Remove div from markup
          // may need to notify user instead that delete failed.
          if ($div && $div.length) {
            $div.remove();
          }
        });
    };

    $scope.showProfile = function () {
      // If the avatar has been update, reset page
      if ($scope.avatarReady === true) {
        $window.location.reload();
      } else {
        // Go to view
        $scope.page = "profile-detail";
        // Call initial API requests
        initialLoad();
      }
    };

    // Reference Helper method
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // Go to public profile of friend
    $scope.goToPublicProfile = function (user, $event) {
      // Grab target element
      var $target = angular.element($event.target);

      // Make sure user is not clicking delete button
      if (!$target.is('button')) {

        // Check for friend object
        if (user.friend !== null) {
          // Go to that friends public profile
          HelperProvider.goToPublicProfile(user.friend);
        }
      }
    };

    // If user has more than one social account linked, will only show first
    for (socialPlatform in auth.social) {

      // Grabs the first social platform linked to account
      $scope.socialProfile = socialPlatform;
      break;
    }

    $scope.googlePlusLink = function () {
      $window.open('http://plus.google.com/' + auth.social.google.id, '_system');
    };

    $scope.facebookLink = function () {
      $window.open('http://facebook.com/' + auth.social.facebook.id, '_system');
    };

    $scope.twitterLink = function () {
      $window.open('http://twitter.com/' + auth.social.twitter.username, '_system');
    };

    $scope.instagramLink = function () {
      $window.open('http://instagram.com/' + auth.social.instagram.username + '?ref=badge', '_system');
    };

    $scope.resetProfileEditForm = function () {
      $scope.errorList = null;

      $scope.editUser.firstName = auth.firstName;
      $scope.editUser.lastName = auth.lastName;
      $scope.editUser.username = auth.username;
      $scope.editUser.email = auth.email;
      $scope.editUser.timezoneId = auth.timezoneId;
    };

    $scope.putUserData = function () {

      userData = {
        firstName: $scope.editUser.firstName,
        lastName: $scope.editUser.lastName,
        username: $scope.editUser.username,
        email: $scope.editUser.email,
        password: $scope.editUser.password,
        timeZoneId: $scope.editUser.timezoneId
      };

      ApiProvider
        .update('users', auth.id, userData)
        .success(function (response) {
          // If we have events data
          if (response.success && response.success === true) {
            ApiServiceProvider
              .users
              .data(auth.id, function (user) {
                // Set new auth info
                auth.email = user.email;
                auth.firstName = user.firstName;
                auth.lastName = user.lastName;
                auth.username = user.username;
                auth.timezoneId = $scope.editUser.timezoneId;
                // Save auth
                StorageProvider.set('auth', auth);

                // Go to Profile page
                $scope.page = "profile-detail";
              });

            angular.element('[data-role="reset-form"]').trigger('click');
          }

        })
        .error(function (response) {
          // Variable declarations
          var error, field, index, errorList, errorListIndex;

          errorList = [];
          errorListIndex = 0;

          if (response.error) {
            // Set error object
            error = response.error;

            // For all resource items
            for (field in error) {
              // Do not iterate through functions
              if (typeof error[field] !== 'function') {
                // Handle multiple error messages per field
                for (index in error[field]) {

                  // Do not iterate through functions
                  if (typeof error[field][index] !== 'function') {

                    errorList[errorListIndex] = error[field][index];
                  }
                }

                errorListIndex += 1;
              }
            }

            $scope.errorList = errorList;
          }
        });
    };

    // Request updated API call data when drawer closed
    supersonic.ui.drawers.whenDidClose(function () {
      // Make sure auth object is current
      auth = StorageProvider.get('auth');
      // Call initial API requests
      initialLoad();
    });

    $scope.avatarUploaded = function () {
      $scope.avatarReady = true;
      $scope.showNewAvatar = true;
    };

    avatarUpdate = {};

    $scope.userPhoto = function () {
      // Passing parameters for photo options
      var options = {
        quality: 100,
        allowEdit: true,
        targetWidth: 200,
        targetHeight: 200,
        encodingType: "jpeg",
        destinationType: "dataURL",
        mediaType: "picture",
      };

      // Calling for native image gallery
      supersonic.media.camera.getFromPhotoLibrary(options).then(function (result) {
        // Variable declaration
        var newFileName;

        i = 0;

        $scope.newAvatar = 'data:image/jpeg;base64,' + result;

        $scope.newAvatarImage = true;

        $scope.currentlyUploading = true;

        // Set unique filename
        newFileName = 'avatar' + '_' + auth.id + '_' + Math.floor(1000000000 * Math.random()) + '.jpg.b64';

        evap.add({
          name: newFileName,
          file: result,
          fileIndex: i,
          signParams: {
            foo: 'bar'
          },
          complete: function () {
            // Click element to run avatar uploaded function
            angular.element('[data-role="avatar-uploaded"]').trigger('click');
            // Invokes successfulUpload()
            ApiProvider
              .update('users', auth.id, avatarUpdate)
              .success(function (response) {
                if (response.success && response.success === true) {

                  $timeout(function () {
                    auth.avatar = response.data.user.avatar;
                    StorageProvider.set('auth', auth);
                  });
                  $timeout(function () {
                    $scope.avatarUploaded();
                    $scope.currentlyUploading = false;
                  }, 3500);
                }
                Mediator.trigger('newAvatar');
              });
            // fallback
            Mediator.trigger('newAvatar');
          }
        });
      });
    };
  });
