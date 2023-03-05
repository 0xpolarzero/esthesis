import config from '@/data';
import { create } from 'zustand';
import useAudio from './useAudio';
import useSwarm from './useSwarm';

const { shaders: OPTIONS_SHADERS } = config.options;

export default create((set, get) => ({
  // Get the exhaustive args for the link
  getLink: () => {
    const { colorA, colorB, background, pattern, count, effects } =
      useSwarm.getState();
    const { playing } = useAudio.getState();

    const patternIndex = OPTIONS_SHADERS.vertex.findIndex(
      (p) => p.name === pattern.name,
    );
    const preview = () => {
      if (!playing) return null;

      const url = new URL(`${window.location.href}shared/`);
      url.searchParams.set('colorA', `${colorA.dark},${colorA.light}`);
      url.searchParams.set('colorB', `${colorB.dark},${colorB.light}`);
      url.searchParams.set(
        'background',
        `${background.dark},${background.light}`,
      );
      url.searchParams.set('pattern', `${patternIndex}`);
      url.searchParams.set('count', `${count}`);
      Object.keys(effects).forEach((key) => {
        url.searchParams.set(key, `${effects[key]}`);
      });
      url.searchParams.set('sound', `${playing.data.id}`);

      return url;
    };

    const shareable = () => {
      if (!playing) return null;

      return JSON.stringify({
        colorA,
        colorB,
        background,
        pattern: patternIndex,
        count,
        effects,
        sound: playing.data.id,
      });
    };

    return { preview, shareable };
  },

  // Create a shareable link (minified with a reference to Google Spreadsheet)
  createShareableLink: async () => {
    const { getLink } = get();
    const link = getLink().shareable();

    if (!link)
      return {
        data: null,
        error: true,
        message: 'you need to choose a song first',
      };

    // Call api to write to spreadsheet
    const res = await fetch('/api/google-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        functionName: 'write',
        arg: link,
      }),
    });

    const data = await res.json();
    if (data.statusCode === 500) return { data, error: true, message: 'error' };

    const newLink = new URL(`${window.location.href}shared?id=${data}`);

    return { data: newLink, error: false, message: 'success' };
  },

  // Create a preview link (no need to write to Google Spreadsheet)
  createPreviewLink: () => {
    const { getLink } = get();
    const link = getLink().preview();

    if (!link)
      return {
        data: null,
        error: true,
        message: 'you need to choose a song first',
      };

    return { data: link, error: false, message: 'success' };
  },

  // Retrieve the link from the ID
  retrieveLink: async (id) => {
    const res = await fetch('/api/google-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        functionName: 'retrieve',
        arg: id,
      }),
    });

    const data = await res.json();
    if (data.statusCode === 500) return null;

    return data;
  },
}));
