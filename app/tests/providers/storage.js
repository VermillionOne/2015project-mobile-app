describe('providers.StorageProvider', function () {

  // Invoke strict mode
  "use strict";

  var $store;

  beforeEach(module('suaray'));

  beforeEach(module('provider.storage'));

  beforeEach(inject(function (_StorageProvider_) {

    $store = _StorageProvider_;
  }));

  it('should have injectible methods', function () {

    expect($store).toEqual(jasmine.any(Object));
  });

  describe('debug method return value', function () {
    var data;

    beforeEach(function () {

      data = $store.debug();
    });

    it('should have storage data', function () {

      expect(data).toEqual(jasmine.any(Object));
    });

    it('should have correct object keys', function () {

      expect(data.key).toBeDefined();
      expect(data.data).toBeDefined();
    });

  });

  describe('clear data should empty localStorage', function () {
    var storage = localStorage, cleared;
    
    beforeEach(function () {

      cleared = $store.clear();
    });

    it('and return true', function () {

      expect(cleared).toEqual(true);
    });

  });

  describe('storage keys based on current environment', function () {
    var storageKeys, suarayKey, suarayEnv;

    storageKeys = {
      staging: 'com.shindiig.suaray.staging',
      production: 'com.shindiig.suaray.production'
    };

    beforeEach(function () {
      suarayEnv = 'staging';
      suarayKey = storageKeys[suarayEnv];
    });

    it('should have correct storage key for staging', function () {

      expect(suarayKey).toEqual('com.shindiig.suaray.staging');
    });

  });

});
