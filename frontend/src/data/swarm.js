import { backgrounds, baseColors, count, shaders, blurBg } from './options';

const swarm = {
  colors: baseColors,
  background: {
    dark: backgrounds.dark[0],
    light: backgrounds.light[0],
  },
  pattern: shaders.vertex[0],
  count: count.max, // So it enables max vertices
  allowDynamicEffects: true,
  blurBg: blurBg.default,
};

export default swarm;
