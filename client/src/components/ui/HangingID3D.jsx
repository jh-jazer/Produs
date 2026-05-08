import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSphere, useBox, Physics, usePointToPointConstraint } from '@react-three/cannon';
import { Html, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import useAuthStore from '../../store/useAuthStore';
import Avatar from './Avatar';

const IDCard = ({ position = [0, 0, 0] }) => {
  const { user } = useAuthStore();
  
  // The Anchor (where the lace is attached to the "ceiling")
  const [anchorRef] = useSphere(() => ({
    type: 'Static',
    position: [0, 5, 0],
    args: [0.1],
  }));

  // The Card Body
  const [cardRef, api] = useBox(() => ({
    mass: 1,
    position: [0, 2, 0],
    args: [3, 4, 0.1], // Width, Height, Depth
    linearDamping: 0.5,
    angularDamping: 0.5,
  }));

  // Constraints to simulate the laces
  // Lace 1 (Left)
  usePointToPointConstraint(anchorRef, cardRef, {
    pivotA: [-0.1, 0, 0],
    pivotB: [-0.5, 2, 0],
  });
  
  // Lace 2 (Right)
  usePointToPointConstraint(anchorRef, cardRef, {
    pivotA: [0.1, 0, 0],
    pivotB: [0.5, 2, 0],
  });

  // Reference for the laces visual
  const laceRef = useRef();

  useFrame((state) => {
    if (!laceRef.current || !cardRef.current) return;
    
    // Draw the laces from anchor to card top center
    // In a real implementation we'd use multiple segments for "soft" rope, 
    // but a straight line works for a "taut" lace.
  });

  return (
    <group>
      {/* Visual Laces */}
      <Laces anchorPos={[0, 5, 0]} cardRef={cardRef} />

      <mesh ref={cardRef} castShadow>
        <boxGeometry args={[3, 4, 0.05]} />
        <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.2} />
        
        {/* The ID Content via Html component */}
        <Html
          transform
          distanceFactor={4}
          position={[0, 0, 0.03]}
          className="pointer-events-none select-none"
        >
          <div className="bg-[#121212] text-white w-72 p-5 rounded-sm border-t-[6px] border-primary flex flex-col gap-4 scale-[0.35] origin-center">
             <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Operative ID</span>
                <span className="text-sm font-black tracking-tighter">#{user?._id?.slice(-8).toUpperCase() || 'UNKNOWN'}</span>
              </div>
              <div className="size-10 bg-white/5 rounded-sm flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-xl opacity-40">fingerprint</span>
              </div>
            </div>

            <div className="h-[1px] bg-white/10 w-full" />

            <div className="flex items-center gap-4">
              <div className="size-14 bg-black rounded-sm overflow-hidden border border-white/10">
                <Avatar config={user?.avatar} className="size-full" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">AUTHORIZED</span>
                <span className="text-xs font-bold uppercase tracking-tight">{user?.username?.split('#')[0] || 'OPERATIVE'}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-bold uppercase tracking-widest">ACTIVE_LINK</span>
              </div>
              <span className="text-[8px] font-mono opacity-40">SEC_LEVEL_{user?.level || 0}</span>
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
};

const Laces = ({ anchorPos, cardRef }) => {
  const lineRef = useRef();
  
  useFrame(() => {
    if (!lineRef.current || !cardRef.current) return;
    
    // Update line geometry to connect anchor to card
    const cardPos = new THREE.Vector3();
    cardRef.current.getWorldPosition(cardPos);
    
    // Attachment points on top of card (local to card)
    const attachL = new THREE.Vector3(-0.5, 2, 0).applyMatrix4(cardRef.current.matrixWorld);
    const attachR = new THREE.Vector3(0.5, 2, 0).applyMatrix4(cardRef.current.matrixWorld);
    
    const points = [
        new THREE.Vector3(anchorPos[0] - 0.05, anchorPos[1], anchorPos[2]),
        attachL,
        attachR,
        new THREE.Vector3(anchorPos[0] + 0.05, anchorPos[1], anchorPos[2])
    ];
    
    lineRef.current.geometry.setFromPoints(points);
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="white" opacity={0.2} transparent />
    </line>
  );
};

export default function HangingID3D() {
  return (
    <div className="w-full h-[400px] relative">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={35} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Physics gravity={[0, -9.81, 0]}>
          <IDCard />
        </Physics>

        <Environment preset="city" />
      </Canvas>
      
      {/* Interaction Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Physics System Active // Hover to disturb</span>
      </div>
    </div>
  );
}
