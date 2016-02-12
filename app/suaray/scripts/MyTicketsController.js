/*global escape,angular,supersonic*/
/*jslint unparam: true, indent: 2*/
angular
  .module('suaray')
  .controller('MyTicketsController', function ($scope, supersonic, HelperProvider, ApiServiceProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var auth, initialOnLoad;

    $scope.navbarTitle = "My Tickets";

    $scope.myTicketsSearch = null;

    initialOnLoad = function () {
      // Get logged in users ID
      auth = StorageProvider.get('auth');

      // Set auth data in scope
      $scope.auth = auth;

      ApiServiceProvider
        .users
        .codes(auth.id, function (data) {

          var i, orders;

          orders = [];

          if (!data.error) {

            for (i = 0; i < data.length; i += 1) {
              if (data[i].types !== null) {
                orders.push(data[i]);
              }
              if (i > 0) {
                $scope.ticketsPresent = true;
              }
              $scope.orders = orders;
            }

          } else {

            $scope.ticketsPresent = false;

            $scope.myTicketsError = data.error;

          }
        });

      // fire api call on 4th character
      angular.element('.my-tickets-input').keyup(function (e) {
        var code;

        code = $(this).val();

        // codes are only 4 characters
        if (code && code.length === 5) {
          // fire search button call
          angular.element('.my-tickets-search-enter-button').click();
        }
      });
    };

    // Reload API data for accurate user/ticket data
    supersonic.ui.drawers.whenDidClose(function () {
      initialOnLoad();
    });

    // Initial load for API data
    initialOnLoad();

    $scope.goToTicketReceipt = HelperProvider.goToTicketReceipt;

  });
