angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $sce, $ionicPopover) {

        $scope.startTimer = function () {
            $scope.$broadcast('timer-start');
            $scope.timerRunning = true;
        };

        $scope.stopTimer = function () {
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;
        };

        $scope.resetTimer = function () {
            $scope.$broadcast('timer-reset');
            $scope.timerRunning = false;
        };

        $scope.$on('timer-stopped', function (event, data) {
        });

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

        function findRepeatExercise(index, name) {
            console.log(bwf.routine.exercises[index]);
            var repeatExercise = {};
            $(bwf.routine.exercises).each(function (exerciseIndex, item) {
                console.log(item);
                if (item.name === bwf.routine.exercises[index].name && item.type !== "repeat") {
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
            return item.levels[item.activeLevel - 1];
        }

        function populateRepeats(routine) {
            var populatedRoutine = [];

            routine.forEach(function (item, index) {
                if (item.type === "repeat") {
                    populatedRoutine.push(findRepeatExercise(index));
                } else if (item.type === "category") {
                    populatedRoutine.push(findCategoryExericse(item));
                } else {
                    populatedRoutine.push(item);
                }
            });

            return populatedRoutine;
        }

        $scope.routine = populateRepeats(bwf.routine.exercises);
        console.log($scope.routine);
    })

    .controller('ngSwitch', function ($scope) {

    })

    .controller('SettingsCtrl', function ($scope) {
    });
