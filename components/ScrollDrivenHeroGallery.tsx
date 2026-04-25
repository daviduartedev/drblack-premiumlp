"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ScrollFilmCoda from "@/components/ScrollFilmCoda";

type CardEnv = {
  accent: string;
  bgUrl?: string;
};

type GalleryCard = {
  id: string;
  title: string;
  imageUrl: string;
  env: CardEnv;
};

gsap.registerPlugin(ScrollTrigger);

function WipeScene({
  fromUrl,
  toUrl,
  fromAccent,
  toAccent,
  t,
}: {
  fromUrl: string;
  toUrl: string;
  fromAccent: string;
  toAccent: string;
  t: number;
}) {
  const texARaw = useTexture(fromUrl);
  const texBRaw = useTexture(toUrl);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const texA = useMemo(() => {
    const x = texARaw.clone();
    x.colorSpace = THREE.SRGBColorSpace;
    x.wrapS = x.wrapT = THREE.ClampToEdgeWrapping;
    x.minFilter = THREE.LinearFilter;
    x.magFilter = THREE.LinearFilter;
    x.needsUpdate = true;
    return x;
  }, [texARaw]);

  const texB = useMemo(() => {
    const x = texBRaw.clone();
    x.colorSpace = THREE.SRGBColorSpace;
    x.wrapS = x.wrapT = THREE.ClampToEdgeWrapping;
    x.minFilter = THREE.LinearFilter;
    x.magFilter = THREE.LinearFilter;
    x.needsUpdate = true;
    return x;
  }, [texBRaw]);

  const uniforms = useMemo(() => {
    return {
      uTexA: { value: texA },
      uTexB: { value: texB },
      uT: { value: 0 },
      uColorA: { value: new THREE.Color(fromAccent) },
      uColorB: { value: new THREE.Color(toAccent) },
      uTime: { value: 0 },
    };
  }, [texA, texB, fromAccent, toAccent]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uT.value = t;
    materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform sampler2D uTexA;
          uniform sampler2D uTexB;
          uniform float uT;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform float uTime;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }

          void main() {
            vec3 baseA = uColorA;
            vec3 baseB = uColorB;
            vec2 uv = vUv;
            vec2 uvA = uv + vec2(-0.02, 0.00) * uT;
            vec2 uvB = uv + vec2( 0.02, 0.00) * (1.0 - uT);
            vec3 colA = texture2D(uTexA, uvA).rgb * 0.75 + baseA * 0.25;
            vec3 colB = texture2D(uTexB, uvB).rgb * 0.75 + baseB * 0.25;
            float n = hash(uv * 180.0 + uTime * 0.15);
            float edge = uv.x + (n - 0.5) * 0.06;
            float mask = smoothstep(uT - 0.04, uT + 0.04, edge);
            vec3 col = mix(colA, colB, mask);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function ScrollDrivenHeroGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ p: 0 });
  const stRef = useRef<ScrollTrigger | null>(null);

  const cards: GalleryCard[] = useMemo(
    () => [
      {
        id: "1",
        title: "SKINS NO PONTO.\nRIFA NA TELA.",
        imageUrl: "/gallery/card-1.jpg",
        env: {
          accent: "#120f0c",
          bgUrl: "/gallery/env-1.jpg",
        },
      },
      {
        id: "2",
        title: "MERCADO AO VIVO\nSEM ENROLAÇÃO.",
        imageUrl: "/gallery/card-2.jpg",
        env: {
          accent: "#1a1510",
          bgUrl: "/gallery/env-2.jpg",
        },
      },
      {
        id: "3",
        title: "CARTA FORTE\nNO SEU TEMPO.",
        imageUrl: "/gallery/knife.png",
        env: {
          accent: "#c94d0f",
          bgUrl: "/gallery/env-3.jpg",
        },
      },
    ],
    []
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [transitionT, setTransitionT] = useState(0);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      const steps = cards.length - 1;
      const total = Math.max(1, steps);

      progressRef.current.p = 0;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: `+=${cards.length * 100}%`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current.p = self.progress;
            const p = self.progress * total;
            const idx = Math.min(steps, Math.max(0, Math.floor(p)));
            const t = p - idx;
            setActiveIdx(idx);
            setTransitionT(t);
          },
        },
      });

      stRef.current = tl.scrollTrigger ?? null;
      return () => {
        stRef.current = null;
      };
    }, rootRef);

    return () => ctx.revert();
  }, [cards.length]);

  const from = cards[activeIdx];
  const to = cards[Math.min(cards.length - 1, activeIdx + 1)];

  const jumpTo = (idx: number) => {
    const st = stRef.current;
    if (!st) return;
    const total = Math.max(1, cards.length - 1);
    const targetProgress = total === 0 ? 0 : idx / total;
    const y = st.start + (st.end - st.start) * targetProgress;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section ref={rootRef} className="w-full">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Canvas
            orthographic
            camera={{ position: [0, 0, 5], zoom: 1 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            dpr={[1, 1.75]}
          >
            <WipeScene
              fromUrl={from.env.bgUrl ?? from.imageUrl}
              toUrl={to.env.bgUrl ?? to.imageUrl}
              fromAccent={from.env.accent}
              toAccent={to.env.accent}
              t={transitionT}
            />
          </Canvas>
        </div>

        <div className="relative z-10 h-full w-full">
          <div className="flex items-center justify-between px-[5vw] pt-7">
            <div
              className="text-[11px] tracking-[0.28em] uppercase"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              DR · BLACK SKINS
            </div>

            <div className="flex items-center gap-2">
              {cards.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => jumpTo(i)}
                  className="h-7 px-3 text-[10px] tracking-[0.28em] uppercase transition"
                  style={{
                    border: "1px solid rgba(255,92,10,0.45)",
                    color:
                      i === activeIdx || i === activeIdx + 1
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.55)",
                    background:
                      i === activeIdx ? "rgba(255,92,10,0.18)" : "transparent",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>

          <div className="px-[5vw] mt-[10vh] max-w-[52rem]">
            <h1
              style={{
                fontFamily: "var(--font-oswald), sans-serif",
                fontWeight: 700,
                lineHeight: 0.88,
                letterSpacing: "-0.02em",
                fontSize: "clamp(56px, 9vw, 156px)",
                color: "rgba(255,255,255,0.96)",
                textTransform: "uppercase",
                whiteSpace: "pre-line",
              }}
            >
              {from.title}
            </h1>
            <p
              className="mt-5 text-[13px] leading-relaxed max-w-lg"
              style={{ color: "rgba(255,255,255,0.74)" }}
            >
              Scroll com wipe entre ambientes: o card ativo encosta à esquerda e o
              próximo entra pela direita, em cima da mesma paleta laranja e preto.
            </p>
          </div>

          <div className="absolute inset-x-[5vw] bottom-[8vh] flex items-end justify-between gap-8">
            <div className="flex items-end gap-3">
              {cards.slice(0, activeIdx).map((c, i) => (
                <div
                  key={c.id}
                  className="relative overflow-hidden"
                  style={{
                    width: 148,
                    height: 96,
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.18)",
                    transform: `translateY(${i * 6}px) rotate(${(-2 + i) * 0.6}deg)`,
                    boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                  }}
                >
                  <Image
                    src={c.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="148px"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-end gap-5">
              <div
                className="relative overflow-hidden"
                style={{
                  width: 520,
                  height: 340,
                  borderRadius: 22,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
                  transform: `translateX(${(-220 * transitionT).toFixed(2)}px) scale(${(
                    1 - 0.18 * transitionT
                  ).toFixed(3)})`,
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              >
                <Image
                  src={from.imageUrl}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 520px, 90vw"
                />
              </div>

              <div
                className="relative overflow-hidden"
                style={{
                  width: 440,
                  height: 300,
                  borderRadius: 22,
                  border: "1px solid rgba(255,255,255,0.16)",
                  boxShadow: "0 18px 60px rgba(0,0,0,0.42)",
                  transform: `translateX(${(220 * (1 - transitionT)).toFixed(2)}px) scale(${(
                    0.92 + 0.08 * transitionT
                  ).toFixed(3)})`,
                  opacity: 0.85 + 0.15 * transitionT,
                  willChange: "transform, opacity",
                }}
              >
                <Image
                  src={to.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 440px, 80vw"
                />
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-7 left-[5vw] text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            SCROLL ↓
          </div>
        </div>
      </div>

      <ScrollFilmCoda />

      <section
        className="relative w-full"
        style={{
          minHeight: "100vh",
          background: "#eed9c4",
          color: "#0a0a0a",
        }}
      >
        <div className="mx-auto max-w-6xl px-[5vw] py-24">
          <div
            className="text-[11px] tracking-[0.28em] uppercase"
            style={{ color: "rgba(10,10,10,0.55)" }}
          >
            04 · TIMELINE
          </div>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              fontSize: "clamp(42px, 6vw, 92px)",
              lineHeight: 0.95,
            }}
          >
            Continua a narrativa
          </h2>
          <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-black/70">
            Do arquivo vivo para o mercado real. Da promessa para a entrega.
          </p>
        </div>
      </section>
    </section>
  );
}
