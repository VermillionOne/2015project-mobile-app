/*jslint unparam: true*/
/*global suarayEnv,steroids,supersonic,window */
angular
  .module('provider.mediator', [])
  .provider('Mediator', function () {

    return {

      $get: function (supersonic) {

        return {
          /**
           * Add new channel with callback and optional context
           *
           * @param channel {string} - name of the channel to subscribe
           * @param fn {function} - method to execute when publishing this channel
           * @param context {object} - optional context to change scope of executed fn
           * @return sub {object} - the subscription
          **/
          on: function (channel, fn, context) {
            var sub;

            sub = supersonic.data.channel(channel).subscribe(function () {
              var argc = [].slice.call(arguments);

              if (context !== undefined) {

                fn.apply(context, argc);

              } else {

                fn(argc[0]);
              }
            });

            return sub;
          },

          /**
           * Remove / stop listening for a specified channel
           *
           * @param channel {string} - the channel to stop listening too
           * @return sub {null} - null subscription
          **/
          off: function (channel) {
            var sub;

            sub = supersonic.data.channel(channel);

            sub = null;

            return sub;
          },

          /**
           * Fire a specific event via passed channel with optional data or callback
           *
           * @param channel {string} - the channel to publish
           * @param data {various} - any type of argument to pass when published
           * @param callback {function} - method to execute after channel published
           * @return sub {object} - the published channel
          **/
          trigger: function (channel, data, callback) {
            var sub;

            sub = supersonic.data.channel(channel).publish(data);

            if (callback && typeof callback === 'function') {

              callback.call(this, sub);
            }

            return sub;
          }

        };

      }

    };

  });
