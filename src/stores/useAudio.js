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
  createAnalyser: (audio) => {
    console.log('createAnalyser', audio);
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
