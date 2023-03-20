import swarm from './swarm';
import { backgrounds, count, shaders } from './options';
import networkMapping from './constants/networkMapping.json';
import eclipseAbi from './constants/Visualize.json';
import allowlist from './constants/allowlist.json';

const chainId = 80001;

// const baseUrl = 'https://eclipse.art';
const baseUrl = 'https://visualize.polarzero.xyz/';

const config = {
  options: {
    backgrounds,
    count,
    shaders,
  },
  swarm,
  networkMapping,
  eclipseAbi,
  allowlist,
  chainId,
  baseUrl,
};

export default config;
