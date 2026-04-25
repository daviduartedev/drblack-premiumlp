"use client";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

gsap.registerPlugin(ScrollTrigger);

const ANIM_FILM_FRAME_COUNT = 96;
const ANIM_FILM_FILE_LAST = 101;
const ANIM_FILM_SCROLL_STEPS = 1 + ANIM_FILM_FRAME_COUNT;
const LAST_CARD_STATIC_SRC = "/gallery/knife.png";
const LAST_CARD_DOM_FALLBACK = "#0a0a0a";

const CARD3_HEADLINE_DEFAULT = "CARTA FORTE\nNO SEU TEMPO.";
const CARD3_HEADLINE_REVEAL =
  "AQUI O PREÇO TÁ EXPOSTO\nE A SKIN TÁ SÓBRIA.";

function filmFileIndexFromStep(filmStep: number) {
  if (filmStep <= 0) return 1;
  if (filmStep > ANIM_FILM_FRAME_COUNT) return ANIM_FILM_FILE_LAST;
  if (ANIM_FILM_FRAME_COUNT <= 1) return ANIM_FILM_FILE_LAST;
  const t =
    ((filmStep - 1) * (ANIM_FILM_FILE_LAST - 1)) / (ANIM_FILM_FRAME_COUNT - 1);
  return 1 + Math.round(t);
}

function frameJpegUrl(fileIndex: number) {
  return `/animacao-frames/frame_${String(fileIndex).padStart(3, "0")}.jpg`;
}

function FilmFrameDoubleBuffer({
  fileIndex,
  fallbackColor,
}: {
  fileIndex: number;
  fallbackColor: string;
}) {
  const url = useMemo(() => frameJpegUrl(fileIndex), [fileIndex]);
  const aRef = useRef<HTMLImageElement | null>(null);
  const bRef = useRef<HTMLImageElement | null>(null);
  const frontIsA = useRef(true);
  const initRef = useRef(false);
  const lastApplied = useRef<string | null>(null);
  const loadGen = useRef(0);

  const base: React.CSSProperties = {
    transform: "scale(1.04)",
    backgroundColor: fallbackColor,
    willChange: "auto",
  };

  useLayoutEffect(() => {
    if (lastApplied.current === url) return;
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    if (!initRef.current) {
      a.src = url;
      b.src = url;
      a.style.zIndex = "2";
      b.style.zIndex = "1";
      a.style.opacity = "1";
      b.style.opacity = "1";
      void a.decode?.().catch(() => undefined);
      initRef.current = true;
      lastApplied.current = url;
      return;
    }

    const gen = ++loadGen.current;
    const useAOnTop = frontIsA.current;
    const elUnder = useAOnTop ? b : a;
    const elOver = useAOnTop ? a : b;

    elUnder.src = url;
    const finalize = () => {
      if (gen !== loadGen.current) return;
      elUnder.style.zIndex = "2";
      elOver.style.zIndex = "1";
      frontIsA.current = elUnder === a;
      lastApplied.current = url;
    };

    if (elUnder.decode) {
      elUnder
        .decode()
        .then(() => requestAnimationFrame(finalize))
        .catch(() => {
          elUnder.addEventListener(
            "load",
            () => requestAnimationFrame(finalize),
            { once: true }
          );
        });
    } else if (elUnder.complete && elUnder.naturalWidth) {
      requestAnimationFrame(finalize);
    } else {
      elUnder.addEventListener(
        "load",
        () => requestAnimationFrame(finalize),
        { once: true }
      );
    }
  }, [url]);

  return (
    <>
      <img
        ref={aRef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        style={{ ...base, zIndex: 2 }}
        decoding="async"
        draggable={false}
      />
      <img
        ref={bRef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        style={{ ...base, zIndex: 1 }}
        decoding="async"
        draggable={false}
      />
    </>
  );
}

/**
 * Trecho scroll-linked: frame estático (faca) → scrub `frame_001`…`frame_101`.
 * Headline de revelação só nos dois últimos ficheiros (100 e 101).
 */
export default function ScrollFilmCoda() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [filmProgress, setFilmProgress] = useState(0);

  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= ANIM_FILM_FILE_LAST; i++) {
      const img = document.createElement("img");
      img.decoding = "async";
      img.src = frameJpegUrl(i);
      imgs.push(img);
    }
    return () => {
      imgs.forEach((img) => {
        img.src = "";
      });
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: "+=420%",
        pin: true,
        scrub: 0.65,
        anticipatePin: 1,
        onUpdate: (self) => {
          setFilmProgress(self.progress);
        },
      });
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const filmStep = useMemo(() => {
    const t = Math.min(1, Math.max(0, filmProgress));
    return Math.min(
      ANIM_FILM_FRAME_COUNT,
      Math.max(0, Math.floor(t * ANIM_FILM_SCROLL_STEPS * (1 - 1e-9)))
    );
  }, [filmProgress]);

  const filmFileIndex = useMemo(() => {
    if (filmStep <= 0) return -1;
    return filmFileIndexFromStep(filmStep);
  }, [filmStep]);

  const showReveal =
    filmStep > 0 && filmFileIndex >= ANIM_FILM_FILE_LAST - 1;

  const headlineText = showReveal ? CARD3_HEADLINE_REVEAL : CARD3_HEADLINE_DEFAULT;

  return (
    <section ref={rootRef} className="w-full" style={{ minHeight: "520vh" }}>
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
        style={{ backgroundColor: LAST_CARD_DOM_FALLBACK }}
        data-film-step={String(filmStep)}
      >
        <div className="absolute inset-0">
          {filmStep > 0 ? (
            <div className="absolute inset-0 isolate" aria-hidden>
              <FilmFrameDoubleBuffer
                fileIndex={filmFileIndexFromStep(filmStep)}
                fallbackColor={LAST_CARD_DOM_FALLBACK}
              />
            </div>
          ) : (
            <div className="absolute inset-0" aria-hidden>
              <Image
                src={LAST_CARD_STATIC_SRC}
                alt=""
                fill
                className="object-cover"
                style={{ transform: "scale(1.04)" }}
                sizes="100vw"
                priority
              />
            </div>
          )}
        </div>

        <div
          className="absolute bottom-[14vh] left-0 right-0 z-10 px-[5vw] pointer-events-none select-none"
        >
          <h2
            key={showReveal ? "rev" : "def"}
            style={{
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              lineHeight: 0.88,
              letterSpacing: "-0.025em",
              fontSize: "clamp(40px, 8vw, 120px)",
              color: "rgba(255,255,255,0.97)",
              textTransform: "uppercase",
              whiteSpace: "pre-line",
              textShadow: "0 14px 40px rgba(0,0,0,0.45)",
              opacity: showReveal ? 1 : 0.55,
              transition: "opacity 240ms ease",
              maxWidth: "76rem",
            }}
          >
            {headlineText}
          </h2>
          <p
            className="mt-4 max-w-md text-[12px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            A última carta: faca no frame, print no inventário, clip no mercado — tudo
            no mesmo scroll.
          </p>
        </div>

        <div
          className="absolute bottom-6 left-[5vw] z-10 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {filmStep === 0
            ? "CENA · CARTA"
            : `CENA ${filmStep} / ${ANIM_FILM_FRAME_COUNT}`}
        </div>
      </div>
    </section>
  );
}
