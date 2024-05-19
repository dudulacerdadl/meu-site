document.addEventListener("DOMContentLoaded", function () {
    var audio = document.querySelector(".bkg-audio");
    var playButton = document.querySelector(".play-music");

    playButton.addEventListener("click", function () {
        if (audio.paused) {
            audio.play();
            playButton.src = "/assets/imgs/pause.png";
        } else {
            audio.pause();
            playButton.src = "/assets/imgs/play.png";
        }
    });
});
