import { create } from 'zustand';
import * as THREE from 'three';
import useConfig from './useConfig';
import config from '@/data';

const {
  colors: COLORS,
  background: BACKGROUND,
  pattern: PATTERN,
  count: COUNT,
  allowDynamicBackground: ALLOW_DYNAMIC_BACKGROUND,
} = config.swarm;
const { shaders: OPTIONS_SHADERS } = config.options;

const hexToVec3 = (hex) => {
  const color = new THREE.Color(hex);
  return [color.r.toFixed(2), color.g.toFixed(2), color.b.toFixed(2)];
};

export default create((set, get) => ({
  /**
   * @notice Attributes
   */
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
  allowDynamicBackground: ALLOW_DYNAMIC_BACKGROUND,
  setCount: (count) =>
    isNaN(count) ? set({ count: COUNT.default }) : set({ count }),
  setAllowDynamicBackground: (allow) => set({ allowDynamicBackground: allow }),

  /**
   *
   * @notice Init an entity based on parameters
   */
  initSwarm: (params) => {
    const { setColorA, setColorB, setBackground, setPattern, setCount } = get();
    try {
      setColorA(params.colorA.dark, 'dark');
      setColorA(params.colorA.light, 'light');
      setColorB(params.colorB.dark, 'dark');
      setColorB(params.colorB.light, 'light');
      setBackground(params.background.dark, 'dark');
      setBackground(params.background.light, 'light');
      setPattern(params.pattern);
      setCount(params.count);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
}));
