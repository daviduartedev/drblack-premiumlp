"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CatalogOption } from "@/lib/cs2-skin-catalog";

type SearchableComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: CatalogOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function matchesQuery(option: CatalogOption, query: string): boolean {
  if (!query) return true;
  const haystack = normalize(`${option.label} ${option.value} ${option.hint ?? ""}`);
  return haystack.includes(normalize(query));
}

export function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder = "Selecione ou busque",
  searchPlaceholder = "Buscar...",
  allowCustom = true,
  emptyMessage = "Nenhum resultado",
  disabled = false,
}: SearchableComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((item) => item.value === value);

  const filtered = useMemo(
    () => options.filter((item) => matchesQuery(item, query)),
    [options, query]
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function commitValue(next: string) {
    onChange(next);
    setQuery("");
    setOpen(false);
  }

  function handleBlur() {
    if (!allowCustom) return;
    const trimmed = query.trim();
    if (trimmed) {
      commitValue(trimmed);
    }
  }

  const displayValue = open ? query : selected?.label ?? (value || "");

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        value={displayValue}
        placeholder={placeholder}
        className="admin-input min-h-[44px] w-full"
        onFocus={() => {
          setOpen(true);
          setQuery(selected?.label ?? value);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (allowCustom) {
            onChange(e.target.value);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            handleBlur();
            setOpen(false);
          }, 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
          if (e.key === "Enter" && filtered[0]) {
            e.preventDefault();
            commitValue(filtered[0].value);
          }
        }}
      />

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-[280px] w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1A1A1A] py-1 shadow-xl"
        >
          <div className="border-b border-white/[0.06] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#888888]">
              {searchPlaceholder}
            </p>
          </div>
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-[13px] text-[#888888]">{emptyMessage}</p>
          ) : (
            filtered.map((item) => {
              const active = item.value === value;
              return (
                <button
                  key={`${item.value}-${item.label}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] ${
                    active ? "bg-[rgba(245,166,35,0.08)]" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitValue(item.value)}
                >
                  <span className="text-[13px] font-medium text-[#F0F0F0]">
                    {item.label}
                  </span>
                  {item.hint ? (
                    <span className="text-[11px] text-[#888888]">{item.hint}</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
