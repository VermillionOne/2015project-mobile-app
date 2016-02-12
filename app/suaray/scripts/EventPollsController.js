/*jslint unparam: true */
/*jshint unused: true, node: true */
/*global angular */
angular
  .module('suaray')
  .controller('EventPollsController', function ($window, $scope, $timeout, supersonic, StorageProvider, ApiProvider, ApiServiceProvider, HelperProvider) {

    // Invoke strict mode
    "use strict";

    // variable declaration
    var $this = this, auth, polls, event;

    /**
     * Adds all available polls to scope via event object 
     *
     * @param obj {object} - the event object to parse 
     * @return polls {array} - array of all polls for event 
    **/
    $this.parsePolls = function (obj) {
      var i, poll, polls = [];

      if (obj && obj.length > 0) {

        for (i in obj) {

          if (obj.hasOwnProperty(i)) {

            poll = obj[i];

            polls.push(poll);
          }
        }
      }

      return polls;
    };

    /**
     * Submit api call to create new poll via post route 
     *
     * @param data {object} - the poll data to send to server 
     * @param callback {function} - what to do with returned data
     * @return function 
    **/
    $this.doCreatePoll = function (data, callback) {
      if (data && data.event_id) {
        ApiServiceProvider
          .events
          .polls(data, function (res) {
            if (res && !res.error) {

              callback(res);

            } else {
              $scope.error = res.error;

              callback();
            }
          });
      }
    };

    /**
     * Submit api call to add choice to created poll 
     *
     * @param data {object} - the choice data to send to server 
     * @param callback {function} - what to do with returned data
     * @return function 
    **/
    $this.doUpdatePollChoices = function (data, callback) {
      var url;

      if (data && data.id) {
        url = 'polls/' + data.poll_id + '/choices';

        ApiProvider
          .store(url, data)
          .success(function (res) {
            if (res && res.success) {
              callback(res.data.resource);
            }
          })
          .error(function (err) {
            if (err && err.message) {
              $scope.error = err;
            }

            callback();
          });
      }
    };

    // get latest event data from storage
    polls = StorageProvider.get('polls');

    // grab event id from storage
    event = StorageProvider.get('event');

    // get auth data from storage
    auth = StorageProvider.get('auth');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    // set default scope values
    $scope.poll = {};

    $scope.page = 'polls';

    $scope.showPollAnswer = false;

    $scope.polls = $this.parsePolls(polls);

    // show main polls page
    $scope.showPolls = function () {
      $scope.page = 'polls';
    };

    // show new poll form
    $scope.showPollsForm = function () {
      $scope.poll = {};
      $scope.page = 'create';
    };

    // show answers page
    $scope.showAnswers = function () {
      $scope.page = 'answers';
    };

    // show answers page with assigned poll
    $scope.editPoll = function (poll) {
      $scope.poll = poll;
      $scope.showAnswers();
    };

    $scope.submitNewPoll = function () {
      var data;

      // grab poll data from scope
      data = $scope.poll || null;

      // add needed user and event id's
      data.user_id = auth.id;
      data.event_id = event.id;

      $this.doCreatePoll(data, function (poll) {
        if (poll && HelperProvider.isObj(poll)) {
          // add returned poll to scope
          $scope.poll = poll;

          // add returned poll to all polls array
          $scope.polls.push(poll);
        }

        // go to answers page 
        $scope.showAnswers();
      });
    };

    $scope.submitNewAnswer = function (poll) {
      var obj;

      // grab poll object from scope
      obj = $scope.poll || poll;

      if (obj && obj.id) {
        // add poll_id as this is what api expects
        obj.poll_id = obj.id;

        if (obj.choice && obj.choice !== '') {

          $this.doUpdatePollChoices(obj, function (choice) {
            var i;

            // if we get poll back from api
            if (choice && choice.poll_id) {

              for (i in $scope.polls) {

                if ($scope.polls.hasOwnProperty(i)) {

                  // add new choice to matching polls choices array
                  if (choice.poll_id === $scope.polls[i].id) {
                    $scope.polls[i].choices.push(choice);
                  }
                }
              }
            }

            // show polls page
            $scope.showPolls();
          });
        } else {

          // show poll error
          $scope.showPollAnswer = true;
        }
      } else {
        
        // show polls page
        $scope.showPolls();
      }
    };

  });
