angular.module('starter.controllers', [])

    .controller('RoutineCtrl', function ($scope, $sce, $ionicPopover, settingsFactory, routineFactory) {

        $scope.settings = settingsFactory.get();
        $scope.startTimer = function (index) {
            console.log('timer-' + index);
            document.getElementById('timer-' + index).getElementsByTagName('timer')[0].start();
            $scope.timerRunning = true;
        };

        $scope.stopTimer = function () {
            $scope.$broadcast('timer-stop');
            $scope.forceStop = true;
            $scope.timerRunning = false;
        };

        $scope.resetTimer = function () {
            $scope.$broadcast('timer-reset');
            $scope.timerRunning = false;
        };

        $scope.$on('timer-stopped', function (event, data) {

            if (!$scope.forceStop && settingsFactory.findSetting("enableSounds")) {
                document.getElementById('timerEnd').play();
                $scope.timerRunning = false;
            }
        });

        $scope.slideChanged = function (index) {
            if ($scope.timerRunning === false) {
                $scope.$broadcast('timer-reset');
            }
        };

        function setUpVideos(player, youtubeId) {
            if (!player) {
                var v = $(".youtube-player");
                [].forEach.call(v, function (item) {
                    var p = document.createElement("div");
                    p.innerHTML = labnolThumb(item.dataset.id);
                    p.onclick = labnolIframe;
                    item.appendChild(p);
                });
            } else {
                console.log("Creating thumbnail for image");
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
            setUpVideos();
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
                populatedRoutine.push(exercise);
            });

            return populatedRoutine;
        }

        $scope.routine = populateRepeats(routineFactory.get());
        console.log("Routine scope");
        console.log($scope.routine);
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

            routineFactory.clear();
            routineFactory.add($scope.routine);
            console.log($scope.routine);
        };

        $scope.updateSettings = function (name, value) {

            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === value) {
                    item.value = value;
                }
            });
            routineFactory.clear();
            routineFactory.add($scope.routine);

            console.log($scope.routine);
        };

        function findExerciseByName(name) {
            var foundExercise = {};
            $($scope.routine.exercises).each(function (exerciseIndex, item) {
                if (item.name === name) {
                    foundExercise = item;
                    return false;
                }
            });
            return foundExercise;
        }

        $scope.exercise = findExerciseByName($stateParams.exerciseName);
    })

    .controller('SettingsCtrl', function ($scope, settingsFactory, routineFactory) {

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
