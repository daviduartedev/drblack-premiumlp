"use client";

/**
 * Dragão 3D — versão "speed run":
 *  - Mesh leve em primitivas Three.js (sem GLB).
 *  - Movimento rápido tipo o vídeo do peachweb: criatura voa do canto
 *    superior esquerdo, faz um arco mergulhando pra direita-e-pra-baixo,
 *    e SAI da tela MUITO antes do fim da hero.
 *  - Trail de fumaça/vapor atrás (essencial pro look) — particles
 *    aditivas com opacity decay.
 *  - Some completo ao chegar na próxima seção (vp >= 0.85).
 *
 * Foco: VELOCIDADE e TRAIL > realismo do mesh.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as THREE from "three";

const subscribeNoop = () => () => undefined;
const getMountedTrue = () => true;
const getMountedFalse = () => false;

const TRAIL_COUNT = 90;
const FLIGHT_END_VP = 0.45; // quase toda a animação cabe em ~45% da viewport
const FADE_START_VP = 0.35;
const FADE_END_VP = 0.65;

type DragonProps = {
  zIndex?: number;
};

function useScrollViewports() {
  const [vp, setVp] = useState(0);
  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = Math.max(1, window.innerHeight);
      setVp(window.scrollY / vh);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return vp;
}

/**
 * Curva de voo — começa no canto superior esquerdo, faz arco descendo
 * pra direita, depois mergulha forte pra baixo e sai.
 * Replicando o movimento do peachweb.
 */
function useFlightPath() {
  return useMemo(() => {
    const points = [
      new THREE.Vector3(-3.5, 2.6, 1.0), // entrada esquerda alto
      new THREE.Vector3(-1.4, 1.8, 0.5),
      new THREE.Vector3(0.6, 1.2, -0.3), // centro
      new THREE.Vector3(2.2, 0.4, 0.2),
      new THREE.Vector3(3.0, -0.8, 0.6), // direita meio
      new THREE.Vector3(2.6, -2.6, 0.0), // mergulha
      new THREE.Vector3(1.8, -5.0, -0.5), // sai pelo fundo
    ];
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  }, []);
}

function CreatureMesh({
  bodyRef,
  wingLRef,
  wingRRef,
  color,
  glow,
}: {
  bodyRef: React.RefObject<THREE.Group | null>;
  wingLRef: React.RefObject<THREE.Mesh | null>;
  wingRRef: React.RefObject<THREE.Mesh | null>;
  color: string;
  glow: string;
}) {
  // Asa com forma de gota/pétala (PlaneGeometry deformado)
  const wingGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.2, 0.6, 12, 6);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const norm = Math.abs(x) / 0.6;
      const taper = 1 - norm * 0.7;
      pos.setY(i, y * taper);
      pos.setZ(i, Math.sin(norm * Math.PI) * 0.12);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group ref={bodyRef}>
      {/* Corpo principal — esfera achatada/alongada */}
      <mesh scale={[0.5, 0.42, 0.7]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.5}
          emissive={glow}
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Cabeça — esfera menor à frente */}
      <mesh position={[0, 0.05, 0.45]} scale={[0.32, 0.3, 0.4]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.5}
          emissive={glow}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Olhos brilhantes */}
      <mesh position={[0.12, 0.1, 0.62]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={glow}
          emissiveIntensity={3}
        />
      </mesh>
      <mesh position={[-0.12, 0.1, 0.62]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={glow}
          emissiveIntensity={3}
        />
      </mesh>

      {/* Cauda — cone ponta pra trás */}
      <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.5, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.4}
          emissive={glow}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Asa esquerda */}
      <mesh
        ref={wingLRef}
        geometry={wingGeom}
        position={[-0.32, 0.08, 0]}
        rotation={[0, 0.2, -0.25]}
      >
        <meshStandardMaterial
          color={color}
          emissive={glow}
          emissiveIntensity={0.5}
          roughness={0.45}
          metalness={0.25}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Asa direita */}
      <mesh
        ref={wingRRef}
        geometry={wingGeom}
        position={[0.32, 0.08, 0]}
        rotation={[0, -0.2, 0.25]}
      >
        <meshStandardMaterial
          color={color}
          emissive={glow}
          emissiveIntensity={0.5}
          roughness={0.45}
          metalness={0.25}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  );
}

