import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const SolarSystem: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / 400, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(mountRef.current.clientWidth, 400);
        mountRef.current.appendChild(renderer.domElement);

        // Sun
        const sunGeo = new THREE.SphereGeometry(1, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        scene.add(sun);

        // Planet
        const planetGeo = new THREE.SphereGeometry(0.3, 32, 32);
        const planetMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
        const planet = new THREE.Mesh(planetGeo, planetMat);
        scene.add(planet);

        camera.position.z = 5;

        let angle = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            angle += 0.01;
            planet.position.x = Math.cos(angle) * 3;
            planet.position.z = Math.sin(angle) * 3;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
      <div className="relative w-full h-[600px] bg-black/40 rounded-[40px] overflow-hidden border border-white/5">
        <div ref={mountRef} className="w-full h-full" />
        <div className="absolute top-8 left-8 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/40">3D Space Explorer active</p>
           <h2 className="text-4xl font-black italic uppercase tracking-tighter">Solar System</h2>
        </div>
        <button 
          onClick={onFinish}
          className="absolute top-8 right-8 px-8 h-12 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-glow"
        >
          Exit Science Lab
        </button>
      </div>
    );
};
