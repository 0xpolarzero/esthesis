import shaders from './shaders';

const themes = ['dark', 'light'];

const backgrounds = {
  dark: [
    '#101010',
    '#242424',
    '#c6bf87',
    '#cdb995',
    '#d28f8f',
    '#b583b5',
    '#8d82bd',
    '#6c87c4',
    '#5b9db4',
    '#57a2b9',
    '#5cb5a7',
    '#7ac383',
  ],
  light: [
    '#e9e9e9',
    '#f8f8f8',
    '#fbf8cc',
    '#fde4cf',
    '#ffcfd2',
    '#f1c0e8',
    '#cfbaf0',
    '#a3c4f3',
    '#90dbf4',
    '#8eecf5',
    '#98f5e1',
    '#b9fbc0',
  ],
};

const baseColors = {
  dark: ['#ffffff', backgrounds.light[0]],
  light: [backgrounds.dark[0], '#050505'],
};

const count = {
  default: 1000,
  min: 10,
  max: 10000,
};

const blurBg = {
  default: 4,
  low: 2,
  medium: 4,
  high: 6,
};

export { backgrounds, baseColors, count, shaders, themes, blurBg };
