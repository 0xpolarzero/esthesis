import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Island from './Island';
import stores from '@/stores';
import config from '@/data';

const Render = () => {
  const retrieveLink = stores.useInteract((state) => state.retrieveLink);
  const initSwarm = stores.useSwarm((state) => state.initSwarm);
  const initSound = stores.useSpinamp((state) => state.initSound);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const retrieveParameters = async () => {
      const params = new URLSearchParams(window.location.search);
      // Is it a shortened url or preview (meaning that we don't need to fetch the complete url)
      const isShortened = params.has('id');

      const retrievedParams = isShortened
        ? // Get the associated parameters in JSON
          await retrieveLink(params.get('id'))
        : // Retrieve the parameters from the url
          Object.fromEntries(params);
      if (!retrievedParams) {
        toast.error('invalid link');
        setIsLoading(false);
        return;
      }

      // Format it
      const formatted = isShortened
        ? // Parse the JSON
          JSON.parse(retrievedParams)
        : // Format it a bit better
          {
            colorA: {
              dark: retrievedParams.colorA.split(',')[0],
              light: retrievedParams.colorA.split(',')[1],
            },
            colorB: {
              dark: retrievedParams.colorB.split(',')[0],
              light: retrievedParams.colorB.split(',')[1],
            },
            background: {
              dark: retrievedParams.background.split(',')[0],
              light: retrievedParams.background.split(',')[1],
            },
            initialTheme: retrievedParams.initialTheme,
            count: Number(retrievedParams.count),
            pattern: Number(retrievedParams.pattern),
            effects: {
              scale: Number(retrievedParams.scale),
              movement: Number(retrievedParams.movement),
              color: Number(retrievedParams.color),
            },
            artworkBg: retrievedParams.artworkBg === 'true',
            blurBg: retrievedParams.blurBg,
            sound: retrievedParams.sound,
          };

      const swarmSuccess = initSwarm(formatted, formatted.initialTheme);
      const soundSuccess = await initSound(formatted.sound);

      if (!swarmSuccess || !soundSuccess) {
        toast.error('invalid link');
      }

      setIsLoading(false);
    };

    retrieveParameters();
  }, [initSound, initSwarm, retrieveLink]);

  return <Island />;
};

export default Render;
