/*jshint unused: true, node: true */
/*global Bugsnag,device,suarayEnv */
// Bugsnag service
angular
  .module('exceptionOverride', [])
  .factory('$exceptionHandler', function () {

    "use strict";

    return function (exception, cause) {
      Bugsnag.notifyException(exception, {diagnostics: {cause: cause}});
    };
  });

angular
  .module('suaray', [
    'filters',
    'providers',
    'directives',
    'supersonic',
    'ngCordova',
    'ngAnimate',
    'ngImgCrop'
  ])

  .directive('clickAndDisable', function () {

    "use strict";
    // Disables button until response is returned
    return {
      scope: {
        clickAndDisable: '&'
      },
      link: function (scope, submit) {
        submit.bind('click', function () {
          submit.prop('disabled', true);
          scope.clickAndDisable().finally(function () {
            submit.prop('disabled', false);
          });
        });
      }
    };
  })

  .run(function ($rootScope, $window, $templateCache, DeviceTypeFactory, StorageProvider, Mediator) {

    // Enable Strict Mode
    "use strict";

    var auth = StorageProvider.get('auth');

    // remove all view cache
    $rootScope.$on('$viewContentLoaded', function() {
      $templateCache.removeAll();
    });

    // remove specific view cache on route change event
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if (typeof(current) !== 'undefined'){
        $templateCache.remove(current.templateUrl);
      }
    });

    // global reload event any controller can call
    Mediator.on('refresh', function () {
      // refresh current view
      $window.location.reload();
    });

    // Activate CSS class iOS for specific styles necessary for proper iOS render
    if (DeviceTypeFactory.android()) {

      // set platform on global device object
      device.platform = 'android';
      // set ios styles
      $rootScope.iOSStyles = false;

    } else if (DeviceTypeFactory.iOS9()) {

      // set platform on global device object
      device.platform = 'ios';
      // set version of ios
      device.version = '9';
      // set ios styles
      $rootScope.iOSStyles = true;

    } else if (DeviceTypeFactory.iOS()) {

      // set platform on global device object
      device.platform = 'ios';
      // set ios styles
      $rootScope.iOSStyles = true;
    }

    // analytics
    if (auth && auth.id) {
      if (suarayEnv === 'production') {

        /* jshint ignore:start */
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-64664719-1', 'auto');
        ga('send', 'pageview');
        ga('set', '&uid', auth.id || '');
        /* jshint ignore:end */
      }
    }

  });
