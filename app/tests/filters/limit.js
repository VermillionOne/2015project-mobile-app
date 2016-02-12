describe('filters.limit', function () {

  // Invoke strict mode
  "use strict";

  var $filter;

  beforeEach(module('filters'));

  beforeEach(inject(function (_$filter_) {

    $filter = _$filter_;
  }));

  it('should return false if count is greater than limit', function () {
    var limit = $filter('limitObjectTo'),
        output = limit({
          key: '',
          key1: null
        }, 0);

    expect(output).toEqual({});
  });

  it('should return empty array if object has no keys', function () {
    var limit = $filter('limitObjectTo'), obj = {};

    expect(limit(obj)).toEqual([]);
  });

  it('should return object with limited keys', function () {
    var limit = $filter('limitObjectTo'),
        obj = {key1: 'value', key2: 'value'};

    expect(limit(obj, 1)).toEqual({key1: 'value'});
  });

});
