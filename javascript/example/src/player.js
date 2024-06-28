const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const progressContainer = document.getElementById('progress-container');
const progressFilled = document.getElementById('progress-filled');
const progressThumb = document.getElementById('progress-thumb');
const loading = document.querySelector('.loading');
const fileInput = document.getElementById('file-input');
const selectVideoButton = document.getElementById('select-video');
// const playPauseButton = document.getElementById('play-pause');
const restartButton = document.getElementById('restart');
const closeButton = document.getElementById('close-button');
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');
const handle = document.querySelector('.divider');

let detector;
let poseNetLoaded = false;
let lastPoses = [];
let videoAspectRatio = 16 / 9;
let lowResCanvas;
let lowResolution = 720;

document.addEventListener('DOMContentLoaded', loadMoveNet);

async function loadMoveNet() {
  try {
    const model = poseDetection.SupportedModels.MoveNet;
    detector = await poseDetection.createDetector(model);
    console.log('MoveNet loaded successfully');
    poseNetLoaded = true;
  } catch (err) {
    console.error('Error loading the MoveNet model', err);
  }
}

video.addEventListener('loadedmetadata', () => {
  videoAspectRatio = video.videoWidth / video.videoHeight;
  resizeCanvas();
  createLowResCanvas();
});

video.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('mousedown', startProgressDrag);
selectVideoButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', loadVideo);
// playPauseButton.addEventListener('click', playPause);
restartButton.addEventListener('click', restart);
closeButton.addEventListener('click', closeVideo);

function createLowResCanvas() {
  lowResCanvas = document.createElement('canvas');
  const aspectRatio = video.videoWidth / video.videoHeight;
  lowResCanvas.width = lowResolution;
  lowResCanvas.height = Math.round(lowResolution / aspectRatio);
}

function resizeCanvas() {
  const containerRect = leftSide.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  let canvasWidth, canvasHeight;

  if (containerWidth / containerHeight > videoAspectRatio) {
    canvasHeight = containerHeight;
    canvasWidth = canvasHeight * videoAspectRatio;
  } else {
    canvasWidth = containerWidth;
    canvasHeight = canvasWidth / videoAspectRatio;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  canvas.style.position = 'absolute';
  canvas.style.top = `${(containerHeight - canvasHeight) / 2}px`;

  if (lastPoses.length > 0) {
    drawPoses(lastPoses);
  }
}

function drawPoses(poses) {
  lastPoses = poses;
  const context = canvas.getContext('2d');
  
  context.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / lowResCanvas.width;
  const scaleY = canvas.height / lowResCanvas.height;

  const minDimension = Math.min(canvas.width, canvas.height);
  const keyPointRadius = minDimension * 0.01;
  const lineWidth = minDimension * 0.005;

  if (poses.length > 0) {
    const pose = poses[0];

    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.2) {
        context.beginPath();
        context.arc(keypoint.x * scaleX, keypoint.y * scaleY, keyPointRadius, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
      }
    });

    const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
    adjacentPairs.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (kp1.score > 0.2 && kp2.score > 0.2) {
        context.beginPath();
        context.moveTo(kp1.x * scaleX, kp1.y * scaleY);
        context.lineTo(kp2.x * scaleX, kp2.y * scaleY);
        context.strokeStyle = 'red';
        context.lineWidth = lineWidth;
        context.stroke();
      }
    });

    const angles = calculateAllAngles(pose.keypoints);
    displayAngles(context, angles);
  }
}

function calculateAllAngles(keypoints) {
  const angles = {};
  
  const angleDefinitions = [
    { name: "Left Elbow", points: [5, 7, 9] },
    { name: "Right Elbow", points: [6, 8, 10] },
    { name: "Left Shoulder", points: [11, 5, 7] },
    { name: "Right Shoulder", points: [12, 6, 8] },
    { name: "Left Hip", points: [5, 11, 13] },
    { name: "Right Hip", points: [6, 12, 14] },
    { name: "Left Knee", points: [11, 13, 15] },
    { name: "Right Knee", points: [12, 14, 16] }
  ];

  angleDefinitions.forEach(def => {
    const [a, b, c] = def.points.map(i => keypoints[i]);
    if (a.score > 0.2 && b.score > 0.2 && c.score > 0.2) {
      angles[def.name] = calculateAngle(a, b, c);
    }
  });

  return angles;
}

function calculateAngle(A, B, C) {
  const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI);
}

