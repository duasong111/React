"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加点光源
    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // 创建几何体组
    const geometries: THREE.Mesh[] = [];

    // 立方体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -2;
    scene.add(cube);
    geometries.push(cube);

    // 球体
    const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = 2;
    scene.add(sphere);
    geometries.push(sphere);

    // 圆柱体
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.y = -1.5;
    scene.add(cylinder);
    geometries.push(cylinder);

    // 圆环
    const torusGeometry = new THREE.TorusGeometry(0.6, 0.2, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.y = 1.5;
    scene.add(torus);
    geometries.push(torus);

    // 八面体
    const octaGeometry = new THREE.OctahedronGeometry(0.6);
    const octaMaterial = new THREE.MeshPhongMaterial({
      color: 0xff8800,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const octa = new THREE.Mesh(octaGeometry, octaMaterial);
    octa.position.set(2, 1.5, 0);
    scene.add(octa);
    geometries.push(octa);

    // 四面体
    const tetraGeometry = new THREE.TetrahedronGeometry(0.6);
    const tetraMaterial = new THREE.MeshPhongMaterial({
      color: 0x8800ff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    const tetra = new THREE.Mesh(tetraGeometry, tetraMaterial);
    tetra.position.set(-2, 1.5, 0);
    scene.add(tetra);
    geometries.push(tetra);

    // 动画循环
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // 旋转几何体
      geometries.forEach((mesh, index) => {
        mesh.rotation.x += 0.01 + index * 0.002;
        mesh.rotation.y += 0.01 + index * 0.002;
      });

      // 相机轻微摆动
      camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
      camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(mesh => {
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🎨 Three.js 3D 展示</h1>
          <p className="text-muted-foreground">交互式 3D 几何体展示</p>
        </div>
        
        <div 
          ref={containerRef}
          className="w-full h-[600px] rounded-2xl border border-border/50 overflow-hidden shadow-xl"
        />
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🟦</div>
            <div className="text-sm font-medium">立方体</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔴</div>
            <div className="text-sm font-medium">球体</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🟡</div>
            <div className="text-sm font-medium">圆柱体</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🟢</div>
            <div className="text-sm font-medium">圆环</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🟠</div>
            <div className="text-sm font-medium">八面体</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🟣</div>
            <div className="text-sm font-medium">四面体</div>
          </div>
        </div>
      </div>
    </div>
  );
}