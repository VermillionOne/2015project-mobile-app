describe('providers.SocialProvider', function () {

  "use strict";

  var SocialProvider, $http, config;

  beforeEach(module('suaray'));

  beforeEach(module('provider.social'));

  beforeEach(inject(function (_SocialProvider_) {

    SocialProvider = _SocialProvider_;

  }));

  it('should have injectible methods', function () {

    expect(SocialProvider).toEqual(jasmine.any(Object));
  });

});
