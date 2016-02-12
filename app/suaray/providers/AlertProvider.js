angular
  .module('provider.alert', [])
  .factory('AlertProvider', function ($timeout, supersonic) {

    // enable strict mode
    "use strict";

    return {

      /**
       * Custom toast like message box / dialog 
       *
       * @param msg {string} - the message to display in alert dialog
       * @param time {number} - amount of time to show dialog in miliseconds 
       * @param callback {function} - optional function to execute when alert button pressed
       * @return void
      **/
      toast: function (msg, time) {
        var $box, callback;
        // grab last passed argument which should always be a callback
        callback = [].slice.call(arguments).pop();
        if (typeof msg === 'function') {
          callback = msg;
        }

        // set default time
        time = time || 3000;
        // set default selector
        $box = $('.toast-message-box');

        // replace toast message with passed text
        if (msg && (typeof msg === 'string')) {
          $('.toast-message', $box).text(msg);
        }

        // fade in toast box
        $box.fadeIn('slow');

        $timeout(function () {
          // fade toast box out
          $box.fadeOut('slow', function () {
            // make sure callback exists and is function
            if (callback && (typeof callback === 'function')) {
              // execute callback when complete
              callback();
            }
          });
        }, time);
      },

      /**
       * Native device alert / dialog with optional params
       *
       * @param msg {string} - the message to display in alert dialog
       * @param label {string} - what the dialog button should say
       * @param callback {function} - optional function to execute when alert button pressed
       * @return void
      **/
      dialog: function (msg, label, callback) {
        var options;

        // set callback if no msg or label passed
        if (msg && (typeof msg === 'function')) {
          callback = msg;
          msg = undefined;

        } else if (label && (typeof label === 'function')) {
          callback = label;
          label = undefined;
        }

        // create dialog options obj
        options = {
          message: msg || 'Suaray Alert',
          buttonLabel: label || 'OK'
        };

        // display native dialog alert
        supersonic.ui.dialog.alert('SUARAY', options).then(function () {
          // check if callback is passed
          if (callback && (typeof callback === 'function')) {
            // execute when alter button clicked
            callback();
          }
        });
      }
    };

  });
