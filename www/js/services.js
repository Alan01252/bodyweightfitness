angular.module('starter.services', [])

    .factory('$localStorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])

    .factory('routineFactory', ['$localStorage', function (localStorage) {
        var routine = null;

        localStorage.remove('routine');

        return {
            add: function (newRoutine) {
                routine = newRoutine;
                localStorage.setObject('routine', routine);
            },
            clear: function () {
                localStorage.remove('routine');
                routine = null;
            },
            get: function () {
                if (routine) {
                    return routine;
                }

                var storedRoutine = localStorage.getObject('routine');
                if (!$.isEmptyObject(storedRoutine)) {
                    console.log("Stored routine " + storedRoutine);
                    routine = storedRoutine;
                    return routine;
                }
                return bwf.routine;
            }
        }
    }])

    .factory('settingsFactory', ['$localStorage', function (localStorage) {
        var settings = null;

        return {
            findSetting: function (key) {
                var value = null;
                $(settings).each(function (exerciseIndex, item) {
                    if (item.key === key) {
                        value = item.value;
                        return false;
                    }
                });

                return value;
            },
            add: function (newSettings) {
                settings = newSettings;
                localStorage.setObject('settings', settings);
            },
            clear: function () {
                localStorage.remove('settings');
                settings = null;
            },
            get: function () {
                if (settings) {
                    return settings;
                }

                var storedSettings = localStorage.getObject('settings');
                if (!$.isEmptyObject(storedSettings)) {
                    console.log("Stored settings " + storedSettings);
                    settings = storedSettings;
                    return settings;
                }
                return bwf.settings;
            }
        };
    }]);

