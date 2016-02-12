/*jshint unused: true, node: true */
/*jslint unparam: true */
/*global escape,steroids,moment*/
angular
  .module('suaray')
  .controller('PublicProfileController', function ($scope, $timeout, $window, supersonic, ApiProvider, ApiServiceProvider, StorageProvider, HelperProvider) {
    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var $this = this, auth, user, fields, socialPlatform;

    steroids.view.navigationBar.hide();

    // Get Event id from StorageProvider
    user = StorageProvider.get('user');

    auth = StorageProvider.get('auth');

    $scope.user = user;

    $scope.auth = auth;

    $scope.requestbtn = false;

    $scope.isFriend = false;

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
    $this.initialLoad = function () {
      // Check if logged in user viewing own public profile
      if (parseInt(user.id, 10) === parseInt(auth.id, 10)) {
        // Hide activity wall form if logged in user is same as public profile user
        angular.element('[data-role="update-wall"]').css({'display': 'none'});
        // Also hide friend button as user cannot friend themselves
        angular.element('.friend-requester').css({'display': 'none'});
      }

      // set calendar data array
      $scope.calendarData = {};

      // Set api key in api provider config
      ApiProvider.setConfig('apiKey', auth.apiKey);

      // Set navbar title
      $scope.navbarTitle = "Profile";

      // update wall form
      $scope.update = {
        message: null
      };

      // Pulling rsvp'd events from the logged in user
      ApiServiceProvider
        .events
        .attending(user.id, function (data) {
          // variables
          var times, time, currentIndex, myEventsFormatted, icon, monthOpts, dayOpts, eventPhoto, isMulti, days, newDate, x, dateStart, dateEnd, defaultColor, color, title, eventId;

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
              eventLimitClick: function (data) {
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
              eventClick: function (date) {
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
              eventAfterRender: function (event, element) {
                // reset colors
                element.css('color', '#FFF');
                element.css('background', event.textColor);

                if (event.end === null) {
                  // size event height to take up needed space
                  element.css('height', '950px');
                }
              },
              viewRender: function (view) {
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

    $this.initialLoad();

    fields = '&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=avatar&fields[]=friends&fields[]=friendRequests&fields[]=email&fields[]=social';

    ApiServiceProvider
      .users
      .friendRequests(user.id, fields, function (data) {
        var i;

        user = data;

        // If user has more than one social account linked, will only show first
        // This sets the social links for all users
        for (socialPlatform in user.social) {

          // Grabs the first social platform linked to account
          $scope.socialProfile = socialPlatform;

          break;
        }

        if (user && user.friendRequests) {

          // Check if user has been a friend request from logged in user
          for (i = 0; i < user.friendRequests.length; i += 1) {
            if (user.friendRequests[i].email === auth.email) {
              // turn requested button on and friend request button off
              $scope.requestbtn = true;
              // show requested text in button
              $(".friend-requester").show();
            }
          }
        }

        if (user && user.friends) {

          // Check if logged in user is friends with visitors profile
          for (i = 0; i < user.friends.length; i += 1) {
            if (user.friends[i].email === auth.email) {
              $scope.isFriend = true;
              // show friends status
              $(".friend-status").show();
              // show requested text in button
              $(".friend-requester").hide();
            }
          }
        }

      });

    //
    $scope.googlePlusLink = function () {
      $window.open('http://plus.google.com/' + user.social.google.id, '_system');
    };

    $scope.facebookLink = function () {
      $window.open('http://facebook.com/' + user.social.facebook.id, '_system');
    };

    $scope.twitterLink = function () {
      $window.open('http://twitter.com/' + user.social.twitter.username, '_system');
    };

    $scope.instagramLink = function () {
      $window.open('http://instagram.com/' + user.social.instagram.username + '?ref=badge', '_system');
    };

    // Pulling users information that have updates
    ApiServiceProvider
      .users
      .updates(user.id, function (data) {
        // Shows Friend Request
        $scope.usersComments = data.updates;
        // Shows Friends
        $scope.loggedInUser = data;
      });

    $scope.doCreateRequest = function () {
      //Api provider call
      ApiProvider
        //Remove user from friend request list http://staging-api.suaray.com/v1/users/1/friends/2/requests
        .store('users/' + escape(auth.id) + '/friends/' + escape(user.id) + '/requests')
        .success(function (response) {
          if (response.success && response.success === true) {
            // change friend request title to requested
            $scope.requestbtn = true;
          }
        });
    };

    // Refresh views once request are accepted
    angular.element('[data-role="update-wall"]').submit(function () {
      var message, userId, data;

      // Get query value
      message = $scope.update.message;

      // User ID authenication
      userId = auth.id;

      // Define comment data
      data = {
        userId: user.id,
        friendId: userId,
        message: message
      };

      // Api Call to store and accept friend request
      ApiProvider
        .store('usersupdates', data)
        .success(function (response) {
          // if theres data
          if (response.success && response.success === true) {
            // Refresh views once request are accepted
            ApiServiceProvider
              .users
              .updates(user.id, function (data) {
                // Shows Friends
                $scope.loggedinuser = data;
                // Shows Friend Request
                $scope.usersComments = data.updates;
                // Clear input field after render
                $scope.update.message = null;
              });
          }
        });
    });

    fields = '&fields[]=id&fields[]=featuredPhoto&fields[]=title';
    // Get events created by user
    ApiServiceProvider
      .users
      .events(user.id, fields, function (data) {
        var events = {}, key,  eventsWithFeaturedPhoto, eventsWithFeaturedPhotoIndex;

        if (!data.error) {

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

          $scope.eventsByUser = eventsWithFeaturedPhoto;

          if (eventsWithFeaturedPhoto.length === 0) {
            $scope.eventsByUser = events;
          }
        }
      });

    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    $scope.goToPublicProfile = HelperProvider.goToPublicProfile;

  });
