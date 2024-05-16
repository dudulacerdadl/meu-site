document.addEventListener("DOMContentLoaded", function () {
    var audio = document.querySelector(".bkg-audio");
    var playButton = document.querySelector(".play-music");

    playButton.addEventListener("click", function () {
        audio.play();
    });
});
