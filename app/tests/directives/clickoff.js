/*
describe('directives.ClickOff', function () {
  // Invoke strict mode
  "use strict";

  var element, outerScope, innerScope;

  beforeEach(module('suaray'));

  beforeEach(module('directive.clickOff'));

  // inject directive
  beforeEach(inject(function($rootScope, $compile) {
    element = angular.element('<super-button label="myLabel" on-click="myCallback()"></super-button>');

    outerScope = $rootScope;

    $compile(element)(outerScope);

    innerScope = element.isolateScope();

    outerScope.$digest();
  }));

  // test actual use of directive
  describe('click callback', function(clickOff) {
    var mySpy;

    beforeEach(function() {
      mySpy = spyOn(clickOff);

      outerScope.$apply(function() {
        outerScope.myCallback = mySpy;
      });
    });

    // when click off event evoked
    describe('when the directive is clicked', function() {

      beforeEach(function() {
        var event = document.createEvent("MouseEvent");

        // imulate click event
        event.initMouseEvent("click", true, true);
        element[0].children[1].dispatchEvent(event);
      });

      // test call count
      it('should be called', function() {
        // once click event is called
        // expect(mySpy.callCount).to.equal(1);
      });

    });

  });

});
*/
