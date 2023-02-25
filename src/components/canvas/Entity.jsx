import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import stores from '@/stores';
import config from '@/data';

const { colors } = config.swarm;
const { count: COUNT, shaders } = config.options;
const { vertex, fragment } = shaders;

const Entity = () => {
  const getAnalyserData = stores.useAudio((state) => state.getAnalyserData);
  const theme = stores.useConfig((state) => state.theme);
  const { colorA, colorB, pattern, count, allowDynamicCount } = stores.useSwarm(
    (state) => ({
      colorA: state.colorA,
      colorB: state.colorB,
      pattern: state.pattern,
      count: state.count,
      allowDynamicCount: state.allowDynamicCount,
    }),
  );
  const [countExpanded, setCountExpanded] = useState(count);
  const ref = useRef(null);

  const radius = 2;

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(countExpanded * 3);

    for (let i = 0; i < countExpanded; i++) {
      const d = Math.sqrt(Math.random() - 0.5) * radius;
      const th = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      let x = d * Math.sin(th) * Math.cos(phi);
      let y = d * Math.sin(th) * Math.sin(phi);
      let z = d * Math.cos(th);

      positions.set([x, y, z], i * 3);
    }

    return positions;
  }, [countExpanded, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0.0,
      },
      uRadius: {
        value: radius,
      },
      uColorA: new THREE.Uniform(new THREE.Color(colors['dark'][0])),
      uColorB: new THREE.Uniform(new THREE.Color(colors['dark'][1])),
      uGain: {
        value: 1.0,
      },
      uBrighten: {
        value: 1.0,
      },
    }),
    [radius],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;

    // Time
    ref.current.material.uniforms.uTime.value = clock.getElapsedTime();

    // Modifications based on audio
    const analyserData = getAnalyserData();
    const gainMultiplier = 1 + analyserData?.gain * 5 || 1;
    const freqMultiplier = 1 + analyserData?.frequency / 10000 || 1;
    // Modify scale based on the gain
    ref.current.material.uniforms.uGain.value = gainMultiplier;
    // as well as the brightness
    ref.current.material.uniforms.uBrighten.value = freqMultiplier;
    // Increase the count of particles based on the frequency
    if (!allowDynamicCount) return;
    setCountExpanded(
      count * freqMultiplier >= COUNT.max
        ? COUNT.max
        : (count * freqMultiplier).toFixed(0),
    );
  });

  // Colors
  useEffect(() => {
    if (!ref.current) return;

    ref.current.material.uniforms.uColorA.value = new THREE.Color(
      colorA[theme],
    );
    ref.current.material.uniforms.uColorB.value = new THREE.Color(
      colorB[theme],
    );
  }, [theme, colorA, colorB]);

  // Pattern
  useEffect(() => {
    if (!ref.current) return;

    ref.current.material.vertexShader = pattern.shader;
    ref.current.material.needsUpdate = true;
  }, [pattern]);

  // Count
  useEffect(() => {
    setCountExpanded(count);
  }, [count]);

  return (
    <points ref={ref} scale={1.5}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexShader={vertex[0].shader}
        fragmentShader={fragment[0]}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Entity;