function displayAngles(context, angles) {
  context.font = '14px Arial';
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.lineWidth = 3;

  let y = 30;
  for (const [name, angle] of Object.entries(angles)) {
    const text = `${name}: ${angle.toFixed(1)}°`;
    context.strokeText(text, 10, y);
    context.fillText(text, 10, y);
    y += 20;
  }
}

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
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'auto';
    video.style.display = 'block';
    document.querySelector('.controls').style.display = 'flex';
    resizeCanvas();
    createLowResCanvas();
    estimatePoses();
  }
}

const playPauseAnimation = document.getElementById('play-pause-animation');

canvas.addEventListener('click', togglePlayPause);

function togglePlayPause() {
  if (video.paused) {
    video.play();
    playPauseAnimation.className = 'play-pause-animation play';
    requestAnimationFrame(estimatePoses);
  } else {
    video.pause();
    playPauseAnimation.className = 'play-pause-animation pause';
  }
  
  playPauseAnimation.style.display = 'block';
  setTimeout(() => {
    playPauseAnimation.style.display = 'none';
  }, 1000);
}

function restart() {
  video.currentTime = 0;
  video.play();
  requestAnimationFrame(estimatePoses);
}

const recordDataButton = document.getElementById('record-data');
export let timeMarkers = [];

recordDataButton.addEventListener('click', recordData);

function recordData() {
  const currentTime = video.currentTime;
  const angles = calculateAllAngles(lastPoses[0].keypoints);
  
  timeMarkers.push({ time: currentTime, angles: angles });
  addMarkerToProgressBar(currentTime);
}

function addMarkerToProgressBar(time) {
  const progress = (time / video.duration) * 98 + 1;
  const marker = document.createElement('div');
  marker.className = 'progress-marker';
  marker.style.left = `${progress}%`;
  marker.addEventListener('click', (e) => {
    e.stopPropagation();
    video.currentTime = time;
    updateProgress();
    if (video.paused) {
      estimatePoses();
    }
  });
  progressContainer.appendChild(marker);
}

function updateProgress() {
  const progress = (video.currentTime / video.duration) * 98 + 2;
  let thickness = progressThumb.clientWidth;
  progressFilled.style.width = `calc(${progress}% - ${thickness}px)`;
  progressThumb.style.left = `calc(${progress}% - ${thickness}px)`; 
}

function startProgressDrag(e) {
  updateProgressWithEvent(e);
  document.addEventListener('mousemove', updateProgressWithEvent);
  document.addEventListener('mouseup', stopProgressDrag);
  document.body.style.userSelect = 'none';
}

function stopProgressDrag() {
  document.removeEventListener('mousemove', updateProgressWithEvent);
  document.removeEventListener('mouseup', stopProgressDrag);
  document.body.style.userSelect = '';
  if (video.paused) {
    estimatePoses();
  }
}

function updateProgressWithEvent(e) {
  const rect = progressContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;
  const newTime = (x / width) * video.duration;
  video.currentTime = newTime;
  updateProgress();
  if (video.paused) {
    estimatePoses();
  }
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
    thumbnailDiv.style.display = 'none';
    progressContainer.insertBefore(thumbnailDiv, progressFilled);

    context.drawImage(video, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    thumbnailDiv.style.backgroundImage = `url(${thumbnailCanvas.toDataURL()})`;
  }

  loading.style.display = 'none';
  const thumbnails = document.querySelectorAll('.progress-thumbnail');
  thumbnails.forEach(thumbnail => thumbnail.style.display = 'block');

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
  video.style.display = 'none';
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
  document.body.style.userSelect = 'none';
});

function onDrag(event) {
  if (!isDragging) return;

  const containerRect = document.querySelector('.container').getBoundingClientRect();
  const newWidth = event.clientX - containerRect.left;

  if (newWidth > 400 && newWidth < containerRect.width - 400) {
    leftSide.style.width = `${newWidth}px`;
    rightSide.style.width = `${containerRect.width - newWidth}px`;
    resizeCanvas();
  }
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.body.style.userSelect = '';
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createLowResCanvas();
});

async function estimatePoses() {
  if (video.readyState >= 2 && poseNetLoaded) {
    const lowResContext = lowResCanvas.getContext('2d');
    lowResContext.drawImage(video, 0, 0, lowResCanvas.width, lowResCanvas.height);
    
    const poses = await detector.estimatePoses(lowResCanvas, {
      flipHorizontal: false
    });
    drawPoses(poses);
    console.log(video.paused);
  }
  if (!video.paused) {
    requestAnimationFrame(estimatePoses);
  }
}