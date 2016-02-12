/*jslint unparam: true*/
/*global window,supersonic,suarayConfig,Bugsnag,jsSHA*/
angular
  .module('provider.social', [])
  .factory('SocialProvider', function ($window, $http, $timeout, supersonic, HelperProvider, StorageProvider) {

    // Invoke strict mode
    "use strict";

    // Variable declar
    var config, JsSHA;

    // Reference to suaray
    config = suarayConfig;

    // re-reference jsSha for lint purposes
    JsSHA = jsSHA;

    /**
    * Takes authorized url and parses key / value pairs
    *
    * @param {string} url - the url to parse
    * @return {object} obj - new object with key / value from url
    **/
    function parseAuthParams(response) {
      // Variable declaration
      var obj = {}, params, index, parts, key, value;

      // Get auth params
      params = response.split('&');

      // Save user auth params
      for (index in params) {

        if (params.hasOwnProperty(index)) {

          if (!HelperProvider.isFunc(params[index])) {
            // Get key / value
            parts = params[index];
            parts = (params[index]).split('=');

            // If we have a value for this key
            if (parts[1] !== undefined) {
              // Set key / value
              key = parts[0];
              value = unescape(parts[1]);

              // Set object
              obj[key] = value;
            }
          }
        }
      }

      return obj;
    }

    /**
    * Creates random string nounce
    *
    * @param {int} length - how long string should be
    * @return {string} text - randomly created string
    **/
    function createNonce(length) {
      var text = '', i,
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }

    /**
    * Sign an Oauth 1.0 request
    *
    * @param {string} method
    * @param {string} endPoint
    * @param {object} headerParameters
    * @param {object} bodyParameters
    * @param {string} secretKey
    * @param {string} tokenSecret (optional)
    * @return {object} - signed oAuth Objectt
    **/
    function createSignature(method, endPoint, headerParameters, bodyParameters, secretKey, tokenSecret) {
      var i, headBodyParams, bodyKeys, sigBase, headBodyKeys, sigObj, toeknSecret, headParamKeys, authHeader;

      headBodyParams = angular.copy(headerParameters);
      bodyKeys = Object.keys(bodyParameters);

      for(i = 0; i < bodyKeys.length; i++) {
        headBodyParams[bodyKeys[i]] = encodeURIComponent(bodyParameters[bodyKeys[i]]);
      }

      sigBase = method + "&" + encodeURIComponent(endPoint) + "&";
      headBodyKeys = (Object.keys(headBodyParams)).sort();

      for(i = 0; i < headBodyKeys.length; i++) {

        if(i == headBodyKeys.length - 1) {

          sigBase += encodeURIComponent(headBodyKeys[i] + "=" + headBodyParams[headParamKeys[i]]);

        } else {

          sigBase += encodeURIComponent(headBodyKeys[i] + "=" + headBodyParams[headParamKeys[i]] + "&");
        }
      }

      sigObj = new JsSHA(sigBase, "TEXT");
      tokenSecret = '';

      if (tokenSecret) {
        tokenSecret = encodeURIComponent(tokenSecret);
      }

      headerParameters.oauth_signature = encodeURIComponent(sigObj.getHMAC(encodeURIComponent(secretKey) + "&" + tokenSecret, "TEXT", "SHA-1", "B64"));

      headParamKeys = Object.keys(headerParameters);
      authHeader = 'OAuth ';

      for(i = 0; i < headParamKeys.length; i++) {

        if(i == headParamKeys.length - 1) {

          authHeader += headParamKeys[i] + '="' + headerParameters[headParamKeys[i]] + '"';

        } else {

          authHeader += headParamKeys[i] + '="' + headerParameters[headParamKeys[i]] + '",';
        }
      }

      return {
        signature_base_string: sigBase,
        authorization_header: authHeader,
        signature: headerParameters.oauth_signature
      };
    }

    /**
    * Creates Browser window reference (popup)
    *
    * @param {string} url - the url to open
    * @return null
    **/
    function createBrowserRef(url) {
      // Variable declaration
      var ref, auth, response, options;

      // Get code from social provider (popup)
      return (function () {
        options = 'toolbar=yes,location=no,clearsessioncache=yes,clearcache=yes';

        ref = $window.open(url, '_blank', options);

        ref.addEventListener('loadstart', function (event) {
          // Check for success page
          if (event.url.indexOf('/auth/success') !== -1) {
            // Close popup
            ref.close();

            // Get response from API
            response = (event.url).split('?')[1];

            // Create auth object with returned params
            auth = parseAuthParams(response);

            // Set Bugsnag user
            Bugsnag.user = auth;

            // Save auth
            StorageProvider.set('auth', auth);

            // Enable drawer gestures
            HelperProvider.drawerEnableGestures();

            // Go to home view
            HelperProvider.showView('featured');

          } else if (event.url.indexOf('/auth/error') !== -1 && event.url.indexOf('exitWindow=1') !== -1) {
            // Close popup
            ref.close();

            // Login Failed
            supersonic.logger.log('Error :: Failed to login :: ' + event.url);
          }
        });

      })();
    }

    return {
      /**
      * Returns object with needed auth properties and values
      **/
      parseAuthParams: parseAuthParams,

      /**
      * Attempts to login to App via Google oAuth API
      **/
      google: function (location) {
        // Variable declaration
        var url, redirect, clientId;

        // Grab client id from config
        clientId = config.social.keys.google;

        // Redirect uri
        redirect = config.api[suarayEnv].baseUrl + config.endpoints.post.auth.cb + '?location=' + location.latitude + ',' + location.longitude;

        // Google url
        url = 'https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect + '&scope=https://www.googleapis.com/auth/plus.me&approval_prompt=force&response_type=code';

        // Make call with popup
        createBrowserRef(url);
      },

      /**
      * Attempts to login to App via Instagram oAuth API
      **/
      instagram: function (location) {
        // Variable declaration
        var url, redirect, clientId;

        // Grab client id from config
        clientId = config.social.keys.instagram;

        // Redirect uri
        redirect = config.api[suarayEnv].baseUrl + config.endpoints.post.auth.cb + '?location=' + location.latitude + ',' + location.longitude;

        // Instagram url
        url = 'https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirect + '&response_type=code';

        // Make call with popup
        createBrowserRef(url);
      },

      /**
      * Attempts to login to App via Facebook oAuth API
      **/
      facebook: function (location) {
        // Variable declaration
        var url, redirect, clientId;

        // FB client id for API access
        clientId = config.social.keys.facebook;

        // Redirect uri
        redirect = config.api[suarayEnv].baseUrl + config.endpoints.post.auth.cb + '?location=' + location.latitude + ',' + location.longitude;

        // Facebook url
        url = 'https://www.facebook.com/v2.0/dialog/oauth?client_id=' + clientId + '&redirect_uri=' + redirect + '&response_type=code&scope=public_profile,email';

        // Make call with popup
        createBrowserRef(url);
      },

      /**
      * Attempts to login to App via Twitter oAuth API
      *
      * Twitter requires oAuth signiture and call for
      * access token to authorize further requests.
      **/
      twitter: function (location) {
        // Variable declaration
        var url, redirect, clientId, clientSecret, oauthObj, signitureObj;

        // Redirect uri
        redirect = config.api[suarayEnv].baseUrl + config.endpoints.post.auth.cb + '?location=' + location.latitude + ',' + location.longitude;

        // oAuth object for twitter signed signature
        oauthObj = {
          oauth_consumer_key: clientId,
          oauth_nonce: createNonce(10),
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
          oauth_version: "1.0"
        };

        // create signature object to send via http request to twitter API
        signatureObj = createSignature("POST", "https://api.twitter.com/oauth/request_token", oauthObj, {oauth_callback: redirect}, clientSecret);

        // make http post to request access token from twitter
        $http({
          method: "post",
          url: "https://api.twitter.com/oauth/request_token",
          headers: {
            "Authorization": signatureObj.authorization_header,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: "oauth_callback=" + encodeURIComponent(redirect)
        })
        .success(function(response) {
          // variables
          var i, params, obj = {};

          params = (response).split("&");

          // parse returned response
          for(i = 0; i < params.length; i++) {
            obj[params[i].split("=")[0]] = params[i].split("=")[1];
          }

          // Successfully pulled access / auth token
          if (obj && obj.oauth_token) {
            // add access token to authorize url
            url = 'https://api.twitter.com/oauth/authenticate?oauth_token=' + obj.oauth_token;

            // Make call with popup
            createBrowserRef(url);

          } else {
            // Failed
            supersonic.logger.log('ERROR :: Unable to find oAuth Access Token! ::', obj);
          }
        });
      }
    };
  });
