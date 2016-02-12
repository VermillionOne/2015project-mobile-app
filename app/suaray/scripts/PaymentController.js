/*jslint unparam: true*/
/*jshint unused: true */
/*global suarayConfig */
angular
  .module('suaray')
  .controller('PaymentController', function ($scope, $cacheFactory, supersonic, StorageProvider, ApiServiceProvider, HelperProvider) {

    var auth, paymentFields, paymentAccount = {};

    auth = StorageProvider.get('auth');

    $scope.auth = auth;

    $scope.page = 'payment';

    $scope.accountTypes = [];

    $scope.error = {};

    $scope.cache = $cacheFactory('paymentAccount');

    /**
     * Close this payment modal and reload view 
     *
     * @return promise 
    **/
    function closeModal() {
      var options = {animate: true};

      // hide modal
      supersonic.ui.modal.hide(options);
    }

    /**
     * Action for back arrow on devices 
     *
     * @return void
    **/
    function onBackKeyDown() {
      closeModal();
    }

    /**
     * Called when device ready to apply back button action 
     * and set device platform 
     *
     * @return void
    **/
    function onDeviceReady() {
      document.addEventListener('backbutton', onBackKeyDown, false);
      suarayConfig.device = device.platform;
    }

    /**
     * Executed one page has fully loaded 
     *
     * @return void
    **/
    function onPageReady() {

      $scope.paymentAccount = {};

      $scope.email = auth.email || '';

      document.addEventListener('deviceready', onDeviceReady, false);
    }

    /**
     * Make api call to grab user stripe account data 
     *
     * @param callback {funciton} - method to execute once api call made
     * @return {function} 
    **/
    function getPaymentAccounts(callback) {
      if (!HelperProvider.isFunc(callback)) {
        return false;
      }

      if (auth.accountId && auth.accountId !== null) {

        ApiServiceProvider
          .users
          .managed(auth.accountId, function (data) {
            if (data && !data.error) {

              callback(data);
            } else {

              callback();
            }
          });
      } else {

        callback();
      }
    }

    /**
     * Make api call to update user stripe account data 
     *
     * @param callback {funciton} - method to execute once api call made
     * @return {function} 
    **/
    function updatePaymentAccounts(callback) {
      var formData, accId;

      if (!HelperProvider.isFunc(callback)) {
        return false;
      }
      
      formData = {};

      accId = auth.accountId || 'no-account';

      formData.userId = auth.id;
      formData.email = auth.email || $scope.email;

      formData.legal_entity = $scope.legal_entity;
      formData.bank_account = $scope.bank_account;

      // revisit this
      formData.tos_acceptance = {
        date: 10212015, 
        ip: '127.0.0.1'
      };

      ApiServiceProvider
        .users
        .deposit(accId, formData, function (data) {
          if (data && data.success) {

            callback(data);
          } else {
            if (data && data.message) {
              $scope.error.message = data.message;
            }

            callback();
          }
        });
    }

    function getStripeAccount(callback) {
      // grab user stripe account id data if any
      ApiServiceProvider
        .users
        .account(auth.id, function (data) {
          if (data && !data.error) {
            if (data.stripeManagedAccounts && data.stripeManagedAccounts.length > 0) {
              // set stripe payment account id to auth
              auth.accountId = data.stripeManagedAccounts[0].acctId;
            }
          }

          callback();
        });
    }

    getStripeAccount(function () {

      // grab user stripe account data if any
      getPaymentAccounts(function (data) {
        console.log('account data = ', data);

      });
    });

    // document ready callback
    $(document).ready(function () {
      var value;

      onPageReady();

      paymentFields = ['firstName', 'lastName', 'dobMonth', 'dobYear', 'dobDay', 'routingNumber', 'accountNumber', 'accountType', 'country', 'email'];

      $('input').blur(function () {

        angular.forEach(paymentFields, function (idx, str) {
          value = $('[data-stripe="' + str + '"]').val();

          if (value && HelperProvider.isStr(value)) {
            // update $scope values
            $scope.paymentAccount[str] = value;
          }
        });

        paymentAccount = $scope.paymentAccount;
      });

    });

    $scope.closeModal = closeModal;

    $scope.doUpdatePayment = function () {
      var v, $elem, valids, errors = [];
      
      // all required fields
      valids = {
        firstName: 'showNameError',
        lastName: 'showNameError',
        email: 'showEmailError',
        routingNumber: 'showRoutingError',
        accountNumber: 'showAccountError',
        accountType: 'showTypeError',
        country: 'showCountryError'
      };

      // check for errors
      angular.forEach(valids, function (value, key) {
        // grab data-stripe element
        $elem = $('[data-stripe="' + key + '"]');

        if ($elem && !$elem.val()) {
          // show error on view
          $scope[value] = true;

          errors.push(key);
        }
      });

      if (errors.length === 0) {
        
        for (v in valids) {
          // hide error icons 
          $scope[valids[v]] = false;
        }

        // do post api call
        updatePaymentAccounts(function (data) {
          if (data) {
            // close modal and reload
            closeModal();
          }
        });
      }
    };

  });
