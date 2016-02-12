/* Suaray Gruntfile Task Runner */
module.exports = function(grunt) {

  // allows loading of external grunt tasks
  require('load-grunt-tasks')(grunt);

  // load needed npm tasks
  grunt.loadNpmTasks("grunt-karma");

  grunt.loadNpmTasks('grunt-contrib-jshint');
  
  grunt.loadNpmTasks("grunt-steroids");

  // set initial grunt config
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // angular js unit test config
    karma: {
      unit: {
        options: {
          frameworks: ['jasmine'],
          singleRun: true,
          usePolling: true,
          browsers: ['Chrome'],
          files: [
            'http://maps.googleapis.com/maps/api/js',
            'bower_components/platform/platform.js',
            'bower_components/steroids-js/steroids.js',
            'bower_components/bugsnag/src/bugsnag.js',
            'bower_components/webcomponentsjs/webcomponents.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/supersonic/supersonic.js',
            'bower_components/jquery-touchswipe/jquery.touchSwipe.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/ngImgCrop/compile/unminified/ng-img-crop.js',
            'bower_components/ngCordova/dist/ng-cordova.js',
            'bower_components/evaporatejs/evaporate.js',
            'bower_components/bootstrap/js/carousel.js',
            'bower_components/bootstrap/js/tab.js',
            'bower_components/moment/moment.js',
            'bower_components/fullcalendar/dist/fullcalendar.js',
            'bower_components/jsSHA/src/sha.js',
            'app/common/assets/config/SuarayEnv.js',
            'app/common/assets/config/SuarayConfig.js',
            'app/common/assets/config/SuarayDevice.js',
            'app/common/assets/config/SuarayVersion.js',
            'app/suaray/**/*.js',
            'app/tests/**/*.js'
          ],
          colors: true,
          reporters: ['progress', 'coverage'],
          autoWatch: false,
          customLaunchers: {
            Chrome_travis_ci: {
              base: 'Chrome',
              flags: ['--no-sandbox']
            }
          },
        }
      }
    },
    // js hint config
    jshint: {
      ignore_warning: {
        options: {
          '-W083': true
        },
        src: ['Gruntfile.js', 'app/suaray/**/*.js', 'app/common/**/*.js']
      }
    }
  });

  // run custom chrome browser when ran by Travis CI
  if (process.env.TRAVIS) {
    // set custom browser
    grunt.config.set('karma.unit.options.browsers', ['Chrome_travis_ci']);
  }

  // run test scripts
  grunt.registerTask("test", ["karma"]);

  // run linter tests
  grunt.registerTask("linter", ["jshint"]);
  
  // run linter and karma tests only
  grunt.registerTask("tester", ["linter", "karma"]);

  // default task to build app
  grunt.registerTask("default", ["steroids-make-fresh"]);

  // run linter, test scripts & steroids build tasks
  grunt.registerTask("build", ["linter", "karma", "steroids-make-fresh"]);

};
