import { create } from 'zustand';
import useSpinamp from './useSpinamp';
import config from '@/data';

export default create((set, get) => ({
  audioContext: null,
  analyser: null,
  ready: false,
  suspended: true,
  // Current song
  playing: null,
  duration: 0,
  loop: false,

  /*
   * Audio
   */
  init: () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      set({ audioContext, ready: true });
    } catch (err) {
      console.log('err', err);
    }
  },
  reset: () => set({ ready: false, suspended: true, playing: null }),

  start: (data, onlyPrepare = false) => {
    const { ready, init, playing, createAnalyser, navigate, loop } = get();
    if (!ready && !onlyPrepare) init();

    // Just to make sure
    if (playing && playing.data.id === data.id && !onlyPrepare) {
      playing.audio.play();
      set({ suspended: false });
      return;
    }

    // If playing another song
    if (playing) {
      playing.audio.pause();
      // Remove any listener
      playing?.audio.removeEventListener('loadedmetadata', () => {});
      set({ duration: 0 });
    }

    const audio = new Audio(data.lossyAudioUrl);
    audio.volume = 1;
    audio.loop = loop;
    audio.preload = 'none';
    audio.crossOrigin = 'anonymous';
    if (!onlyPrepare) audio.play();

    // Set the duration when the song is loaded
    audio.addEventListener('loadedmetadata', () => {
      set({ duration: audio.duration });
    });
    // Play the next song when the current one is finished (if loop is off)
    audio.addEventListener('ended', () => {
      // if (loop) return;
      navigate('next');
    });

    if (!onlyPrepare) {
      createAnalyser(audio);
      set({ suspended: false });
    }

    set({ playing: { audio, data } });
  },

  play: () => {
    const { playing, ready, analyser, init, createAnalyser } = get();
    if (!playing) return;

    // Just for shared page
    if (!ready) init();
    if (!analyser) createAnalyser(playing.audio);

    playing.audio.play();
    set({ suspended: false });
  },

  pause: () => {
    const { playing } = get();
    if (!playing) return;

    playing.audio.pause();
    set({ suspended: true });
  },

  navigate: (direction) => {
    const { playing, start } = get();
    const { tracks } = useSpinamp.getState();
    if (!playing || !tracks?.items) return;

    const index = tracks.items.findIndex((s) => s.id === playing.data.id);
    if (index === -1) return;

    // If the current one has an event listener, remove it
    playing.audio.removeEventListener('ended', () => {});

    const newSource =
      tracks.items[direction === 'next' ? index + 1 : index - 1];
    // Should not happen but just in case
    if (!newSource) return;

    start(newSource);
  },

  updateTime: (e, slider) => {
    const { playing } = get();
    if (!playing || !slider) return;

    const { width, left } = slider.getBoundingClientRect();
    const x = e.clientX - left;
    const percent = (x / width) * 100;
    const time = (percent * playing.audio.duration) / 100;

    playing.audio.currentTime = time;
  },

  toggleLoop: () => {
    const { playing, loop } = get();
    if (playing) playing.audio.loop = !loop;
    set({ loop: !loop });
  },

  /*
   * Analyser
   */
  createAnalyser: (audio) => {
    const { audioContext } = get();

    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const splitter = audioContext.createChannelSplitter(2);

    source.connect(splitter);
    splitter.connect(analyser, 0, 0);
    splitter.connect(analyser, 1, 0);
    analyser.connect(audioContext.destination);

    set({ analyser });
  },

  getAnalyserData: () => {
    const { audioContext, analyser } = get();
    if (!analyser) return null;
    const frequencyRange = [20, 20000]; // change this to experiment with different ranges
    let averageFrequency = 0;

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    // Get the gain
    const gain = data.reduce((a, b) => a + b) / data.length;
    // Find the average frequency
    let sum = 0;
    const lowerIndex = Math.round(
      frequencyRange[0] / (audioContext.sampleRate / bufferLength),
    );
    const upperIndex = Math.round(
      frequencyRange[1] / (audioContext.sampleRate / bufferLength),
    );
    for (let i = lowerIndex; i <= upperIndex; i++) {
      sum += data[i];
    }
    averageFrequency = sum / (upperIndex - lowerIndex + 1);

    // Get the stereo factor (-1=more left, 1=more right, 0=balanced)
    const leftAmplitude = data.reduce((acc, val, index) => {
      if (index < bufferLength / 2) {
        return acc + val;
      } else {
        return acc;
      }
    }, 0);
    const rightAmplitude = data.reduce((acc, val, index) => {
      if (index >= bufferLength / 2) {
        return acc + val;
      } else {
        return acc;
      }
    }, 0);

    const balance = (leftAmplitude - rightAmplitude) / bufferLength;

    return {
      frequency: averageFrequency / 255,
      gain: gain / 255,
      pan: balance / 100,
    };
  },
}));
