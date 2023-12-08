let stream = null,
  mixedStream = null,
  chunks = [],
  recorder = null;
(startButton = null),
  (stopButton = null),
  (downloadButton = null),
  (recordedVideo = null);

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    setupVideoFeedback();
  } catch (err) {
    console.error(err);
  }
}

function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector('.video-feedback');
    video.srcObject = stream;
    video.play();
  } else {
    console.warn('No stream available');
  }
}

async function startRecording() {
  await setupStream();

  if (stream) {
    mixedStream = new MediaStream([
      ...stream.getTracks(),
    ]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.start(1000);

    startButton.disabled = true;
    stopButton.disabled = false;

    console.log('Recording started');
  } else {
    console.warn('No stream available.');
  }
}

function stopRecording() {
  recorder.stop();

  startButton.disabled = false;
  stopButton.disabled = true;
}

function handleDataAvailable(e) {
  chunks.push(e.data);
}

function handleStop(e) {
  const blob = new Blob(chunks, { type: 'video/mkv' });
  chunks = [];

  downloadButton.href = URL.createObjectURL(blob);
  downloadButton.download = 'video.mkv';
  downloadButton.disabled = false;

  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.load();
  recordedVideo.onloadeddata = function () {
    const rc = document.querySelector('.recorded-video-wrap');
    rc.classList.remove('hidden');
    rc.scrollIntoView({ behavior: 'smooth', block: 'start' });

    recordedVideo.play();
  };

  stream.getTracks().forEach((track) => track.stop());

  console.log('Recording stopped');
}

window.addEventListener('load', () => {
  startButton = document.querySelector('.start-recording');
  stopButton = document.querySelector('.stop-recording');
  downloadButton = document.querySelector('.download-video');
  recordedVideo = document.querySelector('.recorded-video');

  startButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);
});
