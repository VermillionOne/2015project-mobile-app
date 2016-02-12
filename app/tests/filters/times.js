describe('filter.parseTimeDataFilter', function () {

  // Invoke strict mode
  "use strict";

  var $filter;

  beforeEach(module('filters'));

  beforeEach(inject(function (_$filter_) {

    $filter = _$filter_;
  }));

  it('should return human readable time from passed date', function () {
    var parseTime = $filter('parseTimeDataFilter'),
        date = new Date('today');

    date = date.toString();
    expect(parseTime(date)).toEqual(Date.parse(date));
  });

  it('should return same value if its null or undefined', function () {
    var parseTime = $filter('parseTimeDataFilter'),
        date = null;

    expect(parseTime(date)).toBeNull();
  });

});
