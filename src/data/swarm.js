import { backgrounds, baseColors, count, shaders } from './options';

const swarm = {
  colors: baseColors,
  background: {
    dark: backgrounds.dark[0],
    light: backgrounds.light[0],
  },
  pattern: shaders.vertex[0],
  count: count.default,
  allowDynamicBackground: true,
};

export default swarm;