function FlyingCreature({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<number>;
}) {
  const path = useFlightPath();
  const bodyRef = useRef<THREE.Group | null>(null);
  const wingLRef = useRef<THREE.Mesh | null>(null);
  const wingRRef = useRef<THREE.Mesh | null>(null);
  const trailRef = useRef<THREE.Points | null>(null);

  const lastT = useRef(0);
  const speed = useRef(0);
  const lastPos = useRef(new THREE.Vector3());

  // Trail particles. trailGeom em useMemo (estável). trailLifeRef em
  // useRef pra que o lint estrito não reclame de mutação no useFrame.
  const trailGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_COUNT * 3);
    const sizes = new Float32Array(TRAIL_COUNT);
    const opacities = new Float32Array(TRAIL_COUNT);
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453);
      sizes[i] = (r - Math.floor(r)) * 0.15 + 0.1;
      opacities[i] = 0;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    return g;
  }, []);
  const trailLifeRef = useRef<Float32Array>(new Float32Array(TRAIL_COUNT));

  useFrame((state, delta) => {
    const vp = scrollRef.current;
    const t = THREE.MathUtils.clamp(vp / FLIGHT_END_VP, 0, 1);
    const time = state.clock.getElapsedTime();
    const dt = Math.max(0.001, Math.min(0.05, delta));

    // Posição alvo na curva + bobbing
    const onCurve = path.getPoint(t);
    const tangent = path.getTangent(t);
    onCurve.x += Math.sin(time * 2.0) * 0.12;
    onCurve.y += Math.cos(time * 1.6) * 0.10;

    const dT = (t - lastT.current) / dt;
    lastT.current = t;
    speed.current = THREE.MathUtils.lerp(
      speed.current,
      Math.min(4.0, Math.abs(dT) * 8 + 0.8),
      0.12
    );

    const body = bodyRef.current;
    if (body) {
      // Lerp rápido pro alvo (mais responsivo que antes)
      body.position.lerp(onCurve, 0.28);

      // Look-at direção
      const lookTarget = new THREE.Vector3()
        .copy(body.position)
        .add(tangent);
      body.lookAt(lookTarget);

      // Banking (roll lateral) baseado em mudança X — dá sensação de curva
      const dx = body.position.x - lastPos.current.x;
      body.rotation.z = THREE.MathUtils.lerp(body.rotation.z, -dx * 1.5, 0.18);
      lastPos.current.copy(body.position);

      // Flap das asas — frequência alta (parece passarinho/peixe)
      const flap = Math.sin(time * 14) * 0.7 * (0.7 + speed.current * 0.15);
      if (wingLRef.current) {
        wingLRef.current.rotation.z = -0.25 + flap;
        wingLRef.current.rotation.y = -0.15 - flap * 0.4;
      }
      if (wingRRef.current) {
        wingRRef.current.rotation.z = 0.25 - flap;
        wingRRef.current.rotation.y = 0.15 + flap * 0.4;
      }
    }

    // Update trail
    if (trailRef.current && body) {
      const pos = trailRef.current.geometry.attributes.position;
      const sizes = trailRef.current.geometry.attributes
        .size as THREE.BufferAttribute;
      const opa = trailRef.current.geometry.attributes
        .opacity as THREE.BufferAttribute;
      // Spawn rate proporcional à velocidade
      const spawnsThisFrame = Math.min(4, Math.ceil(speed.current * 1.5));
      for (let s = 0; s < spawnsThisFrame; s++) {
        // Acha partícula morta
        for (let i = 0; i < TRAIL_COUNT; i++) {
          if (trailLifeRef.current[i] <= 0) {
            const r1 = Math.abs(Math.sin((time + i + s) * 91.45) * 6571.13);
            const r2 = Math.abs(Math.cos((time + i + s) * 53.71) * 1947.31);
            const r3 = Math.abs(Math.sin((time + i + s) * 17.83) * 3892.55);
            const j1 = (r1 - Math.floor(r1) - 0.5) * 0.25;
            const j2 = (r2 - Math.floor(r2) - 0.5) * 0.25;
            const j3 = (r3 - Math.floor(r3) - 0.5) * 0.15;
            // Posiciona atrás do corpo
            pos.setXYZ(
              i,
              body.position.x + j1,
              body.position.y + j2,
              body.position.z + j3
            );
            const r4 = Math.abs(Math.sin((time + i + s) * 31.13) * 8765.21);
            sizes.setX(i, (r4 - Math.floor(r4)) * 0.3 + 0.18);
            opa.setX(i, 0.85);
            trailLifeRef.current[i] = 0.9 + (r1 - Math.floor(r1)) * 0.6;
            break;
          }
        }
      }
      // Update existing
      for (let i = 0; i < TRAIL_COUNT; i++) {
        if (trailLifeRef.current[i] > 0) {
          trailLifeRef.current[i] -= dt;
          // Drift up + spread
          pos.setXYZ(
            i,
            pos.getX(i) + (Math.sin(time * 3 + i) * 0.0008 + 0) * 60 * dt,
            pos.getY(i) + 0.4 * dt + 0.05 * dt,
            pos.getZ(i) + (Math.cos(time * 2 + i) * 0.0006) * 60 * dt
          );
          // Cresce levemente, depois fade
          const life = Math.max(0, trailLifeRef.current[i]);
          const lifeNorm = life / 1.5;
          const cur = sizes.getX(i);
          sizes.setX(i, Math.min(0.8, cur + dt * 0.6));
          opa.setX(i, lifeNorm * 0.85);
        } else {
          opa.setX(i, 0);
        }
      }
      pos.needsUpdate = true;
      sizes.needsUpdate = true;
      opa.needsUpdate = true;
    }
  });

  // Material custom pras particles do trail (com opacity per-particle)
  const trailMat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#ffffff") },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
          // disco soft com fade radial
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d) * vOpacity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    return m;
  }, []);

  return (
    <>
      <CreatureMesh
        bodyRef={bodyRef}
        wingLRef={wingLRef}
        wingRRef={wingRRef}
        color="#ffffff"
        glow="#f79300"
      />
      <points ref={trailRef} geometry={trailGeom} material={trailMat} />
    </>
  );
}

export default function Dragon3D({ zIndex = 5 }: DragonProps) {
  const vp = useScrollViewports();
  const scrollRef = useRef(0);
  useEffect(() => {
    scrollRef.current = vp;
  }, [vp]);

  // Hard cutoff: depois de FADE_END_VP, nem renderiza canvas
  // (poupa GPU e garante que NÃO aparece sobreposto à seção 2)
  const visible = vp < FADE_END_VP;

  // Fade global do wrapper (CSS) pra suavizar o cutoff
  const fade = THREE.MathUtils.clamp(
    1 - (vp - FADE_START_VP) / (FADE_END_VP - FADE_START_VP),
    0,
    1
  );

  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedTrue,
    getMountedFalse
  );

  if (!mounted || !visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex,
        opacity: fade,
        transition: "opacity 0.2s linear",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={1.0}
          color="#fff8e7"
        />
        <pointLight
          position={[-3, -2, 3]}
          intensity={0.6}
          color="#f79300"
        />
        <FlyingCreature scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
