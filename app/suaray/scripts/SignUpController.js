/*jslint unparam: true*/
angular.module('suaray')
  .controller('SignUpController', function ($scope, supersonic, HelperProvider, ApiProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // Variable declarations
    var auth, fullName, firstName, lastName, nameArray;

    // Get user auth
    auth = StorageProvider.get('auth');

    // Set navbar title
    $scope.navbarTitle = "Sign Up";

    $scope.errorList = [];

    // Make login-body class append to the <body> tag for streching background image
    angular.element('body').addClass('login-body');

    // Range for days, months and years in birthday
    $scope.range = function (min, max, step) {
      step = step || 1;
      var input, i;
      input = [];
      for (i = min; i <= max; i += step) {
        input.push(i);
      }
      return input;
    };

    $scope.user = {

      // Input fields
      email: null,
      password: null,
      passwordConfirmation: null,
      fullName: null,
      gender: null,
      timeZoneId: 6,
      dob: null
    };

    $scope.email = {text: 'me@example.com'};

    $scope.userValidation = {
      email: /^([\w\-\.\+])+@([\w\-]+\.)+[\w\-]{2,4}$/
    };


    // Do general login
    $scope.doCreateAccount = function () {

      // Full entry of name
      fullName = $('#fullName').val();

      // Splits name into array
      nameArray = fullName.split(' ');

      // Grabs only first entry
      firstName = nameArray.shift();

      // Anything after first name submitted as last
      lastName = nameArray.join(' ');

      // Grabs first name as string to be saved
      $scope.user.firstName = firstName;

      // Grabs last name as string to be saved
      $scope.user.lastName = lastName;

      //Get user api key by credentials
      ApiProvider
        .store('users/new', {
          email: $scope.user.email,
          password: $scope.user.password,
          passwordConfirmation: $scope.user.passwordConfirmation,
          firstName: $scope.user.firstName,
          lastName: $scope.user.lastName,
          gender: $scope.user.gender,
          timeZoneId: $scope.user.timeZoneId,
          birthYear: $scope.user.birthYear,
          birthMonth: $scope.user.birthMonth,
          dob: $scope.user.dob
        })
        .success(function (response) {

          // If we have events data
          if (response.success && response.success === true) {

            // Set auth info
            auth.id = response.data.user.id;
            auth.email = response.data.user.email;
            auth.firstName = response.data.user.firstName;
            auth.lastName = response.data.user.lastName;
            auth.username = response.data.user.username;
            auth.apiKey = response.data.user.apiKey;

            // Save auth
            StorageProvider.set('auth', auth);

            // Enable drawer gestures
            HelperProvider.drawerEnableGestures();

             // Go to home view
            HelperProvider.showView('featured');
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

    // Show Sign-In
    $scope.showSignIn = function () {
      // Go to index view
      HelperProvider.showView('sign-in');
    };

    // Show Sign-In
    $scope.showTerms = function () {
      // Go to index view
      HelperProvider.showView('terms');
    };

  });


angular.module('suaray')
  .directive('sameAs', function () {
    'use strict';

    // Validates both password and password confirmation are the same
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModel) {
        /*global validate*/
        ngModel.$parsers.unshift(validate);

        // Force-trigger the parsing pipeline.
        scope.$watch(attrs.sameAs, function () {
          ngModel.$setViewValue(ngModel.$viewValue);
        });

        function checkValid(value) {
          var isValid = scope.$eval(attrs.sameAs) === value;

          ngModel.$setValidity('same-as', isValid);

          return isValid ? value : undefined;
        }

        checkValid();
      }
    };

  });
