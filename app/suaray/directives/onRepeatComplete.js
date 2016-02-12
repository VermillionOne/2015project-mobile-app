angular
  .module('directive.onRepeatComplete', [])
  .directive('onRepeatComplete', function ($timeout, supersonic) {

    // Invoke strict mode
    "use strict";

    // Custom directive
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
