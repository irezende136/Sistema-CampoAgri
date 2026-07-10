import { TERMS_UPDATED_AT } from "@/lib/legal/constants";

export const metadata = { title: "Política de Privacidade — Sistema CampoAgri" };

export default function PrivacidadePage() {
  return (
    <article>
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
        Última atualização: {TERMS_UPDATED_AT}
      </p>
      <h1 className="text-2xl font-semibold mb-6">Política de Privacidade</h1>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Esta política explica quais dados o Sistema CampoAgri trata, para quê, com que base
        legal e quais direitos você (usuário) e os produtores rurais cadastrados possuem, em
        conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
      </p>

      <Section title="1. Quem trata os dados">
        <p>
          Existem dois papéis distintos: sua <strong>organização</strong> (o escritório ou
          agrônomo que usa o Sistema) é a <strong>controladora</strong> dos dados dos produtores
          e propriedades que cadastra — ela decide o quê, como e por quê registrar. O{" "}
          <strong>Sistema CampoAgri</strong> atua como <strong>operador</strong>: processamos
          esses dados apenas para viabilizar as funcionalidades contratadas, seguindo as
          instruções da organização e as salvaguardas técnicas descritas abaixo.
        </p>
      </Section>

      <Section title="2. Dados que coletamos">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Da pessoa que usa o Sistema</strong> (agrônomo, técnico, assistente): nome,
            e-mail, telefone, senha (armazenada de forma criptografada), papel na organização e
            registros de acesso.
          </li>
          <li>
            <strong>Da organização</strong>: nome, dados de contato, endereço, logo, assinatura
            digital, registro profissional e plano contratado.
          </li>
          <li>
            <strong>De produtores rurais</strong> (cadastrados pela organização, sem login
            próprio): nome, CPF/CNPJ, telefone, WhatsApp, e-mail e endereço, quando informados.
          </li>
          <li>
            <strong>Técnicos e de campo</strong>: dados de propriedades e talhões, safras,
            avaliações agronômicas, ocorrências, recomendações, fotos e, quando o usuário optar
            por informar, coordenadas de geolocalização de propriedades.
          </li>
          <li>
            <strong>Técnicos de uso</strong>: registros de auditoria (ação, data/hora,
            usuário) para segurança e rastreabilidade.
          </li>
        </ul>
      </Section>

      <Section title="3. Para que usamos esses dados">
        <ul className="list-disc pl-5 space-y-1">
          <li>Viabilizar o cadastro e a operação das visitas técnicas dentro do Sistema;</li>
          <li>Gerar relatórios em PDF para que a organização os envie a seus clientes;</li>
          <li>Autenticar usuários e controlar permissões de acesso por organização;</li>
          <li>Registrar logs de auditoria para segurança e prevenção de fraude;</li>
          <li>Enviar comunicações operacionais (confirmação de e-mail, recuperação de senha);</li>
          <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
        </ul>
        <p>Não utilizamos os dados para publicidade direcionada, e não os vendemos a terceiros.</p>
      </Section>

      <Section title="4. Base legal (LGPD, art. 7º)">
        <p>
          Tratamos dados de usuários e organizações principalmente com base na{" "}
          <strong>execução de contrato</strong> (viabilizar o serviço contratado) e no{" "}
          <strong>consentimento</strong> manifestado no aceite destes termos. Já os dados de
          produtores rurais são inseridos pela própria organização, que deve possuir base legal
          própria para tratá-los (tipicamente execução de contrato de consultoria/assistência
          técnica ou legítimo interesse) — cabe à organização informar seus clientes sobre esse
          tratamento, conforme aplicável.
        </p>
      </Section>

      <Section title="5. Onde os dados ficam armazenados">
        <p>
          Os dados são armazenados em infraestrutura em nuvem fornecida por{" "}
          <strong>Supabase</strong> (banco de dados e arquivos) e o Sistema é publicado via{" "}
          <strong>Vercel</strong> — ambos fornecedores com práticas de segurança e certificações
          reconhecidas internacionalmente. O acesso ao banco de dados é protegido por{" "}
          <strong>Row Level Security</strong>: cada organização só consegue ler ou escrever seus
          próprios dados, mesmo em nível de banco de dados — não apenas na interface.
        </p>
      </Section>

      <Section title="6. Compartilhamento com terceiros">
        <p>
          Não compartilhamos dados pessoais com terceiros para fins comerciais. Os relatórios em
          PDF gerados a partir de uma visita são de responsabilidade da organização — o envio ao
          produtor (por WhatsApp, e-mail ou outro meio) é feito manualmente pelo próprio usuário,
          fora do Sistema.
        </p>
      </Section>

      <Section title="7. Retenção e exclusão">
        <p>
          Para preservar o histórico técnico (essencial ao acompanhamento agronômico ao longo do
          tempo), exclusões no Sistema são, por padrão, lógicas: o registro sai das listagens
          normais mas permanece guardado internamente. Mediante solicitação, é possível excluir
          definitivamente dados de um produtor, propriedade ou usuário, respeitadas eventuais
          obrigações legais de guarda.
        </p>
      </Section>

      <Section title="8. Seus direitos como titular de dados (LGPD, art. 18)">
        <ul className="list-disc pl-5 space-y-1">
          <li>Confirmação da existência de tratamento e acesso aos dados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
          <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
          <li>Eliminação dos dados tratados com base no consentimento;</li>
          <li>Revogação do consentimento, a qualquer momento;</li>
          <li>Informação sobre com quem os dados são compartilhados.</li>
        </ul>
        <p>
          Se você é <strong>usuário</strong> do Sistema, exerça esses direitos diretamente pela
          tela de <strong>Configurações</strong> ou pelo contato com um owner/admin da sua
          organização. Se você é um <strong>produtor rural</strong> cadastrado por uma
          organização e quer exercer esses direitos, procure diretamente o agrônomo ou
          escritório responsável pelo seu atendimento — ele é o controlador dos seus dados.
        </p>
      </Section>

      <Section title="9. Cookies e sessão">
        <p>
          Usamos apenas cookies estritamente necessários para manter sua sessão autenticada.
          Não utilizamos cookies de rastreamento ou publicidade.
        </p>
      </Section>

      <Section title="10. Alterações desta política">
        <p>
          Podemos atualizar esta política para refletir mudanças no Sistema ou na legislação.
          Mudanças relevantes exigirão um novo aceite explícito, registrado com data e versão.
        </p>
      </Section>

      <Section title="11. Contato">
        <p>
          Para dúvidas, solicitações relacionadas a dados pessoais ou exercício dos direitos
          acima, entre em contato com sua organização (usuários) ou com o suporte da
          plataforma.
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
