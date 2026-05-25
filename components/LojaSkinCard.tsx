"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { formatBRL } from "@/lib/profit-calculator";
import type { PublicStoreSkin } from "@/lib/ruby-safira-types";
import { whatsappSkinUrl } from "@/lib/whatsapp";

function floatBarPercent(value: number | null): number {
  if (value == null) return 0;
  return Math.min(100, Math.max(0, value * 100));
}

export default function LojaSkinCard({ skin }: { skin: PublicStoreSkin }) {
  const floatPct = floatBarPercent(skin.float);

  return (
    <motion.article
      className="group relative overflow-hidden rounded-[12px] border border-white/10 bg-[#141414] p-4 transition-colors hover:border-[rgba(255,92,10,0.35)]"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-card-sub text-[var(--foreground-muted)]">{skin.weapon}</p>
          <span className="mt-1 inline-flex rounded-full bg-[rgba(34,197,94,0.12)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#22C55E]">
            Disponivel
          </span>
        </div>
        <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 text-[var(--foreground-muted)] transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
          <ShoppingBag size={16} />
        </span>
      </div>

      <h2 className="t-card-title mt-3 line-clamp-2">{skin.name}</h2>

      <div className="mt-2 flex flex-wrap gap-2">
        {skin.isStatTrak ? (
          <Badge label="StatTrak™" tone="orange" />
        ) : null}
        {skin.wearLabel ? <Badge label={skin.wearLabel} tone="muted" /> : null}
      </div>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[8px] bg-black/40">
        <Image
          src={skin.imageUrl}
          alt={skin.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {skin.stickers.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skin.stickers.map((sticker) => (
            <span
              key={sticker}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--foreground-muted)]"
            >
              {sticker}
            </span>
          ))}
        </div>
      ) : null}

      {skin.float != null ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--foreground-muted)]">
            <span>Float</span>
            <span className="tabular-nums">{skin.float.toFixed(4)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] via-[#F5A623] to-[#EF4444]"
              style={{ width: `${floatPct}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="t-card-sub">Preco</p>
          <p className="t-h3 mt-0.5 text-[var(--accent)] tabular-nums">
            {formatBRL(skin.listPrice)}
          </p>
          {skin.suggestedPrice != null ? (
            <p className="t-body-sm mt-1 text-[var(--foreground-muted)] line-through tabular-nums">
              {formatBRL(skin.suggestedPrice)}
            </p>
          ) : null}
        </div>
      </div>

      <a
        href={whatsappSkinUrl(skin.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-solid t-cta mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2"
      >
        <MessageCircle size={16} />
        Quero esta skin
      </a>
    </motion.article>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "orange" | "muted";
}) {
  const styles =
    tone === "orange"
      ? "bg-[rgba(255,92,10,0.15)] text-[var(--accent)]"
      : "bg-white/10 text-[var(--foreground-muted)]";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${styles}`}
    >
      {label}
    </span>
  );
}
