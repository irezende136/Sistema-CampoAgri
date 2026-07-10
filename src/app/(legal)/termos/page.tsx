import Link from "next/link";
import { TERMS_UPDATED_AT } from "@/lib/legal/constants";

export const metadata = { title: "Termos de Uso — Sistema CampoAgri" };

export default function TermosPage() {
  return (
    <article className="prose-legal">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
        Última atualização: {TERMS_UPDATED_AT}
      </p>
      <h1 className="text-2xl font-semibold mb-6">Termos de Uso</h1>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Este documento é um modelo-base de Termos de Uso, redigido para refletir o
        funcionamento real do Sistema CampoAgri e os princípios da LGPD (Lei nº 13.709/2018) e
        do Código de Defesa do Consumidor (Lei nº 8.078/1990). Antes de operar comercialmente
        com clientes pagantes, recomendamos revisão por um advogado.
      </p>

      <Section title="1. Sobre o serviço">
        <p>
          O Sistema CampoAgri (&quot;Sistema&quot;, &quot;nós&quot;) é uma plataforma de gestão de visitas
          técnicas agronômicas: cadastro de produtores rurais, propriedades, áreas/talhões,
          safras, registro de visitas, ocorrências, fotos, recomendações técnicas e geração de
          relatórios em PDF. O acesso é feito por organizações (escritórios de consultoria,
          agrônomos autônomos ou equipes técnicas) e seus usuários autorizados.
        </p>
      </Section>

      <Section title="2. Cadastro e conta">
        <p>
          Para usar o Sistema você cria uma conta com e-mail e senha, vinculada a uma
          organização. Você é responsável por manter suas credenciais em sigilo e por todas as
          atividades realizadas na sua conta. Cada organização deve ter ao menos um usuário com
          papel de <em>owner</em>, responsável pelas configurações e pela equipe.
        </p>
      </Section>

      <Section title="3. Responsabilidade técnica e profissional">
        <p>
          O Sistema é uma ferramenta de organização e registro de informações — ele não
          substitui, valida ou emite julgamento técnico sobre diagnósticos, doses de produtos ou
          recomendações agronômicas. A responsabilidade técnica por avaliações, recomendações e
          relatórios gerados é integralmente do profissional habilitado que os registrou,
          conforme seu registro no conselho profissional competente (CREA ou equivalente).
        </p>
      </Section>

      <Section title="4. Dados registrados pela organização">
        <p>
          A organização (e seus usuários) é responsável por inserir dados verídicos de
          produtores, propriedades e visitas, e por possuir base legal e autorização adequadas
          para tratar os dados pessoais de seus clientes (produtores rurais) dentro do Sistema —
          nos termos da LGPD, a organização atua como <strong>controladora</strong> desses dados,
          e o Sistema CampoAgri atua como <strong>operador</strong>, processando-os apenas para
          viabilizar o serviço contratado. Mais detalhes em nossa{" "}
          <Link href="/privacidade" className="text-primary font-medium">
            Política de Privacidade
          </Link>
          .
        </p>
      </Section>

      <Section title="5. Planos, teste gratuito e cobrança">
        <p>
          O Sistema pode ser oferecido em diferentes planos, incluindo período de teste
          (trial). Caso a cobrança seja ativada futuramente, você será informado previamente
          sobre valores, forma de pagamento e periodicidade, com total transparência conforme o
          Código de Defesa do Consumidor. Contratações remotas garantem ao consumidor o direito
          de arrependimento em até 7 (sete) dias corridos a contar da contratação (art. 49 do
          CDC), com reembolso integral de eventuais valores pagos nesse período.
        </p>
      </Section>

      <Section title="6. Cancelamento">
        <p>
          Você pode solicitar o cancelamento da sua organização a qualquer momento. Após o
          cancelamento, os dados são mantidos por um período razoável para eventual reativação
          ou cumprimento de obrigação legal, e podem ser excluídos definitivamente mediante
          solicitação expressa, observadas as exceções legais de guarda obrigatória.
        </p>
      </Section>

      <Section title="7. Disponibilidade e limitação de responsabilidade">
        <p>
          Envidamos esforços para manter o Sistema disponível e funcional, mas não garantimos
          operação ininterrupta ou livre de falhas. Não nos responsabilizamos por danos
          decorrentes de uso indevido, indisponibilidade de terceiros (conectividade, provedores
          de infraestrutura) ou de decisões agronômicas tomadas com base nos registros do
          Sistema — essa responsabilidade é do profissional técnico responsável, conforme a
          Seção 3.
        </p>
      </Section>

      <Section title="8. Alterações destes termos">
        <p>
          Podemos atualizar estes Termos para refletir mudanças no Sistema ou na legislação.
          Alterações relevantes exigirão um novo aceite explícito antes que você continue
          usando o Sistema.
        </p>
      </Section>

      <Section title="9. Foro e legislação aplicável">
        <p>
          Este documento é regido pelas leis da República Federativa do Brasil. Fica eleito o
          foro do domicílio do consumidor/organização contratante para dirimir eventuais
          controvérsias, conforme o Código de Defesa do Consumidor.
        </p>
      </Section>

      <Section title="10. Contato">
        <p>
          Dúvidas sobre estes termos podem ser enviadas para o e-mail de contato configurado
          pela sua organização, ou diretamente ao suporte da plataforma.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/90 space-y-2">{children}</div>
    </section>
  );
}
