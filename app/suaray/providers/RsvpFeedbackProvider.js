/*jslint unparam: true*/
/*global app,alert,rsvpTimeData*/
angular
  .module('provider.rsvp', [])
  .factory('RsvpFeedbackFactory', function () {

  // Invoke strict mode
  "use strict";

  // Initial factory method for setting RSVP UI to give proper feedback to the user
  function getRsvp(scope, element, attrs) {

    // Setting variables for getRsvp Method
    var timeId, rsvpMessage, i, timeIdCheck, isAttending;

    // Grabbing the current RSVP date select option ID value: rsvpTimeData.id
    timeId = parseInt(angular.element('[data-role="event-date"]').val(), 10);

    // For loop through each index of rsvpTimeData
    for (i = 0; i < rsvpTimeData.length; i += 1) {

      // if rsvpTimeData object and rsvpTimeData.id is present
      if (rsvpTimeData && rsvpTimeData[i].id) {

        // Assign the rsvpTimeData index ID value to a variable
        timeIdCheck = rsvpTimeData[i];

        // If the timeId for the current option and the index ID match
        if (timeId === timeIdCheck.id) {

          // Assign the auth.isAttending value to a variable
          isAttending = timeIdCheck.auth.isAttending;

          // if isAttending is equal to 'yes'
          if (isAttending === 'yes') {

            // Set rsvpMessage to 'Attending' for function return value
            rsvpMessage = 'Attending';

          // if isAttending is equal to 'maybe'
          } else if (isAttending === 'maybe') {

            // Set rsvpMessage to 'Maybe Attending' for function return value
            rsvpMessage = 'Maybe Attending';

          // if isAttending is equal to 'no'
          } else if (isAttending === 'no') {

            // Set rsvpMessage to 'Not Attending' for function return value
            rsvpMessage = 'Not Attending';

          // if isAttending has no value
          } else {

            // Set rsvpMessage to 'Null' for function return value
            rsvpMessage = null;
          }

        }

      }

    }

    console.log('rsvpMessage => ' + rsvpMessage);
    // Return isAttending value through rsvpMessage
    return rsvpMessage;

  }

  // Available methods in factory
  return {
    // Gives corresponding feedback used to show whether or not the user has RSVP'd to an event
    getRsvp: getRsvp
  };

});
