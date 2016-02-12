/*jslint unparam: true, indent: 2*/
/*jshint unused: true, node: true */
/*global angular,console,steroids,location*/
angular
  .module('suaray')
  .controller('DrawerController', function ($scope, $timeout, supersonic, StorageProvider, HelperProvider, ApiProvider, ApiServiceProvider, Mediator) {

    // Invoke strict mode
    "use strict";

    // Variable declaration
    var auth, updateAvatar, updateNotificationsCount, mobileSettings;

    // Set navbar title
    $scope.navbarTitle = "";

    // Set scope auth on view
    $scope.auth = {
      firstName: null,
      lastName: null,
      friendRequestsCount: 0
    };

    updateAvatar = function () {
      setTimeout(function () {location.reload(); }, 2000);
    };

    // get mobile settings object from storage provider
    mobileSettings = StorageProvider.get('settings');

    /**
     * Method that sets scope variables for all drawer links based on mobile settings
     * and will enable / disable those links depending on settings value
     *
     * @return void
   **/
    function checkSettings() {
      // set scope variables for all drawer items
      $scope.featured = (mobileSettings.drawerFeaturedDisabled) ? false : true;
      $scope.categories = (mobileSettings.drawerCategoriesDisabled) ? false : true;
      $scope.map = (mobileSettings.drawerMapDisabled) ? false : true;
      $scope.create = (mobileSettings.drawerCreateDisabled) ? false : true;
      $scope.checkin = (mobileSettings.drawerCheckInDisabled) ? false : true;
      $scope.mytickets = (mobileSettings.drawerMyTicketsDisabled) ? false : true;
      $scope.friends = (mobileSettings.drawerFriendsDisabled) ? false : true;
      $scope.notifications = (mobileSettings.drawerNotificationsDisabled) ? false : true;
      $scope.crowdsurf = (mobileSettings.drawerCrowdSurfDisabled) ? false : true;
      $scope.help = (mobileSettings.drawerHelpDisabled) ? false : true;
      $scope.logout = (mobileSettings.drawerLogoutDisabled) ? false : true;
      $scope.avatar = (mobileSettings.drawerSearchDisabled) ? false : true;
      $scope.searchable = (mobileSettings.drawerAvatarDisabled) ? false : true;
    }

    // Method to update and show correct number of notifications
    // Includes friend requests and event invites
    updateNotificationsCount = function () {
      // Set default notifications count
      $scope.notificationsCount = 0;

      // Make api call using ApiServiceProvider for friend requests.
      ApiServiceProvider
        .users
        .friendRequests(auth.id, function (data) {
          // Update notifications count value
          $scope.notificationsCount += data.friendRequests.length || 0;
        });

      // Pull event invite data via ApiServiceProvider
      ApiServiceProvider
        .users
        .eventInvites(auth.id, function (data) {
          // Add number of event invites to notifications count
          $scope.notificationsCount += data.length || 0;
        });
    };

    steroids.statusBar.hide();
    // Update method
    $scope.updateInfo = function () {
      // Get auth from storage
      auth = StorageProvider.get('auth');

      // Only once we can verify that we have auth data
      if (!auth.id) {

        // Call updateInfo() again in 10 secs from now
        $timeout(function () {
          $scope.updateInfo();
        }, 10000);

        return;
      }

      // Update our scope auth data
      $scope.auth.firstName = auth.firstName;
      $scope.auth.lastName = auth.lastName;
      $scope.auth.avatar = auth.avatar + '?t=' + Math.floor(Date.now() / 1000);

      // Set full name
      $scope.fullName = auth.firstName + ' ' + auth.lastName;

      // Update notifications count value
      updateNotificationsCount();
    };

    // enable / disable drawer items
    checkSettings();

    $scope.updateInfo();

    // check for location object
    if (auth.location && auth.location.watchLocation) {
      console.log('Tracking user location.');
      // track user location
      auth.location.watch();
    }

    // Capture search query from form submit
    angular.element('[data-role="drawer-search-form"]').submit(function (e) {
      // Variable declarations
      var query;

      // Prevent the form from being submitted
      e.preventDefault();

      // Get query value
      query = angular.element('[data-role="drawer-search-form"] input').val();

      // Save
      StorageProvider.set('search', {
        query: query
      });

      // Go to search results view
      HelperProvider.showView('search-results');

      // Clears value of search input on success
      angular.element('[data-role="drawer-search-form"] input').val(null);
    });

    // Do logout
    $scope.doLogout = function () {
      // Clear auth data
      StorageProvider.set('auth', {});

      // Clear scope auth data
      $scope.auth = {};

      // Set the data to keep checking for auth data
      $scope.updateInfo();

      // Disable drawer side swipe from login screen
      HelperProvider.drawerDisableGestures();

      // Go to index view
      HelperProvider.showView('sign-in');
    };

    // Show friends
    $scope.showFriends = function () {
      // Go to friends view
      HelperProvider.showView('friends');
    };

    // Show notifications
    $scope.showNotifications = function () {
      // Clear friend request count
      // we do this, because for now, we cannot update drawer view without doing a timeout
      // so its best to remove a count that might become stale at any moment
      $scope.auth.friendRequestsCount = 0;
      // Go to view
      HelperProvider.showView('notifications');
    };

    // Show featured
    $scope.showSearch = function () {
      // Go to view
      HelperProvider.showView('advanced-search');
    };

    // Show featured
    $scope.showFeatured = function () {
      // Go to view
      HelperProvider.showView('featured');
    };

    $scope.showMyTickets = function () {
      // publish ticket loader
      Mediator.trigger('myTicketsLoader');
      // Go to view
      HelperProvider.showView('my-tickets');
    };

    // Show categories
    $scope.showCategory = function () {
      // Go to view
      HelperProvider.showView('category');
    };

    // Show profile
    $scope.showProfile = function () {
      // Go to view
      HelperProvider.showView('profile');
    };

    // Show map
    $scope.showMap = function () {
      // Go to view
      HelperProvider.showView('map');
    };

    // Show create
    $scope.showCreate = function () {
      // Go to view
      var modalView = new supersonic.ui.View("suaray#create"),
        options = {
          animate: true
        };

      supersonic.ui.modal.show(modalView, options);
    };

    // Show friends
    $scope.showFriends = function () {
      // Go to view
      HelperProvider.showView('friends');
    };

    // Show crowd
    $scope.showCrowd = function () {
      // Go to view
      HelperProvider.showView('crowd');
    };

    // Show crowd
    $scope.showSettings = function () {
      // Go to view
      HelperProvider.showView('settings');
    };

    // Show check in
    $scope.showCheckin = function () {
      // Go to view
      HelperProvider.showView('check-in');
    };

    // Get updated user info when drawer open from StorageProvider
    supersonic.ui.drawers.whenDidShow(function () {
      // Keep data current
      $scope.updateInfo();
    });

    // Request updated API call data when drawer closed
    supersonic.ui.drawers.whenDidClose(function () {
      // Keep data current
      $scope.updateInfo();
    });

    // This will be called when a new avatar image is uploaded via profile edit form in the ProfileController
    Mediator.on('newAvatar', function () {
      // update avatar when new one uploaded
      updateAvatar();

      $scope.updateInfo();
    });

    // This will call the showCreate() function from any controller publishing to the openCreate data channel
    Mediator.on('openCreate', function () {
      // show event creation view
      $scope.showCreate();
    });

    // This is used to send the user to profile after event is created
    // Or to just close the modal and revert back to last page before create event was opened
    Mediator.on('eventCreated', function (created) {
      if (created) {
        HelperProvider.showView('profile');
      }
    });

  });
