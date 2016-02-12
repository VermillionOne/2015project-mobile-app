angular
  .module('directive.onFinishMyEvents', [])
  .directive('onFinishMyEvents', function ($timeout) {

    // Invoke strict mode
    "use strict";

    return {
      restrict: 'A',
      link: function (scope) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('ngRepeatFinished');
          });
        }
      }
    };
  });
