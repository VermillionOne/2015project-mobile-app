/*jslint unparam: true*/
/*global window,steroids,suarayConfig*/
angular
  .module('provider.schedule', [])
  .provider('ScheduleProvider', function () {

    // Invoke strict mode
    "use strict";

    var i, daysSelected = [];

    // Methods available for helper provider
    return {

      // Injectible stuff
      $get: function () {


        /**
        * Called in controllers to concatenate days selected for days selected in a weekly recurring schedule
        *
        * @param day - checkbox with value of day to add or remove from daysSelected list
        * @return void
        **/
        function checkDaysOfWeek(day) {
          // Declare variables
          var value, daysSelectedString;
          // Grab the value of the day of the week changed
          value = day.value;
          // If the day of the week is checked
          if (day.checked) {
            // Add the value to the daysSelected array
            daysSelected.push(value);
            // Then turn the array into a string
            daysSelectedString = daysSelected.toString();
          // Else if the day of the week is not checked
          } else {
            for (i = 0; i <= daysSelected.length; i += 1) {
              if (daysSelected[i] === value) {
                daysSelected.splice(i, 1);
                // Then turn the array into a string
                daysSelectedString = daysSelected.toString();
              }
            }
          }
          return daysSelectedString;
        }

        /**
        * Called in controllers to check on base interval value (Daily, Weekly, Monthly, Yearly)
        *
        * @param baseInterval - Select input: repeats - holds values 'Daily', 'Weekly', 'Monthly', and 'Yearly'
        * @return void
        **/
        function checkRepeats(baseInterval) {
          // Declare variables
          var value, daysOfWeek, daysSelectedString, interval, result;
          // Define dayOfWeek as the array of checkboxes for days of week
          daysOfWeek = angular.element('[data-role^="day-of-week-"]');
          // Set interval value to selected value
          interval = baseInterval;
          // If the base interval selected is 'weekly'
          if (interval === 'weekly') {
            // For each of the days of the week
            for (i = 0; i < daysOfWeek.length; i += 1) {
              // Grab the value of the day of the week
              value = daysOfWeek[i].value;
              // If the day is checked
              if (daysOfWeek[i].checked) {
                // Add the value to the daysSelected Array
                daysSelected.push(value);
                // Then turn the array into a string
                daysSelectedString = daysSelected.toString();
              }
            }
          // If option other than Repeats Weekly is selected
          } else {
            // Clear daysSelected as these no longer apply
            daysSelected = [];
            // Then turn the array into a string
            daysSelectedString = daysSelected.toString();
          }

          result = {
            interval           : interval,
            daysSelectedString : daysSelectedString
          };

          return result;

        }

        // Return all methods encapsulated in this parent function
        return {
          checkDaysOfWeek : checkDaysOfWeek,
          checkRepeats    : checkRepeats
        };
      }
    };
  });
