import { create } from 'zustand';
import config from '@/data';

export default create((set, get) => ({
  audioContext: null,
  sources: [],
  setSources: (sources) => set({ sources }),
  analyser: null,
  ready: false,
  suspended: true,
  playing: null,

  // ! Don't use sources, instead just audio with 1 file
  // ! On init, return false if no audio

  // maybe addSource & removeSource that do both in player and in array
  // playing that takes some id of the playing song to display the right logo
  // if click on play of another song, add it beginning of the array and play it so it keeps the queue
  // when next song is playing, should remove from sources array if it exists

  /*
   * Audio
   */
  init: () => set({ audioContext: new AudioContext(), ready: true }),
  reset: () => set({ ready: false, suspended: true, playing: null }),

  start: (data) => {
    const { ready, init, playing, createAnalyser } = get();
    if (!ready) init();

    // If just playing again after pause
    if (playing && playing.data.url === data.url) {
      playing.audio.play();
      set({ suspended: false });
      return;
    }

    // If playing another song
    if (playing) playing.audio.pause();

    const audio = new Audio(data.url);
    audio.volume = 1;
    audio.loop = true;
    audio.preload = 'none';
    audio.crossOrigin = 'anonymous';
    audio.play();

    createAnalyser(audio);

    set({ playing: { audio, data }, suspended: false });
  },

  stop: () => {
    const { playing } = get();
    if (!playing) return;

    playing.audio.pause();
    set({ suspended: true });
  },

  navigate: (direction) => {
    const { playing, sources, start } = get();
    if (!playing) return;

    const index = sources.findIndex((s) => s.url === playing.data.url);
    if (index === -1) return;

    // Should not happen but just in case
    const newSource = sources[direction === 'next' ? index + 1 : index - 1];
    if (!newSource) return;

    start(newSource);
  },

  /*
   * Analyser
   */
  createAnalyser: (audio) => {
    const { audioContext } = get();

    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    set({ analyser });
  },

  getAnalyserData: () => {
    const { audioContext, analyser } = get();
    if (!analyser) return null;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    // Get the gain
    const gain = data.reduce((a, b) => a + b) / data.length;
    // Find the main frequency
    const mainFrequencyIndex = data.indexOf(Math.max(...data));
    const mainFrequencyInHz =
      (mainFrequencyIndex * (audioContext.sampleRate / 2)) /
      analyser.frequencyBinCount;

    return { frequency: mainFrequencyInHz, gain: gain / 255 };
  },
}));
