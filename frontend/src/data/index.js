import swarm from './swarm';
import { backgrounds, count, shaders, themes, blurBg } from './options';
import networkMapping from './constants/networkMapping.json';
import esthesisAbi from './constants/Eclipse.json';
import allowlist from './constants/allowlist.json';

const chainId = 80001;

// const baseUrl = 'https://esthesis.art';
const baseUrl = 'https://esthesis.polarzero.xyz/';

const config = {
  options: {
    backgrounds,
    count,
    shaders,
    themes,
    blurBg,
  },
  swarm,
  networkMapping,
  esthesisAbi,
  allowlist,
  chainId,
  baseUrl,
};

export default config;
