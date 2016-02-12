describe('providers.ApiProvider', function () {

  // Invoke strict mode
  "use strict";

  var $api, $http, config;

  beforeEach(module('suaray'));

  beforeEach(module('provider.api'));

  beforeEach(inject(function (_ApiProvider_) {

    $api = _ApiProvider_;
  }));

  it('should have injectible methods', function () {

    expect($api).toEqual(jasmine.any(Object));
  });

  describe('api provider config', function () {
    var apiConfig;

    beforeEach(function () {

      $api.setConfig('apiKey', '9a18012a5cb52d207a9e7113483cda3372cf04eb');

      apiConfig = $api.getConfig();
    });

    it('should have api key', function () {

      expect(apiConfig).toBeDefined();
      expect(apiConfig.apiKey).toBeDefined();
    });

    describe('setting up api aconfig', function () {
      var config = {
        api: {
          production: {
            baseUrl: 'https://api.suaray.com/v1/'
          },
          staging: {
            baseUrl: 'http://staging-api.suaray.com/v1/'
          },
        }
      };
      
      beforeEach(function () {
        var apiConfig;

        $api.setConfig('baseUrl', config.api.staging.baseUrl);

        apiConfig = $api.getConfig();
      });

      it('should have base url defined', function () {

        expect(apiConfig.baseUrl).toBeDefined();
      });

      it('should have config equal to', function () {

        expect(apiConfig).toEqual({
          httpVerb: 'get',
          baseUrl: 'http://staging-api.suaray.com/v1/',
          apiKey: '9a18012a5cb52d207a9e7113483cda3372cf04eb'
        });

      });

    });

  });

});
