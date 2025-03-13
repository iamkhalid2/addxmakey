import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, PresentationControls, AccumulativeShadows, RandomizedLight, Backdrop } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const ImagePlane = ({ image, ...props }) => {
  const meshRef = useRef();
  const { viewport } = useThree();
  
  // Create a texture from the uploaded image
  const texture = React.useMemo(() => {
    if (!image) return null;
    return new THREE.TextureLoader().load(image);
  }, [image]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        (state.mouse.y * 0.1), 
        0.05
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (state.mouse.x * 0.2),
        0.05
      );
    }
  });

  if (!texture) return null;

  return (
    <Float 
      speed={2} 
      rotationIntensity={0.2} 
      floatIntensity={0.5}
      position={[0, 0, 0]}
    >
      <mesh 
        ref={meshRef}
        {...props}
      >
        <planeGeometry args={[viewport.width / 2, viewport.height / 2.5, 1, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </Float>
  );
};

const Scene3D = ({ image }) => {
  return (
    <motion.div 
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Canvas 
        shadows
        gl={{ antialias: true, logarithmicDepthBuffer: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <PresentationControls
          global
          zoom={1.5}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 6, Math.PI / 6]}
        >
          <ImagePlane image={image} />
        </PresentationControls>
        
        <Environment preset="city" />
        
        <AccumulativeShadows temporal frames={60} alphaTest={0.85} opacity={0.4}>
          <RandomizedLight amount={8} radius={10} ambient={0.5} position={[5, 5, -5]} />
        </AccumulativeShadows>
        
        <Backdrop floor={2} segments={20} position={[0, -1, -2]} scale={[10, 3, 10]}>
          <meshStandardMaterial color="#0ea5e9" envMapIntensity={0.1} />
        </Backdrop>
      </Canvas>
    </motion.div>
  );
};

export default Scene3D;