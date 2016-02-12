describe('providers.DeviceTypeProvider', function () {

  // Invoke strict mode
  "use strict";

  var DeviceProvider;

  beforeEach(module('suaray'));

  beforeEach(module('provider.device'));

  beforeEach(inject(function (_DeviceTypeFactory_) {

    DeviceProvider = _DeviceTypeFactory_;
  }));

  it('should return object', function () {

    expect(DeviceProvider).toEqual(jasmine.any(Object));
  });

  it('should have correct device types', function () {

    expect(DeviceProvider.android).toBeDefined();

    expect(DeviceProvider.iOS).toBeDefined();

    expect(DeviceProvider.iOS9).toBeDefined();
  });

});
