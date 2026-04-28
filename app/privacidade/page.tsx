import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade | DR Black Skins",
  description:
    "Como tratamos seus dados pessoais, base legal, finalidades, retenção e seus direitos sob a LGPD.",
};

const UPDATED_AT = "27 de abril de 2026";

export default function PrivacidadePage() {
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

        <h1 className="t-h2 mt-6">Política de Privacidade</h1>
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
          <Section title="1. Quem somos">
            <p>
              <strong>[Razão Social Ltda.]</strong>, CNPJ{" "}
              <strong>XX.XXX.XXX/0001-XX</strong>, é a controladora dos seus
              dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº
              13.709/2018, LGPD).
            </p>
          </Section>

          <Section title="2. Quais dados coletamos">
            <p>
              Coletamos: dados de cadastro (nome, e-mail, CPF, data de
              nascimento), dados financeiros para processar pagamentos (CPF,
              dados bancários ou de cartão, pelo provedor parceiro), dados de
              navegação (IP, dispositivo, cookies), dados da Steam (Steam ID,
              inventário público) quando você conecta sua conta, e
              comunicações que você nos envia.
            </p>
          </Section>

          <Section title="3. Para que usamos">
            <p>
              Para criar e manter sua conta, processar transações e rifas,
              prevenir fraudes, cumprir obrigações legais e fiscais, atender
              suporte e, apenas com seu consentimento, enviar comunicações
              de marketing e melhorar a experiência via análises agregadas.
            </p>
          </Section>

          <Section title="4. Base legal (LGPD art. 7º)">
            <p>
              Tratamos seus dados com base em: execução de contrato (cadastro
              e transações); cumprimento de obrigação legal (fiscal,
              prevenção a fraudes); legítimo interesse (segurança e melhoria
              do serviço); e consentimento (marketing, cookies não-essenciais).
            </p>
          </Section>

          <Section title="5. Compartilhamento">
            <p>
              Compartilhamos dados com: provedor de pagamento, provedor de
              hospedagem e serviços em nuvem, serviços antifraude, e
              autoridades quando exigido por lei. Não vendemos seus dados.
            </p>
          </Section>

          <Section title="6. Retenção">
            <p>
              Mantemos os dados pelo tempo necessário às finalidades acima e
              pelos prazos legais, mínimo de 5 anos para registros financeiros
              e fiscais, conforme legislação tributária. Após esse período, os
              dados são anonimizados ou eliminados.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              Detalhes na nossa{" "}
              <Link href="/cookies" style={{ color: "var(--highlight)" }}>
                Política de Cookies
              </Link>
              . Cookies essenciais não exigem consentimento; demais categorias
              são ativadas apenas após sua escolha no banner.
            </p>
          </Section>

          <Section title="8. Seus direitos" id="lgpd">
            <p>
              Sob a LGPD, você tem direito a: confirmar a existência de
              tratamento; acessar seus dados; corrigir dados incompletos ou
              desatualizados; anonimizar, bloquear ou eliminar dados
              desnecessários; portabilidade; informação sobre
              compartilhamento; revogar consentimento; opor-se a tratamento.
              Para exercer, escreva ao nosso encarregado de dados (DPO) em{" "}
              <a
                href="mailto:dpo@drblackskins.com"
                style={{ color: "var(--highlight)" }}
              >
                dpo@drblackskins.com
              </a>
              . Respondemos em até 15 dias.
            </p>
          </Section>

          <Section title="9. Encarregado de Dados (DPO)">
            <p>
              <strong>[Nome do DPO]</strong> · dpo@drblackskins.com · [Telefone
              opcional]. Esta é a pessoa responsável por intermediar a
              comunicação entre você, a empresa e a Autoridade Nacional de
              Proteção de Dados (ANPD).
            </p>
          </Section>

          <Section title="10. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais, criptografia em
              trânsito (TLS), controle de acesso, monitoramento, backups e
              treinamento da equipe, para proteger seus dados. Em caso de
              incidente relevante, comunicaremos a ANPD e os titulares
              afetados conforme a LGPD.
            </p>
          </Section>

          <Section title="11. Transferência internacional">
            <p>
              Alguns provedores (hospedagem, e-mail) podem armazenar dados
              fora do Brasil. Nesses casos, exigimos garantias contratuais
              compatíveis com a LGPD.
            </p>
          </Section>

          <Section title="12. Crianças e adolescentes">
            <p>
              A plataforma é restrita a maiores de 18 anos. Não tratamos
              intencionalmente dados de menores. Se identificarmos dados de
              menor coletados sem autorização, eliminamos o registro.
            </p>
          </Section>

          <Section title="13. Alterações">
            <p>
              Esta política pode ser atualizada. Mudanças relevantes serão
              comunicadas por e-mail e em destaque no site.
            </p>
          </Section>

          <Section title="14. Contato e ANPD">
            <p>
              Dúvidas:{" "}
              <a
                href="mailto:dpo@drblackskins.com"
                style={{ color: "var(--highlight)" }}
              >
                dpo@drblackskins.com
              </a>
              . Você também pode reclamar diretamente à ANPD em{" "}
              <a
                href="https://www.gov.br/anpd/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--highlight)" }}
              >
                gov.br/anpd
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

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: "var(--space-7)" }}>
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
