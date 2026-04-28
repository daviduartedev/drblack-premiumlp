import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos de Uso | DR Black Skins",
  description:
    "Termos e condições de uso da plataforma DR Black Skins, compra, venda e rifa de skins de CS2.",
};

const UPDATED_AT = "27 de abril de 2026";

export default function TermosPage() {
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

        <h1 className="t-h2 mt-6">Termos de Uso</h1>
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
          <Section title="1. Sobre estes termos">
            <p>
              Bem-vindo à DR Black Skins. Estes Termos de Uso regulam o acesso e a
              utilização da plataforma operada por <strong>[Razão Social Ltda.]</strong>,
              CNPJ <strong>XX.XXX.XXX/0001-XX</strong>, com sede em [endereço completo].
              Ao usar o site você concorda integralmente com este documento.
            </p>
          </Section>

          <Section title="2. Quem pode usar a plataforma">
            <p>
              É necessário ter pelo menos 18 anos e capacidade civil plena. Menores
              só podem usar a plataforma sob responsabilidade dos representantes
              legais, que assumem toda obrigação contratual.
            </p>
          </Section>

          <Section title="3. Cadastro e conta">
            <p>
              O usuário é responsável pelas informações fornecidas no cadastro,
              pelo sigilo da senha e por todas as ações realizadas em sua conta.
              Reservamo-nos o direito de suspender ou encerrar contas com
              indícios de fraude, uso indevido, lavagem de dinheiro ou
              violação destes termos.
            </p>
          </Section>

          <Section title="4. Compra e venda de skins">
            <p>
              A plataforma intermedia transações entre usuários e/ou entre o
              usuário e a operadora. Preços, taxas e condições estão exibidos na
              tela da transação antes da confirmação. As skins são bens digitais
              e a posse depende das regras da Steam/Valve, sobre as quais não
              temos controle.
            </p>
          </Section>

          <Section title="5. Rifas">
            <p>
              As rifas oferecidas seguem regulamento próprio publicado em cada
              campanha (período, preço do bilhete, prêmio, critério de sorteio,
              forma de entrega). Resultados são auditáveis e divulgados em até
              48 horas após o sorteio. Participantes devem ser maiores de idade.
            </p>
          </Section>

          <Section title="6. Pagamentos e reembolso">
            <p>
              Pagamentos são processados por provedor parceiro. Em caso de falha
              técnica imputável à plataforma, o reembolso é integral. Compras de
              bilhetes de rifa são definitivas após a confirmação do pagamento,
              salvo cancelamento da campanha pela operadora.
            </p>
          </Section>

          <Section title="7. Conduta proibida">
            <p>
              É vedado: usar bots, scrapers ou automações não autorizadas;
              tentar burlar mecanismos de segurança; revender contas; fornecer
              dados falsos; usar a plataforma para qualquer atividade ilícita.
              O descumprimento implica suspensão imediata, sem prejuízo das
              medidas judiciais cabíveis.
            </p>
          </Section>

          <Section title="8. Propriedade intelectual">
            <p>
              A marca, logotipos, textos, imagens e código da plataforma são
              propriedade da operadora ou licenciados a ela. <em>Counter-Strike 2</em>
              {" "}e suas skins são marcas registradas da Valve Corporation; não
              somos afiliados à Valve.
            </p>
          </Section>

          <Section title="9. Limitação de responsabilidade">
            <p>
              A plataforma é fornecida "como está". Não nos responsabilizamos por
              indisponibilidade da Steam/Valve, por flutuações de mercado de
              skins ou por danos indiretos decorrentes do uso. Nossa
              responsabilidade fica limitada ao valor da última transação do
              usuário no site.
            </p>
          </Section>

          <Section title="10. Alterações">
            <p>
              Estes termos podem ser atualizados a qualquer momento. Mudanças
              relevantes serão comunicadas por e-mail e exibidas em destaque no
              site. O uso continuado após a alteração implica aceitação.
            </p>
          </Section>

          <Section title="11. Foro">
            <p>
              Fica eleito o foro da comarca de [Cidade/UF], com renúncia a
              qualquer outro, para dirimir controvérsias decorrentes destes
              termos.
            </p>
          </Section>

          <Section title="12. Contato">
            <p>
              Dúvidas: <a href="mailto:contato@drblackskins.com" style={{ color: "var(--highlight)" }}>contato@drblackskins.com</a>
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
      <h2 className="t-h3">
        {title}
      </h2>
      <div
        className="mt-3 t-body"
        style={{ color: "var(--foreground-muted)", lineHeight: 1.7 }}
      >
        {children}
      </div>
    </section>
  );
}
