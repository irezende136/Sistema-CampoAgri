"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateOrganizationImageAction } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";

export function ImageUploadField({
  label,
  organizationId,
  field,
  currentUrl,
}: {
  label: string;
  organizationId: string;
  field: "logo_url" | "assinatura_url";
  currentUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "png";
        const folder = field === "logo_url" ? "logo" : "assinatura";
        const path = `${organizationId}/organizacao/${folder}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("campoagri")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        await updateOrganizationImageAction(field, path);
        setPreview(URL.createObjectURL(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
      }
    });
  }

  return (
    <div>
      <p className="block text-sm font-medium mb-1.5">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <Image src={preview} alt={label} width={64} height={64} className="object-contain w-full h-full" unoptimized />
          ) : (
            <Upload size={20} className="text-muted-foreground" />
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {pending ? "Enviando..." : "Enviar imagem"}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
