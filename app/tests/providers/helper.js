describe('providers.HelperProvider', function () {

  // Invoke strict mode
  "use strict";

  var HelperProvider;

  beforeEach(module('suaray'));

  beforeEach(module('provider.helper'));

  beforeEach(inject(function (_HelperProvider_) {

    HelperProvider = _HelperProvider_;
  }));

  it('should have injectible methods', function () {

    expect(HelperProvider).toEqual(jasmine.any(Object));
  });

  describe('when helper methods invoked', function () {
    var obj = {}, 
        func = function () {},
        str = '', 
        numb = 1;

    beforeEach(inject(function (_HelperProvider_) {

      HelperProvider = _HelperProvider_;
    }));

    it('should return true', function () {
      expect(HelperProvider.isObj(obj)).toEqual(true);

      expect(HelperProvider.isStr(str)).toEqual(true);

      expect(HelperProvider.isFunc(func)).toEqual(true);
    });

    describe('and when incorrect values passed', function () {
      var obj = '',
          func = null,
          str = 0,
          numb = '9';

      beforeEach(inject(function (_HelperProvider_) {

        HelperProvider = _HelperProvider_;
      }));

      it('should return false', function () {
        expect(HelperProvider.isObj(obj)).toEqual(false);

        expect(HelperProvider.isStr(str)).toEqual(false);

        expect(HelperProvider.isFunc(func)).toEqual(false);
      });

    });

  });

  describe('check if value is integer', function () {
    var isTrue = false, 
        value = 10;

    beforeEach(function () {

      isTrue = HelperProvider.isInteger(value);
    });

    it('should return true', function () {

      expect(isTrue).toBe(true);
    });

    describe('when value is not integer', function () {
      var value = 'some string';

      beforeEach(function () {

        isTrue = HelperProvider.isInteger(value);
      });

      it('should return false', function () {

        expect(isTrue).toBe(false);
      });

    });

  });

  describe('valid email method', function () {
    var email = 'invalid@email';

    beforeEach(inject(function (_HelperProvider_) {

      HelperProvider = _HelperProvider_;
    }));

    it('should return email is invalid', function () {
      
      expect(HelperProvider.isValidEmail(email)).toEqual(false);
    });

    describe('valid email', function () {
      var email = 'valid@email.com';

      beforeEach(inject(function (_HelperProvider_) {

        HelperProvider = _HelperProvider_;
      }));

      it('should return email is valid', function () {
        
        expect(HelperProvider.isValidEmail(email)).toEqual(true);
      });

    });

  });

  describe('slugify method return value', function () {
    var title = '',
        string = 'Some Event Title to slugify';

    beforeEach(function () {

      title = HelperProvider.slugify(string);
    });

    it('should have dashes and no capitals', function () {

      expect(title).toEqual('some-event-title-to-slugify');
    });

  });

  describe('get object size based on keys', function () {
    var obj = {
      key1: 'first',
      key2: 'second',
      key3: 'third'
    },
    total = 0;

    beforeEach(function () {

      total = HelperProvider.getObjectSize(obj);
    });

    it('should return total number of keys', function () {

      expect(total).toEqual(3);
    });

  });

});
