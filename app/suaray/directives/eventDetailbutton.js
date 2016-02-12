angular
  .module('directive.eventDetailbutton', [])
  .directive('eventDetailbutton', function () {

    // Invoke strict mode
    "use strict";

    // Disables button element if ng-click is pressed in attribute
    return {
      restrict: 'E',
      link: function (scope, elem, attrs) {

        // Disable blank href's or hash attributes
        if (attrs.ngClick) {
          elem.on('click', function (e) {
            e.preventDefault();
          });
        }
      }
    };
  });
