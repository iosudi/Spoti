// Import songs array from an external file (songs.js)
import songs from "./songs.js";

const audioPlayer = new Audio();
const appContainer = $(".app");
const minimizeButton = $(".collapse");
const dropDownMenu = $(".dots");
const coverImage = $(".cover img");
const songTitle = $("h2.name");
const artistName = $("p.artist");
const currentTimeElement = $("#current-time");
const durationElement = $("#duration");
const progressBar = $("#progress");
const playerProgressBar = $("#player-progress");
const favoriteIcon = $(".fav-ico i");
const backwardButton = $(".fa-backward");
const playPauseButton = $(".controls #play");
const forwardButton = $(".fa-forward");
const volumeIcon = $(".volume i");
const shuffleButton = $(".shuffle");
const repeatButton = $(".repeat");
const queueButton = $(".queue");
const closeQueueButton = $("#close");
const queueContainer = $(".music-list");
const queueList = $(".music-list ul");
const favAlert = $(".fav-alert");
const volumeControl = $(".volume-control");
const volumeRange = $(".volume-range");
const volumeBar = $(".volume-bar");
const volumeControlWrapper = $(".volume");

let currentIndex = 0;
let isPlaying = false;
let isShuffleOn = false;
let isRepeatOn = false;
let isToggled = false;
let currentVolume = 0.5;

// Toggle play/pause
function togglePlayPause() {
  if (!isPlaying) {
    playMusic();
  } else {
    pauseMusic();
  }
}

// Play the current song
function playMusic() {
  isPlaying = true;
  playPauseButton.removeClass("fa-play").addClass("fa-pause");
  playPauseButton.attr("title", "Pause");
  audioPlayer.play();
}

// Pause the current song
function pauseMusic() {
  isPlaying = false;
  playPauseButton.removeClass("fa-pause").addClass("fa-play");
  playPauseButton.attr("title", "Play");
  audioPlayer.pause();
}

// Load and play the selected song
function loadAndPlaySong(index) {
  currentIndex = index;
  const currentSong = songs[currentIndex];
  audioPlayer.src = currentSong.path;
  audioPlayer.load();

  // Update UI elements with song information
  coverImage.attr("src", currentSong.poster);
  coverImage.attr("title", `${currentSong.name} - ${currentSong.artist}`);
  songTitle.text(currentSong.name);
  artistName.text(currentSong.artist);
  appContainer.css(
    "background",
    `linear-gradient(to top, rgba(0, 0, 0, 0.5) 60%, ${currentSong.theme})`
  );
  appContainer.css(
    "box-shadow",
    `0px 0px 50px 5px #ffffff51, 0 0 50px 10px ${currentSong.theme}`
  );
  queueContainer.css("box-shadow", `0 -5px 10px ${currentSong.theme}`);

  // Play the song if it was playing before
  if (isPlaying) {
    playMusic();
  }

  // Update the duration once the metadata is loaded
  audioPlayer.addEventListener("loadedmetadata", () => {
    durationElement.text(formatTime(audioPlayer.duration));
  });
}

// Change the current song based on direction (1 for next, -1 for previous)
function changeSong(direction) {
  if (isShuffleOn) {
    currentIndex = getRandomIndex();
  } else {
    currentIndex = (currentIndex + direction + songs.length) % songs.length;
  }
  loadAndPlaySong(currentIndex);
  playMusic();
}

// Get a random index for shuffle mode
function getRandomIndex() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * songs.length);
  } while (randomIndex === currentIndex);
  return randomIndex;
}

// Format time in MM:SS format
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

// Update the progress bar and time display
function updateProgress() {
  const duration = audioPlayer.duration;
  const currentTime = audioPlayer.currentTime;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.css("width", `${progressPercent}%`);
  currentTimeElement.text(formatTime(currentTime));
}

// Set the playback position based on the clicked position on the progress bar
function setPlaybackPosition(e) {
  const width = playerProgressBar.width();
  const clickX = e.offsetX;
  audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
}

function updateVolume() {
  audioPlayer.volume = currentVolume; // Set the audio volume
  volumeBar.css("width", `${currentVolume * 100}%`); // Update the volume bar
  updateVolumeIcon();
}

function updateVolumeIcon() {
  if (currentVolume > 0.5) {
    volumeIcon
      .removeClass("fa-volume-xmark")
      .removeClass("fa-volume-low")
      .addClass("fa-volume-high");
  } else if (currentVolume <= 0.5 && currentVolume > 0) {
    volumeIcon
      .removeClass("fa-volume-xmark")
      .removeClass("fa-volume-high")
      .addClass("fa-volume-low");
  } else {
    volumeIcon
      .removeClass("fa-volume-low")
      .removeClass("fa-volume-high")
      .addClass("fa-volume-xmark");
  }
}

