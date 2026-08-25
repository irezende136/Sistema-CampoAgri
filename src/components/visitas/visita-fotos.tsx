"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, CloudUpload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrgCtx } from "@/components/offline/org-context";
import { savePhotoOffline, localPhotoUrl } from "@/lib/offline/repo";
import { removerFotoLocal } from "@/lib/offline/visita-actions";
import type { FotoLocal } from "@/lib/offline/visita";

/**
 * Fotos da visita funcionando sem sinal: o arquivo fica guardado no aparelho
 * (IndexedDB) e sobe para o Storage na sincronização. Enquanto não subiu, a
 * miniatura é lida do próprio arquivo local.
 */
export function VisitaFotos({
  visitaId,
  propriedadeId,
  areas,
  fotos,
  readOnly,
  aoMudar,
}: {
  visitaId: string;
  propriedadeId: string;
  areas: { id: string; nome: string }[];
  fotos: FotoLocal[];
  readOnly: boolean;
  aoMudar: () => void;
}) {
  const ctx = useOrgCtx();
  const [areaId, setAreaId] = useState("");
  const [legenda, setLegenda] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSalvando(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      await savePhotoOffline(
        ctx,
        { visitaId, propriedadeId, areaId: areaId || null, legenda: legenda.trim() || null },
        file,
        ext
      );
      setLegenda("");
      aoMudar();
    } finally {
      setSalvando(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="">Foto geral da propriedade</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
            <input
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              placeholder="Legenda (opcional)"
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
            />
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 h-11 text-sm font-medium cursor-pointer hover:bg-muted">
            {salvando ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {salvando ? "Salvando..." : "Adicionar foto"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={aoEscolherArquivo}
              disabled={salvando}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            A foto fica salva no aparelho e sobe sozinha quando houver conexão.
          </p>
        </div>
      )}

      {fotos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma foto nesta visita.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fotos.map((f) => (
            <Miniatura
              key={f.id}
              foto={f}
              readOnly={readOnly}
              aoExcluir={async () => {
                await removerFotoLocal(ctx, f.id);
                aoMudar();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Miniatura({
  foto,
  readOnly,
  aoExcluir,
}: {
  foto: FotoLocal;
  readOnly: boolean;
  aoExcluir: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelado = false;

    async function carregar() {
      // Primeiro tenta o arquivo local (foto ainda não enviada).
      const local = await localPhotoUrl(foto.id);
      if (cancelado) return;
      if (local) {
        objectUrl = local;
        setUrl(local);
        setPendente(true);
        return;
      }
      // Já subiu: pede uma URL assinada ao Storage.
      const supabase = createClient();
      const { data } = await supabase.storage.from("campoagri").createSignedUrl(foto.storage_path, 3600);
      if (!cancelado) setUrl(data?.signedUrl ?? null);
    }

    void carregar();
    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [foto.id, foto.storage_path]);

  return (
    <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
      {url ? (
        <Image
          src={url}
          alt={foto.legenda ?? "Foto da visita"}
          width={300}
          height={200}
          unoptimized
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
        </div>
      )}
      {pendente && (
        <span className="absolute top-1 left-1 inline-flex items-center gap-1 rounded bg-warning/90 text-white text-[10px] px-1.5 py-0.5">
          <CloudUpload size={11} /> no aparelho
        </span>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={aoExcluir}
          className="absolute top-1 right-1 rounded bg-black/60 text-white p-1"
          aria-label="Excluir foto"
        >
          <Trash2 size={13} />
        </button>
      )}
      {foto.legenda && (
        <div className="px-2 py-1 text-xs text-muted-foreground truncate">{foto.legenda}</div>
      )}
    </div>
  );
}
