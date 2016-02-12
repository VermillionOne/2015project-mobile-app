/*jshint unused: true, node: true */
/*jslint unparam: true, node: true */
/*global google,navigator,alert,window*/
angular
  .module('suaray')
  .controller('MapController', function ($scope, supersonic, $compile, ApiProvider, ApiServiceProvider, HelperProvider, StorageProvider, AlertProvider) {

    // Invoke strict mode
    "use strict";

    var map, auth, infowindow, initialize, content, icon, icons, currentPositionMarker, geocoder, locations, eventCategory, latlngset, marker, i, mapOptions, eventName, eventId, lat, long;

    // Resize map container
    HelperProvider.resizeWindow($('#map'));

    function setCurrentPosition(pos) {
      var latlng;

      latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

      // Users current position on the map
      currentPositionMarker = new google.maps.Marker({
        map: map,
        position: latlng,
        icon: '/icons/marker-icon.png'
      });

      // info window is the tool tip that says you are here
      infowindow = new google.maps.InfoWindow({
        map: map,
        position: latlng,
        content: 'You are here!'
      });

      // tell users device to go to your current position
      map.panTo(latlng);
    }

    function addLocation(data) {
      // variable declaration
      var length, index, event, locations;

      locations = [];

      index = 0;
      length = data.length || 0;

      // loop through featured events
      do {
        event = data[index];

        if (event && typeof event !== 'function') {
          // set location item array
          locations[index] = {
            id: event.id,
            title: event.title,
            color: event.color,
            latitude: event.latitude,
            longitude: event.longitude,
            address1: event.address1,
            category1: event.category1,
            tags: event.tags,
            icon: event.icon,
          };
        }

        index++;
      } while (--length);

      return locations;
    }

    // Set location markers across the map
    function setMarkers(map, locations) {
      /* jshint ignore:start */
      var prevWindow = false;
      /* jshint ignore:end */
      // loop for different locations
      for (i = 0; i < locations.length; i += 1) {

        // locations data for loop
        lat = locations[i].latitude;
        long = locations[i].longitude;
        eventName = locations[i].title;
        eventId = locations[i].id;
        eventCategory = locations[i].category1;
        icons = locations[i].icon;

        if (icons === null) {

          icon = "default";

        } else {

          switch (icons.tag) {
          case "concerts":
            icon = "concerts";
            break;

          case "parties":
            icon = "parties";
            break;

          case "festivals":
            icon = "festivals";
            break;

          case "conventions":
            icon = "conventions";
            break;

          case "nightlife":
            icon = "nightlife";
            break;

          case "shows":
            icon = "shows";
            break;

          case "events":
            icon = "events";
            break;

          case "restaurants":
            icon = "restaurants";
            break;

          case "shopping":
            icon = "shopping";
            break;

          case "bars":
            icon = "bars";
            break;

          case "hotels":
            icon = "hotels";
            break;

          case "traditional":
            icon = "traditional";
            break;

          case "beauty":
            icon = "beauty";
            break;

          case "automotive":
            icon = "automotive";
            break;

          case "medical":
            icon = "medical";
            break;

          case "home":
            icon = "home";
            break;

          case "local services":
            icon = "localServices";
            break;

          case "arts":
            icon = "arts";
            break;

          case "travel":
            icon = "travel";
            break;

          default:
            icon = "default";
            break;
          }
        }

        // place markers on map using there lat and long
        latlngset = new google.maps.LatLng(lat, long);

        icon = "/icons/map-markers/" + icon + ".png";

        // set new markers
        marker = new google.maps.Marker({
          map: map,
          title: eventName,
          position: latlngset,
          icon: new google.maps.MarkerImage(icon),
        });

        // set where your located in the center of the screen
        map.setCenter(marker.getPosition());

        // set html data for info window
        content = '<b ng-click="goToEventDetail(' + eventId + ')">' + eventName + '</b>';
        // Convert content into html element
        content = $compile(content)($scope);
        content = content[0];

        // Initialize new tooltip
        infowindow = new google.maps.InfoWindow();

        // Event Listerner for when you click on a location marker
        /* jshint ignore:start */
        google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
          return function () {
            // if prev window open, close it
            if (prevWindow) {
              prevWindow.close();
            }
            // reference window
            prevWindow = infowindow;

            // set ocntent and display
            infowindow.setContent(content);
            infowindow.open(map, this);

            // tell users device to go to your current position
            map.panTo(this.getPosition());
          };
        })(marker, content, infowindow));
        /* jshint ignore:end */
      }
    }

    // If location not found, call will be made to get featured events with tags
    function defaultFeatured() {

      // Get events local to user
      ApiServiceProvider
        .events
        .featured("", function (data) {
          // add event locations
          locations = addLocation(data);
          // apply markers to map
          setMarkers(map, locations);
          // hide loader after all api calls
          $('.loading-overlay').fadeOut('fast');
        });
    }

    // Map Functions
    function locError() {
      var message = "Current position could not be found. Showing all featured events instead.";
      
      // display native alert
      AlertProvider.dialog(message);

      // If no location, defaults to call and populate featured events
      defaultFeatured();
    }

    // If location found, call will be made to get events based on user gps
    function displayAndWatch(position) {

      // set current position
      setCurrentPosition(position);

      var latitude, longitude;

      latitude = position.coords.latitude;

      longitude = position.coords.longitude;

      // Get events local to user
      ApiServiceProvider
        .events
        .byLocation(latitude, longitude, function (data) {
          // add event locations
          locations = addLocation(data);
          // set markers on map
          setMarkers(map, locations);
          // hide loader after all api calls
          $('.loading-overlay').fadeOut('fast');
        });
    }

    /**
    * Initialize google maps with updated locations array and data
    *
    * @return void
    **/
    initialize = function () {
      // set geocoder for address search
      geocoder = new google.maps.Geocoder();

      // zoom in to the maps set location
      mapOptions = {
        zoom: 12
      };

      // if browser / device is compatible
      if (navigator.geolocation) {

        // Timeout being set due to this issue: https://github.com/AppGyver/wrapper/issues/117
        navigator.geolocation.getCurrentPosition(displayAndWatch, locError, {timeout: 5000, enableHighAccuracy: true});
        // init google map with map opts
        map = new google.maps.Map(document.getElementById('map'), mapOptions);

      } else {

        alert("Your browser does not support the Geolocation API");
      }
    };

    // get the authorized logged in user
    auth = StorageProvider.get('auth');

    // Set api key in api provider config
    ApiProvider.setConfig('apiKey', auth.apiKey);

    // Locatinos array
    locations = [];

    // launch google maps
    google.maps.event.addDomListener(window, 'load', initialize);

    $scope.navbarTitle = 'Map';

    // Refrence event detail function in helper
    $scope.goToEventDetail = HelperProvider.goToEventDetail;

    // Center back to users location
    $scope.backToYourLocation = function () {

      // Reset search field
      $('#address').val("");

      // Grab events in users area or default if no location
      initialize();
    };

    // Execute search for events local to users location
    angular.element('[data-role="map-event-search"]').submit(function () {
      // Search query & or address
      var query = $('#address')[0].value;

      ApiServiceProvider
        .events
        .search(query, function (data) {

          if (data && !data.error) {
            // add event locations
            locations = addLocation(data);

            // Initialize when we get data back from the api
            initialize();
          } else {
            // Geocode location if no events
            geocoder.geocode({ 'address': query}, function (results, status) {

              if (status === google.maps.GeocoderStatus.OK) {

                map.setCenter(results[0].geometry.location);

                // set location marker
                marker = new google.maps.Marker({
                  map: map,
                  icon: '/icons/marker-icon.png',
                  position: results[0].geometry.location
                });

              } else {
                var message = "Geocode was not successful for the following reason: " + status;

                // Alerts user that location cannot be found
                AlertProvider.dialog(message);
              }
            });
          }
        });
    });
  });
