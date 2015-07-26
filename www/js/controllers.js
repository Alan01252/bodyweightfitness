angular.module('starter.controllers', [])

    .controller('TabsCtrl', function ($scope, $rootScope, $state) {
    })

    .controller('RoutineCtrl', function ($rootScope, $scope, $sce, $ionicSlideBoxDelegate, settingsFactory, routineFactory, currentSlideFactory) {

        $rootScope.showCustomBack = false;
        $scope.showCustomBack = false;

        $scope.settings = settingsFactory.get();
        $scope.startTimer = function (index) {
            console.log('timer-' + index);
            if (window.plugins) {
                console.log("Making sure screen is kept alive");
                window.plugins.insomnia.keepAwake();
            }
            document.getElementById('timer-' + index).getElementsByTagName('timer')[0].start();
            $scope.timerRunning = true;
            $scope.forceStop = false;
        };

        $scope.stopTimer = function () {

            $scope.$broadcast('timer-stop');
            $scope.forceStop = true;
            $scope.timerRunning = false;
        };

        $scope.resetTimer = function () {
            if (window.plugins) {
                console.log("Allowing screen to sleep again");
                window.plugins.insomnia.allowSleepAgain();
            }
            console.log("Resetting timer");
            $scope.$broadcast('timer-reset');
            $scope.timerRunning = false;
            $scope.forceStop = false;
        };

        $scope.$on('timer-stopped', function (event, data) {

            if (window.plugins) {
                console.log("Allowing screen to sleep again");
                window.plugins.insomnia.allowSleepAgain();
            }

            console.log("Timer stopped");
            console.log("Force stop event " + $scope.forceStop);
            if (!$scope.forceStop && settingsFactory.findSetting("enableSounds")) {

                console.log("Trying to play finishing sound");
                var audio = document.getElementById('timerEnd');
                var url = audio.getAttribute('src');
                var currentPlatform = ionic.Platform.platform();
                if (currentPlatform.toLowerCase() === "android") {
                    if (!url.match("^/android_asset")) {
                        url = "/android_asset/www/" + url;
                        audio.setAttribute('src', url);
                    }
                }
                audio.play();
            }
        });

        $scope.slideChanged = function (index) {
            console.log("Slide changed");
            currentSlideFactory.set(index);
            console.log($rootScope.currentSlide);
            if ($scope.timerRunning === false) {
                $scope.$broadcast('timer-reset');
            }

            $("iframe").each(function (index, item) {
                item.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            });
        };

        function setUpVideos(player, youtubeId) {
            if (!player) {
                var v = $(".youtube-player").unbind();
                [].forEach.call(v, function (item) {
                    $(item).empty();
                    var p = document.createElement("div");
                    p.innerHTML = labnolThumb(item.dataset.id);
                    p.onclick = labnolIframe;
                    item.appendChild(p);
                });
            } else {
                console.log("Creating thumbnail for image");
                $(player).empty();
                var p = document.createElement("div");
                if (youtubeId) {
                    console.log("Creating thumbnail for image");
                    p.innerHTML = labnolThumb(youtubeId);
                    p.onclick = labnolIframe;
                    player.appendChild(p);
                }
            }
        }


        $scope.$on("$ionicView.afterEnter", function (scopes, states) {
            $rootScope.showCustomBack = false;
            $scope.showCustomBack = false;
            setUpVideos();
        });

        $rootScope.$on('updateRoutine', function () {
            console.log("Updating routine");
            $scope.routine = populateRepeats(routineFactory.get());
            console.log("Getting current slide");
            var currentSlide = currentSlideFactory.get();
            console.log("Current slide was " + currentSlide);
            if (currentSlide !== null) {
                console.log("Found current slide moving to " + currentSlide);
                $ionicSlideBoxDelegate.slide(currentSlide);
            }
            setTimeout(function () {
                console.log("Resetting timer");
                $scope.resetTimer();
            }, 500);
        });


        function labnolThumb(id) {
            console.log("Making thumbs");
            return '<img class="youtube-thumb" src="http://i.ytimg.com/vi/' + id + '/hqdefault.jpg"><div class="play-button"></div>';
        }

        function labnolIframe() {
            var iframe = document.createElement("iframe");
            iframe.setAttribute("src", "http://www.youtube.com/embed/" + this.parentNode.dataset.id + "?autoplay=1&autohide=2&border=0&wmode=opaque&enablejsapi=1&controls=0&showinfo=0");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("id", "youtube-iframe");
            this.parentNode.replaceChild(iframe, this);
        }

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        function findRepeatExercise(index, routine) {
            var repeatExercise = {};
            $(routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === routine.exercises[index].name && item.type !== "repeat") {
                    console.log("Found matching exercise name setting repeat exercise");
                    if (item.type === "category") {
                        repeatExercise = findCategoryExercise(item);
                    } else {
                        repeatExercise = item;
                    }
                    console.log("Using " + repeatExercise.name);
                    return false;
                }
            });
            return repeatExercise;
        }

        function findCategoryExercise(item) {
            return item.levels[item.activeLevel];
        }

        function populateRepeats(routine) {
            var populatedRoutine = [];

            routine.exercises.forEach(function (item, index) {
                var exercise = item;
                if (item.name === "Rest" && populatedRoutine.length > 0 && populatedRoutine[populatedRoutine.length - 1].name === "Rest") {
                    console.log("Discarding second rest in a row");
                    return false;
                }
                if (item.type === "repeat") {
                    exercise = findRepeatExercise(index, routine);
                } else if (item.type === "category") {
                    exercise = findCategoryExercise(item);
                    exercise.enabled = item.enabled;
                }
                exercise.index = index;
                if (exercise.enabled) {
                    populatedRoutine.push(JSON.parse(JSON.stringify(exercise)));
                }
            });

            return populatedRoutine;
        }

        var rawRoutine = routineFactory.get();
        $scope.routine = populateRepeats(rawRoutine);
        $scope.routineName = rawRoutine.name;

    })

    .controller('ExercisesettingsCtrl', function ($scope, $rootScope, $stateParams, routineFactory) {
        $rootScope.showCustomBack = true;
        $scope.showCustomBack = true;
        $scope.routine = routineFactory.get();


        $scope.updateActiveLevel = function (name, value) {

            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === name) {
                    console.log("Updating index " + exerciseIndex + " active level " + value);
                    item.activeLevel = value;
                }
            });

            routineFactory.add(JSON.parse(JSON.stringify($scope.routine)));
            $rootScope.$emit('updateRoutine');
        };

        $scope.updateCategoryMaxHold = function (name, value) {

            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === name) {
                    console.log("Updating index " + exerciseIndex + " max hold level " + value);
                    item.levels[item.activeLevel].maxHold = value;
                }
            });
            routineFactory.add(JSON.parse(JSON.stringify($scope.routine)));
            $rootScope.$emit('updateRoutine');
        };

        $scope.updateMaxHold = function (name, value) {

            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === name) {
                    console.log("Updating index " + exerciseIndex + " max hold " + value);
                    item.maxHold = value;
                }
            });

            routineFactory.add(JSON.parse(JSON.stringify($scope.routine)));
            $rootScope.$emit('updateRoutine');
        };

        $scope.updateSettings = function (name, value) {
            console.log("Updating " + name);

            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === value) {
                    item.value = value;
                }
            });
            routineFactory.add(JSON.parse(JSON.stringify($scope.routine)));
            $rootScope.$emit('updateRoutine');
        };

        function findExerciseByName(name) {
            var foundExercise = {};
            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === name) {
                    foundExercise = item;
                    return false;
                }
            });

            console.log(foundExercise);
            if ($.isEmptyObject(foundExercise)) {
                $($scope.routine.exercises).each(function (exerciseIndex, item) {
                    console.log(item.type);
                    if (item.type === "category") {
                        $(item.levels).each(function (exerciseIndex, level) {
                            console.log(level.name);
                            if (level.name === name) {
                                foundExercise = item;
                                return false;
                            }
                        });
                    }
                });
            }

            return foundExercise;
        }

        console.log($stateParams.exerciseName);
        $scope.exercise = findExerciseByName($stateParams.exerciseName);

        if ($scope.exercise.type === "category") {
            $scope.activeLevel = $scope.exercise.levels[$scope.exercise.activeLevel];
        }
    })

    .controller('SettingsCtrl', function ($scope, $rootScope, $ionicPopup, settingsFactory, routineFactory) {

        $rootScope.showCustomBack = false;
        $scope.showCustomBack = false;

        $scope.updateSettings = function (key, value) {
            $($scope.settings.exercises).each(function (exerciseIndex, item) {
                if (item.key === key) {
                    item.value = value;
                }
            });
            settingsFactory.clear();
            settingsFactory.add($scope.settings);
            $rootScope.$emit('settingsUpdated');
        };

        function getExercises(routine) {
            var exercises = [];

            routine.exercises.forEach(function (item, index) {
                if (item.type !== "repeat" && item.type !== "done") {
                    exercises.push(item);
                }
            });

            return exercises;
        }

        $scope.clearRoutine = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Reset current routine',
                template: 'Are you sure you want to reset the current routine?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    routineFactory.clear();
                    $scope.exercises = getExercises(routineFactory.get());
                    $rootScope.$emit('updateRoutine');
                }
            });
        };

        $scope.exercises = getExercises(routineFactory.get());
        $scope.settings = settingsFactory.get();
        console.log($scope.exercises);

    });
