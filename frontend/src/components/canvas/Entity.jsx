import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import stores from '@/stores';
import config from '@/data';

const { colors } = config.swarm;
const { count: COUNT, shaders } = config.options;
const { vertex, fragment } = shaders;

const Entity = () => {
  const getAnalyserData = stores.useAudio((state) => state.getAnalyserData);
  const theme = stores.useConfig((state) => state.theme);
  const { colorA, colorB, pattern, count, effects } = stores.useSwarm(
    (state) => ({
      colorA: state.colorA,
      colorB: state.colorB,
      pattern: state.pattern,
      count: state.count,
      effects: state.effects,
    }),
  );
  const { camera } = useThree();
  const ref = useRef(null);

  const radius = 2;

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const d = Math.sqrt(Math.random() - 0.5) * radius;
      const th = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      let x = d * Math.sin(th) * Math.cos(phi);
      let y = d * Math.sin(th) * Math.sin(phi);
      let z = d * Math.cos(th);

      positions.set([x, y, z], i * 3);
    }

    return positions;
  }, [count, radius]);

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
      uFreq: {
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
    if (!analyserData) return;

    if (effects.scale) {
      // Modify scale based on the gain
      const gainMultiplier = 1 + analyserData.gain * 5 * effects.scale;
      ref.current.material.uniforms.uGain.value = gainMultiplier;
    }

    if (effects.movement) {
      // Rotate the swarm based on the pan (left/right balance)
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        analyserData.pan * 2 * effects.movement,
        0.01,
      );
    }

    if (effects.color) {
      // Modify the brightness of the colors based on the frequency
      ref.current.material.uniforms.uFreq.value = THREE.MathUtils.lerp(
        ref.current.material.uniforms.uFreq.value,
        1 + analyserData.frequency * effects.color * 2,
        0.1,
      );
    }
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
