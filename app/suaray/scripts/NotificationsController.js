/*jslint unparam: true*/
/*global escape*/
angular
   .module('suaray')
   .controller('NotificationsController', function ($scope, supersonic, ApiProvider, ApiServiceProvider, StorageProvider, HelperProvider) {

    //Invoke strict mode
    "use strict";

    //Get logged in users ID
    var auth, makeServiceCall;

    // Set auth data
    auth = StorageProvider.get('auth');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    // Method to make needed ApiServiceProvider calls
    makeServiceCall = function () {
      // Make API calls friends, friend requests, and event requests
      ApiServiceProvider
        .users
        .friendRequests(auth.id, function (data) {
          // Shows Friend Request
          $scope.friendRequestResults = data.friendRequests;
          // Shows Friends
          $scope.friendResults = data.friends;
        });

      // Grab events user has been invited to from API
      ApiServiceProvider
        .users
        .eventInvites(auth.id, function (data) {
          // Shows Event Request
          $scope.eventRequestResults = data;
        });
    };

    makeServiceCall();

    // Request updated API call data when drawer closed
    supersonic.ui.drawers.whenDidClose(function () {
      makeServiceCall();
    });

    // Pull to refresh directive callback
    $scope.onReload = function () {
      supersonic.logger.log('pull to refresh callback .. working!');
      console.log('pull to refresh callback .. working!');
    };

    // If user clicks on event or close, request will be updated
    $scope.updateRequest = function (eventId, id, index) {

      ApiProvider
        .update('events/' + eventId + '/invite', id)
        .success(function (response) {

          if (response.success && response.success === true) {

            // Updates view, removes updated request
            $scope.eventRequestResults.splice(index, 1);
          }
        });
    };

    // reference public profile helper method
    $scope.goToPublicProfile = HelperProvider.goToPublicProfile;

    // reference event detail helper method
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // allow entire row to be clickable for event invites
    $scope.toEventDetail = function ($event, eventId) {
      var $target = $($event.target);

      if ($target.hasClass('close-request')) {
        return false;
      } else {
        $scope.goToEventDetail(eventId);
      }
    };

    // Delete Friend Request Function
    $scope.denyFriendRequest = function (friendId, index) {
      // Api provider call
      ApiProvider
        //Remove user from friend request list
        .destroy('users', escape(auth.id) + '/friends/' + escape(friendId) + '/requests/0')
        .success(function (response) {

          if (response.success && response.success === true) {

            // Removes row from friend request list
            $scope.friendRequestResults.splice(index, 1);
          }
        });
    };

    $scope.acceptFriend = function (friendId) {

      var data = {
        friendId: friendId
      };

      ApiProvider
        // Api Call to store and accept friend request
        .store('users/' + escape(auth.id) + '/friends', data)
        .success(function (response) {

          //if theres data
          if (response.success && response.success === true) {

            ApiServiceProvider
              .users
              .friendRequests(auth.id, function (data) {
                // Shows Friend Request
                $scope.friendRequestResults = data.friendRequests;

                // Shows Friends
                $scope.friendResults = data.friends;
              });
          }
        });
    };

  });
