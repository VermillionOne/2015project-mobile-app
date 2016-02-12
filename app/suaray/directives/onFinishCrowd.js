angular
  .module('directive.onFinishCrowd', [])
  .directive('onFinishCrowd', function($timeout) {
    // Invoke strict mode
    "use strict";

    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('ngRepeatFinished');
          });
        }
      }
    };
  });
