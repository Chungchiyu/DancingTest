window.video = document.getElementById('video');
const canvas = document.getElementById('canvas');
window.progressContainer = document.getElementById('progress-container');
const progressFilled = document.getElementById('progress-filled');
const progressThumb = document.getElementById('progress-thumb');
const loading = document.querySelector('.loading');
const fileInput = document.getElementById('file-input');
const selectVideoButton = document.getElementById('select-video');
// const playPauseButton = document.getElementById('play-pause');
const restartButton = document.getElementById('restart');
const closeButton = document.getElementById('close-button');
const poseButton = document.getElementById('pose-button');
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');
const handle = document.querySelector('.divider');
const poseDetectToggle = document.getElementById('poseDetect');
window.linkRobot = document.getElementById('link-robot');
const DEG2RAD = Math.PI / 180;

let poseNetLoaded = false;
let lastPoses = [];
let lastPoseAngles;
let videoAspectRatio = 16 / 9;
let lowResCanvas;
let lowResolution = 720;

document.addEventListener('DOMContentLoaded', LoadMediaPipe);

let model;
let detector;

async function initPoseDetector() {
  model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'mediapipe',
    modelType: 'full',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
    enableSmoothing: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  };
  return await poseDetection.createDetector(model, detectorConfig);
}

async function detectPose(detector, video) {
  return await detector.estimatePoses(video, {
    flipHorizontal: false
  });
}

