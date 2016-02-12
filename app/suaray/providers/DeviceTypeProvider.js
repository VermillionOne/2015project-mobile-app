/*jslint unparam: true*/
/*jshint unused: true, node: true */
angular
  .module('provider.device', [])
  .factory('DeviceTypeFactory', function () {

    // Invoke strict mode
    "use strict";

    return {
      android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      iOS9: function () {
        return navigator.userAgent.match(/ OS 9_/i);
      }
    };
  });
