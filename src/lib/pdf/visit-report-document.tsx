import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { VisitReportData } from "@/lib/data/visit-report";
import { formatDateBR, formatDateTimeBR } from "@/lib/utils/format";

const COLORS = {
  primary: "#1f4d3a",
  accent: "#c88a2e",
  text: "#1f2421",
  muted: "#6b6459",
  border: "#e3ddcd",
  bg: "#faf7f0",
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
    marginBottom: 14,
  },
  orgName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.primary },
  orgMeta: { fontSize: 8, color: COLORS.muted, marginTop: 2 },
  reportTitle: { fontSize: 9, color: COLORS.muted, textAlign: "right" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: COLORS.bg,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  label: { fontFamily: "Helvetica-Bold" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoItem: { width: "50%", marginBottom: 4 },
  badge: {
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginLeft: 4,
  },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  photoBox: { width: 130 },
  photo: { width: 130, height: 100, objectFit: "cover", borderRadius: 3 },
  photoCaption: { fontSize: 7.5, color: COLORS.muted, marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    fontSize: 8,
    color: COLORS.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pageNumber: { position: "absolute", bottom: 24, right: 32, fontSize: 8, color: COLORS.muted },
});

const SEVERIDADE_LABEL: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" };
const PRIORIDADE_LABEL: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
const TIPO_AREA_LABEL: Record<string, string> = {
  lavoura: "Lavoura",
  pastagem: "Pastagem",
  piquete: "Piquete",
  canavial: "Canavial",
  area_silagem: "Área de silagem",
  area_experimental: "Área experimental",
  outro: "Outro",
};

export function VisitReportDocument({ data, codigo }: { data: VisitReportData; codigo: string }) {
  const { organization, produtor, propriedade, visita, responsavel, avaliacoes, ocorrencias, recomendacoes, fotos } = data;

  const ocorrenciasPorArea = new Map<string, typeof ocorrencias>();
  for (const o of ocorrencias) {
    const key = o.area_id ?? "geral";
    ocorrenciasPorArea.set(key, [...(ocorrenciasPorArea.get(key) ?? []), o]);
  }
  const recomendacoesPorArea = new Map<string, typeof recomendacoes>();
  for (const r of recomendacoes) {
    const key = r.area_id ?? "geral";
    recomendacoesPorArea.set(key, [...(recomendacoesPorArea.get(key) ?? []), r]);
  }
  const fotosPorArea = new Map<string, typeof fotos>();
  for (const f of fotos) {
    const key = f.area_id ?? "geral";
    fotosPorArea.set(key, [...(fotosPorArea.get(key) ?? []), f]);
  }
  const recomendacoesGerais = recomendacoesPorArea.get("geral") ?? [];
  const fotosGerais = fotosPorArea.get("geral") ?? [];

  return (
    <Document
      title={`Relatório de visita - ${propriedade?.nome ?? ""}`}
      author={organization?.nome ?? "Sistema CampoAgri"}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.orgName}>{organization?.nome_comercial || organization?.nome}</Text>
            <Text style={styles.orgMeta}>
              {[organization?.telefone, organization?.email].filter(Boolean).join("  ·  ")}
            </Text>
            <Text style={styles.orgMeta}>
              {[organization?.cidade, organization?.estado].filter(Boolean).join(" - ")}
              {organization?.registro_profissional ? `  ·  ${organization.registro_profissional}` : ""}
            </Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>Relatório de Visita Técnica</Text>
            <Text style={styles.reportTitle}>Nº {codigo}</Text>
            <Text style={styles.reportTitle}>{formatDateBR(visita.data_visita)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoGrid}>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Produtor: </Text>
              {produtor?.nome}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Propriedade: </Text>
              {propriedade?.nome}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Município/UF: </Text>
              {[propriedade?.municipio, propriedade?.estado].filter(Boolean).join(" - ") || "-"}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Responsável técnico: </Text>
              {responsavel?.nome ?? "-"}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Data da visita: </Text>
              {formatDateBR(visita.data_visita)}
              {visita.hora_inicial ? ` · ${visita.hora_inicial.slice(0, 5)}` : ""}
              {visita.hora_final ? ` às ${visita.hora_final.slice(0, 5)}` : ""}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Condições climáticas: </Text>
              {visita.condicoes_climaticas ?? "-"}
            </Text>
          </View>
          {visita.objetivo && (
            <Text style={{ marginTop: 6 }}>
              <Text style={styles.label}>Objetivo da visita: </Text>
              {visita.objetivo}
            </Text>
          )}
        </View>

        {visita.resumo_geral && (
          <View>
            <Text style={styles.sectionTitle}>Resumo geral da visita</Text>
            <Text>{visita.resumo_geral}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Áreas avaliadas</Text>
        {avaliacoes.length === 0 && <Text style={{ color: COLORS.muted }}>Nenhuma área avaliada nesta visita.</Text>}
        {avaliacoes.map((a) => {
          const area = (a as unknown as { areas: { nome: string; tipo: string } }).areas;
          const safra = (a as unknown as { safras: { nome: string; cultura: string; cultivar: string } | null }).safras;
          const areaOcorrencias = ocorrenciasPorArea.get(a.area_id) ?? [];
          const areaRecomendacoes = recomendacoesPorArea.get(a.area_id) ?? [];
          const areaFotos = fotosPorArea.get(a.area_id) ?? [];

          return (
            <View key={a.id} style={styles.card} wrap={false}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5, marginBottom: 4 }}>
                {area?.nome} ({TIPO_AREA_LABEL[area?.tipo] ?? area?.tipo})
                {safra ? ` — ${safra.cultura}${safra.cultivar ? " · " + safra.cultivar : ""} (${safra.nome})` : ""}
              </Text>

              <View style={styles.infoGrid}>
                {a.estadio_fenologico && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Estádio: </Text>
                    {a.estadio_fenologico}
                  </Text>
                )}
                {a.vigor && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Vigor: </Text>
                    {a.vigor}
                  </Text>
                )}
                {a.stand_plantas && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Stand: </Text>
                    {a.stand_plantas}
                  </Text>
                )}
                {a.uniformidade && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Uniformidade: </Text>
                    {a.uniformidade}
                  </Text>
                )}
                {a.umidade_solo && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Umidade do solo: </Text>
                    {a.umidade_solo}
                  </Text>
                )}
                {a.pragas && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Pragas: </Text>
                    {a.pragas}
                  </Text>
                )}
                {a.doencas && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Doenças: </Text>
                    {a.doencas}
                  </Text>
                )}
                {a.plantas_daninhas && (
                  <Text style={styles.infoItem}>
                    <Text style={styles.label}>Plantas daninhas: </Text>
                    {a.plantas_daninhas}
                  </Text>
                )}
              </View>
              {a.observacoes_gerais && <Text style={{ marginTop: 4 }}>{a.observacoes_gerais}</Text>}
              {a.necessidade_intervencao && (
                <Text style={{ marginTop: 4, color: "#b33f3f", fontFamily: "Helvetica-Bold" }}>
                  Atenção: necessita intervenção imediata
                </Text>
              )}

              {areaOcorrencias.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.label}>Ocorrências:</Text>
                  {areaOcorrencias.map((o) => (
                    <Text key={o.id} style={{ marginTop: 2 }}>
                      • {o.tipo} — severidade {SEVERIDADE_LABEL[o.severidade] ?? o.severidade}
                      {o.descricao ? `: ${o.descricao}` : ""}
                      {o.produto_recomendado ? ` (produto: ${o.produto_recomendado}${o.dose ? ", dose " + o.dose : ""})` : ""}
                    </Text>
                  ))}
                </View>
              )}

              {areaRecomendacoes.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.label}>Recomendações:</Text>
                  {areaRecomendacoes.map((r) => (
                    <Text key={r.id} style={{ marginTop: 2 }}>
                      • [{PRIORIDADE_LABEL[r.prioridade] ?? r.prioridade}] {r.recomendacao}
                      {r.prazo_sugerido ? ` — prazo: ${formatDateBR(r.prazo_sugerido)}` : ""}
                    </Text>
                  ))}
                </View>
              )}

              {areaFotos.length > 0 && (
                <View style={styles.photoGrid}>
                  {areaFotos.map(
                    (f) =>
                      f.url && (
                        <View key={f.id} style={styles.photoBox}>
                          <Image src={f.url} style={styles.photo} />
                          {f.legenda && <Text style={styles.photoCaption}>{f.legenda}</Text>}
                        </View>
                      )
                  )}
                </View>
              )}
            </View>
          );
        })}

        {recomendacoesGerais.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Recomendações gerais</Text>
            <View style={styles.card}>
              {recomendacoesGerais.map((r) => (
                <Text key={r.id} style={{ marginBottom: 3 }}>
                  • [{PRIORIDADE_LABEL[r.prioridade] ?? r.prioridade}] {r.recomendacao}
                  {r.prazo_sugerido ? ` — prazo: ${formatDateBR(r.prazo_sugerido)}` : ""}
                </Text>
              ))}
            </View>
          </View>
        )}

        {fotosGerais.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Fotos gerais</Text>
            <View style={styles.photoGrid}>
              {fotosGerais.map(
                (f) =>
                  f.url && (
                    <View key={f.id} style={styles.photoBox}>
                      <Image src={f.url} style={styles.photo} />
                      {f.legenda && <Text style={styles.photoCaption}>{f.legenda}</Text>}
                    </View>
                  )
              )}
            </View>
          </View>
        )}

        {(visita.proximas_acoes || visita.observacoes_finais) && (
          <View>
            {visita.proximas_acoes && (
              <View>
                <Text style={styles.sectionTitle}>Próximas ações</Text>
                <Text>{visita.proximas_acoes}</Text>
              </View>
            )}
            {visita.observacoes_finais && (
              <View>
                <Text style={styles.sectionTitle}>Observações finais</Text>
                <Text>{visita.observacoes_finais}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ marginTop: 28 }}>
          <View style={{ borderTopWidth: 1, borderTopColor: COLORS.text, width: 220 }} />
          <Text style={{ marginTop: 4 }}>{responsavel?.nome ?? "Responsável técnico"}</Text>
          {organization?.registro_profissional && <Text style={{ color: COLORS.muted }}>{organization.registro_profissional}</Text>}
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {organization?.nome} · {formatDateTimeBR(new Date().toISOString())}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
