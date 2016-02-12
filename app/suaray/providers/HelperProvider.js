/*jslint unparam: true*/
/*global window,steroids,device,suarayConfig,Evaporate*/
angular
  .module('provider.helper', [])
  .provider('HelperProvider', function () {

    // Invoke strict mode
    "use strict";

    // Methods available for helper provider
    return {

      // Injectible stuff
      $get: function (supersonic, StorageProvider) {

        var delay;

        supersonic.ui.navigationBar.hide();

        /**
        * Use to get days difference between two dates
        *
        * @param a {date} - first date to compare
        * @param b {date} - second date to compare
        * @return {number} - amount of days between a and b
        **/
        function dateDiffInDays(a, b) {
          var _MS_PER_DAY = 1000 * 60 * 60 * 24,
            utc1 = Date.UTC(a.get('year'), a.get('month'), a.get('date')),
            utc2 = Date.UTC(b.get('year'), b.get('month'), b.get('date'));

          return Math.floor((utc2 - utc1) / _MS_PER_DAY);
        }

        /**
        * Use to resize elemen to match window size
        *
        * @param $el {object} - jQuery wrapped element to resize
        * @return void
        **/
        function resizeWindow($el, scroll) {
          if (!$el.height) {
            $el = $($el);
          }

          $(function () {

            $(window).resize(function () {

              $el.height($(window).height());

            });

            $(window).resize();
          });

          if (scroll) {
            // disable scrolling vertically
            $('html, body').css({
              'overflow': 'hidden',
              'height': '100%'
            });
          }
        }

        /**
        * Called in controllers to add to $scope
        *
        * @param event id - of event to view
        * @return void
        **/
        function goToEventDetail(eventId) {
          // Variable declarations
          var event, view;

          // Get
          event = StorageProvider.get('event');

          // Modify
          event.id = eventId;

          // Set
          StorageProvider.set('event', event);

          // Go to Event Detail view
          view = new supersonic.ui.View("suaray#event-detail");
          supersonic.ui.layers.push(view);
        }

        /**
        * Called in controllers to add to $scope
        *
        * @param user object - of friend or user to view
        * @return void
        **/
        function goToPublicProfile(user) {
          // Storage Provider Access
          // Variable declarations
          var view;

          // Set
          StorageProvider.set('user', user);

          // Go to Profile view
          view = new supersonic.ui.View("suaray#public-profile");
          supersonic.ui.layers.push(view);
        }

        /**
        * Called in controllers to add to $scope
        *
        * @param event id - of event to view
        * @return void
        **/
        function goToTicketReceipt(code) {
          // Variable declarations
          var ticketOrder, view;

          // Get
          ticketOrder = StorageProvider.get('ticketOrder');

          // Modify
          ticketOrder.code = code;

          // Set
          StorageProvider.set('ticketOrder', ticketOrder);

          // Go to Event Detail view
          view = new supersonic.ui.View("suaray#ticket-receipt");
          supersonic.ui.layers.push(view);
        }

        /**
         * Check passed array for existing user to prevent duplicates 
         *
         * @param user {object} - user object to check in array 
         * @param array {array} - array of user objects 
         * @return void
        **/
        function checkUserArray(user, array) {
          var index, friend;

          for (index in array) {
            friend = array[index];

            if (user.id === friend.id) {
              return true;
            }
          }

          return false;
        }

        /**
        * Called in controllers to add to turn strings into slugs for image upload
        *
        * @param event title - of title to turn to string for insertion into URI
        * @return void
        **/
        function slugify(text) {
          return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
        }

        /**
        * Used to build a comma seperated string from either an Array or Object 
        *
        * @param obj {object} - the array or object to parse 
        * @return str {string} - comma delimeted string 
        **/
        function stringify(obj) {
          var i, str = '';

          if (obj instanceof Array) {

            return obj.prototype.join.call(obj, ','); 

          } else if (obj instanceof Object) {

            for (i in obj) {
              if (obj.hasOwnProperty(i)) {

                str += i + '=' + obj[i] + ',';
              }
            }

            return str;
          }
        }

        /**
        * Called whenever photo upload settings are needed for Evaporate
        *
        * @param evap {object} - Evaporate object to apply upload settings to via stored mobile settings
        * @return evap {object} - updated evaporate settings
        **/
        function addUploadSettings(evap) {
          // get stored settings
          var mobileSettings = StorageProvider.get('settings');

          // attach upload settings to global device object
          device.upload = mobileSettings ? mobileSettings.upload : null;

          if (device.version === null) {
            device.version = '';
          }

          // Evaporate for media upload
          evap = new Evaporate({
            cloudfront: true,
            aws_key: (device.upload && device.upload.key) || null,
            bucket: (device.upload && device.upload.bucket) || null,
            aws_url: (device.upload && device.upload.bucketUrl) || null,
            // Add mobile flag to signer url
            signerUrl: (device.upload && (device.upload.signerUrl + '/' + ((device.platform).toLowerCase() === 'ios' && (device.version).substring(0, 1) === '9' ? 'ios9' : device.platform).toLowerCase())) || null
          });

          return evap;
        }

        /**
        * Delays a method call for given milliseconds 
        *
        * @param time {number} - the amount of time to wait 
        * @param callback {function} - the function to execute when time done 
        * @return {function}
        **/
        delay = (function (callback, ms) {
          var timer = 0;

          return function (callback, ms) {

            clearTimeout(timer);

            timer = setTimeout(callback, ms);
          };
        })();

        /**
        * executes passed method and only allows it to be ran once
        *
        * @param fn {function} - function to execute once
        * @param context {object} - the context to be applied to passed function
        * @return {function}
        **/
        function runOnce(fn, context) {
          var result;

          return function () {

            if (fn) {

              result = fn.apply(context || this, arguments);

              fn = null;
            }

            return result;
          };
        }

        /**
        * Check if passed object is instance of Object
        *
        * @param obj {object} - object to check
        * @return {boolean}
        **/
        function isObj(obj) {
          return angular.isObject(obj);
        }

        /**
        * Check if type is typeof value
        *
        * @param type {string} - type to check for
        * @param value {various} - object, string, function, number
        * @return {boolean}
        **/
        function isType(type, value) {
          return (typeof value === type);
        }

        /**
        * Check if passed function is indeed type function
        *
        * @param fn {function} - function to check
        * @return {boolean}
        **/
        function isFunc(fn) {
          return !!(fn && fn.constructor && fn.call && fn.apply);
        }

        /**
        * Check if valid string
        *
        * @param str {string} - string to check
        * @return {boolean}
        **/
        function isStr(str) {
          return angular.isString(str);
        }

        /**
        * Check if value is integer 
        *
        * @param value {number} - the number value to test 
        * @return {boolean}
        **/
        function isInteger(value) {
          var regex = /^-?[0-9]+$/;

          return regex.test(value);
        }

        /**
        * Check if valid email address 
        *
        * @param email {string} - email address to check
        * @return {boolean}
        **/
        function isValidEmail(email) {
          var regex;

          if (!email) {
            return false;
          }

          regex = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/i;

          return regex.test(email);
        }

        /**
        * Returns a random number between min (inclusive) and max (exclusive)
        *
        * @param min {number} - int min number of range
        * @param max {number} - int max number of range
        * @return {number} - randomly generated number bewteen passed range
        **/
        function getRandomNumber(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        /**
        * Return number of keys in first level of object
        *
        * @param obj {object} - object to size
        * @return {number} - total object size
        **/
        function getObjectSize(obj) {
          var total = 0, key;

          for (key in obj) {

            if (obj.hasOwnProperty(key)) {
              total += 1;
            }
          }

          return total;
        }

        /**
        * Get list of all US States with abbreviations
        *
        * @return {array} - of state objects with name and abbreviation
        **/
        function getStatesList() {
          // States Array
          return [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
            "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
          ];
        }

        /**
         * Opens the drawer
         *
         * @return {void}
         */
        function drawerOpen() {
          // Open the drawer
          supersonic.ui.drawers.open();
        }

        /**
         * Closes the drawer
         *
         * @return {void}
         */
        function drawerClose() {
          // Close the drawer
          supersonic.ui.drawers.close();
        }

        /**
         * Disables the side swipe from the drawer
         * note: drawer can still be called to be shown by supersonic.ui.drawers.open()
         *
         * @return {void}
         */
        function drawerDisableGestures() {
          // Updating the drawer options with a empty array disables gestures
          steroids.drawers.update({
            options: {
              openGestures: []
            }
          });
        }

        /**
         * Enables the side swipe from the drawer
         *
         * @return {void}
         */
        function drawerEnableGestures() {
          // Updates the drawer options with a the side swipe
          steroids.drawers.update({
            options: {
              openGestures: ['PanBezelCenterView']
            }
          });
        }

        /**
         * Show the requested view, equivalent of super-navigate attribute: location="suaray#home"
         *
         * @param  {string} name Example: home, index, sign-up, event-detail, etc
         * @return {void}
         */
        function showView(name) {
          // Variable declaration
          var view;

          // Close drawer
          drawerClose();

          // remove previous view
          supersonic.ui.layers.pop();

          // Create new view
          view = new supersonic.ui.View('suaray#' + name);

          // Replace current view
          view.start('suaray#' + name).then(function (startedView) {
            supersonic.ui.layers.replace(startedView);
          });

          supersonic.ui.layers.replace('suaray#' + name);
        }

        /**
         * Show the requested view for the Event Detail Page, equivalent of super-navigate attribute: location="suaray#event-detail"
         *
         * @param  {string} name Example: home, index, sign-up, event-detail, etc
         * @return {void}
         */
        function showEventView(name) {
          // Variable declaration
          var view;

          // Close drawer
          drawerClose();

          // Create new view
          view = new supersonic.ui.View('suaray#' + name);

          // Replace current view
          view.start('suaray#' + name).then(function (startedView) {
            supersonic.ui.layers.replace(startedView);
          });

          supersonic.ui.layers.replace('suaray#' + name);
        }

        /**
         * Stop the requested view, It will be destroyed and any memory used freed
         *
         * @param  {string} name Example: home, index, sign-up, event-detail, etc
         * @return {void}
         */
        function stopView(name) {

          supersonic.ui.views.stop(name).then(function () {
            supersonic.logger.log(name + ': successfully stopped and removed');
          });
        }

        function stopAllViews() {
          // Variable declaration
          var key;

          // Remove all layers
          supersonic.ui.layers.popAll();

          // For all views
          for (key in suarayConfig.views) {
            if (suarayConfig.views.hasOwnProperty(key)) {

              // Remove view
              stopView(suarayConfig.views[key]);
            }
          }
        }

        // Return all methods encapsulated in this parent function
        return {
          isObj: isObj,
          isStr: isStr,
          isType: isType,
          isFunc: isFunc,
          isInteger: isInteger,
          isValidEmail: isValidEmail,
          resizeWindow: resizeWindow,
          getStatesList: getStatesList,
          getObjectSize: getObjectSize,
          getRandomNumber: getRandomNumber,
          goToEventDetail: goToEventDetail,
          goToPublicProfile: goToPublicProfile,
          goToTicketReceipt: goToTicketReceipt,
          addUploadSettings: addUploadSettings,
          delay: delay,
          runOnce: runOnce,
          slugify: slugify,
          stringify: stringify,
          checkUserArray: checkUserArray,
          drawerDisableGestures: drawerDisableGestures,
          drawerEnableGestures: drawerEnableGestures,
          dateDiffInDays: dateDiffInDays,
          showView: showView,
          showEventView: showEventView,
          stopView: stopView,
          stopAllViews: stopAllViews,
          drawerOpen: drawerOpen,
          drawerClose: drawerClose
        };
      }
    };
  });
