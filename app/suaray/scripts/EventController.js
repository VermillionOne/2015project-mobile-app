/*jslint unparam: true, indent:2*/
/*jshint unused: true, node: true */
/*global angular,document,$,escape,steroids,google,device*/
angular
  .module('suaray')
  .controller('EventController', function ($window, $scope, $compile, $filter, $timeout, $http, supersonic, HelperProvider, ApiProvider, StorageProvider, DeviceTypeFactory, ApiServiceProvider, Mediator) {

    // Invoke strict mode
    "use strict";

    // Set variables
    var $this = this, id, event, auth, purchase, eventTimes, mobileSettings, ticketDateChange, needsReply, icons, isMenuOpen;

    /* Controller maps object */
    $this.maps = {

      /**
       * Opens native map application when user clicks anywhere on map
       *
       * @param div {dom} - the element containing google map that is clickable
       * @param event {object} - event data needed to get query parameters
       * @return void
      **/
      setHandler: function (div, event) {
        var _this = this, mapstring, lat, lng, app, regex;
        // expression to determine android
        regex = /Android|android/i;

        // store lat and lng values
        lat = event.latitude;
        lng = event.longitude;

        // build map query string
        mapstring = event.address1;
        mapstring += ' ' + event.city;
        mapstring += ' ' + event.state;
        mapstring += ' ' + event.zipcode;

        // add dom event via gmaps event object
        google.maps.event.addDomListener(div, 'click', function (e) {
          // prevent all regular gmaps events
          e.preventDefault();
          e.stopPropagation();

          // get current device platform
          app = (device) ? device.platform : null;

          if (app !== null && app.match(regex)) {

            supersonic.app.openURL('geo:?q=' + escape(mapstring));
          } else {

            supersonic.app.openURL('maps:q=' + escape(mapstring));
          }

          google.maps.event.trigger(_this, 'click');
        });
      },

      /**
       * Adds marker to passed google map object
       *
       * @param map {object} - the google map object
       * @param event {object} - the current event object to grab icon from based on category
       * @return void
      **/
      setMarker: function (map, event) {
        // Variables
        var i, latlng, icon, marker, tag, hasImg = false, cat;

        icons = ['arts', 'automotive', 'bars', 'beauty', 'casinos', 'concerts', 'conventions', 'events', 'festivals', 'home', 'hotels', 'medical', 'nightlife', 'parties', 'publicServices', 'restaurants', 'shopping', 'shows', 'traditional1', 'travel'];

        if (event && event.tags) {
          cat = event.category1 || undefined;
          tag = (event.tags[0]) ? event.tags[0].tag : undefined;
        }

        latlng = new google.maps.LatLng(event.latitude, event.longitude);

        for (i in icons) {
          if (icons.hasOwnProperty(i)) {
            if (cat && cat === icons[i]) {
              hasImg = true;
            }

            if (tag && tag === icons[i]) {
              hasImg = true;
            }
          }
        }

        if (cat && !tag) {
          // Get icon by event tag
          icon = "/icons/map-markers/" + cat + ".png";
        } else if (!cat && tag) {
          // Get icon by event tag
          icon = "/icons/map-markers/" + tag + ".png";
        } else if (!cat && !tag) {
          // set default icon
          icon = '/icons/map-markers/default.png';
        }

        if (!hasImg) {
          // set default icon
          icon = '/icons/map-markers/default.png';
        }

        // set new marker
        marker = new google.maps.Marker({
          map: map,
          title: event.title,
          position: latlng,
          icon: new google.maps.MarkerImage(icon)
        });

        // set where your located in the center of the screen
        map.setCenter(marker.getPosition());
      },

      /**
       * Initialize google maps with options and current event
       *
       * @param event {object} - the event object
       * @return void
      **/
      initialize: function (event) {
        var map, mapOptions, div;

        // zoom in to the maps set location
        mapOptions = {
          zoom: 12,
          draggable: false,
          mapControl: false,
          zoomControl: false,
          scrollWheel: false,
          scaleControl: false,
          mapTypeControl: false,
          disableDefaultUI: true,
          disableDoubleClickZoom: true
        };

        div = document.getElementById('map');

        // init google map
        map = new google.maps.Map(div, mapOptions);

        // set marker using the map and location
        this.setMarker(map, event);
        // add custom event handler to map div
        this.setHandler(div, event);
      }
    };

    // custom event to reload this view when event is updated / edited
    Mediator.on('eventUpdated', function (updated) {
      // when modal closed
      if (updated) {
        // refresh the view
        $window.location.reload();
      }
    });

    isMenuOpen = false;
    // Set to zero for incrementation in callGetRsvp();
    ticketDateChange = 0;
    // Get Event id from StorageProvider
    event = StorageProvider.get('event');

    id = event.id;
    needsReply = false;

    // Get Ticket ID
    purchase = StorageProvider.get('purchase');
    // Define Purchase Tickets scope
    purchase.tickets = [];

    // Get auth data
    auth = StorageProvider.get('auth');

    // Get mobile settings data
    mobileSettings = StorageProvider.get('settings');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    $scope.editMenu = null;
    // Set navbar title
    $scope.navbarTitle = "Event Details";
    // create reservations array
    $scope.reservations = [];
    // Set scope for ticketQueue
    $scope.ticketQueue = [];
    // hide ticket sections until settings check
    $scope.tickets = false;

    $scope.showHome = function () {
      // Go to view
      HelperProvider.showEventView('featured');
      // Grab latest featured events
      ApiServiceProvider
        .events
        .featured(function (data) {
          // Make tags available in $scope
          $scope.eventsWithTags = data;
        });
    };

    // Show home
    $scope.showEvent = function () {
      // Go to view
      $scope.page = "details";
      // Update events with similar tags
      ApiServiceProvider
        .events
        .withTags(function (data) {
          // Make tags available in $scope
          $scope.eventsWithTags = data;
        });
    };

    $scope.toggleEditDrawer = function () {
      var $menu = $('.event-drawer');

      if (isMenuOpen === false) {

        isMenuOpen = true;
        // show in scope
        $scope.editMenu = true;
        // slide menu down
        $menu.slideDown(500);

      } else {
        isMenuOpen = false;
        // slide up menu
        $menu.slideUp(500, function () {
          // hide from view when slide done
          $scope.editMenu = null;
        });
      }
    };

    // Show edit form
    $scope.editEvent = function () {
      var modalView, options;

      // hide edit menu
      $scope.toggleEditDrawer();

      modalView = new steroids.views.WebView('app/suaray/edit.html');
      options = {
        animate: true,
        disableAnimation: false
      };
      // remove un-needed event data before store
      delete $scope.event.attendees;
      delete $scope.event.comments;
      delete $scope.event.reviews;

      // store needed event data for edit modal
      StorageProvider.set('editEvent', $scope.event);

      // Go to view
      steroids.modal.show(modalView, options);
    };

    // go to new event tickets view
    $scope.editEventTickets = function () {
      var view;

      // hiden edit menu
      $scope.toggleEditDrawer();

      // remove meta data as its not needed
      delete $scope.event.meta;

      // store needed ticket data
      StorageProvider.set('event', $scope.event);

      // show tickets view
      view = new supersonic.ui.View("suaray#event-tickets");
      supersonic.ui.layers.push(view);
    };

    $scope.editEventPolls = function () {
      var view, evnt;

      evnt = {};
      evnt.id = $scope.event.id;

      // hiden edit menu
      $scope.toggleEditDrawer();

      // store needed ticket data
      StorageProvider.set('polls', $scope.event.polls);
      StorageProvider.set('event', evnt);

      // show tickets view
      view = new supersonic.ui.View("suaray#event-polls");
      supersonic.ui.layers.push(view);
    };

    $scope.editEventPhotos = function () {
      // hide edit menu dropdown
      $scope.toggleEditDrawer();
      // temp for now, need upload view
      $scope.showPhotos();
    };

    // Show invite
    $scope.showInviteFriends = function () {
      // Go to view
      $scope.page = "invite-friends";
    };

    // Show comments
    $scope.showComments = function () {
      // Go to view
      $scope.page = "comments";
    };

    // Show reviews
    $scope.showReviews = function () {
      // Go to view
      $scope.page = "reviews";
    };

    // Show Photos
    $scope.showPhotos = function () {
      // Go to view
      $scope.page = "eventPhotos";
    };

    // Show invite
    $scope.showAttendees = function () {
      // Go to view
      $scope.page = "attendees";
    };

    // Show invite
    $scope.showGoing = function () {
      // Go to view
      $scope.page = "going";
      // update active
      $('.attendee-going').addClass('active');
      $('.attendee-maybe').removeClass('active');
    };

    // Show invite
    $scope.showMaybe = function () {
      // Go to view
      $scope.page = "maybe";
      // update active
      $('.attendee-going').removeClass('active');
      $('.attendee-maybe').addClass('active');
    };

    // Show search view
    $scope.showSearch = function () {

      // Variable declarations
      var query;

      // Grabs the first tag to enter in to search more
      // If no tags available, will default search
      if (event.tags && event.tags[0] && event.tags[0].tag) {
        query = event.tags[0].tag;
      } else {
        query = ' ';
      }

      // Save
      StorageProvider.set('search', {
        query: query
      });

      // Go to view
      HelperProvider.showEventView('search-results');
    };

    // Get all events that match this id #
    ApiProvider
      .show('events', id + '?with[]=times&with[]=nextEvent&with[]=comments.user&with[]=reviews.user&with[]=nextEvent&with[]=photos&with[]=tags&with[]=ticketsInventory&with[]=polls.choices.votes&with[]=attendeesAndFriends.user')
      .success(function (response) {
        // variable declaration
        var i, userId, eventTimeId, tags, eventTags, eventTag, x, attendingUser, attendees;

        // If we have event data...
        if (response.data && response.data.event) {

          // set variable
          event = response.data.event;
          // Assign event data to "event"
          $scope.event = event;
          // Set variable for event.times
          eventTimes = event.times;

          // check for premium features
          if ($scope.event && $scope.event.isPremium) {
            $scope.reviews = true;
          }

          // Save for next view
          purchase.ticketsInventory = event.ticketsInventory;

          $scope.userId = auth.id;

          // Set Scope for accessing event times array
          $scope.eventTimes = eventTimes;

          if ($scope.eventTimes && $scope.eventTimes.length === 0) {
            $scope.purchase = false;
          }

          // Setting Reviews' and Comments' minimum for ng-repeat filter
          $scope.minReviews = 11;
          $scope.minComments = 10;
          $scope.pollTakenId = $scope.event.polls;

          $scope.maybeFriends = [];
          $scope.attendingFriends = [];

          if ($scope.event && $scope.event.polls) {
            //Check if user has been a friend request from logged in user
            for (i = 0; i < $scope.event.polls.length; i += 1) {

              $scope.pollTaken = $scope.event.polls[i].choices;

              if ($scope.pollTaken) {

                for (i = 0; i < $scope.pollTaken.length; i += 1) {

                  $scope.pollVotes = $scope.pollTaken[i].votes;

                  if ($scope.pollVotes) {

                    for (i = 0; i < $scope.pollVotes.length; i += 1) {

                      if ($scope.pollVotes[i]) {

                        $scope.pollUserId = $scope.pollVotes[i].userId;
                      }
                    }
                  }
                }
              }
            }
          }

          // Gets number of people who have rsvp'd yes and maybe to display
          $scope.attendingMaybe = 0;
          $scope.attendingYes = 0;

          // attendees = $scope.event.attendees;
          attendees = $scope.event.attendeesAndFriends;

          if (attendees) {
            for (i = 0; i < attendees.length; i++) {
              // grab attending user object
              attendingUser = attendees[i];
              // add to scope
              $scope.attendingUser = attendingUser;

              if ($scope.event.nextEvent) {
                // If user has selected yes as rsvp for the next event, count will show next event numbers only
                if (attendingUser.isYes === true && $scope.event.nextEvent.id === attendingUser.eventTimeId) {
                  // Number of people who have rsvp'd yes
                  $scope.attendingYes += 1;
                }

                // If user has selected maybe as rsvp for the next event, count will show next event numbers only
                if (attendingUser.isMaybe === true && $scope.event.nextEvent.id === attendingUser.eventTimeId) {
                  // Number of people who have rsvp'd maybe
                  $scope.attendingMaybe += 1;
                }
              }
              // make sure no duplicates
              if (!HelperProvider.checkUserArray(attendingUser.user, $scope.attendingFriends)) {
                // make sure not to add logged in user
                if (attendingUser.user.id !== auth.id && attendingUser.isYes === true) {
                  // add the rest of the attending users
                  $scope.attendingFriends.push(attendingUser.user);
                }
              }
              // make sure no duplicates
              if (!HelperProvider.checkUserArray(attendingUser.user, $scope.maybeFriends)) {
                // make sure not to add logged in user
                if (attendingUser.user.id !== auth.id && attendingUser.isMaybe === true) {
                  // add the rest of the attending users
                  $scope.maybeFriends.push(attendingUser.user);
                }
              }
            }
          }

          // Gets total number of those who rsvp'd yes or maybe for conditional to show rsvp amounts
          $scope.totalAttendees = $scope.attendingMaybe + $scope.attendingYes;

          // get all tags for similar events
          eventTags = event.tags;

          tags = '';

          if (eventTags) {
            for (x = 0; x < eventTags.length; x++) {

              eventTag = eventTags[x];

              tags += eventTag.tag + ',';
            }
          }

          // Get all similar events with current tags
          ApiServiceProvider
            .events
            .withTags(tags, function (data) {
              // Make tags available in $scope
              $scope.eventsWithTags = data;
            });

          // Initialize Google Map
          $this.maps.initialize(event);
        }

        // If we have rsvp data...
        if (response.data && response.data.event.nextEvent) {

          $scope.attendees = event.attendees;

          userId = auth.id;

          $scope.userId = userId;

          eventTimeId = event.nextEvent.id;
        }

        // Function to make RSVP options available
        $scope.resetRsvpUi = function () {
          $scope.attendingStatus = null;
          $scope.changeRsvp = false;
        };

        // Function to set the RSVP UI to show whether a response has already been given by the user
        $scope.getRsvp = function (eventId, eventTimeId, userId) {
          // Sends the eventTimeId to the ticket Inventory data to show proper event date and time in My Tickets
          if (purchase.tickestInventory) {
            for (i = 0; i < purchase.ticketsInventory.length; i += 1) {

              purchase.ticketsInventory[i].eventTimeId = eventTimeId;
            }
          }

          ApiProvider
            .index('events/' + eventId + "/times/" + eventTimeId + '/attendees?filter[and][][userId]=' + userId)
            .success(function (response) {

              var eventAttending;

              // If we have events data
              if (response.data && response.data.attendees) {

                eventAttending = response.data.attendees[0];

                // If responder answered 'yes', set 'rsvpIs' to 'isYes'
                if (eventAttending.isYes === true) {

                  $scope.attendingStatus = 'yes';
                  // show picture icon for taking pictures
                  // disable for now
                  //$scope.isAttending = true;

                } else if (eventAttending.isMaybe === true) {

                  $scope.attendingStatus = 'maybe';
                } else if (eventAttending.isNo === true) {

                  $scope.attendingStatus = 'no';
                }

                $scope.changeRsvp = true;
              }
            })
            .error(function () {
              $scope.resetRsvpUi();
            });
        };

        // Function to send response data to the API
        $scope.doUpdateRsvp = function (eventTimeIdSelected, rsvpOption) {
          var rsvp;

          rsvp = {
            userId: auth.id,
            eventTimeId: eventTimeIdSelected
          };

          $scope.data = rsvp;

          // If responder answered 'yes', set 'rsvpIs' to 'isYes'
          if (rsvpOption === 'yes') {

            rsvp.isYes = true;
          } else if (rsvpOption === 'maybe') {

            rsvp.isMaybe = true;
          } else if (rsvpOption === 'no') {

            rsvp.isNo = true;
          }

          ApiProvider
            .store('attendees', rsvp)
            .success(function (response) {
              if (response.success && response.success === true) {

                $scope.getRsvp(id, eventTimeIdSelected, userId);
              }
            });
        };

        // Set start event-detail page at its home screen
        $scope.initialLoad = function () {
          var t, ticket;

          // set initial scope values
          $scope.purchase = true;
          $scope.page = "details";
          $scope.social = false;
          $scope.invite = false;
          $scope.sendEmail = false;
          $scope.email = null;
          $scope.emailError = false;
          $scope.emailInviteSent = false;
          $scope.ticketsEnabled = 0;

          // Get email for invitation
          $scope.invites = {email: null};

          // check if payment option is enabled / disabled
          $scope.tickets = (mobileSettings.ticketsDisabled === false) ? true : false;

          if ($scope.event && $scope.event.isPremium) {
            if ($scope.tickets === true) {
              // after checking settings, check isPremium flag of event
              $scope.tickets = ($scope.event && $scope.event.isPremium) ? true : false;
            }
          }

          // check if polls option is enabled / disabled
          $scope.polls = (mobileSettings.pollsDisabled === false) ? true : false;
          if ($scope.polls === true) {

            $scope.polls = ($scope.event && $scope.event.isPremium) ? true : false;
          }

          if (eventTimeId) {
            $scope.getRsvp(id, eventTimeId, userId);
          }
          // check if user is creator of event
          if ($scope.event) {
            if (parseInt($scope.event.userId, 10) === parseInt(auth.id, 10)) {
              // show edit icon
              $scope.isOwner = true;
            }

            if ($scope.event.ticketsInventory) {
              // add reservations
              for (t = 0; t < $scope.event.ticketsInventory.length; t += 1) {

                ticket = $scope.event.ticketsInventory[t];

                if (ticket.isReservation === true && ticket.isEnabled) {
                  $scope.reservations.push(ticket);
                }
                /* jshint ignore:start */
                if (ticket.isEnabled) {
                  $timeout(function () {
                    $scope.ticketsEnabled += 1;
                  });
                }
                /* jshint ignore:end */
              }
            }
          }

          // outside popup click
          $('.popup-overlay').click(function (e) {
            e.preventDefault();
            var $target = $(e.target);

            if ($target.hasClass('popup-overlay')) {
              // hide popup
              $scope.email = null;
              $scope.invite = false;
              $scope.sendEmail = false;
              $scope.emailError = false;
            }
          });
        };

        $scope.initialLoad();

        // Functions called by event date selector through-ng-change
        // Calls the getRsvp() function to show proper UI response
        $scope.callGetRsvp = function (eventTimeIdSelected, indexType) {

          $scope.getRsvp(id, eventTimeIdSelected, auth.id);

          var rsvpDateIndex, ticketDateIndex;

          rsvpDateIndex = angular.element('[data-role="rsvp-event-date"]')[0].selectedIndex;
          ticketDateIndex = (angular.element('[data-role="ticket-event-date"]').length > 0) ? angular.element('[data-role="ticket-event-date"]')[0].selectedIndex : null;

          if (indexType === 'ticket') {
            angular.element('[data-role="rsvp-event-date"]')[0].selectedIndex = ticketDateIndex;
            ticketDateChange = ticketDateChange += 1;

          } else if (indexType === 'rsvp') {

            if (ticketDateChange > 0){

              angular.element('[data-role="ticket-event-date"]')[0].selectedIndex = rsvpDateIndex;
            } else if (ticketDateChange === 0) {

              if (ticketDateIndex !== null) {

                angular.element('[data-role="ticket-event-date"]')[0].selectedIndex = rsvpDateIndex + 1;
              }
            }
          }
          $scope.eventTimeIdSelected = (eventTimes[0]) ? eventTimes[0].id : null;
        };

        $scope.eventTimeIdSelected = (eventTimes[0]) ? eventTimes[0].id : null;

        // hide loader after all api calls
        $('.loading-overlay').fadeOut('fast');
      });

    // Grab latest featured events
    ApiServiceProvider
      .events
      .featured(function (data) {
        // Make tags available in $scope
        $scope.eventsWithTags = data;
      });

    // Submit Comments
    $('[data-role="update-comments"]').submit(function (eventId) {
      var comment, userId, data;

      // Get query value
      comment = $scope.event.comment;

      // User ID authenication
      userId = auth.id;
      eventId = event.id;

      // Define comment data
      data = {
        comment: comment,
        userId: userId,
        eventId: eventId
      };

      // Store Comments
      ApiProvider
        .store('comments', data)
        .success(function (response) {

          // if theres data
          if (response.success && response.success === true) {

            // Refresh views once request are accepted
            ApiProvider
              .show('events', escape(event.id) + '?with[]=comments.user')
              .success(function (response) {
                // If we have events data
                if (response.data && response.data.event) {
                  // Clear input field after render
                  $scope.event.comment = null;

                  $scope.event.comments = response.data.event.comments;
                }
              });
          }
        });
    });

    $scope.removePoll = function () {
      var pollId, pollChoiceId, userId;

      // Getting input of poll choice id
      pollChoiceId = $scope.event.poll;

      // SToring user id and poll id
      userId = auth.id;

      pollId = $scope.event.pollId;

      // Define poll data
      $scope.poll = {
        pollId: pollId,
        userId: userId,
        pollChoiceId: pollChoiceId
      };

      // Store Poll choices
      ApiProvider
        .store('polls/' + escape($scope.poll.pollId) + '/votes',  $scope.poll)
        .success(function (response) {

          if (response.success && response.success === true) {

            $scope.userId = $scope.pollUserId;

            // Pulls newly created poll choice
            ApiProvider
              .index('polls/' + escape($scope.poll.pollId) + '?with[]=choices.votes')
              .success(function () {

                // Returns confirmation of poll taken
                $scope.userId = $scope.pollUserId;
              });
          }
        });
    };

    // Submit Reviews
    angular.element('[data-role="update-reviews"]').submit(function (eventId) {

      var review, userId, data, rating;

      // Get query value
      review = $scope.event.review;
      rating = $scope.event.rating;

      // User ID authenication
      userId = auth.id;

      eventId = event.id;

      // Define review data
      data = {
        review: review,
        userId: userId,
        eventId: eventId,
        rating: rating
      };

      // Store Comments
      ApiProvider
        .store('reviews', data)
        .success(function (response) {
          // if theres data
          if (response.success && response.success === true) {

            // Refresh views once request are accepted
            ApiProvider
              .show('events', escape(event.id) + '?with[]=reviews.user')
              .success(function (response) {

                // If we have events data
                if (response.data && response.data.event) {

                  // Clear input field after render
                  $scope.event.review = null;
                  $scope.event.reviews = response.data.event.reviews;
                  $scope.event.rating = null;
                }
              });
          }
        });
    });

    /* Allow user to take photo while at event with native phone camera */
    $scope.takeUserPhoto = function () {
      var options;

      options = {
        quality: 50,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: "png",
        saveToPhotoAlbum: true
      };

      supersonic.media.camera.takePicture(options).then( function(result){
        supersonic.logger.debug(result);
        if (result) {
          console.log('image result = ', result);
        }
      });
    };

    // Reference event detail function in helper for similar events
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // Reference public profile function in helper
    $scope.goToPublicProfile = HelperProvider.goToPublicProfile;

    $scope.setTicketsPurchase = function () {
      var quantity, i;

      purchase.tickets = [];

      for (i = 0; i < $scope.ticketQueue.length; i += 1) {

        quantity = $scope.ticketQueue[i];

        if (quantity > 0) {
          purchase.tickets.push({
            ticketsInventoryId: purchase.ticketsInventory[i].id,
            quantity: quantity,
            name: purchase.ticketsInventory[i].name,
            price: purchase.ticketsInventory[i].amount
          });

        }

      }

      purchase.userId = auth.id;
      purchase.email = auth.email;
      purchase.event_id = event.id;
      purchase.eventTimeId = parseFloat(angular.element('[data-role="ticket-event-date"]').val());

      StorageProvider.set('purchase', purchase);
      StorageProvider.get('purchase');
    };

    $scope.goToTickets = function (eventId) {
      // Variable declarations
      var t, i, ii, ticket, view, options, reservationTextarea, reservationArray, reservationMessages, message, ticketSelect, ticketSelects, ticketIndex, ticketOrderQuantity, ticketArray, ticketOrder, data = {};

      // Get Event ID
      event = StorageProvider.get('event');
      // Modify
      event.id = eventId;

      // reset reservationMessages to 0
      reservationMessages = 0;
      reservationArray = [];
      // reset ticket array and order to 0
      ticketArray = [];
      ticketOrder = 0;

      // Set
      StorageProvider.set('event', event);
      // tickets view
      view = new supersonic.ui.View("suaray#tickets");

      if ($scope.reservations.length > 0) {

        // set needed reservation post values
        data.userId = auth.id;
        // create reservations array
        data.reservations = [];
        data.eventTimeId = parseFloat(angular.element('[data-role="ticket-event-date"]').val());
        for (ticket in $scope.reservations) {

          t = $scope.reservations[ticket];

          if (t.reply && t.reply !== '') {
            // format reservation data
            data.reservations.push({
              id: t.id,
              request: t.reply,
              eventTimeId: parseFloat(angular.element('[data-role="ticket-event-date"]').val())
            });
          }
        }

        if (data.reservations && data.reservations.length > 0) {

          reservationTextarea = angular.element('[data-role="reservationTextarea"]');

          for (i in reservationTextarea) {
            var textareaIndex = parseFloat(i);

            if (HelperProvider.isInteger(textareaIndex)) {
              message = angular.element('[data-role="reservationTextarea"]')[i].value;
              reservationArray.push(message);
              if (message.length > 0) {
                reservationMessages += 1;
              }
            }
          }
        }
        // If there are 1 or more messages, initiate confirmation to user
        if (reservationMessages > 0) {

          options = {
            message: "Your reservation request has been sent.",
            buttonLabel: "OK"
          };

          // call api with reservation reply
          $scope.doReservationUpdate(data, function () {
            // display native alert
            supersonic.ui.dialog.alert("SUARAY", options).then(function () {
              // empty out reservation reply textbox
              for (ii = 0; ii < reservationArray.length; ii += 1) {
                angular.element('[data-role="reservationTextarea"]')[ii].value = '';
              }
            });
          });

        } else {

          options = {
            message: "Please enter a message for your reservation.",
            buttonLabel: "OK"
          };
          // display native alert
          supersonic.ui.dialog.alert("SUARAY", options);
        }
      } else {

        ticketSelects = angular.element('[data-role="ticketOrderQuantity"]');

        for (ticketSelect in ticketSelects) {
          ticketIndex = parseFloat(ticketSelect);

          if (HelperProvider.isInteger(ticketIndex)) {
            ticketOrderQuantity = angular.element('[data-role="ticketOrderQuantity"]')[ticketSelect].value;
            ticketArray.push(ticketOrderQuantity);

            if (ticketOrderQuantity > 0) {
              ticketOrder += 1;
            }
          }
        }

        if (ticketOrder > 0) {
          // Go to Tickets view to complete transaction
          supersonic.ui.modal.show(view);
        } else {
          options = {
            message: "Please select how many tickets you would like to purchase.",
            buttonLabel: "OK"
          };

          // display native alert
          supersonic.ui.dialog.alert("SUARAY", options);
        }
      }
    };

    // update reservation with reply
    $scope.doReservationUpdate = function (reservations, callback) {
      var options;

      // send reply to reservation endpoint
      ApiServiceProvider
        .events
        .reservation($scope.event.id, reservations, function (data) {
          if (data && !data.error) {
            // continue
            callback();
          } else {
            // error
            options = {
              message: "We were unable to send your reservation reply.",
              buttonLabel: "OK"
            };

            // display native alert
            supersonic.ui.dialog.alert("SUARAY", options);
          }
        });
    };

    // show invite by email popup
    $scope.inviteByEmail = function () {
      // hide invite popup
      $scope.invite = false;
      // show email invite popup
      $scope.sendEmail = true;
      // auto focus input for user
      $('input[type="email"]').focus();
    };

    // send invite to provided email address via api call
    $scope.sendInviteByEmail = function () {
      // check for valid email
      if (HelperProvider.isValidEmail($scope.email)) {

        // assign email to invites object
        $scope.invites.email = $scope.email;

        // send invite without friend id
        $scope.doSendInvite(null);
      } else {

        // show error
        $scope.emailError = true;
      }
    };

    // Grabs users friend list
    ApiServiceProvider
      .users
      .friends(auth.id, function (data) {
        // Shows Friends
        $scope.friendResults = data.friends;
      });

    // Send invites to event
    $scope.doSendInvite = function (id) {
      // api POST
      ApiProvider
        .store('events/' + event.id + '/invite', {
          eventId: event.id,
          requesterId: auth.id,
          userId: id,
          email: $scope.invites.email
        })
        .success(function (response) {
          if (response && response.success) {
            if ($scope.sendEmail) {
              // reset field
              $scope.email = null;
              // hide form and show success message
              $scope.emailInviteSent = true;
            }

            $timeout(function () {
              // hide popup
              $scope.sendEmail = false;
              $scope.emailError = false;
              // hide email success message
              $scope.emailInviteSent = false;
            }, 3500);
          }
        })
        .error(function (response) {
          if (response && response.error) {
            // make sure email form is visible
            if ($scope.sendEmail) {
              // show email error
              $scope.emailError = true;
            }
          }
        });
    };

  });
