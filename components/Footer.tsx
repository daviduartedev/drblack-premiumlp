"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { whatsappUrl } from "@/lib/whatsapp";

const UTOPIA_URL = "https://utopia.app.br/";
const WHATSAPP_URL = whatsappUrl();

/**
 * Footer institucional.
 *
 * Estrutura:
 *  - 4 colunas em desktop (Marca / Navegação / Suporte / Legal)
 *  - Empilhado em mobile
 *  - Barra inferior com © + crédito Utopia + disclaimer Valve
 *
 * Tom: limpo. Credibilidade vem da organização, não de adornos.
 */

type FooterLink = { label: string; href: string };

const NAV: FooterLink[] = [
  { label: "Catálogo", href: "/loja" },
  { label: "Rifas", href: "/rifas" },
  { label: "Coleções", href: "#" },
  { label: "Sobre", href: "#" },
];

const SUPORTE: FooterLink[] = [
  { label: "Como funciona", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Garantia", href: "#" },
  { label: "Contato", href: "mailto:contato@drblackskins.com" },
];

const LEGAL: FooterLink[] = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Política de Cookies", href: "/cookies" },
  { label: "Aviso LGPD", href: "/privacidade#lgpd" },
];

const SOCIAL: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Discord",
    href: "https://discord.gg/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05a19.9 19.9 0 0 0 5.99 3.03c.03.01.06 0 .08-.02.46-.63.87-1.29 1.23-1.99.02-.04 0-.08-.04-.09-.65-.25-1.27-.55-1.87-.89-.04-.02-.04-.08-.01-.11.13-.09.25-.19.37-.29.02-.02.05-.02.07-.01 3.92 1.79 8.18 1.79 12.06 0 .02-.01.05-.01.07.01.12.1.24.2.37.29.04.03.04.09-.01.11-.6.35-1.22.64-1.87.89-.04.01-.05.06-.04.09.37.7.78 1.36 1.23 1.99.02.02.05.03.08.02 1.95-.6 3.95-1.5 5.99-3.03.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="relative w-full"
      style={{
        background: "var(--background)",
      }}
    >
      {/* Bloco principal */}
      <div
        className="content-wrap section-padding-x"
        style={{ paddingBlock: "var(--space-7)" }}
      >
        <div
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] xl:gap-x-[var(--space-7)]"
          style={{ rowGap: "var(--space-6)" }}
        >
          {/* COLUNA 1 — MARCA */}
          <div className="md:pr-[var(--space-6)] md:pt-[2px]">
            <div
              className="relative"
              style={{ maxWidth: "min(100%, 320px)" }}
            >
              <Image
                src="/new-logo.png"
                alt="Dr. Black Skins, assinatura"
                width={500}
                height={500}
                className="h-20 w-20 object-contain object-left"
                sizes="80px"
              />
            </div>
            <p
              className="t-body-sm mt-4"
              style={{ maxWidth: "32ch" }}
            >
              Skins de CS2, rifas e mercado direto. Compra, vende, concorra, sem enrolação.
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="btn-icon-sm"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Navegação" links={NAV} />
          <FooterColumn title="Suporte" links={SUPORTE} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>
      </div>

      {/* Barra inferior */}
      <div
        style={{
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        <div
          className="content-wrap section-padding-x flex flex-col gap-[var(--space-2)] md:flex-row md:items-center md:justify-between"
          style={{
            paddingBlock: "clamp(var(--space-3), 2vw, var(--space-4))",
          }}
        >
          <p
            className="t-body-sm"
            style={{ color: "var(--foreground-faint)", margin: 0 }}
          >
            © {new Date().getFullYear()} DR Black Skins
            <span style={{ opacity: 0.85 }}>
              {" "}
              · Desenvolvido por{" "}
              <a
                href={UTOPIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                utopia.app.br
              </a>
            </span>
          </p>

          <p
            className="t-body-sm"
            style={{ color: "var(--foreground-faint)", margin: 0 }}
          >
            Não somos afiliados à Valve. CS2 é marca registrada da Valve Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
 * Coluna do footer
 * ============================================================ */
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="t-eyebrow">
        {title}
      </h3>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLinkItem href={link.href}>{link.label}</FooterLinkItem>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLinkItem({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const className = "footer-link t-body-sm";

  if (isInternal && href.startsWith("/")) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
