/*jslint unparam: true*/
angular
  .module('suaray')
  .controller('TicketSummmaryController', function ($scope, supersonic, HelperProvider, ApiProvider, ApiServiceProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var auth;

    // Get logged in users ID
    auth = StorageProvider.get('auth');

    // Set auth data in scope
    $scope.auth = auth;

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    /*global escape*/
    ApiServiceProvider
      .users
      .orders(auth.id, function (data) {
        var ticketsInfo, orders;

        // set ticket info object
        ticketsInfo = data;

        // set orders data
        orders = ticketsInfo.orders;

        // add ticket data to $scope
        $scope.ticketOrders = orders;

        // make api call for event data for this order
        ApiProvider
          .index('events/' + orders[0].event.id + '?fields[]=id&fields[]=featuredPhoto.url.114x88')
          .success(function(response) {
            // if we have event data
            if (response.data && response.data.event) {
              // set ticket thumbnail with featured photo of event
              $scope.ticketThumbnail = response.data.event.featuredPhoto;
            }
          });
      });

    $scope.goToTicketDetail = function (ticketOrder) {
      // attempt to fire ticketInfo event
      supersonic.data.channel('ticketInfo').publish(ticketOrder);

      // show ticket reciept view
      HelperProvider.showView('ticket-receipt');
    };
  });
