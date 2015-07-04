angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $sce, $ionicPopover) {

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
            return '<img class="youtube-thumb" src="//i.ytimg.com/vi/' + id + '/hqdefault.jpg"><div class="play-button"></div>';
        }

        function labnolIframe() {
            var iframe = document.createElement("iframe");
            iframe.setAttribute("src", "//www.youtube.com/embed/" + this.parentNode.dataset.id + "?autoplay=1&autohide=2&border=0&wmode=opaque&enablejsapi=1&controls=0&showinfo=0");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("id", "youtube-iframe");
            this.parentNode.replaceChild(iframe, this);
        }

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.findExercise = function (index, name) {
            console.log(bwf.routine.exercises[index]);
            if (bwf.routine.exercises[index].type === "repeat") {
                bwf.routine.exercises.forEach(function (item) {
                    if (item.name === bwf.routine.exercises[index].name && item.type !== "repeat") {
                        console.log("Found matching exercise name setting repeat excercise");
                        if (item.type === "category") {
                            console.log(item);
                            $scope.repeatExercise = item.levels[item.activeLevel - 1];
                        } else {
                            $scope.repeatExercise = item;
                        }

                        var currentSlide = $('#exercises .slider-slide[data-index=' + index + ']').find('.youtube-player')[0];
                        if (!($(currentSlide).find('iframe').length > 0) && $scope.repeatExercise.youtube) {
                            console.log("Setting up video for iframe");
                            setUpVideos(currentSlide, $scope.repeatExercise.youtube);
                        }
                    }
                })
            }


        };

        $scope.routine = bwf.routine.exercises;
    })

    .controller('ngSwitch', function ($scope) {

    })

    .controller('SettingsCtrl', function ($scope) {
    });
