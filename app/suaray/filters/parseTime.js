// EVENT CONTROLLER
/*jslint unparam: true*/
/*global escape,jQuery,Stripe,steroids,alert*/
angular
  .module('filter.parseTimeDataFilter', [])
  .filter('parseTimeDataFilter', function () {
    // filter for displaying the start time in plain, readable Text

    // Invoke strict mode
    "use strict";

    return function (startTime) {

      if (startTime && startTime !== null) {

        startTime = startTime.replace(/-/g, '/');
        startTime = Date.parse(startTime);
      }

      return startTime;
    };
  });
