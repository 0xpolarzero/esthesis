import { create } from 'zustand';
import * as THREE from 'three';
import useAudio from './useAudio';
import useConfig from './useConfig';
import config from '@/data';

const {
  colors: COLORS,
  background: BACKGROUND,
  pattern: PATTERN,
  count: COUNT,
  allowDynamicCount: ALLOW_DYNAMIC_COUNT,
} = config.swarm;
const { shaders: OPTIONS_SHADERS } = config.options;

const hexToVec3 = (hex) => {
  const color = new THREE.Color(hex);
  return [color.r.toFixed(2), color.g.toFixed(2), color.b.toFixed(2)];
};

export default create((set, get) => ({
  // Colors
  colorA: {
    dark: COLORS.dark[0],
    light: COLORS.light[0],
  },
  colorB: {
    dark: COLORS.dark[1],
    light: COLORS.light[1],
  },
  setColorA: (color, type) =>
    set({ colorA: { ...get().colorA, [type]: color } }),
  setColorB: (color, type) =>
    set({ colorB: { ...get().colorB, [type]: color } }),

  // Background
  background: { dark: BACKGROUND.dark, light: BACKGROUND.light },
  setBackground: (newBg, type) => {
    const { updateTheme } = useConfig.getState();
    set({ background: { ...get().background, [type]: newBg } });
    updateTheme(type);
  },

  // Pattern
  pattern: PATTERN,
  setPattern: (index) => set({ pattern: OPTIONS_SHADERS.vertex[index] }),

  // Count
  count: COUNT,
  allowDynamicCount: ALLOW_DYNAMIC_COUNT,
  setCount: (count) =>
    isNaN(count) ? set({ count: COUNT.default }) : set({ count }),
  setAllowDynamicCount: (allow) => set({ allowDynamicCount: allow }),

  // Link
  createShareableLink: async () => {
    const { colorA, colorB, background, pattern, count } = get();
    const { playing } = useAudio.getState();

    if (!playing)
      return {
        data: null,
        error: true,
        message: 'You need to choose a sound first',
      };

    const patternIndex = OPTIONS_SHADERS.vertex.findIndex(
      (p) => p.name === pattern.name,
    );
    // 0 = colorA, 1 = colorB, 2 = background, 3 = pattern, 4 = count 5 = sound
    const argsSwarm = `?0=${colorA.dark},${colorA.light}&1=${colorB.dark},${colorB.light}&2=${background.dark},${background.light}&3=${patternIndex}&4=${count}`;
    const argsSound = `&5=${playing.data.id}`;
    const args = `${argsSwarm}${argsSound}`;

    // Call api to write to spreadsheet
    const res = await fetch('/api/google-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        functionName: 'write',
        args: [args],
      }),
    });

    const data = await res.json();
    const url = new URL(window.location.href);

    return { data: `${url}${data}`, error: false, message: 'Success' };
  },
}));
