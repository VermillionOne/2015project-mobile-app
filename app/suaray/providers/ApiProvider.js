/*jslint unparam: true*/
/*global suarayEnv,suarayConfig*/
angular
  .module('provider.api', [])
  .provider('ApiProvider', function () {

    // Invoke strict mode
    "use strict";

    // Configuration values
    var config = {
      baseUrl: suarayConfig.api[suarayEnv].baseUrl,
      apiKey: null,
      httpVerb: 'get'
    };

    return {

      // Configurable settings
      setBaseUrl: function (value) {
        config.baseUrl = value;
      },

      setApiKey: function (value) {
        config.apiKey = value;
      },

      // Injectible stuff
      $get: function ($http) {

        /**
         * Get all config options
         *
         * @return {object} All available config options
         */
        function getConfig() {
          return config;
        }

        /**
         * Set a specific config value
         *
         * @param {string} key     The key name of the config value you want to set
         * @param {string} value   The actual value of the config settings
         */
        function setConfig(key, value) {
          config[key] = value;
        }

        /**
         * The API client request call to all endpoints
         *
         * @param  {string}  httpVerb  GET | POST | PUT | DELETE
         * @param  {string}  uri       events | users | user/1
         * @param  {object}  data      data array with all variables to be url encoded
         * @return {object}            The requested promise
         */
        function request(httpVerb, uri, data) {

          // Set variables
          var httpRequest, endpoint, headers;

          // Create full endpoint url
          endpoint = config.baseUrl + uri;

          // Set headers
          headers = {
            'X-User-Authorization': config.apiKey
          };

          // Create request object
          httpRequest = {
            method: httpVerb,
            url: endpoint,
            headers: headers
          };

          // Set data if available
          if (data !== undefined && data !== null) {
            httpRequest.data = data;
          }

          // Return http promise
          return $http(httpRequest)

            // Log error response from api
            .success(function (response, status, headers, config) {
              if (response.success !== true) {
                console.log('Api responded with an error: ' + response.error);
                console.log('When requesting: ' + endpoint);
                console.log(response);
              }
            })

            // Log connection error
            .error(function (response, status, headers, config) {
              console.log('Connection error while trying to access endpoint: ' + endpoint);
              console.log('Connection status code: ' + status);
            });
        }

        /**
         * Index - All elements of a resource
         *
         * @param  {string} uri   users | user | events | event
         * @return {object}       The requested promise
         */
        function index(uri) {

          // Return the promise from request method
          return request('get', uri);
        }

        /**
         * Show - A specifc element of a resource
         *
         * @param  {string} uri   users | user | events | event
         * @param  {int}    id    1 | 2 | 3 | etc
         * @return {object}       The requested promise
         */
        function show(uri, id) {

          // Return the promise from request method
          return request('get', uri + '/' + id);
        }

        /**
         * Store - A new elment of a resource
         *
         * @param  {string} uri   users | user | events | event
         * @param  {object} data  attributes / fields
         * @return {object}       The requested promise
         */
        function store(uri, data) {

          // Return the promise from request method
          return request('post', uri, data);
        }

        /**
         * Update - A existing elment of a resource
         *
         * @param  {string} uri   users | user | events | event
         * @param  {int}    id    1 | 2 | 3 | etc
         * @return {object}       The requested promise
         */
        function update(uri, id, data) {

          // Return the promise from request method
          return request('put', uri + '/' + id, data);
        }

        /**
         * Destroy the requested resource
         *
         * @param  {string} uri   users | user | events | event
         * @param  {int}    id    1 | 2 | 3 | etc
         * @return {object}       The requested promise
         */
        function destroy(uri, id) {

          // Return the promise from request method
          return request('delete', uri + '/' + id);
        }

        // Return all methods encapsulated in this parent function
        return {
          getConfig: getConfig,
          setConfig: setConfig,
          request: request,
          index: index,
          show: show,
          store: store,
          update: update,
          destroy: destroy
        };

      }

    };

  });
