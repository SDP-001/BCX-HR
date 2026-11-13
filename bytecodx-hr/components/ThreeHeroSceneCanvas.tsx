"use client";

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useEffect, useRef } from "react";

type ThreeHeroSceneCanvasProps = {
  onUnavailable: () => void;
};

export default function ThreeHeroSceneCanvas({ onUnavailable }: ThreeHeroSceneCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!context) {
      onUnavailable();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.error("ByteCodX 3D scene failed to initialize; showing the CSS fallback.", error);
      onUnavailable();
      return;
    }

    renderer.domElement.className = "three-hero-canvas";
    renderer.setClearColor(0x03010e, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1 : 1.35));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0, 9.2);

    const environmentScene = new RoomEnvironment();
    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTarget = environmentGenerator.fromScene(environmentScene, 0.04);
    scene.environment = environmentTarget.texture;

    scene.add(new THREE.AmbientLight(0x8bc9ff, 1.05));

    const keyLight = new THREE.PointLight(0x38dfff, 28, 24, 1.8);
    keyLight.position.set(-2.5, 2.5, 4);
    scene.add(keyLight);

    const cursorLight = new THREE.PointLight(0x72ffd0, 16, 16, 2);
    cursorLight.position.set(0, 0, 3.5);
    scene.add(cursorLight);

    const rig = new THREE.Group();
    scene.add(rig);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0b2542,
      metalness: 0.68,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      emissive: 0x063d74,
      emissiveIntensity: 0.7,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 3), coreMaterial);
    rig.add(core);

    const wireGeometry = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.12, 2));
    const wireframe = new THREE.LineSegments(
      wireGeometry,
      new THREE.LineBasicMaterial({ color: 0x62e8ff, transparent: true, opacity: 0.64 }),
    );
    rig.add(wireframe);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.7, 0.035, 180, 12, 2, 5),
      new THREE.MeshPhysicalMaterial({
        color: 0x73f0ed,
        metalness: 0.72,
        roughness: 0.18,
        clearcoat: 1,
        emissive: 0x087bff,
        emissiveIntensity: 0.42,
      }),
    );
    knot.rotation.set(0.4, 0.5, -0.3);
    rig.add(knot);

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x47dfff,
      metalness: 0.68,
      roughness: 0.22,
      emissive: 0x087bff,
      emissiveIntensity: 0.38,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.012, 8, 180), ringMaterial);
    ringA.rotation.set(1.05, 0.25, 0.2);
    rig.add(ringA);

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(1.86, 0.008, 8, 180),
      new THREE.MeshStandardMaterial({
        color: 0x5fffc5,
        metalness: 0.6,
        roughness: 0.28,
        emissive: 0x00e879,
        emissiveIntensity: 0.28,
      }),
    );
    ringB.rotation.set(0.2, 1.15, 0.85);
    rig.add(ringB);

    const satellites = [0, 1, 2].map((index) => {
      const satellite = new THREE.Mesh(
        new THREE.SphereGeometry(index === 1 ? 0.085 : 0.06, 16, 16),
        new THREE.MeshPhysicalMaterial({
          color: index === 1 ? 0x8affdb : 0x72e9ff,
          metalness: 0.36,
          roughness: 0.12,
          emissive: index === 1 ? 0x00e879 : 0x087bff,
          emissiveIntensity: 1.2,
        }),
      );
      rig.add(satellite);
      return satellite;
    });

    const particleCount = window.innerWidth < 720 ? 600 : 1500;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const vertical = Math.random() * 2 - 1;
      const radius = 3.1 + Math.random() * 5.2;
      const horizontal = Math.sqrt(1 - vertical * vertical);
      particlePositions[index * 3] = Math.cos(angle) * horizontal * radius;
      particlePositions[index * 3 + 1] = vertical * radius;
      particlePositions[index * 3 + 2] = Math.sin(angle) * horizontal * radius;
      particleSizes[index] = 1.2 + Math.random() * 3.4;
      particlePhases[index] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(particlePhases, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uProgress: { value: 0 },
        uBurstTime: { value: -1000 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uProgress;
        uniform float uBurstTime;
        varying float vAlpha;

        void main() {
          vec3 point = position;
          vec3 mergedPoint = normalize(position) * 2.45;
          point = mix(point, mergedPoint, uProgress);
          point.x += sin(uTime * 0.24 + aPhase) * 0.07;
          point.y += cos(uTime * 0.2 + aPhase * 1.4) * 0.06;

          vec2 mousePosition = uPointer * 4.2;
          float mouseDistance = distance(point.xy, mousePosition);
          float mouseInfluence = 1.0 - smoothstep(0.15, 2.1, mouseDistance);
          point.xy += normalize(point.xy - mousePosition + vec2(0.001)) * mouseInfluence * 0.2;

          float burstAge = uTime - uBurstTime;
          float burst = exp(-max(0.0, burstAge) * 3.2) * step(0.0, burstAge);
          point += normalize(position + vec3(0.001)) * burst * 0.85;

          vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = aSize * (18.0 / max(1.0, -viewPosition.z));
          vAlpha = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 0.75 + aPhase));
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
          float glow = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
          gl_FragColor = vec4(vec3(0.36, 0.86, 1.0), glow * vAlpha * 0.78);
        }
      `,
    });

    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    const timer = new THREE.Timer();
    timer.connect(document);
    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const hostBounds = () => host.getBoundingClientRect();
    let pointerInside = false;
    let visible = false;
    let frameId: number | null = null;

    const resize = () => {
      const { width, height } = hostBounds();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rig.position.x = Math.min(width / height * 1.42, width > 760 ? 2.35 : 0.62);
      particleField.position.x = rig.position.x;
    };

    const updatePointer = (event: globalThis.PointerEvent) => {
      const bounds = hostBounds();
      const isInside = event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      pointerInside = isInside && event.pointerType !== "touch";
      if (!pointerInside || !bounds.width || !bounds.height) {
        targetPointer.set(0, 0);
        return;
      }
      targetPointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        1 - ((event.clientY - bounds.top) / bounds.height) * 2,
      );
    };

    const triggerBurst = (event: globalThis.PointerEvent) => {
      const bounds = hostBounds();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      particleMaterial.uniforms.uBurstTime.value = timer.getElapsed();
    };

    const renderFrame = () => {
      frameId = null;
      if (!visible || document.hidden) return;

      timer.update();
      const elapsed = timer.getElapsed();
      const delta = Math.min(timer.getDelta(), 0.05);
      const scrollProgress = THREE.MathUtils.clamp(
        1 - hostBounds().bottom / Math.max(window.innerHeight, 1),
        0,
        1,
      );

      pointer.lerp(targetPointer, 1 - Math.exp(-delta * 5));
      particleMaterial.uniforms.uTime.value = elapsed;
      particleMaterial.uniforms.uPointer.value.copy(pointer);
      particleMaterial.uniforms.uProgress.value = scrollProgress;

      rig.rotation.x += (pointer.y * 0.16 + scrollProgress * 0.12 - rig.rotation.x) * delta * 1.8;
      rig.rotation.y += delta * 0.16 + pointer.x * delta * 0.16;
      rig.rotation.z = Math.sin(elapsed * 0.18) * 0.035;
      rig.scale.setScalar(1 - scrollProgress * 0.12);
      core.rotation.y = elapsed * 0.12;
      wireframe.rotation.y = -elapsed * 0.08;
      knot.rotation.x += delta * 0.18;
      knot.rotation.y -= delta * 0.12;
      ringA.rotation.z += delta * 0.08;
      ringB.rotation.x -= delta * 0.055;
      satellites.forEach((satellite, index) => {
        const angle = elapsed * (0.28 + index * 0.08) + index * (Math.PI * 2 / 3);
        const radius = index === 1 ? 1.92 : 1.68;
        satellite.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.2) * 0.62,
          Math.sin(angle) * radius * 0.72,
        );
      });

      cursorLight.position.x += (pointer.x * 2.3 - cursorLight.position.x) * delta * 3;
      cursorLight.position.y += (pointer.y * 1.8 - cursorLight.position.y) * delta * 3;
      camera.position.x += (pointer.x * 0.22 - camera.position.x) * delta * 1.2;
      camera.position.y += (pointer.y * 0.14 - camera.position.y) * delta * 1.2;
      camera.position.z = 9.2 - scrollProgress * 0.45;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const startRendering = () => {
      if (visible && !document.hidden && frameId === null) {
        frameId = window.requestAnimationFrame(renderFrame);
      } else if ((!visible || document.hidden) && frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const visibilityObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          startRendering();
        })
      : null;
    visibilityObserver?.observe(host);
    if (!visibilityObserver) visible = true;

    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", triggerBurst, { passive: true });
    document.addEventListener("visibilitychange", startRendering);
    resize();
    startRendering();

    return () => {
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", triggerBurst);
      document.removeEventListener("visibilitychange", startRendering);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      timer.dispose();

      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      environmentTarget.dispose();
      environmentGenerator.dispose();
      environmentScene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onUnavailable]);

  return <div ref={hostRef} className="three-hero-scene__renderer absolute inset-0 h-full w-full" />;
}
