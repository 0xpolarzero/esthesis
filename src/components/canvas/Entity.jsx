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
  const { colorA, colorB, pattern, count, allowDynamicEffects } =
    stores.useSwarm((state) => ({
      colorA: state.colorA,
      colorB: state.colorB,
      pattern: state.pattern,
      count: state.count,
      allowDynamicEffects: state.allowDynamicEffects,
    }));
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

  // define the base position and the target position
  const basePos = camera.position;
  const objPos = new THREE.Vector3(0, 0, 0);
  const targetPos = new THREE.Vector3().lerpVectors(basePos, objPos, 0.25);
  // create a vector to hold the current position
  const currentPos = new THREE.Vector3();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    // Time
    ref.current.material.uniforms.uTime.value = clock.getElapsedTime();

    // Modifications based on audio
    const analyserData = getAnalyserData();
    const gainMultiplier = 1 + analyserData?.gain * 5 || 1;
    const freqMultiplier = 1 + analyserData?.frequency || 1;
    // Modify scale based on the gain
    ref.current.material.uniforms.uGain.value = gainMultiplier;
    // as well as the brightness
    ref.current.material.uniforms.uFreq.value = freqMultiplier;

    // Modify background color
    if (allowDynamicEffects && analyserData?.frequency) {
      // The camera should lerp a bit closer to the center of the swarm when frequencies are high
      // frequency being between 0 and 1, 0 would be original position, 1 being 2 units closer
      // const lerpFactor = analyserData.frequency;
      // // lerp the camera position
      // camera.position.lerpVectors(basePos, targetPos, lerpFactor);
      // // lerp the swarm position
      // currentPos.lerpVectors(objPos, targetPos, lerpFactor);
      // ref.current.position.set(currentPos.x, currentPos.y, currentPos.z);
    }

    console.log(analyserData?.pan);
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
