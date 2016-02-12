angular
  .module('filter.range', [])
  .filter('range', function () {
    // Invoke strict mode
    "use strict";

    var i;
    return function (input, total) {

      total = parseInt(total, 10);
      for (i = 0; i <= total; i += 1) {
        input.push(i);
      }
      return input;
    };
  });
