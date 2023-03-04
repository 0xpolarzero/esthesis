import { useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import Entity from './Entity';
import stores from '@/stores';
import config from '@/data';

const Experience = () => {
  const setCount = stores.useSwarm((state) => state.setCount);

  useEffect(() => {
    setTimeout(() => setCount(config.options.count.default), 100); // After vertices are loaded for max count
  }, [setCount]);

  return (
    <>
      <Entity />
      <OrbitControls />
    </>
  );
};

export default Experience;
