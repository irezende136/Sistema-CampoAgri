import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { DeleteFotoButton } from "@/components/visitas/delete-foto-button";

type Foto = {
  id: string;
  storage_path: string;
  legenda: string | null;
  areas?: { nome: string } | null;
};

export async function PhotoGallery({ visitaId, fotos }: { visitaId: string; fotos: Foto[] }) {
  if (fotos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma foto adicionada ainda.</p>;
  }

  const supabase = await createClient();
  const withUrls = await Promise.all(
    fotos.map(async (f) => {
      const { data } = await supabase.storage.from("campoagri").createSignedUrl(f.storage_path, 3600);
      return { ...f, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {withUrls.map((f) => (
        <div key={f.id} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
          {f.url && (
            <Image src={f.url} alt={f.legenda ?? "Foto da visita"} fill className="object-cover" unoptimized />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-1.5">
            {f.legenda || f.areas?.nome || "Sem legenda"}
          </div>
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DeleteFotoButton id={f.id} visitaId={visitaId} />
          </div>
        </div>
      ))}
    </div>
  );
}
