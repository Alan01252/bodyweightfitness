// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'timer'])

    .run(function ($ionicPlatform, $ionicHistory, $rootScope, $window, settingsFactory) {

        $rootScope.goBack = function ($event) {
            $ionicHistory.goBack();
        };

        function changeOrientation() {
            if (typeof screen.orientation !== 'undefined') {
                settingsFactory.get();
                var orientation = settingsFactory.findSetting('lockOrientation');
                console.log("Setting orientation" + orientation);
                if (orientation === "both") {
                    console.log("allowing both");
                    if (typeof(screen.unlockOrientation) === "function") {
                        screen.unlockOrientation();
                    }
                } else {
                    if (typeof(screen.lockOrientation) === "function") {
                        console.log("locking orientation")
                        screen.lockOrientation(orientation);
                    }
                }
            }
        }

        $rootScope.$on('settingsUpdated', function () {
            changeOrientation();
            $window.location.reload(true);
        });

        $ionicPlatform.ready(function () {

            changeOrientation();
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.platform.android.scrolling.jsScrolling(false);

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            // Each tab has its own nav history stack:

            .state('tab.routine', {
                url: '/routine',
                views: {
                    'tab-routine': {
                        templateUrl: 'templates/tab-routine.html',
                        controller: 'RoutineCtrl'
                    }
                }
            })


            .state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('tab.exercisesettings', {
                cache: false,
                url: '/settings/exercise/:exerciseName',
                views: {
                    'tab-exercise-settings': {
                        templateUrl: 'templates/tab-exercisesettings.html',
                        controller: 'ExercisesettingsCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/routine');
        $ionicConfigProvider.tabs.position('bottom');

    });
