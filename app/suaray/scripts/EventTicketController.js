/*jslint unparam: true */
/*jshint unused: true, node: true */
/*global angular */
angular
  .module('suaray')
  .controller('EventTicketController', function ($window, $scope, $timeout, supersonic, StorageProvider, ApiProvider, ApiServiceProvider, HelperProvider, Mediator) {

    // Invoke strict mode
    "use strict";

    // variable declaration
    var $this = this, auth, i, ticket;

    /**
     * Run actions once page is ready
     *
     * @return void
    **/
    $this.onPageReady = function () {
      auth = StorageProvider.get('auth');

      $scope.auth = auth;
      $scope.page = "tickets";
      $scope.isUpdate = null;

      $scope.ticket = {};
      $scope.reservation = {};

      $scope.tickets = [];
      $scope.reservations = [];

      // make sure ticket enabled by default
      $('.is-enabled').attr('checked', true);
    };

    /**
     * Create new ticket via api post call 
     *
     * @param data {object} - the ticket data sending to server
     * @param callback {function} - what to do with returned data
     * @return function - execute callback 
    **/
    $this.doCreateTicket = function (data, callback) {
      // create ticket / reservation
      ApiServiceProvider
        .events
        .ticket(data, function (res) {
          // success: inventory object avail with res
          if (!res.error) {
            // show success message
            if (data.isReservation !== true) {
              $scope.ticketSuccess = true;
            } else {
              $scope.reservationSuccess = true;
            }
          }

          callback(res);
        });
    };

    /**
     * Update ticket api call via put method 
     *
     * @param data {object} - the ticket data sending to server
     * @param callback {function} - what to do with returned data
     * @return function - execute callback 
    **/
    $this.doUpdateTicket = function (data, callback) {
      // update ticket / reservation 
      ApiServiceProvider
        .events
        .updateTicket(data.id, data, function (res) {
          // success: inventory object avail with res
          if (!res.error) {
            // show success message
            if (data.isReservation === 'ticket') {
              $scope.ticketSuccess = true;
            } else {
              $scope.reservationSuccess = true;
            }
          }

          callback(res);
        });
    };

    // set initial scope values
    $this.onPageReady();

    $scope.navbarTitle = 'Event Tickets';

    $scope.event = StorageProvider.get('event');

    $scope.inventory = $scope.event.ticketsInventory; 

    if ($scope.inventory && $scope.inventory.length) {

      for (i = 0; i < $scope.inventory.length; i++) {

        ticket = $scope.inventory[i];

        if (ticket.isReservation) {
          $scope.reservations.push(ticket);

        } else {
          $scope.tickets.push(ticket);
        }
      }
    }

    $scope.refresh = function () {
      Mediator.trigger('refresh');
    };

    $scope.showTickets = function () {
      // toggle active class
      $('.check-in-history').removeClass('check-in-active');
      $('.check-in-label').addClass('check-in-active');

      // show tickets
      $scope.page = 'tickets';

      // enable ticket form
      $scope.isReservation = false;
      $('.is-reservation').attr('checked', false);
    };

    $scope.showReservations = function () {
      // toggle active class
      $('.check-in-label').removeClass('check-in-active');
      $('.check-in-history').addClass('check-in-active');

      // show reservations
      $scope.page = 'reservations';

      // enable reservation form
      $scope.isReservation = true;
      $('.is-reservation').attr('checked', true);
    };

    $scope.showTicketForm = function () {
      $scope.page = 'create';
       
      $scope.ticket = {};
      $scope.reservation = {};
      $scope.isUpdate = null;
    };

    $scope.showReservationForm = function ($event) {
      var $target = $($event.target);

      $scope.isReservation = ($target.is(':checked')) ? true : false;
    };
    
    $scope.editTicket = function (ticket) {
      // convert date strings to date object
      ticket.startsAt = (ticket.startsAt) ? new Date(ticket.startsAt) : null;
      ticket.endsAt = (ticket.endsAt) ? new Date(ticket.endsAt) : null;

      // set correct scope value based on if its reservation
      if (ticket.isReservation || ticket.is_reservation) {
        // add scope form values
        $scope.reservation = ticket;
        $scope.isReservation = true;

        // check reservation checkbox
        $scope.ticket.is_reservation = true;
      } else {
        // add scope form values
        $scope.ticket = ticket;
        $scope.ticket.is_reservation = false;
        $scope.isReservation = false;
      }
      // if reservation enabled
      if (ticket.isEnabled || ticket.is_enabled) {
        // check enable checkbox
        $scope.ticket.isEnabled = true;
      } else {
        $scope.ticket.isEnabled = false;
      }

      // show ticket / reservation form with update flag
      $scope.page = 'create';
      $scope.isUpdate = true;
    };

    $scope.submitNewTicket = function (isUpdate) {
      var which, data, isValid = true, ticketValids, resValids;

      // determine which form was used
      which = ($scope.isReservation) ? "reservation" : "ticket";

      ticketValids = {
        name: 'showTicketNameField',
        amount: 'showTicketPriceField',
        inventory: 'showTicketInventoryField'
      };

      resValids = {
        name: 'showResNameField',
        amount: 'showResPriceField',
        inventory: 'showResInventoryField',
        description: 'showResDescriptionField',
        confirmationMessage: 'showResConfirmationField'
      };

      // validation
      switch (which) {

      case 'ticket':
        angular.forEach(resValids, function (value) {
          // hide res errors 
          $scope[value] = false;
        });

        angular.forEach(ticketValids, function (value, key) {
          // show ticket errors if any
          $scope[value] = (!$scope.ticket[key]) ? true : false;

          // check for any errors
          if ($scope[value] === true) {
            isValid = false;
          }
        });
        break;

      case 'reservation':
        angular.forEach(ticketValids, function (value) {
          // hide ticket errors
          $scope[value] = false;
        });

        angular.forEach(resValids, function (value, key) {
          // show reservation errors if any
          $scope[value] = (!$scope.reservation[key]) ? true : false;

          // check for any errors
          if ($scope[value] === true) {
            isValid = false;
          }
        });
        break;
      }

      if (isValid === true) {
        // pull $scope data based on which
        data = (which === 'ticket') ? $scope.ticket : $scope.reservation;

        // add isReservation flag and enabled / disabled
        data.isReservation = $scope.isReservation || false;
        data.isEnabled = ($('.is-enabled').is(':checked')) ? true : false;

        // add needed id's
        data.user_id = auth.id;
        data.event_id = $scope.event.id;

        if (!isUpdate) {

          $this.doCreateTicket(data, function (ticket) {
            // if we get response back
            if (ticket && HelperProvider.isObj(ticket)) {
              // add to correct scope array
              if (ticket.isReservation || ticket.is_reservation) {

                $scope.reservations.push(ticket);
              } else {

                $scope.tickets.push(ticket);
              }
            }

            // show main tickets view
            $scope.showTickets();
          });
        } else {

          $this.doUpdateTicket(data, function (res) {
            var t, ticket, key = which + 's';

            // if we get object back
            if (res && HelperProvider.isObj(res)) {

              // replace object in scope with updated one
              for (t in $scope[key]) {

                if ($scope[key].hasOwnProperty(t)) {
                  ticket = $scope[key][t];

                  // find matching ticket
                  if (res.id === ticket.id) {
                    // replace with updated
                    $scope[key][t] = res;
                  }
                }
              }
            }

            // show main tickets list
            $scope.showTickets();
          });
        }
      }
    };

  });
