/*jslint unparam: true*/
/*global suarayConfig, suarayEnv*/
angular
  .module('suaray')
  .controller('TicketReceiptController', function ($scope, supersonic, HelperProvider, ApiProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var auth, ticketOrder;

    // Set auth data
    auth = StorageProvider.get('auth');

    // Set auth data in scope
    $scope.auth = auth;

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    // Get Event id from StorageProvider
    ticketOrder = StorageProvider.get('ticketOrder');

    // Pull in QR code from API
    $scope.qrCode = suarayConfig.api[suarayEnv].baseUrl + suarayConfig.endpoints.get.collections.qr + ticketOrder.code;

    ApiProvider
      .index('tickets/code/' + ticketOrder.code)
      .success(function (response) {

        // If we have events data
        if (response.data && response.data.order) {

          $scope.ticketReceipt = response.data.order;

        }
      });

    $scope.showMyTickets = function () {
      HelperProvider.showView('my-tickets');
    };

  });
