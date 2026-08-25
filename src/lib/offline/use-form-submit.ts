"use client";

import { useState } from "react";

/**
 * Substitui o useActionState nos formulários que passaram a gravar no banco
 * local: a submissão não vai mais ao servidor, então não há Server Action —
 * mas o formulário continua precisando de estado de "salvando" e de erro.
 */
export function useFormSubmit(aoSalvar: (dados: FormData) => Promise<void>) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    setSalvando(true);
    setErro(null);
    try {
      await aoSalvar(dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
      setSalvando(false);
    }
  }

  return { onSubmit, salvando, erro, setErro };
}