async function LoadMediaPipe() {
  try {
    detector = await initPoseDetector();
    console.log('MediaPipe loaded successfully');
    poseNetLoaded = true;
  } catch (err) {
    console.error('Error loading the MediaPipe model', err);
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

poseDetectToggle.addEventListener('click', () => { 
  poseDetectToggle.classList.toggle('checked');
  estimatePoses();
  if (poseDetectToggle.classList.contains('checked'))
    canvas.style.display = '';
  else
    canvas.style.display = 'none';
 });

linkRobot.addEventListener('click', () => { 
  linkRobot.classList.toggle('checked');
  estimatePoses();
});

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
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / video.videoWidth;
  const scaleY = canvas.height / video.videoHeight;

  const minDimension = Math.min(canvas.width, canvas.height);
  const keyPointRadius = minDimension * 0.008;
  const lineWidth = minDimension * 0.005;

  if (poses.length > 0) {
    const pose = poses[0];

    poses.forEach(pose => {
  
      const connections = poseDetection.util.getAdjacentPairs(model);
      connections.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];
        if (kp1.score > 0.3 && kp2.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(kp1.x * scaleX, kp1.y * scaleY);
          ctx.lineTo(kp2.x * scaleX, kp2.y * scaleY);
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }
      });

      pose.keypoints.forEach((keypoint, index) => {
        const noDraw = index < 10 && index != 2 && index != 5 && index != 9 && index != 10;
        if (keypoint.score > 0.3 && !noDraw) {
          ctx.beginPath();
          ctx.arc(keypoint.x * scaleX, keypoint.y * scaleY, keyPointRadius, 0, 2 * Math.PI);
          ctx.fillStyle = 'blue';
          ctx.fill();
          ctx.strokeStyle = 'yellow'
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    const angles = calculateAllAngles(pose.keypoints3D);
    displayAngles(ctx, angles);

    const remapAngles = angleMapping(angles);
    lastPoseAngles = remapAngles;

    if (linkRobot.classList.contains('checked')) {
      Object.keys(window.viewer.robot.joints).slice(0, 6).map((jointName, index) => {
        window.viewer.setJointValue(jointName, Object.entries(remapAngles)[index][1] * DEG2RAD);
      });
    }
  }

  // if (poses.length > 0) {
  //   const pose = poses[0];
  //   pose.keypoints3D.forEach(keypoint => {
  //     if (keypoint.score > 0.3) {
        
  //       const [x, y] = project3DTo2D(keypoint.x, keypoint.y, keypoint.z);
  //       ctx.beginPath();
  //       ctx.arc(x * scaleX, y * scaleY, keyPointRadius, 0, 2 * Math.PI);
  //       ctx.fillStyle = 'blue';
  //       ctx.fill();
  //     }
  //   });
  // }
}

function angleMapping(angles) {
  const out = [];

  out.A1 = angles.A1 > 90 ? 90 : angles.A1;
  out.A1 = angles.A1 < -90 ? -90 : angles.A1;
  out.A1 = map(out.A1, 90, -90, -110, 110);

  out.A2 = angles.A2 > 180 ? 180 : angles.A2;
  out.A2 = angles.A2 < -180 ? -180 : angles.A2;
  out.A2 = map(angles.A2, 60, 0, -50, 0);

  out.A3 = angles.A3 > 180 ? 180 : angles.A3;
  out.A3 = angles.A3 < -180 ? -180 : angles.A3;
  out.A3 = map(angles.A3, 0, 180, -80, 90);

  out.A4 = 0;

  out.A5 = angles.A5 > 180 ? 180 : angles.A5;
  out.A5 = angles.A5 < -180 ? -180 : angles.A5;
  out.A5 = map(angles.A5, 180, 90, 0, -90);

  out.A6 = 0;

  return out;
}

function map(input, in_min, in_max, out_min, out_max) {
  return (input - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function calculateAllAngles(keypoints3D, groupName = "default") {
  const angles = {};
  const group = window.groups.find(g => g.name === groupName);
  if (!group || !group.data) {
    console.error('Group not found or group data is empty');
    return angles;
  }
  Object.entries(group.data).forEach(([key, value]) => {
    const points = value.split(',').map(id => id.trim());
    
    if (points.length === 3) {
      const [a, b, c] = points.map(i => {
        if (["OH", "DV", "RH", "IH", "UV", "LH"].includes(i)) return i;
        return keypoints3D[parseInt(i)] || { x: 0, y: 0, z: 0, score: 0 };
      });
      if ((a.score > 0.2 && b.score > 0.2) || typeof c === 'string') {
        angles[key] = calculateAngle3D(a, b, c);
      } else {
        console.warn(`Low confidence for angle ${key}, skipping calculation`);
      }
    } else {
      console.warn(`Invalid number of points for angle ${key}, expected 3 but got ${points.length}`);
    }
  });
  return angles;
}

function calculateAngle3D(A, B, C) {
  // Vector from B to A
  const BA = { x: A.x - B.x, y: A.y - B.y, z: A.z - B.z };
  
  let axisVector;
  switch(C) {
    case "OH": axisVector = { x: 0, y: 0, z: -1 }; break;
    case "DV": axisVector = { x: 0, y: -1, z: 0 }; break;
    case "RH": axisVector = { x: 1, y: 0, z: 0 }; break;
    case "IH": axisVector = { x: 0, y: 0, z: 1 }; break;
    case "UV": axisVector = { x: 0, y: 1, z: 0 }; break;
    case "LH": axisVector = { x: -1, y: 0, z: 0 }; break;
    default:
      // If C is not one of the special cases, calculate as before
      const BC = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };
      return calculateAngleBetweenVectors(BA, BC);
  }
  
  return calculateAngleBetweenVectors(BA, axisVector);
}

function calculateAngleBetweenVectors(v1, v2) {
  // Calculate dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  
  // Calculate magnitudes
  const magnitudeV1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z);
  const magnitudeV2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y + v2.z*v2.z);
  
  // Calculate angle
  const angle = Math.acos(dotProduct / (magnitudeV1 * magnitudeV2));
  return angle * (180 / Math.PI);
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
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
    poseButton.style.display = 'flex';
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
video.addEventListener('click', togglePlayPause);

function togglePlayPause() {
  if (video.paused) {
    video.play();
    playPauseAnimation.className = 'play-pause-animation play';
    if (poseDetectToggle.classList.contains('checked'))
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
window.jointsData = [];

recordDataButton.addEventListener('click', recordData);

function recordData() {
  const currentTime = video.currentTime;

  jointsData = [{ time: currentTime, angles: lastPoseAngles }];
  addMarkerToProgressBar(currentTime);

  window.newCard();
}

function addMarkerToProgressBar(time) {
  const progress = (time / video.duration) * 99 + 1;
  const marker = document.createElement('div');
  marker.className = 'progress-marker';
  progressContainer.appendChild(marker);
  marker.style.left = `calc(${progress}% - ${marker.clientWidth / 2}px)`;
  marker.addEventListener('click', (event) => {
    marker.addEventListener('mousedown', (event) => {
      event.stopPropagation();
    });
    event.stopPropagation();
    video.currentTime = time;
    updateProgress();
  });
}

function updateProgress() {
  const progress = (video.currentTime / video.duration) * 99 + 1;
  let thickness = progressThumb.clientWidth;
  progressFilled.style.width = `calc(${progress}% - ${thickness / 2}px)`;
  progressThumb.style.left = `calc(${progress}% - ${thickness / 2}px)`;
  if (poseDetectToggle.classList.contains('checked') || video.paused)
    estimatePoses();
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
  poseButton.style.display = 'none';
  document.querySelector('.modal').style.display = 'none';
  const thumbnails = document.querySelectorAll('.progress-thumbnail');
  thumbnails.forEach(thumbnail => thumbnail.remove());
  progressContainer.querySelectorAll('.progress-marker').forEach(mark => mark.remove());
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

// async function estimatePoses() {
//   console.log('estimation');
//   if (video.readyState >= 2 && poseNetLoaded) {
//     const lowResContext = lowResCanvas.getContext('2d');
//     lowResContext.drawImage(video, 0, 0, lowResCanvas.width, lowResCanvas.height);

//     const poses = await detector.estimatePoses(lowResCanvas, {
//       flipHorizontal: false
//     });
//     drawPoses(poses);
//   }
//   if (!video.paused) {
//     requestAnimationFrame(estimatePoses);
//   }
// }

async function estimatePoses() {
  if (poseDetectToggle.classList.contains('checked')) {
    console.log('estimation');
    if (video.readyState >= 2 && poseNetLoaded) {
      const lowResContext = lowResCanvas.getContext('2d');
      lowResContext.drawImage(video, 0, 0, lowResCanvas.width, lowResCanvas.height);

      const poses = await detectPose(detector, video);
      drawPoses(poses);
    }
    if (!video.paused) {
      requestAnimationFrame(estimatePoses);
    }
  }
}

poseButton.addEventListener('click', () => {
  const poseList = document.querySelectorAll('.field');
  poseList.forEach((e, index) => {
    e.innerHTML = `${angleDefinitions[index].name}: ${angleDefinitions[index].points}`;
  });

  document.querySelector('.modal').style.zIndex = '1000';
  document.querySelector('.modal').classList.toggle('show');
  document.querySelector('.overlay').classList.toggle('show');
});
document.querySelector('.overlay').addEventListener('click', () => {
  document.querySelector('.modal').classList.remove('show');
  document.querySelector('.overlay').classList.remove('show');
  setTimeout(() => {
    document.querySelector('.modal').style.zIndex = '-1';
  }, 500);
});

let angle_field = document.querySelectorAll('fields');

angle_field.children.addEventListener('click', () => {

});