/*jslint unparam: true*/
/*jshint unused: true, node: true */
/*global escape*/
angular
   .module('suaray')
   .controller('FriendsController', function ($scope, $timeout, supersonic, ApiProvider, ApiServiceProvider, StorageProvider, HelperProvider) {

    //Invoke strict mode
    "use strict";

    //Get logged in users ID
    var auth;

    // Set auth data
    auth = StorageProvider.get('auth');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    $scope.navbarTitle = "Friends";

    $scope.friendResults = [];

    /**
     * Grab needed friends list from ApiServiceProvider
     *
     * @return void
    **/
    function makeUserFriendRequest() {

      // Make API calls for user friends list
      ApiServiceProvider
        .users
        .friendRequests(auth.id, function (data) {
          var idx, friend;
          
          // loop through results
          for (idx in data.friends) {
            friend = data.friends[idx];

            // check for duplicates 
            if (!HelperProvider.checkUserArray(friend, $scope.friendResults)) {
              // Shows Friends
              $scope.friendResults.push(friend);
            }
          }
        });
    }

    /**
     * Make API call with search query, callback if no results
     *
     * @param query {string} - the query string to search with
     * @param callback {function} - if no results from query, execute callback
     * @return {function / void}
    **/
    function searchForFriends(query, callback) {
      ApiServiceProvider
        .users
        .list(query, function (data) {
          // if no search results
          if (data.length === 0) {
            // execute callback
            if (callback && HelperProvider.isFunc(callback)) {
              callback();
            }
          } else {
            // set search results in scope
            $scope.userList = data;
          }
        });
    }

    /**
     * Grab needed friends list from ApiServiceProvider
     *
     * @return void
    **/
    function makeUserDataRequest() {
      var filters = '&sort[desc][]=created_at&fields[]=id&fields[]=title';

      // Get events created by user
      ApiServiceProvider
        .users
        .events(auth.id, filters, function (data) {
          // Pulls in all owned events
          $scope.myEvents = data;
        });

      // Get users friends
      makeUserFriendRequest();
    }

    // Make API Calls for users list and events
    makeUserDataRequest();

    /* workaround for IOS 9 tabs bug to show correct tab */
    angular.element('#myTab button').click(function () {
      var href, content;
      // broken in iOS 9
      // angular.element('#friends').tab('show');

      // get content ID
      href = angular.element(this).attr('href');
      // reference content section by ID
      content = angular.element(href);

      // hide all content sections
      angular.element('.tab-pane').hide();
      // show current section
      content.show();
    });

    // Changes active tab class when tab clicked
    angular.element('button.new-friends-nav').click(function () {
      // remove old tab class
      angular.element('button.clicked-friends-nav').removeClass('clicked-friends-nav');
      // update tab class
      angular.element(this).addClass('clicked-friends-nav');

      if (angular.element(this).attr('href') !== '#friend-invite') {
        // update friends list
        makeUserFriendRequest();
      }
    });

    // When search is clicked from invite tab, will change the active class
    angular.element('#search-link').click(function () {
      // update tab classes
      angular.element('#invite.clicked-friends-nav').removeClass('clicked-friends-nav');
      angular.element('#search').addClass('clicked-friends-nav');
    });

    // Reference public profile Helper method
    $scope.goToPublicProfile = HelperProvider.goToPublicProfile;

    // Send invites to event
    $scope.doSendInvite = function (id, eventId) {
      ApiProvider
        .store('events/' + eventId + '/invite', {
          eventId: eventId,
          requesterId: auth.id,
          userId: id,
        });
    };

    $scope.doSearch = function (queryText) {
      var first, last, query, waitTime;

      query = '';
      // amount of time to delay api call
      waitTime = 500;

      first = queryText.split(' ')[0];
      last = queryText.split(' ')[1];

      if (first && !last) {
        // set query to filter for first name
        query = 'filter[or][][first_name]=' + first + '*' + '&sort[asc][]=id&sort[asc][]=email&sort[asc][]=first_name';
      } else {
        // reset query to filter for both first and last name
        query = 'filter[or][][first_name]=' + first + '*' + '&filter[or][][last_name]=' + last + '*' + '&sort[asc][]=id&sort[asc][]=email&sort[asc][]=first_name';
      }

      // delay api call so one is not made every keystroke
      HelperProvider.delay(function () {

        searchForFriends(query, function () {
          // reset query to filter for username
          query = 'filter[or][][username]=' + first + '*' + '&sort[asc][]=id&sort[asc][]=email&sort[asc][]=first_name';

          // search again with username
          searchForFriends(query, function () {
            // if still no results attemp email
            query = 'filter[or][][email]=' + first + '*' + '&sort[asc][]=id&sort[asc][]=email&sort[asc][]=first_name';

            searchForFriends(query);
          });
        });
      }, waitTime);
    };

    // Delete Friend Function
    $scope.deleteFriend = function (friendId, index) {
      // Gets friends id
      var data = {
        friendId: friendId
      };

      // Api provider call
      ApiProvider
        //Remove user from friend list
        .destroy('users', escape(auth.id) + '/friends/' + escape(friendId), data)
        .success(function (response) {
          // if delete was successfull
          if (response.success && response.success === true) {

            // Removes row from friend list
            $scope.friendResults.splice(index, 1);
          }
        });
    };

    // Request updated API call data when drawer closed
    supersonic.ui.drawers.whenDidClose(function () {
      // update all data via API Call
      makeUserDataRequest();
    });

  });
