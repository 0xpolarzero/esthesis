import swarm from './swarm';
import { backgrounds, count, shaders, themes } from './options';
import networkMapping from './constants/networkMapping.json';
import eclipseAbi from './constants/Eclipse.json';
import allowlist from './constants/allowlist.json';

const chainId = 80001;

// const baseUrl = 'https://eclipse.art';
const baseUrl = 'https://eclipse.polarzero.xyz/';

const config = {
  options: {
    backgrounds,
    count,
    shaders,
    themes,
  },
  swarm,
  networkMapping,
  eclipseAbi,
  allowlist,
  chainId,
  baseUrl,
};

export default config;
