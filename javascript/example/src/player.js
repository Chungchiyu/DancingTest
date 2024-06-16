import * as posenet from '@tensorflow-models/posenet';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const progressContainer = document.getElementById('progress-container');
const progressFilled = document.getElementById('progress-filled');
const progressThumb = document.getElementById('progress-thumb');
const loading = document.querySelector('.loading');
const fileInput = document.getElementById('file-input');
const selectVideoButton = document.getElementById('select-video');
const playPauseButton = document.getElementById('play-pause');
const restartButton = document.getElementById('restart');
const closeButton = document.getElementById('close-button');
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');
const handle = document.querySelector('.divider');

let poseNet;
let poseNetLoaded = false;

video.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('mousedown', startProgressDrag);

selectVideoButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', loadVideo);
playPauseButton.addEventListener('click', playPause);
restartButton.addEventListener('click', restart);
closeButton.addEventListener('click', closeVideo);

async function loadVideo(event) {
  const file = event.target.files[0];
  if (file) {
    video.src = URL.createObjectURL(file);
    loading.style.display = 'block';
    canvas.style.display = 'none';
    selectVideoButton.style.display = 'none';
    await video.play();
    video.pause();
    await generateThumbnails();
    closeButton.style.display = 'flex';
    event.target.value = '';
    loadPoseNet();
  }
}

async function loadPoseNet() {
  poseNet = await posenet.load();
  canvas.style.display = 'block';
  document.querySelector('.controls').style.display = 'flex';
  console.log("PoseNet Loaded.");
  poseNetLoaded = true;
}

function playPause() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function restart() {
  video.currentTime = 0;
  video.play();
}

function updateProgress() {
  const progress = (video.currentTime / video.duration) * 98 + 1;
  progressFilled.style.width = `${progress}%`;
  progressThumb.style.left = `${progress}%`;
  if (poseNetLoaded)
    estimatePoses();
}

function startProgressDrag(e) {
  updateProgressWithEvent(e);
  document.addEventListener('mousemove', updateProgressWithEvent);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', updateProgressWithEvent);
    document.body.style.userSelect = '';
  });
  document.body.style.userSelect = 'none';
}

function updateProgressWithEvent(e) {
  const rect = progressContainer.getBoundingClientRect();
  const x = e.clientX - rect.left + handle.style.width / 2;
  const width = rect.width;
  const newTime = (x / width) * video.duration;
  video.currentTime = newTime;
  updateProgress();
}

async function generateThumbnails() {
  const duration = video.duration;
  const thumbnailCount = 20;
  const thumbnailCanvas = document.createElement('canvas');
  const context = thumbnailCanvas.getContext('2d');

  thumbnailCanvas.width = 160;
  thumbnailCanvas.height = 90;

  for (let i = 0; i < thumbnailCount; i++) {
    const thumbnailTime = (i / thumbnailCount) * duration;

    await setVideoCurrentTime(video, thumbnailTime);

    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'progress-thumbnail';
    thumbnailDiv.style.display = 'none'; // Hide thumbnails initially
    progressContainer.insertBefore(thumbnailDiv, progressFilled);

    context.drawImage(video, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    thumbnailDiv.style.backgroundImage = `url(${thumbnailCanvas.toDataURL()})`;
  }

  loading.style.display = 'none';
  canvas.style.display = 'block'; // Show video after generating thumbnails
  document.querySelector('.controls').style.display = 'flex';

  const thumbnails = document.querySelectorAll('.progress-thumbnail');
  thumbnails.forEach(thumbnail => thumbnail.style.display = 'block'); // Show thumbnails after generation

  video.currentTime = 0;
}

async function setVideoCurrentTime(video, time) {
  return new Promise(resolve => {
    video.currentTime = time;
    video.addEventListener('seeked', resolve, { once: true });
  });
}

function closeVideo() {
  video.pause();
  video.src = "";
  selectVideoButton.style.display = 'flex';
  canvas.style.display = 'none';
  document.querySelector('.controls').style.display = 'none';
  closeButton.style.display = 'none';
  const thumbnails = document.querySelectorAll('.progress-thumbnail');
  thumbnails.forEach(thumbnail => thumbnail.remove());
}

let isDragging = false;

handle.addEventListener('mousedown', (event) => {
  isDragging = true;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.userSelect = 'none'; // Prevent text selection while dragging
});

function onDrag(event) {
  if (!isDragging) return;

  const containerRect = document.querySelector('.container').getBoundingClientRect();
  const newWidth = event.clientX - containerRect.left;

  if (newWidth > 400 && newWidth < containerRect.width - 400) {
    leftSide.style.width = `${newWidth}px`;
    rightSide.style.width = `${containerRect.width - newWidth}px`;
  }
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.body.style.userSelect = ''; // Re-enable text selection after dragging
}

async function estimatePoses() {
  if (video.readyState >= 2) { // Ensure video is ready
    const pose = await poseNet.estimateSinglePose(video, {
      flipHorizontal: false,
      decodingMethod: 'single-person'
    });
    console.log(pose);
    drawPoses(pose);
  }
}

function drawPoses(pose) {
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  video.width = video.videoWidth;
  video.height = video.videoHeight;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (pose) {
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.2) {
        context.beginPath();
        context.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
      }
    });
  }
}
