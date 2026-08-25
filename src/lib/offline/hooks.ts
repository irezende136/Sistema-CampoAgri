"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onLocalChange } from "./events";

type QueryState<T> = { data: T | null; carregando: boolean; erro: string | null };

/**
 * Lê do banco local e refaz a leitura sempre que algo muda por lá — seja uma
 * edição do próprio usuário ou dados que acabaram de chegar na sincronização.
 */
export function useLiveQuery<T>(consulta: () => Promise<T>, deps: unknown[]): QueryState<T> & { recarregar: () => void } {
  const [estado, setEstado] = useState<QueryState<T>>({ data: null, carregando: true, erro: null });

  const consultaRef = useRef(consulta);
  useEffect(() => {
    consultaRef.current = consulta;
  });

  const executar = useCallback(async () => {
    try {
      const data = await consultaRef.current();
      setEstado({ data, carregando: false, erro: null });
    } catch (e) {
      setEstado({ data: null, carregando: false, erro: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  useEffect(() => {
    void executar();
    return onLocalChange(() => void executar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...estado, recarregar: () => void executar() };
}
