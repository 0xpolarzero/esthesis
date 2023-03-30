import swarm from './swarm';
import { backgrounds, count, shaders, themes, blurBg } from './options';
import networkMapping from './constants/networkMapping.json';
import esthesisAbi from './constants/Eclipse.json';
import allowlist from './constants/allowlist.json';
import referrals from './referrals';

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
  referrals,
  chainId,
  baseUrl,
};

export default config;
