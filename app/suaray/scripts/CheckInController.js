/*jslint unparam: true, indent: 2*/
/*jshint unused: true, node: true */
/*global angular,$,document,BarcodeScanner*/
angular
  .module('suaray')
  .controller('CheckInController', function ($scope, $cordovaBarcodeScanner, supersonic, HelperProvider, ApiProvider, ApiServiceProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // initialize auth variable
    var $this = this, auth, orders, mobileSettings;

    // Get logged in users ID
    auth = StorageProvider.get('auth');

    mobileSettings = StorageProvider.get('settings');

    $scope.auth = auth;

    $scope.codeLength = 4;

    $scope.ticketCode = null;

    $scope.currentOrder = null;

    $scope.checkedInError = false;

    $scope.navbarTitle = 'Check-In';

    $scope.quantityCounter = 0;
    // enable barcode scanner camera icon in navbar
    $scope.barcode = (mobileSettings.checkInScannerDisabled) ? false : true;

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    /**
     * Run actions once page is ready
     *
     * @return void
    **/
    $this.onPageLoad = function () {
      // make sure check in view is showing
      $scope.ticketCheckIn();

      // fire api call on 4th character
      angular.element('#ticketCode').keyup(function () {
        var code;

        code = $(this).val();

        // codes are only 4 characters
        if (code && code.length === $scope.codeLength) {
          // fire enterCode with value
          angular.element('.enter-code').click();
        }
      });

      angular.element('#searchTickets').keyup(function () {
        var query;

        query = $(this).val();

        if (query.length === 0) {
          // show all history
          $scope.ticketHistory();
        }

        // codes are only 4 characters
        if (query && query.length === $scope.codeLength) {
          // fire enterCode with value
          angular.element('.enter-search').click();
        }
      });
    };

    /**
     * Search through all orders for ones with passed code
     *
     * @param code {string} - the code to search for
     * @param history {boolean} - determine if using history card or not
     * @return void
    **/
    $this.searchOrders = function (code, history) {
      // variables
      var t, order, length, i = 0, type;

      // search orders for matching code
      if (orders && orders.length > 0) {
        length = orders.length;

        // reset order arrays and currentOrder
        $scope.resetOrders();

        do {
          order = orders[i];

          if (order) {
            // format creation date
            order.createdAt = (order && order.createdAt) ? order.createdAt.split(' ')[0] : '';

            // make sure code is all uppercase
            if (order.code === angular.uppercase(code)) {
              // if order has tickets
              if (order.types && order.types.length > 0) {

                // set used in view admit counter
                $scope.used = order.types[0].qty.used;
                // set purchased in view admit counter
                $scope.available = order.types[0].qty.available;

                for (t in order.types) {
                  type = order.types[t];
                  type.quantityCounter = 0;
                }
              }

              if (order.event && order.event.title) {
                // add event name to top level of order
                order.eventName = order.event.title;
              }

              // if history search
              if (history === true) {
                // add to correct scope array
                $scope.ticketOrderHistory.push(order);
              } else {

                // assign found order
                $scope.currentOrder = order;
                // use default ticket orders array
                $scope.ticketOrders.push(order);
              }
            }
          }

          i++;
        } while(--length);

        // error message handling
        if (history !== true) {

          if ($scope.ticketOrders.length === 0) {
            // show no ticket message
            $scope.ticketError = true;
          } else {

            // enable check in button
            $('.bottom-check-in').attr('disabled', false);
          }
        } else {

          if ($scope.ticketOrderHistory.length === 0) {
            // show no ticket message
            $scope.ticketError = true;
          }
        }
      } else {

        // show no ticket message
        $scope.ticketError = true;
        $scope.ticketHistoryError = false;

        // disable check in button
        $('.bottom-check-in').attr('disabled', true);
      }
    };

    /**
     * Make API call for all available ticket orders
     *
     * @return void
    **/
    $scope.makeOrdersRequest = function (callback) {
      // call api service provider
      ApiServiceProvider
        .users
        .codes(auth.id, function (data) {
          // store all ticket orders
          if (!data.error) {

            var i;

            orders = [];

            for (i = 0; i < data.length; i += 1) {
              if (data[i].types !== null) {
                orders.push(data[i]);
              }
              if (i > 0) {
                $scope.ticketsPresent = true;
              }
              $scope.orders = orders;
            }

          }

          // use callback if avail
          if (callback && HelperProvider.isFunc(callback)) {
            // send back order data
            callback(orders);
          }
        });
    };

    // scan ticket code via camera icon
    $scope.scan = function () {
      // make sure device camera is ready
      document.addEventListener("deviceready", function () {
        supersonic.logger.debug('Device Ready to scan!');

        // initiate scanner
        $cordovaBarcodeScanner
          .scan()
          .then(function (barcodeData) {
            supersonic.logger.debug('Device Ready Scan Success!');
            supersonic.logger.debug(barcodeData);

            // if scanner was not cancelled
            if (barcodeData && barcodeData.cancelled === 0) {
              // assign found code to $scope
              $scope.ticketCode = (barcodeData.text) ? barcodeData.text : '';
              // search for code in available orders
              $this.searchOrders($scope.ticketCode, false);
            } else {

              // reset
              $scope.resetOrders();
              $scope.ticketCode = null;
            }
          }, function (error) {
            supersonic.logger.debug('Device Ready Scan Error!');
            supersonic.logger.debug(error);

          });
      }, false);
    };

    $scope.encode = function () {
      var Scanner, encodeUrl;

      // initialize custom barcode scanner object
      Scanner = new BarcodeScanner();
      // endpoint url to encode
      encodeUrl = '';

      // make sure device camera is ready
      document.addEventListener("deviceready", function () {
        supersonic.logger.debug('Device Ready to encode!');

        /* --- Encode does not work yet via AppGyver --- */
        $cordovaBarcodeScanner
          .encode(Scanner.Encode.TEXT_TYPE, encodeUrl)
          .then(function (success) {
            supersonic.logger.debug('Succes encoding.');
            supersonic.logger.debug(success);

          }, function (error) {
            supersonic.logger.debug('Error encoding.');
            supersonic.logger.debug(error);

          });
      }, false);
    };

    // reset $scope ticket orders
    $scope.resetOrders = function () {
      // empty ticket orders list
      $scope.ticketOrders = [];
      $scope.ticketOrderHistory = [];

      $scope.quantityCounter = 0;
      $scope.currentOrder = null;

      // hide no ticket error messages
      $scope.ticketError = false;
      $scope.ticketHistoryError = false;

      // disable check in button
      $('.bottom-check-in').attr('disabled',true);
    };

    // reset $scope popup
    $scope.resetPopup = function () {
      // refresh orders
      $scope.makeOrdersRequest();

      // hide popup
      $scope.checkedIn = false;
      $scope.checkedInError = false;

      $scope.resetOrders();
      $scope.ticketCode = null;
    };

    // with selected ticket code mark as checked in
    $scope.checkIn = function () {
      // variables
      var orderData, t, type, errors = 0;

      // make sure we have current order
      if ($scope.currentOrder !== null && HelperProvider.isObj($scope.currentOrder)) {
        orderData = {};

        if ($scope.currentOrder.types.length === 1) {
          type = $scope.currentOrder.types[0];

          if (type.quantityCounter === 0) {
            // show error popup
            $scope.checkedInError = true;
            return false;
          }

          // just send the quanity
          orderData[type.ticketInventoryId] = type.quantityCounter;

        } else {

          for (t in $scope.currentOrder.types) {

            type = $scope.currentOrder.types[t];

            if (type.quantityCounter === 0) {
              // add error
              errors++;
            }

            if (type.quantityCounter > 0) {
              // setup order data object with key value of inventory id and qanity
              orderData[type.ticketInventoryId] = type.quantityCounter;
            }
          }

          // if all counters are 0
          if (errors === $scope.currentOrder.types.length) {
            // show error popup
            $scope.checkedInError = true;
            return false;
          }
        }

        // post to Api with order id
        ApiProvider
          .store('tickets/code/' + $scope.currentOrder.code + '/use', orderData)
          .success(function (response) {
            // make sure we have order data
            if (response.data && response.data.order) {

              // update currentOrder used / available
              $scope.currentOrder = response.data.order;
              // show popup
              $scope.checkedIn = true;
            }
          })
          .error(function () {
            // show error popup
            $scope.checkedInError = true;
          });
      }
    };

    // search ticket history
    $scope.searchTickets = function (query) {
      // look for orders wih entered code
      $this.searchOrders(query, true);
    };

    // action to take when entering ticket code
    $scope.enterCode = function (code) {
      // look for orders wih entered code
      $this.searchOrders(code, false);
    };

    // show ticket check in section
    $scope.ticketCheckIn = function () {
      // toggle active class
      $('.check-in-history').removeClass('check-in-active');
      $('.check-in-label').addClass('check-in-active');

      // toggle active section
      $('#history').addClass('hidden');
      $('#check-in').removeClass('hidden');
      // show check in button
      $('.bottom-check-in').show();
      $('.suaray-menu-title').text('Check-In');

      // enable barcode scanner camera icon in navbar
      $scope.barcode = (mobileSettings.checkInScannerDisabled) ? false : true;

      // reset ticket orders
      $scope.resetOrders();

      // reset ticket code input
      $scope.ticketCode = null;

      // make api call for all ticket orders
      $scope.makeOrdersRequest();
    };

    // show ticket history section
    $scope.ticketHistory = function () {
      // toggle active class
      $('.check-in-label').removeClass('check-in-active');
      $('.check-in-history').addClass('check-in-active');

      // toggle active section
      $('#check-in').addClass('hidden');
      $('#history').removeClass('hidden');
      // hide check in button
      $('.bottom-check-in').hide();
      $('.suaray-menu-title').text('History');

      // hide scan icon
      $scope.barcode = false;

      // reset ticket orders
      $scope.resetOrders();

      // reset search input
      $scope.query = null;

      $scope.makeOrdersRequest(function (orders) {
        // variables
        var o, order;

        if (orders && orders.length > 0) {

          for (o in orders) {
            order = orders[o];

            order.createdAt = (order.createdAt) ? order.createdAt.split(' ')[0] : '';
          }

          // show all available orders
          $scope.ticketOrderHistory = orders;
        } else {
          // show no ticket message
          $scope.ticketHistoryError = true;
        }
      });
    };

    $scope.increaseAdmit = function (type) {
      // make sure quanity does not exceed available
      if (type.quantityCounter < type.qty.available) {

        // increment counter
        type.quantityCounter++;

        // update view
        type.qty.used = type.quantityCounter;
      }
    };

    $scope.decreaseAdmit = function (type) {
      // no negatives
      if (type.quantityCounter > 0) {

        // decrement counter
        --type.quantityCounter;

        // update view
        type.qty.used = type.quantityCounter;
      }
    };

    $scope.checkedIn = false;
    $scope.checkedInError = false;

    $scope.resetOrders();
    $scope.ticketCode = null;

    $this.onPageLoad();
  });
