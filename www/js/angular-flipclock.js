angular.module('angular-flipclock', [])
    .directive('flipClock', function ($parse) {
        return {
            replace: true,
            template: '<div></div>',
            restrict: 'E',
            link: function (scope, element, attr) {

                var optionKeys = [
                        'autostart', //(boolean) If this is set to false, the clock will not auto start. The default value is true.
                        'countdown', //(boolean) If this is set to true, the clock will count down instead of up. The default value is false.
                        'callbacks', //(object) An object of callback functions that are triggered at various times. For more information, view the callback documentation.
                        'classes',   //(object) This is an object of CSS classes to use to append to DOM objects
                        'clockFace', // (string) This is the name of the clock that is used to build the clock display. The default value is HourlyCounter.
                        'defaultclockface', //(string) This is the default clock face to use if the defined clock face does not exist. The default value is HourlyCounter.
                        'defaultlanguage', //(string) This is the default langauge to use. The default value is english.
                        'time'
                    ], options = {
                        callbacks: {}
                    },
                    clock,
                    methods = [
                        'start', //This method will start the clock just call the .start() method on an FlipClock object.
                        'stop',  // This method will stop the clock just call the .stop() method on an FlipClock object.
                        'setTime', //This method will set the clock time after it has been instantiated just call the .setTime() method on an FlipClock object.
                        'setCountdown', //This method will change the clock from counting up or down.
                        'getTime' //To get the clock time after it has been instantiated just call the .getTime() method on an FlipClock object.
                    ],
                    callbacks = [
                        'destroy', //This callback is triggered when the timer is destroyed
                        'create', // This callback is triggered when the clock face is created
                        'init', //This callback is triggered when the FlipClock object is initialized
                        'interval', //This callback is triggered with each interval of the timer
                        'start', //This callback is triggered when the clock is started
                        'stop', //This callback is triggered when the clock is stopped
                        'reset' // This callback is triggered when the timer has been reset
                    ];


                //set options from attributes
                optionKeys.forEach(function (key) {
                    if (attr[key]) {
                        switch (key) {
                            case 'autostart':
                                options['autoStart'] = attr[key] === 'false' ? false : true;
                                break;
                            case 'defaultclockface':
                                options['defaultClockFace'] = attr[key];
                                break;
                            case 'defaultlanguage':
                                options['defaultLanguage'] = attr[key];
                                break;
                            default:
                                options[key] = attr[key];
                                break;
                        }
                    }
                });

                //init callbacks
                callbacks.forEach(function (callback) {
                    if (attr[callback]) {
                        options.callbacks[callback] = function () {
                            $parse(attr[callback])(scope);
                        }
                    }
                });

                options.clockFace = 'MinuteCounter';
                clock = element.FlipClock(options);

                if (options['time']) {
                    clock.setTime(options['time']);
                }

                //bind methods to the scope
                methods.forEach(function (method) {
                    scope[method] = function () {
                        clock[method].apply(clock, arguments);
                    }
                });
            }
        }
    });
