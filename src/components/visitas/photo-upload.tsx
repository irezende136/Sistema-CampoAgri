"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createFotoAction } from "@/lib/actions/fotos";
import { Button } from "@/components/ui/button";

export function PhotoUpload({
  organizationId,
  visitaId,
  propriedadeId,
  areas,
}: {
  organizationId: string;
  visitaId: string;
  propriedadeId: string;
  areas: { id: string; nome: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [areaId, setAreaId] = useState("");
  const [legenda, setLegenda] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${organizationId}/visitas/${visitaId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("campoagri")
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) throw uploadError;

        await createFotoAction({
          visitaId,
          propriedadeId,
          areaId: areaId || null,
          legenda: legenda || null,
          storagePath: path,
        });
        setLegenda("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar foto.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">Sem área específica</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
        <input
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder="Legenda da foto (opcional)"
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <Button type="button" variant="secondary" onClick={handlePick} disabled={pending}>
        {pending ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
        {pending ? "Enviando..." : "Adicionar foto"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
