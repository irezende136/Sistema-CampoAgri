"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { GpsCapture } from "@/components/ui/gps-capture";
import type { Database } from "@/types/database";
import type { ActionState } from "@/lib/actions/auth";

type Propriedade = Database["public"]["Tables"]["propriedades"]["Row"];

const TIPOS_ATIVIDADE = [
  ["graos", "Grãos"],
  ["leite", "Leite"],
  ["corte", "Corte"],
  ["silagem", "Silagem"],
  ["pastagem", "Pastagem"],
  ["cana", "Cana"],
  ["horticultura", "Horticultura"],
  ["misto", "Misto"],
  ["outro", "Outro"],
];

export function PropriedadeForm({
  propriedade,
  produtores,
  defaultProdutorId,
  action,
}: {
  propriedade?: Propriedade;
  produtores: { id: string; nome: string }[];
  defaultProdutorId?: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [latitude, setLatitude] = useState(propriedade?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(propriedade?.longitude?.toString() ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label="Produtor" htmlFor="produtor_id">
        <Select
          id="produtor_id"
          name="produtor_id"
          required
          defaultValue={propriedade?.produtor_id ?? defaultProdutorId ?? ""}
          disabled={Boolean(propriedade)}
        >
          <option value="" disabled>
            Selecione o produtor
          </option>
          {produtores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Nome da propriedade" htmlFor="nome">
        <Input id="nome" name="nome" required defaultValue={propriedade?.nome} placeholder="Fazenda Santa Clara" />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Município" htmlFor="municipio">
          <Input id="municipio" name="municipio" defaultValue={propriedade?.municipio ?? ""} />
        </FieldGroup>
        <FieldGroup label="Estado" htmlFor="estado">
          <Input id="estado" name="estado" maxLength={2} defaultValue={propriedade?.estado ?? ""} />
        </FieldGroup>
      </div>

      <FieldGroup label="Localização / referência" htmlFor="localizacao" hint="Endereço, coordenadas ou referência de acesso">
        <Input id="localizacao" name="localizacao" defaultValue={propriedade?.localizacao ?? ""} />
      </FieldGroup>

      <GpsCapture
        latitude={latitude}
        longitude={longitude}
        onChange={(lat, lon) => {
          setLatitude(lat);
          setLongitude(lon);
        }}
        hint="Registre as coordenadas estando na propriedade para gerar o link de navegação (Waze/Google Maps)."
      />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Área total (ha)" htmlFor="area_total_ha">
          <Input id="area_total_ha" name="area_total_ha" type="number" step="0.01" min="0" defaultValue={propriedade?.area_total_ha ?? ""} />
        </FieldGroup>
        <FieldGroup label="Tipo de atividade" htmlFor="tipo_atividade">
          <Select id="tipo_atividade" name="tipo_atividade" defaultValue={propriedade?.tipo_atividade ?? ""}>
            <option value="">Selecione</option>
            {TIPOS_ATIVIDADE.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup label="Observações" htmlFor="observacoes">
        <Textarea id="observacoes" name="observacoes" defaultValue={propriedade?.observacoes ?? ""} />
      </FieldGroup>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : propriedade ? "Salvar alterações" : "Cadastrar propriedade"}
      </Button>
    </form>
  );
}