volumeControl.on("click", (e) => {
  const width = volumeRange.width();
  const clickX = e.offsetX;
  currentVolume = clickX / width; // Calculate the new volume based on click position
  updateVolume();
});

function toggleMute() {
  if (currentVolume === 0) {
    // If volume is muted, restore the previous volume
    currentVolume = 0.5; // You can set your preferred default volume here
    volumeIcon.removeClass("fa-volume-xmark").addClass("fa-volume-high");
  } else {
    // If volume is not muted, store the current volume and set to mute
    currentVolume = 0;
    volumeIcon.removeClass("fa-volume-high").addClass("fa-volume-xmark");
  }
  updateVolume(); // Update the volume
}

// Toggle shuffle mode
function toggleShuffleMode() {
  isShuffleOn = !isShuffleOn;
  shuffleButton.toggleClass("active", isShuffleOn);
}

// Toggle repeat mode
function toggleRepeatMode() {
  isRepeatOn = !isRepeatOn;
  repeatButton.toggleClass("active", isRepeatOn);
}

// Show the queue
function showQueue() {
  queueContainer.addClass("show");
}

// Hide the queue
function hideQueue() {
  queueContainer.removeClass("show");
}

// Create the queue list
function createQueueList() {
  queueList.empty();

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];

    const liTag = $(`
      <li>
        <div class="row">
          <span>${song.name}</span>
          <p>${song.artist}</p>
        </div>
        <span class="audio-duration">Loading...</span>
      </li>
    `);

    liTag.on("click", () => {
      loadAndPlaySong(i);
      playMusic();
      updateQueueListDurations();
    });

    queueList.append(liTag);
  }
}

// Update the queue list with song durations
function updateQueueListDurations() {
  const listItems = queueList.find("li");

  for (let i = 0; i < songs.length; i++) {
    const durationSpan = listItems.eq(i).find(".audio-duration");

    if (i === currentIndex && isPlaying) {
      durationSpan.text("Now Playing");
      durationSpan.css("color", "#1db954");
    } else {
      durationSpan.text(formatTime(songs[i].durations));
      durationSpan.css("color", "");
    }
  }
}

// Handle the end of a song
audioPlayer.onended = () => {
  if (isRepeatOn) {
    audioPlayer.currentTime = 0;
    playMusic();
  } else {
    changeSong(1);
  }
};

// Toggle play/pause when play button is clicked
playPauseButton.on("click", togglePlayPause);

// Change to the previous song when backward button is clicked
backwardButton.on("click", () => changeSong(-1));

// Change to the next song when forward button is clicked
forwardButton.on("click", () => changeSong(1));

// Update the progress bar during playback
audioPlayer.addEventListener("timeupdate", updateProgress);

// Set playback position when the progress bar is clicked
playerProgressBar.on("click", setPlaybackPosition);

volumeIcon.on("click", toggleMute);

// Toggle favorite icon (replace with your logic)
favoriteIcon.on("click", () => {
  if (isToggled) {
    favoriteIcon.removeClass("fa-solid").addClass("fa-regular");
    favoriteIcon.css("color", "");
  } else {
    favoriteIcon.removeClass("fa-regular").addClass("fa-solid");
    favoriteIcon.css("color", "#1db954");
    favAlert.addClass("active");
    setInterval(function () {
      favAlert.removeClass("active");
    }, 2000);
  }

  isToggled = !isToggled; // Toggle the favorite state
});

// Toggle shuffle mode when shuffle button is clicked
shuffleButton.on("click", toggleShuffleMode);

// Toggle repeat mode when repeat button is clicked
repeatButton.on("click", toggleRepeatMode);

// Show the queue when the queue button is clicked
queueButton.on("click", showQueue);

// Close the queue when the close queue button is clicked
closeQueueButton.on("click", hideQueue);

// Handle keyboard events (e.g., spacebar to play/pause)
$(window).on("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    togglePlayPause();
  }
});

// Load and play the initial song
loadAndPlaySong(currentIndex);

// Create and update the queue list
createQueueList();
volumeControl.hide();

// Update the queue list durations (including "Now Playing")
setInterval(updateQueueListDurations, 1000);

// Show volume control when hovering over the volume icon
volumeIcon.on("mouseenter", () => {
  volumeControl.show();
});

// Hide volume control when mouse leaves volume icon
volumeIcon.on("mouseleave", () => {
  // Delay hiding volume control to allow time for the user to hover over it
  setTimeout(() => {
    if (!volumeControl.is(":hover")) {
      volumeControl.hide();
    }
  }, 500); // Adjust the delay time as needed
});

// Hide volume control when clicking outside the volume icon and volume control
$(document).on("click", (e) => {
  if (
    !volumeIcon.is(e.target) &&
    !volumeControl.is(e.target) &&
    volumeIcon.has(e.target).length === 0 &&
    volumeControl.has(e.target).length === 0
  ) {
    volumeControl.hide();
  }
});
