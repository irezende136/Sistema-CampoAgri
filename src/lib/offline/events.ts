// Avisa as telas quando o banco local muda, para que as listas se atualizem
// sozinhas depois de salvar, excluir ou sincronizar.

type Listener = () => void;

const listeners = new Set<Listener>();

export function onLocalChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitLocalChange(): void {
  for (const l of listeners) l();
}
