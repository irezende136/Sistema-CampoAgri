/**
 * Prepara as telas principais para uso sem sinal.
 *
 * O service worker guarda uma tela quando ela é aberta. Só que o agrônomo
 * costuma perder o sinal *antes* de abrir tudo que vai precisar no talhão — e aí
 * cai na página de "tela não salva" mesmo com todos os dados já no aparelho.
 *
 * Buscar as rotas principais logo após uma sincronização bem-sucedida resolve
 * isso: o service worker intercepta e guarda cada uma. É feito só quando há
 * conexão e o usuário está autenticado (a sincronização acabou de funcionar),
 * para não gravar em cache uma tela de login.
 */
const ROTAS_PRINCIPAIS = [
  "/dashboard",
  "/visitas",
  "/visitas/nova",
  "/produtores",
  "/produtores/novo",
  "/propriedades",
  "/propriedades/novo",
  "/agenda",
  "/agenda/nova",
  "/financeiro",
];

let jaPreparado = false;

export async function prepararTelasOffline(): Promise<void> {
  if (jaPreparado) return;
  if (typeof navigator === "undefined" || !navigator.onLine) return;
  if (!("serviceWorker" in navigator)) return;

  jaPreparado = true;

  // Em série e sem bloquear: é trabalho de fundo, não pode competir com o que
  // o usuário está fazendo nem estourar a rede do celular.
  for (const rota of ROTAS_PRINCIPAIS) {
    try {
      await fetch(rota, { credentials: "same-origin" });
    } catch {
      // Sem conexão no meio do caminho: para por aqui e tenta na próxima vez.
      jaPreparado = false;
      return;
    }
  }
}
