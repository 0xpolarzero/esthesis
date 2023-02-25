import starDustVeil from './starDustVeil';
import celestialWaltz from './celestialWaltz';
import dancingFireflies from './dancingFireflies';
import glowingOrbs from './glowingOrbs';
import radiantSun from './radiantSun';
import etherealPetals from './etherealPetals';
import spiralingNebula from './spiralingNebula';
import whirlingVortices from './whirlingVortices';

const vertexShaders = [
  { name: 'celestial waltz', shader: celestialWaltz },
  { name: 'dancing fireflies', shader: dancingFireflies },
  { name: 'ethereal petals', shader: etherealPetals },
  { name: 'glowing orbs', shader: glowingOrbs },
  { name: 'radiant sun', shader: radiantSun },
  { name: 'spiraling nebula', shader: spiralingNebula },
  { name: 'stardust veil', shader: starDustVeil },
  { name: 'whirling vortices', shader: whirlingVortices },
];

export default vertexShaders;
