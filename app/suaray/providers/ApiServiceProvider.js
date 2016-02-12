/*jslint unparam: true*/
/*jshint unused: true, node: true */
/*global suarayConfig,escape*/
angular
  .module('provider.service', [])
  .factory('ApiServiceProvider', function (supersonic, ApiProvider, StorageProvider, HelperProvider) {

    // Invoke strict mode
    "use strict";

    // Variable Declaration
    var auth, users, events, collections, post, get, userLocation;

    // Set local reference to suarayConfig
    get = suarayConfig.endpoints.get;
    post = suarayConfig.endpoints.post;

    // Set auth data
    auth = StorageProvider.get('auth');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    userLocation = (auth.location && auth.location !== null) ? '&location=' + escape(auth.location.latitude) + ',' + escape(auth.location.longitude) : '';

    /**
    * Store retrieved API data via StorageProvider
    *
    * @param url {string} - used to call API and as key
    * @param obj {object} - json object to be stored
    * @return {boolean}
    **/
    function storeData(url, data) {

      if (HelperProvider.isStr(url) && HelperProvider.isObj(data)) {

        StorageProvider.set(url, data);
      }
    }

    /**
    * Optimized method to handle common ApiProvider calls
    *
    * @param opts {object} - contains all needed properties for ApiProvider call
    * @param cb {function} - callback function that takes returned data
    * @sub opts.type {string} - ApiProvider method
    * @sub opts.key {string} - identifier for to grab returned data
    * @sub opts.params {string} = extra parameters to append to opts.uri
    * @sub opts.show {string} = extra parameters to append to uri for type show
    * @sub opts.uri {string} - the uri to access via ApiProvider
    * @return {function}
    **/
    function makeApiCall(opts) {
      var cb, data;

      cb = [].slice.call(arguments).pop();

      data = (!opts.id && opts.data) ? opts.data : undefined;

      opts.uri = (opts.params) ? opts.uri + opts.params : opts.uri;

      return (function () {

        ApiProvider
          [opts.type](opts.uri, data || opts.id || opts.show, (data) ? undefined : opts.data)
          .success(function (response) {

            if (response.data && response.data[opts.key]) {

              if (HelperProvider.isFunc(cb)) {
                cb(response.data[opts.key]);
              }
            } else {

              cb(response);
            }
          })
          .error(function (response) {

            if (response && response.error && HelperProvider.isFunc(cb)) {
              cb(response);
            }
          });

      })();
    }

    /**
    * Object with API calls related to various collection data
    **/
    collections = {

      /**
      * Get post-login meta data for ios
      *
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      ios: function (callback) {
        makeApiCall({
          type: 'index',
          key: 'settings',
          uri: get.collections.ios
        }, callback);
      },

      /**
      * Get post-login meta data for android
      *
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      android: function (callback) {
        makeApiCall({
          type: 'index',
          key: 'settings',
          uri: get.collections.android
        }, callback);
      },

      /**
      * Get array of categories
      *
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      categories: function (callback) {
        makeApiCall({
          type: 'index',
          key: 'categories',
          uri: get.collections.categories
        }, callback);
      },

      /**
      * Get array of timezones with needed time_zone_id
      *
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      timezones: function (callback) {
        makeApiCall({
          type: 'index',
          key: 'timezones',
          uri: get.collections.timezones
        }, callback);
      }
    };

    /**
    * Object with API calls related to users data
    **/
    users = {

      /**
      * Purchase tickets via Stripe form submit response
      *
      * @param data {object} - post form data
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      purchase: function (data, callback) {
        makeApiCall({
          type: 'store',
          key: 'purchase',
          data: data,
          uri: post.users.tickets
        }, callback);
      },

      /**
      * Post new stripe deposit form account data
      *
      * @param userId {number} - user id to which account should be added
      * @param data {object} - post form data
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      deposit: function (accId, data, callback) {
        if (!accId || accId === null) {
          accId = 'no-account';
        }
        makeApiCall({
          type: 'store',
          key: 'account',
          data: data,
          uri: post.users.deposit + accId
        }, callback);
      },

      /**
      * Get stripe deposit account data for specified user
      *
      * @param userId {number} - user id to grab account data for
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      account: function (userId, callback) {
        makeApiCall({
          type: 'index',
          key: 'user',
          params: get.users.accounts,
          uri: get.users.uri + '/' + escape(userId)
        }, callback);
      },

      /**
      * Get stripe account data for specified account
      *
      * @param accountId {number} - account id to grab account data for
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      managed: function (accountId, callback) {
        makeApiCall({
          type: 'index',
          key: 'account',
          uri: get.users.managed + escape(accountId)
        }, callback);
      },

      /**
      * Get all tickets with passed code includes all tickets for that order
      *
      * @param code {string} - ticket code
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      tickets: function (code, callback) {
        var filter = '';

        if (code && code !== null) {
          // check if code is function
          if (HelperProvider.isFunc(code)) {
            // assign callback
            callback = code;
          // make sure code is string
          } else if (HelperProvider.isStr(code)) {
            // add ticket code to filter string
            filter = '/' + code;
          }
        }

        makeApiCall({
          type: 'index',
          key: 'order',
          params: filter,
          uri: get.users.tickets
        }, callback);
      },

      /**
      * Get ticket orders user has purchased for specified user ID
      *
      * @param userId {number} - user id
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      orders: function (callback) {
        makeApiCall({
          type: 'index',
          key: 'ticketOrders',
          uri: get.users.orders
        }, callback);
      },

      /**
      * Get specific user data
      *
      * @param userId {number} - user id
      * @param params {string} - query string to append to endpoint url
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      data: function (userId, params, callback) {
        var  filters = get.users.fields;

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }

        makeApiCall({
          type: 'index',
          key: 'user',
          params: filters,
          uri: get.users.uri + '/' + escape(userId)
        }, callback);
      },

      /**
      * Get list of available users
      *
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      list: function (query, callback) {
        if (HelperProvider.isFunc(query)) {
          callback = query;
          query = '';
        }
        makeApiCall({
          type: 'index',
          key: 'users',
          params: '?' + query,
          uri: get.users.uri
        }, callback);
      },

      /**
      * Get users with updates
      *
      * @param userId {number} - user id
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      updates: function (userId, callback) {
        makeApiCall({
          type: 'show',
          key: 'user',
          show: escape(userId) + get.users.updates,
          uri: get.users.uri
        }, callback);
      },

      /**
      * Get user events
      *
      * @param userId {number} - user id
      * @param params {string} - query string to append to endpoint url
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      events: function (userId, params, callback) {
        var  filters = get.users.eventFields;

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }

        makeApiCall({
          type: 'index',
          key: 'events',
          params: escape(userId) + filters,
          uri: get.users.userEvents
        }, callback);
      },

      /**
      * Get events user has been invited to
      *
      * @param userId {number} - user id
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      eventInvites: function (userId, callback) {
        makeApiCall({
          type: 'show',
          key: 'resource',
          show: escape(userId) + '?fields[]=event.city',
          uri: get.events.invites
        }, callback);
      },

      /**
      * Get user friends list and friend requests
      *
      * @param userId {number} - user id
      * @param params {string} - query string to append to endpoint url
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      friends: function (userId, params, callback) {
        var  filters = '';

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }
        makeApiCall({
          type: 'show',
          key: 'user',
          show: escape(userId) + get.users.friends + filters,
          uri: get.users.uri
        }, callback);
      },

      /**
      * Get user friends list and friend requests
      *
      * @param serId {number} - user id
      * @param params {string} - query string to append to endpoint url
      * @param callback {function} - what to do with retrieved data
      * @return void
      **/
      friendRequests: function (userId, params, callback) {
        var  filters = '';

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }
        makeApiCall({
          type: 'show',
          key: 'user',
          show: escape(userId) + get.users.friendRequests + filters,
          uri: get.users.uri
        }, callback);
      },

      codes: function (userId, callback) {
        makeApiCall({
          type: 'index',
          key: 'orders',
          uri: get.users.codes + escape(userId) + '/codes'
        }, callback);
      }
    };

    /**
    * Object with API calls related to events data
    **/
    events = {

      polls: function (poll, callback) {
        makeApiCall({
          type: 'store',
          key: 'resource',
          data: poll,
          uri: post.events.polls
        }, callback);
      },

      /**
      * Update event via PUT call based on event id
      *
      * @param id {number} - the event id to update
      * @param event {object} - data to pass to server with updated values
      * @param callback {function} - what to do with retrieved data
      * @return {void}
      **/
      update: function (id, event, callback) {
        if (HelperProvider.isFunc(event)) {
          callback = event;
          event = undefined;
        }
        makeApiCall({
          type: 'update',
          key: 'resource',
          id: escape(id),
          data: (event) ? event : undefined,
          uri: get.events.uri
        }, callback);
      },

      /**
      * update ticket
      *
      * @param ticket {object} - data object to pass to server
      * @param callback {function} - what to do with retrieved data
      * @return {void}
      **/
      updateTicket: function (id, ticket, callback) {
          makeApiCall({
            type:'update',
            key:'inventory',
            id: escape(id),
            data: ticket,
            uri: get.events.tickets
          }, callback);
      },

      /**
      * Create new event via POST api call
      *
      * @param event {object} - data object to pass to server
      * @param callback {function} - what to do with retrieved data
      * @return {void}
      **/
      create: function (event, callback) {
        makeApiCall({
          type: 'store',
          data: event,
          uri: get.events.uri
        }, callback);
      },

      /**
      * Create new ticket
      *
      * @param ticket {object} - data object to pass to server
      * @param callback {function} - what to do with retrieved data
      * @return {void}
      **/
      ticket: function (ticket, callback) {
        makeApiCall({
          type: 'store',
          key: 'inventory',
          data: ticket,
          uri: get.events.tickets
        }, callback);
      },

      /**
      * Create new reservation
      *
      * @param ticket {object} - data object to pass to server
      * @param callback {function} - what to do with retrieved data
      * @return {void}
      **/
      reservation: function (id, reservation, callback) {
        makeApiCall({
          type: 'store',
          key: 'reservation',
          data: reservation,
          params: '/' + escape(id) + '/reservations',
          uri: get.events.uri
        }, callback);
      },

      /**
      * Get featured event that match passed ID
      *
      * @param params - string of additional parameters to pass to api
      * @param callback - what to do with retrieved data
      * @return void
      **/
      byId: function (id, callback) {
        makeApiCall({
          type: 'show',
          key: 'event',
          show: escape(id) + '?with[]=ticketsInventory',
          uri: get.events.uri
        }, callback);
      },

      /**
      * Get featured events
      *
      * @param params - string of additional parameters to pass to api
      * @param callback - what to do with retrieved data
      * @return void
      **/
      featured: function (params, callback) {
        var filters;

        filters = get.events.fields;

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }

        makeApiCall({
          type: 'index',
          key: 'events',
          params: filters + userLocation,
          uri: get.events.featured
        }, callback);
      },


      /**
      * Get events via search query in a specific location
      *
      * @param query - search query
      * @param callback - what to do with retrieved data
      * @return void
      **/
      byLocation: function (latitude, longitude, callback) {
        makeApiCall({
          type: 'index',
          key: 'events',
          params: '?filter[and][][gps]=' + escape(latitude) + ',' + escape(longitude) + ',30&fields[]=id&fields[]=title&fields[]=latitude&fields[]=longitude&fields[]=address1&fields[]=icon',
          uri: get.events.uri
        }, callback);
      },

      /**
      * Get featured carousel events (one featured event per featured tag)
      *
      * @param callback - what to do with retrieved data
      * @return void
      **/
      carousel: function (params, callback) {
        var filters = get.events.fields;

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }

        makeApiCall({
          type: 'index',
          key: 'events',
          params: filters + '&offset=0&limit=6' + userLocation,
          uri: get.events.carousel
        }, callback);
      },

      /**
      * Get list of featured tags
      *
      * @param callback - what to do with retrieved data
      * @return void
      **/
      tags: function (callback) {
        makeApiCall({
          type: 'index',
          key: 'tags',
          uri: get.events.tags
        }, callback);
      },

      /**
      * Get events based on passed featured tag
      *
      * @param tag - tag to grab featured events for
      * @param callback - what to do with retrieved data
      * @return void
      **/
      eventsWithTag: function (tag, callback) {
        var fields = '?with[]=times&fields[]=times&fields[]=city&fields[]=id&fields[]=title&fields[]=featuredPhoto&limit=15&filter[and][][is_published]=1&filter[and][][is_banned]=0&filter[and][][is_private]=0';

        makeApiCall({
          type: 'index',
          key: 'events',
          params: '/' + escape(tag) + fields + userLocation,
          uri: get.events.tags
        }, callback);
      },

      /**
      * Get events via search query
      *
      * @param query - search query
      * @param callback - what to do with retrieved data
      * @return void
      **/
      search: function (query, callback, noEscape) {
        if (HelperProvider.isFunc(query)) {
          callback = query;
          query = '';
        }
        makeApiCall({
          type: 'index',
          key: 'events',
          uri: get.events.uri + get.events.search + (noEscape ? query : escape(query))
        }, callback);
      },

      /**
      * Get events with specified tags
      *
      * @param tags - comma dilem string of tags
      * @param callback - what to do with retrieved data
      * @return void
      **/
      withTags: function (tags, callback) {
        var filters = '&fields[]=id&fields[]=featuredPhoto&fields[]=userId';

        if (HelperProvider.isFunc(tags)) {
          callback = tags;
          tags = '';
        }
        makeApiCall({
          type: 'index',
          key: 'events',
          uri: get.events.withTags + tags + filters + userLocation
        }, callback);
      },

      /**
      * Get all events with featured tags
      *
      * @param callback - what to do with retrieved data
      * @return void
      **/
      featuredTags: function (params, callback) {
        var filters = '&fields[]=id&fields[]=title&fields[]=featuredPhoto';

        if (HelperProvider.isFunc(params)) {
          callback = params;
        } else {

          if (HelperProvider.isStr(params)) {
            filters = params;
          }
        }
        makeApiCall({
          type: 'index',
          key: 'tags',
          params: '?' + filters,
          uri: get.events.featuredTags
        }, callback);
      },

      /**
      * Get all attending events for calendar data
      *
      * @param userId - id of user to get events for
      * @param callback - what to do with retrieved data
      * @return void
      **/
      attending: function (userId, callback) {
        makeApiCall({
          type: 'index',
          key: 'times',
          uri: get.events.attending + '/' + escape(userId) + '?with[]=tags&with[]=times&fields[]=icon&auth_user_id=' + escape(userId)
        }, callback);
      }
    };

    return {
      // Method to store data by uri
      store: storeData,
      // users object with private methods
      users: users,
      // events object with private methods
      events: events,
      // collections object with private methods
      collections: collections,
      // show enhanced api call method
      makeApiCall: makeApiCall
    };
  });
