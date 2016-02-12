angular
  .module('filter.escape', [])
  .filter('escape', function () {
    // Invoke strict mode
    "use strict";

    /*global window*/
    return window.encodeURIComponent;
  });
