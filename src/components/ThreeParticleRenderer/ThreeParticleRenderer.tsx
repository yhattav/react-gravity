import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Particle } from "../../types/particle";

interface ThreeParticleRendererProps {
  particlesRef: React.RefObject<Particle[]>;
  isPausedRef: React.RefObject<boolean>;
  width: number;
  height: number;
}

interface ParticleTrail {
  positions: THREE.Vector3[];
  color: string;
}

export const ThreeParticleRenderer: React.FC<ThreeParticleRendererProps> = ({
  particlesRef: particleDataRef,
  isPausedRef,
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const trailsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const trailsGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const trailsMapRef = useRef<Map<string, ParticleTrail>>(new Map());
  const MAX_TRAIL_LENGTH = 35;
  const BASE_TRAIL_WIDTH = 8; // Base width matching particle size

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    );
    camera.position.z = 100;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particle system
    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute vec3 color;
        attribute float size;
        varying vec3 vColor;
        uniform float time;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float time;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float r = length(coord) * 2.0;
          
          // Create a soft core
          float core = 1.0 - smoothstep(0.0, 0.5, r);
          
          // Create an outer glow
          float glow = exp(-r * 3.0) * 0.3;
          
          // Combine core and glow
          float alpha = core + glow;
          
          // Add a subtle pulse effect
          alpha *= 0.8 + 0.2 * sin(time * 3.0);
          
          // Make the color more vibrant in the center
          vec3 finalColor = mix(vColor * 1.5, vColor, r);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Create trails system
    const trailsGeometry = new THREE.BufferGeometry();
    trailsGeometryRef.current = trailsGeometry;

    const trailsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: 0.4 },
      },
      vertexShader: `
        attribute vec3 color;
        attribute float alpha;
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float r = length(coord) * 2.0;
          float alpha = (1.0 - smoothstep(0.0, 1.0, r)) * vAlpha * opacity;
          vec3 finalColor = vColor * (1.0 + 0.3 * vAlpha);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const trails = new THREE.Points(trailsGeometry, trailsMaterial);
    scene.add(trails);
    trailsRef.current = trails;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (!isPausedRef.current) {
        // Update time uniform for particle animation
        particleMaterial.uniforms.time.value += 0.016; // Approximately 60 FPS
        updateParticles();
        updateTrails();
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (geometry) geometry.dispose();
      if (trailsGeometry) trailsGeometry.dispose();
      if (particleMaterial) particleMaterial.dispose();
      if (trailsMaterial) trailsMaterial.dispose();
      if (renderer) {
        renderer.dispose();
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
      scene.clear();
      trailsMapRef.current.clear();
    };
  }, [width, height]);

  const updateParticles = () => {
    const particles = particleDataRef.current;
    const geometry = geometryRef.current;
    if (!particles || !geometry) return;

    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const sizes = new Float32Array(particles.length);

    particles.forEach((particle, i) => {
      const x = particle.position.x - width / 2;
      const y = -particle.position.y + height / 2;
      const z = 0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const trail = trailsMapRef.current.get(particle.id) || {
        positions: [],
        color: particle.color || "#FFFFFF",
      };

      trail.positions.unshift(new THREE.Vector3(x, y, z));
      if (trail.positions.length > MAX_TRAIL_LENGTH) {
        trail.positions.pop();
      }

      trailsMapRef.current.set(particle.id, trail);

      const color = particle.color || "#FFFFFF";
      colors[i * 3] = parseInt(color.slice(1, 3), 16) / 255;
      colors[i * 3 + 1] = parseInt(color.slice(3, 5), 16) / 255;
      colors[i * 3 + 2] = parseInt(color.slice(5, 7), 16) / 255;

      sizes[i] = particle.size || 5;
    });

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  };

  const updateTrails = () => {
    const trailsGeometry = trailsGeometryRef.current;
    if (!trailsGeometry) return;

    const trails = Array.from(trailsMapRef.current.values());
    const totalPoints = trails.reduce(
      (sum, trail) => sum + trail.positions.length,
      0
    );

    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const alphas = new Float32Array(totalPoints);
    const sizes = new Float32Array(totalPoints);

    let pointIndex = 0;

    trails.forEach((trail) => {
      const positions_array = trail.positions;
      const color = trail.color;
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      positions_array.forEach((pos, i) => {
        const progress = i / (positions_array.length - 1);
        const alpha = Math.pow(1 - progress, 1.2); // Smoother alpha falloff
        const size = BASE_TRAIL_WIDTH * (1.2 - progress); // Slightly larger at start, smaller at end

        positions[pointIndex * 3] = pos.x;
        positions[pointIndex * 3 + 1] = pos.y;
        positions[pointIndex * 3 + 2] = pos.z;

        colors[pointIndex * 3] = r;
        colors[pointIndex * 3 + 1] = g;
        colors[pointIndex * 3 + 2] = b;

        alphas[pointIndex] = alpha;
        sizes[pointIndex] = size;

        pointIndex++;
      });
    });

    trailsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    trailsGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    trailsGeometry.setAttribute(
      "alpha",
      new THREE.Float32BufferAttribute(alphas, 1)
    );
    trailsGeometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    trailsGeometry.attributes.position.needsUpdate = true;
    trailsGeometry.attributes.color.needsUpdate = true;
    trailsGeometry.attributes.alpha.needsUpdate = true;
    trailsGeometry.attributes.size.needsUpdate = true;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

export default ThreeParticleRenderer;
