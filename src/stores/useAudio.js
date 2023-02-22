import { create } from 'zustand';
import config from '@/data';

export default create((set, get) => ({
  audioContext: null,
  sources: [],
  setSources: (sources) => set({ sources }),
  analyser: null,
  started: false,
  suspended: true,

  // ! Don't use sources, instead just audio with 1 file
  // ! On init, return false if no audio

  /*
   * Audio
   */
  init: () => {
    const { sources, started, createAnalyser } = get();
    if (started) return;

    const audioContext = new AudioContext();

    sources.forEach((ref, index) => {
      // Only play the first one
      if (ref?.current) {
        if (index !== 0) ref.current.volume = 0;
        ref.current.play();
      }
    });

    set({ audioContext, started: true, suspended: false });
    createAnalyser();
  },

  reset: () => {
    set({ started: false, suspended: true });
  },

  update: (audioObject) => {
    const { sources, started, createAnalyser } = get();
    if (!started) return;

    // Don't start again if it's the same
    // e.g. returning to _experience from another page
    const index = config.audio.files.findIndex((v) => v === audioObject) || 0;
    const alreadyplayingIndex = sources.findIndex(
      (ref) => ref?.current?.volume === 1,
    );
    if (index === alreadyplayingIndex) return;

    sources.forEach((ref, i) => {
      if (!ref?.current) return;

      if (i === index) {
        ref.current.volume = 1;
        ref.current.currentTime = 0;
      } else {
        ref.current.volume = 0;
      }
    });

    createAnalyser();
  },

  toggleMute: () => {
    const { audioContext } = get();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
      set({ suspended: false });
    } else {
      audioContext.suspend();
      set({ suspended: true });
    }
  },

  /*
   * Analyser
   */
  createAnalyser: () => {
    const { audioContext, sources } = get();
    const index = sources.findIndex((ref) => ref?.current?.volume === 1) || 0;

    const source = audioContext.createMediaElementSource(
      sources[index]?.current,
    );
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;

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
