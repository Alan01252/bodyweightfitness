angular.module('starter.controllers', [])

    .controller('TabsCtrl', function ($scope, $rootScope, $state) {
    })

    .controller('RoutineCtrl', function ($rootScope, $scope, $sce, $ionicSlideBoxDelegate, settingsFactory, routineFactory, currentSlideFactory) {

        $rootScope.showCustomBack = false;
        $scope.showCustomBack = false;

        $scope.settings = settingsFactory.get();
        $scope.startTimer = function (index) {
            console.log('timer-' + index);
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
            $scope.$broadcast('timer-reset');
            $scope.timerRunning = false;
            $scope.forceStop = false;
        };

        $scope.$on('timer-stopped', function (event, data) {


            console.log("Timer stopped");
            console.log("Force stop event" + $scope.forceStop);
            if (!$scope.forceStop && settingsFactory.findSetting("enableSounds")) {

                console.log("Trying to play finishing sound");
                var audio = document.getElementById('timerEnd');
                if (typeof Media !== 'undefined') {
                    var url = audio.getAttribute('src');

                    var currentPlatform = ionic.Platform.platform();
                    if (currentPlatform.toLowerCase() === "android") {
                        url = "/android_asset/www/" + url;
                    }

                    $scope.timerRunning = false;
                    var my_media = new Media(url,
                        function () {
                            console.log("playAudio():Audio Success");
                        },
                        function (err) {
                            console.log("playAudio():Audio Error: " + err);
                        }
                    );
                    my_media.play();
                } else {
                    audio.play();
                }
            }
        });

        $scope.slideChanged = function (index) {
            console.log("slide changed");
            currentSlideFactory.set(index);
            console.log($rootScope.currentSlide);
            if ($scope.timerRunning === false) {
                $scope.$broadcast('timer-reset');
            }
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
        };


        $scope.$on("$ionicView.afterEnter", function (scopes, states) {
            $rootScope.showCustomBack = false;
            $scope.showCustomBack = false;
            setUpVideos();
        });

        $rootScope.$on('updateRoutine', function () {
            console.log("Updating routine");
            $scope.routine = populateRepeats(routineFactory.get());
            console.log("setting up videos");
            setUpVideos();
            console.log("Getting current slide");
            var currentSlide = currentSlideFactory.get();
            console.log("Current slide was" + currentSlide);
            if (currentSlide !== null) {
                console.log("found current slide moving to " + currentSlide);
                $ionicSlideBoxDelegate.slide(currentSlide);
            }
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
                    console.log("Found matching exercise name setting repeat excercise");
                    if (item.type === "category") {
                        repeatExercise = findCategoryExericse(item);
                    } else {
                        repeatExercise = item;
                    }
                    console.log("using " + repeatExercise.name);
                    return false;
                }
            });
            return repeatExercise;
        };

        function findCategoryExericse(item) {
            return item.levels[item.activeLevel];
        }

        function populateRepeats(routine) {
            var populatedRoutine = [];

            routine.exercises.forEach(function (item, index) {
                var exercise = item;
                if (item.type === "repeat") {
                    exercise = findRepeatExercise(index, routine);
                } else if (item.type === "category") {
                    exercise = findCategoryExericse(item);
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

        $scope.updateSettings = function (name, value) {

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
                console.log("here?");
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

        console.log($stateParams.exerciseName)
        $scope.exercise = findExerciseByName($stateParams.exerciseName);
    })

    .controller('SettingsCtrl', function ($scope, $rootScope, settingsFactory, routineFactory) {

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

        $scope.exercises = getExercises(routineFactory.get());
        $scope.settings = settingsFactory.get();
        console.log($scope.exercises);

    });
