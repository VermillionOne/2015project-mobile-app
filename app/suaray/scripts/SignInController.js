/*jslint unparam: true*/
/*jshint unused: true, node: true */
/*global suarayConfig,Bugsnag,navigator,device*/
angular
  .module('suaray')
  .controller('SignInController', function ($scope, $window, $timeout, supersonic, HelperProvider, ApiProvider, ApiServiceProvider, StorageProvider, SocialProvider, AlertProvider) {

    // Invoke strict mode
    "use strict";

    // Disable back button on android
    document.addEventListener('deviceready', function () {

      document.addEventListener('backbutton', function () {

        $window.history.go(-1);

      }, false);

    }, false);

    /**
     * Check if user is already loggged in
     *
     * @return void
    **/
    function checkLogin() {
      // Make sure we have a userId and apiKey
      if (auth.id && auth.apiKey && auth.id > 0 && auth.apiKey.length > 0) {

        // Set Bugsnag user
        Bugsnag.user = auth;

        // Enable drawer side swap
        HelperProvider.drawerEnableGestures();

        // Go to home view
        HelperProvider.showView('featured');
      } else {

        // Re-show the sign-in form
        $('.login-loading-overlay').hide();
        // Stop spinner
        $scope.loginLoading = false;
      }
    }

    /**
     * Grab geo targeted location using navigator and save to auth object
     *
     * @param callback {function} - method to envoke once location properties set
     * @return {function} - execute callback
    **/
    function getGeoTargetedLocation(callback) {
      var obj = {}, error, _this;

      // Alerts user that location cannot be found
      error = function () {
        AlertProvider.toast(callback);
      };

      // check for navigator support
      if (navigator && navigator.geolocation) {
        // grab user location
        navigator.geolocation.getCurrentPosition(function (position) {
          _this = obj;

          obj.latitude = position.coords.latitude;
          obj.longitude = position.coords.longitude;
          obj.watchLocation = function () {
            // keep track of user location
            navigator.geolocation.watchPosition(function (pos) {
              // update lat / long
              _this.latitude = pos.coords.latitude;
              _this.longitude = pos.coors.longitude;
            });
          };

          // callback with updated location obj
          callback(obj);

        // may need to just pass callback instead of error
        }, error, {timeout: 7500, enableHighAccuracy: true});
      } else {

        // continue
        callback();
      }
    }

    /**
     * Make API call for mobile settings (does not require authentication)
     *
     * @param callback {function} - method to envoke once api call is made
     * @reutrn {function} - execute callback with returned api data
    **/
    function getMobileSettingsData(callback) {
      // variables
      var platform;

      // get settings url based on device platform
      platform = (device) ? device.platform : null;

      if (platform && platform !== null) {
        // do this call before anything else
        ApiServiceProvider
          .collections
          [platform](function (data) {
            var key;

            // check for mobile data
            if (data && data[platform]) {
              // store upload settings in suarayConfig
              for (key in data[platform].upload) {

                if (data[platform].upload.hasOwnProperty(key)) {

                  // Do not iterate through functions
                  if (!HelperProvider.isType('function', data[platform].upload[key])) {
                    // Set config
                    suarayConfig.upload[key] = data[platform].upload[key];
                  }
                }
              }

              // store data for future use
              StorageProvider.set('settings', data[platform]);
            }

            // api call done, callback
            if (callback && HelperProvider.isFunc(callback)) {
              callback(data[platform]);
            }
          });
      }
    }

    /**
     * Callback method used on getMobileSettingsData
     *
     * @param settings {object} - data returned from parent function
     * @reutrn {function} - execute geo target method
    **/
    function onSettingsDone(settings) {
      // variables
      var key, socialKeys, isDisabledKey, isDisabled;

      // social login option keys
      socialKeys = {
        facebook: 'socialSignInFacebookDisabled',
        google: 'socialSignInGoogleDisabled',
        instagram: 'socialSignInInstagramDisabled',
        twitter: 'socialSignInTwitterDisabled'
      };

      // make sure we have settings data
      if (settings && HelperProvider.isObj(settings)) {
        // determine which social logins are enabled / disabled
        for (key in socialKeys) {

          // get social key
          isDisabledKey = socialKeys[key];

          // check if is enabled / disabled
          isDisabled = settings[isDisabledKey];

          // set key in scope to show / hide buttons
          $scope[key] = (isDisabled) ? false : true;
        }
      }

      // attach geo location properties to auth
      getGeoTargetedLocation(function (object) {
        // add location
        auth.location = object || null;
        // Perform login check
        checkLogin();
      });
    }

    // Variable declarations
    var auth;

    // Get user auth
    auth = StorageProvider.get('auth');

    // Set navbar title
    $scope.navbarTitle = "Sign In";

    // Do not show login error on view load
    $scope.showLoginError = false;

    // Do not show loader for doSignin
    $scope.loading = false;

    // Start loader
    $scope.loginLoading = true;

    $scope.locationError = false;

    // Set signin fields
    $scope.signin = {
      // Input fields
      email: null,
      password: null,
      // Validation
      validationPattern: {
        email: /^([\w\-\.\+])+@([\w\-]+\.)+[\w\-]{2,4}$/
      }
    };

    // Make login-body class append to the <body> tag for streching background image
    angular.element('body').addClass('login-body');

    // Disable drawer side swap from this login screen
    HelperProvider.drawerDisableGestures();

    // Temp hide sign-in form for check login call
    $('.login-loading-overlay').show();

    // pull mobile settings data from API and then check login status
    getMobileSettingsData(onSettingsDone);

    // Do general login
    $scope.doLogin = function () {
      var latlng = '';

      // Disable
      $scope.loginForm.$invalid = true;
      // Hide login error
      $scope.showLoginError = false;
      // Show spinning icon
      $scope.loading = true;

      if (auth && auth.location) {
        latlng = auth.location.latitude + ',' + auth.location.longitude;
      }

      // Get user api key by credentials
      ApiProvider
        .store('users/key', {
          email: $scope.signin.email,
          password: $scope.signin.password,
          location: latlng
        })
        .success(function (response) {
          // variables
          var key, tutorial;

          // If we have events data
          if (response.success && response.success === true) {

            // Hide spinning icon
            $scope.loading = false;

            // Loop through user object and attach to auth
            // keeps from having to list all auth / user properties
            for (key in response.data.user) {

              if (response.data.user.hasOwnProperty(key)) {
                // Set auth info
                auth[key] = response.data.user[key];
              }
            }
            // custom property
            auth.friendRequestsCount = response.data.user.friendRequests;

            // Set Bugsnag user
            Bugsnag.user = auth;

            // Save auth
            StorageProvider.set('auth', auth);

            // Enable drawer gestures
            HelperProvider.drawerEnableGestures();

            // check to see if tutorial has been shown
            tutorial = StorageProvider.get('tutorial');

            // if no id found for this user
            if (!tutorial[auth.id]) {
              // set true for this user
              tutorial[auth.id] = true;
              tutorial.toView = 'featured';

              // update stored tutorial object
              StorageProvider.set('tutorial', tutorial);

              // show tutorial
              HelperProvider.showView('tutorial');

            } else {
              tutorial.toView = 'settings';

              // update stored tutorial object
              StorageProvider.set('tutorial', tutorial);

              // Go to home view
              HelperProvider.showView('featured');
            }
          }
          // Disable
          $scope.loginForm.$invalid = false;
        })
        .error(function () {
          // Hide spinning icon
          $scope.loading = false;

          // Display error message
          $scope.showLoginError = true;

          // Disable
          $scope.loginForm.$invalid = false;
        });
    };

    // Instagram login
    $scope.doInstagramLogin = function () {

      SocialProvider.instagram(auth.location);
    };

    // Facebook login
    $scope.doFacebookLogin = function () {

      SocialProvider.facebook(auth.location);
    };

    // Google login
    $scope.doGoogleLogin = function () {

      SocialProvider.google(auth.location);
    };

    // Twitter login
    $scope.doTwitterLogin = function () {

      SocialProvider.twitter(auth.location);
    };

    // Show the sign up page
    $scope.showCreateAccount = function () {
      // Go to sign-up view
      HelperProvider.showView('sign-up');
    };

    $scope.showForgotPassword = function () {
      // Go to forgot-password view
      supersonic.ui.layers.push('suaray#forgot-password');
    };

  });
