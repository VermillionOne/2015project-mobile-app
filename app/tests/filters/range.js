describe('filters.range', function () {

  "use strict";

  var $filter;

  beforeEach(module('filters'));

  beforeEach(inject(function (_$filter_) {

    $filter = _$filter_;
  }));

  it('should return array', function () {
    var range = $filter('range'),
        input = [],
        total = 5,
        output = range(input, total);

    expect(output).toEqual(jasmine.any(Array));
  });

  it('should return array with correct range', function () {
    var range = $filter('range'),
        output = range([], 5);

    expect(output).toEqual([
      0, 1, 2, 3, 4, 5
    ]);
  });

});
