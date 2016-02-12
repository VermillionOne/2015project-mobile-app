/*jslint unparam: true, indent:2*/
/*global angular,window,console,$,steroids,jQuery,Stripe,suarayConfig,suarayEnv */
angular
  .module('suaray')
  .controller('TicketController', function ($scope, $timeout, $animate, supersonic, HelperProvider, StorageProvider, DeviceTypeFactory, ApiServiceProvider) {

    // Invoke strict mode
    "use strict";

    var auth, event, purchase, mobileSettings;

    // Set auth data
    auth = StorageProvider.get('auth');

    // Get Event id from StorageProvider
    event = StorageProvider.get('event');

    // Get tickets id selected for purchase
    purchase = StorageProvider.get('purchase');

    // get settings
    mobileSettings = StorageProvider.get('settings');

    $scope.auth = auth;

    $scope.event = event;

    $scope.navbarTitle = "Tickets";

    $scope.purchase = purchase;

    $scope.response = {};

    $scope.response.error = {};

    /**
     * Get current event via id that this ticket purchase order is for
     *
     * @param id {number} - the event id to pull
     * @return event {object}
    **/
    function getEventsById(id) {
      // Get all events that match this id #
      ApiServiceProvider
        .events
        .byId(id, function (data) {
          // ...Get event data
          event = data;
          // Assign event data to "event"
          $scope.event = event;
        });
    }

    /**
     * Add up total amount via number of tickets being purchased
     *
     * @return ticketsTotal {number}
    **/
    function totalCost() {
      var i, ticketsCost, ticketsTotal, totalQuantity, purchaseInventory;

      ticketsTotal = 0;
      totalQuantity = 0;
      purchaseInventory = {};

      for (i = 0; i < purchase.tickets.length; i += 1) {

        if (purchase.tickets[i].quantity > 0 && purchase.tickets[i].quantity !== undefined) {
          // Calculating Cost of tickets per index
          ticketsCost = purchase.tickets[i].quantity * purchase.tickets[i].price;

          // Totaling the costs in a single variable for purchase.amount
          ticketsTotal = ticketsTotal + ticketsCost;

          // Creating an object using ticketsInventoryId as the key and quantity of the ticket type per index as the value
          purchaseInventory[purchase.tickets[i].ticketsInventoryId] = purchase.tickets[i].quantity;

        }

        // round ticket total to human readable number
        ticketsTotal = parseFloat(ticketsTotal.toPrecision(ticketsTotal.toString().indexOf('.') + 2), 10);
      }

      // add total ticket cost to scope
      $scope.ticketsTotal = ticketsTotal;
      // $scope.totalQuantity = totalQuantity;
      $scope.inventory = purchaseInventory;
    }

    /**
     * Hit our api directly when posting credit card info
     *
     * @return void
    **/
    function onCardSubmit(data) {
      var t, tt, inventory, ticket, obj = {};

      // show spinner
      $scope.processingPurchase = true;

      // update purchase object
      purchase.token = '';
      purchase.billing = data;
      purchase.amount = $scope.ticketsTotal;
      purchase.inventory = $scope.inventory;

      // save purchase object to storage
      StorageProvider.set('purchase', purchase);

      // add billing obj with ticket_inventories
      obj.billing = {
        number: data.number,
        cvc: data.cvc,
        month: data.month,
        year: data.year,
      };

      // setup data to send to server
      obj.user_id = auth.id;
      obj.email = auth.email;
      obj.event_id = $scope.event.id;
      obj.amount = $scope.ticketsTotal;
      obj.zip = $scope.userBilling.zip;
      obj.name = $scope.userBilling.name;

      // create ticket inventory array
      obj.ticket_inventories = [];

      // loop through all tickets
      for (t in purchase.tickets) {
        if (purchase.tickets.hasOwnProperty(t)) {

          ticket = purchase.tickets[t];

          for (tt in purchase.ticketsInventory) {
            inventory = purchase.ticketsInventory[tt];

            // match ticket with inventory
            if (ticket.ticketsInventoryId === inventory.id) {
              // add event time id
              ticket.eventTimeId = inventory.eventTimeId;
              // add to ticket inventories array
              obj.ticket_inventories.push({
                id: ticket.ticketsInventoryId,
                quantity: ticket.quantity || "0",
                event_time_id: ticket.eventTimeId
              });

              obj.eventTimeId = ticket.eventTimeId || 0;
            }
          }
        }
      }

      // hit our API with purchase data
      ApiServiceProvider
        .users
        .purchase(obj, function (response) {
          // hide spinner
          $scope.processingPurchase = false;

          // success
          if (response && response.success === true) {
            $scope.showBox();
            $scope.purchaseError = false;
            $scope.purchaseConfirmation = true;

            $timeout(function () {
              $scope.showEventDetail();
            }, 5000);

          } else {

            if (response.error) {
              // set error message to scope
              $scope.response.error.message = response.error;

            } else {
              // show error message box
              $scope.showBox();
              $scope.purchaseConfirmation = false;
              $scope.purchaseError = true;
            }
          }
        });
    }

    // Get latest events by current ID
    getEventsById(event.id);

    // calculate total ticket cost
    totalCost();

    // custom event to submit payment form
    $('[name="payment-form"]').on('submitStripe', function (e) {
      var values, data, $form, f, field, hasErrors = false;

      $form = angular.element(this);

      values = $form.serializeArray();

      for (f in values) {
        if (values.hasOwnProperty(f)) {
          field = values[f];

          // validation
          if (field.value === '') {
            hasErrors = true;

            $scope[field.name + 'Error'] = true;
          } else {
            $scope[field.name + 'Error'] = false;
          }
        }
      }

      // stop if errors
      if (hasErrors) {
        $scope.response.error.message = 'Please fill out all form fields.';
        return false;
      }

      // grab user billing data
      data = $scope.userBilling || {};

      // post directly to our api
      onCardSubmit(data);

      return false;
    });

    $scope.showEventDetail = function () {
      // hide success box
      $scope.successBox = null;
      // hide modal
      supersonic.ui.modal.hide();
    };

    // show success / error div
    $scope.showBox = function () {
      // show success box
      $scope.successBox = true;
    };

    // trigger custom payment event
    $scope.submitPaymentForm = function () {
      var $form = angular.element('#payment-form');

      $form.trigger('submitStripe');
    };

    $scope.initialLoad = function () {
      // hide spinner
      $scope.processingPurchase = false;
    };

  });
