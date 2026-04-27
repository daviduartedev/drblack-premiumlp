import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Cookies | DR Black Skins",
  description:
    "Como usamos cookies e tecnologias semelhantes — categorias, finalidade e como gerenciar.",
};

const UPDATED_AT = "27 de abril de 2026";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--background)" }}>
      <main
        className="content-wrap section-padding"
        style={{ flex: 1, maxWidth: "880px" }}
      >
        <Link
          href="/"
          className="t-eyebrow"
          style={{ color: "var(--highlight)" }}
        >
          ← Voltar para o início
        </Link>

        <h1 className="t-h2 mt-6">Política de Cookies</h1>
        <p
          className="t-body-sm mt-3"
          style={{ color: "var(--foreground-faint)" }}
        >
          Última atualização: {UPDATED_AT}
        </p>

        <article
          className="mt-10 flex flex-col gap-8"
          style={{ color: "var(--foreground-muted)" }}
        >
          <Section title="O que são cookies">
            <p>
              Cookies são pequenos arquivos de texto que sites colocam no seu
              dispositivo para lembrar preferências e medir uso. Tecnologias
              semelhantes — como localStorage e pixels de rastreamento —
              também são tratadas por esta política.
            </p>
          </Section>

          <Section title="Categorias que usamos">
            <CookieRow
              name="Essenciais"
              required
              purpose="Manter sessão, autenticação e segurança. Sem eles o site não funciona."
              examples="dr.session, dr.csrf"
            />
            <CookieRow
              name="Analíticos"
              purpose="Estatísticas anônimas e agregadas de navegação para entender o que melhorar."
              examples="_ga, _ga_*"
            />
            <CookieRow
              name="Marketing"
              purpose="Personalização de campanhas e medição de conversão."
              examples="_fbp, _gcl_au"
            />
          </Section>

          <Section title="Como gerenciar">
            <p>
              Na primeira visita exibimos um banner com as opções{" "}
              <strong>Aceitar todos</strong>, <strong>Só essenciais</strong> e{" "}
              <strong>Configurar</strong>. Sua escolha fica registrada
              localmente e pode ser alterada a qualquer momento limpando os
              dados do site no seu navegador, ou recarregando a página com o
              banner reaberto. Você também pode bloquear cookies diretamente
              nas configurações do navegador.
            </p>
          </Section>

          <Section title="Mais informações">
            <p>
              Detalhes sobre dados pessoais estão na nossa{" "}
              <Link href="/privacidade" style={{ color: "var(--highlight)" }}>
                Política de Privacidade
              </Link>
              . Dúvidas:{" "}
              <a
                href="mailto:dpo@drblackskins.com"
                style={{ color: "var(--highlight)" }}
              >
                dpo@drblackskins.com
              </a>
              .
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="t-h3" style={{ color: "var(--foreground)" }}>
        {title}
      </h2>
      <div
        className="mt-3 t-body flex flex-col gap-4"
        style={{ color: "var(--foreground-muted)", lineHeight: 1.7 }}
      >
        {children}
      </div>
    </section>
  );
}

function CookieRow({
  name,
  purpose,
  examples,
  required,
}: {
  name: string;
  purpose: string;
  examples: string;
  required?: boolean;
}) {
  return (
    <div
      style={{
        padding: "var(--space-4)",
        border: "1px solid var(--line-soft)",
        borderRadius: "12px",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="t-card-title">{name}</span>
        {required ? (
          <span
            className="t-card-sub"
            style={{
              padding: "2px 8px",
              borderRadius: "999px",
              border: "1px solid var(--line)",
              color: "var(--accent)",
            }}
          >
            Obrigatório
          </span>
        ) : null}
      </div>
      <p className="t-body-sm mt-2">{purpose}</p>
      <p
        className="t-body-sm mt-2"
        style={{ color: "var(--foreground-faint)" }}
      >
        Exemplos: <code>{examples}</code>
      </p>
    </div>
  );
}
