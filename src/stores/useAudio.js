import { create } from 'zustand';
import useSpinamp from './useSpinamp';
import config from '@/data';

export default create((set, get) => ({
  audioContext: null,
  analyser: null,
  ready: false,
  suspended: true,
  playing: null,

  /*
   * Audio
   */
  init: () => set({ audioContext: new AudioContext(), ready: true }),
  reset: () => set({ ready: false, suspended: true, playing: null }),

  start: (data) => {
    const { ready, init, playing, createAnalyser } = get();
    if (!ready) init();

    // If just playing again after pause
    if (playing && playing.data.id === data.id) {
      playing.audio.play();
      set({ suspended: false });
      return;
    }

    // If playing another song
    if (playing) playing.audio.pause();

    const audio = new Audio(data.lossyAudioUrl);
    audio.volume = 1;
    audio.loop = true;
    audio.preload = 'none';
    audio.crossOrigin = 'anonymous';
    audio.play();

    createAnalyser(audio);

    set({ playing: { audio, data }, suspended: false });
  },

  play: () => {
    const { playing } = get();
    if (!playing) return;

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

    const newSource =
      tracks.items[direction === 'next' ? index + 1 : index - 1];
    // Should not happen but just in case
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
