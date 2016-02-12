angular
  .module('filter.limit', [])
  .filter('limitObjectTo', function () {
    // Invoke strict mode
    "use strict";

    return function(obj, limit) {
      var ret, keys, count;

      keys = Object.keys(obj);
      if (keys.length < 1) {
        return [];
      }

      ret = {};
      count = 0;
      angular.forEach(keys, function(key, arrayIndex) {
        if (count >= limit) {
          return false;
        }
        ret[key] = obj[key];
        count += 1;
      });

      return ret;
    };
  });
