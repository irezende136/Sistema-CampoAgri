export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agenda_visitas: {
        Row: {
          created_at: string
          created_by: string | null
          data_prevista: string
          deleted_at: string | null
          horario: string | null
          id: string
          objetivo: string | null
          observacoes: string | null
          organization_id: string
          produtor_id: string
          propriedade_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_prevista: string
          deleted_at?: string | null
          horario?: string | null
          id?: string
          objetivo?: string | null
          observacoes?: string | null
          organization_id: string
          produtor_id: string
          propriedade_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_prevista?: string
          deleted_at?: string | null
          horario?: string | null
          id?: string
          objetivo?: string | null
          observacoes?: string | null
          organization_id?: string
          produtor_id?: string
          propriedade_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_visitas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_visitas_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "produtores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_visitas_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          area_ha: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          observacoes: string | null
          organization_id: string
          propriedade_id: string
          status: string
          tipo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_ha?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          observacoes?: string | null
          organization_id: string
          propriedade_id: string
          status?: string
          tipo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_ha?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          observacoes?: string | null
          organization_id?: string
          propriedade_id?: string
          status?: string
          tipo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "areas_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_area: {
        Row: {
          acamamento: string | null
          area_id: string
          compactacao: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          desenvolvimento_geral: string | null
          doencas: string | null
          estadio_fenologico: string | null
          falhas_plantio: string | null
          id: string
          necessidade_intervencao: boolean | null
          observacoes_gerais: string | null
          organization_id: string
          plantas_daninhas: string | null
          pragas: string | null
          safra_id: string | null
          stand_plantas: string | null
          umidade_solo: string | null
          uniformidade: string | null
          updated_at: string
          updated_by: string | null
          vigor: string | null
          visita_id: string
        }
        Insert: {
          acamamento?: string | null
          area_id: string
          compactacao?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          desenvolvimento_geral?: string | null
          doencas?: string | null
          estadio_fenologico?: string | null
          falhas_plantio?: string | null
          id?: string
          necessidade_intervencao?: boolean | null
          observacoes_gerais?: string | null
          organization_id: string
          plantas_daninhas?: string | null
          pragas?: string | null
          safra_id?: string | null
          stand_plantas?: string | null
          umidade_solo?: string | null
          uniformidade?: string | null
          updated_at?: string
          updated_by?: string | null
          vigor?: string | null
          visita_id: string
        }
        Update: {
          acamamento?: string | null
          area_id?: string
          compactacao?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          desenvolvimento_geral?: string | null
          doencas?: string | null
          estadio_fenologico?: string | null
          falhas_plantio?: string | null
          id?: string
          necessidade_intervencao?: boolean | null
          observacoes_gerais?: string | null
          organization_id?: string
          plantas_daninhas?: string | null
          pragas?: string | null
          safra_id?: string | null
          stand_plantas?: string | null
          umidade_solo?: string | null
          uniformidade?: string | null
          updated_at?: string
          updated_by?: string | null
          vigor?: string | null
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_area_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_area_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_area_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_area_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos: {
        Row: {
          area_id: string | null
          created_at: string
          created_by: string | null
          data_hora: string
          deleted_at: string | null
          id: string
          latitude: number | null
          legenda: string | null
          longitude: number | null
          observacoes: string | null
          ocorrencia_id: string | null
          organization_id: string
          propriedade_id: string | null
          safra_id: string | null
          storage_path: string
          visita_id: string | null
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          created_by?: string | null
          data_hora?: string
          deleted_at?: string | null
          id?: string
          latitude?: number | null
          legenda?: string | null
          longitude?: number | null
          observacoes?: string | null
          ocorrencia_id?: string | null
          organization_id: string
          propriedade_id?: string | null
          safra_id?: string | null
          storage_path: string
          visita_id?: string | null
        }
        Update: {
          area_id?: string | null
          created_at?: string
          created_by?: string | null
          data_hora?: string
          deleted_at?: string | null
          id?: string
          latitude?: number | null
          legenda?: string | null
          longitude?: number | null
          observacoes?: string | null
          ocorrencia_id?: string | null
          organization_id?: string
          propriedade_id?: string | null
          safra_id?: string | null
          storage_path?: string
          visita_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotos_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_ocorrencia_id_fkey"
            columns: ["ocorrencia_id"]
            isOneToOne: false
            referencedRelation: "ocorrencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos_custos: {
        Row: {
          area_id: string | null
          area_total: number | null
          created_at: string
          created_by: string | null
          custo_ha: number | null
          custo_total: number | null
          deleted_at: string | null
          id: string
          nome_insumo: string
          observacoes: string | null
          organization_id: string
          preco_unitario: number | null
          propriedade_id: string
          quantidade_ha: number | null
          safra_id: string | null
          tipo_insumo: string
          unidade: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_id?: string | null
          area_total?: number | null
          created_at?: string
          created_by?: string | null
          custo_ha?: number | null
          custo_total?: number | null
          deleted_at?: string | null
          id?: string
          nome_insumo: string
          observacoes?: string | null
          organization_id: string
          preco_unitario?: number | null
          propriedade_id: string
          quantidade_ha?: number | null
          safra_id?: string | null
          tipo_insumo: string
          unidade?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_id?: string | null
          area_total?: number | null
          created_at?: string
          created_by?: string | null
          custo_ha?: number | null
          custo_total?: number | null
          deleted_at?: string | null
          id?: string
          nome_insumo?: string
          observacoes?: string | null
          organization_id?: string
          preco_unitario?: number | null
          propriedade_id?: string
          quantidade_ha?: number | null
          safra_id?: string | null
          tipo_insumo?: string
          unidade?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insumos_custos_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_custos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_custos_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_custos_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_auditoria: {
        Row: {
          acao: string
          data_hora: string
          detalhes: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          ip: string | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          data_hora?: string
          detalhes?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          data_hora?: string
          detalhes?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias: {
        Row: {
          area_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          descricao: string | null
          dose: string | null
          id: string
          organization_id: string
          prazo_recomendado: string | null
          produto_recomendado: string | null
          recomendacao_tecnica: string | null
          responsavel_acao: string | null
          safra_id: string | null
          severidade: string
          status: string
          tipo: string
          updated_at: string
          updated_by: string | null
          visita_id: string
        }
        Insert: {
          area_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          descricao?: string | null
          dose?: string | null
          id?: string
          organization_id: string
          prazo_recomendado?: string | null
          produto_recomendado?: string | null
          recomendacao_tecnica?: string | null
          responsavel_acao?: string | null
          safra_id?: string | null
          severidade?: string
          status?: string
          tipo: string
          updated_at?: string
          updated_by?: string | null
          visita_id: string
        }
        Update: {
          area_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          descricao?: string | null
          dose?: string | null
          id?: string
          organization_id?: string
          prazo_recomendado?: string | null
          produto_recomendado?: string | null
          recomendacao_tecnica?: string | null
          responsavel_acao?: string | null
          safra_id?: string | null
          severidade?: string
          status?: string
          tipo?: string
          updated_at?: string
          updated_by?: string | null
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string
          data_convite: string | null
          data_entrada: string | null
          id: string
          organization_id: string
          role: string
          status: string
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_convite?: string | null
          data_entrada?: string | null
          id?: string
          organization_id: string
          role?: string
          status?: string
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_convite?: string | null
          data_entrada?: string | null
          id?: string
          organization_id?: string
          role?: string
          status?: string
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          assinatura_url: string | null
          cidade: string | null
          cor_primaria: string
          created_at: string
          data_fim_trial: string | null
          data_inicio_trial: string | null
          deleted_at: string | null
          documento: string | null
          email: string | null
          estado: string | null
          id: string
          limite_armazenamento_mb: number
          limite_propriedades: number | null
          limite_usuarios: number
          limite_visitas_mensais: number | null
          logo_url: string | null
          nome: string
          nome_comercial: string | null
          plano: string
          registro_profissional: string | null
          status_assinatura: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          assinatura_url?: string | null
          cidade?: string | null
          cor_primaria?: string
          created_at?: string
          data_fim_trial?: string | null
          data_inicio_trial?: string | null
          deleted_at?: string | null
          documento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          limite_armazenamento_mb?: number
          limite_propriedades?: number | null
          limite_usuarios?: number
          limite_visitas_mensais?: number | null
          logo_url?: string | null
          nome: string
          nome_comercial?: string | null
          plano?: string
          registro_profissional?: string | null
          status_assinatura?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          assinatura_url?: string | null
          cidade?: string | null
          cor_primaria?: string
          created_at?: string
          data_fim_trial?: string | null
          data_inicio_trial?: string | null
          deleted_at?: string | null
          documento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          limite_armazenamento_mb?: number
          limite_propriedades?: number | null
          limite_usuarios?: number
          limite_visitas_mensais?: number | null
          logo_url?: string | null
          nome?: string
          nome_comercial?: string | null
          plano?: string
          registro_profissional?: string | null
          status_assinatura?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      planejamento_plantio: {
        Row: {
          adubacao_base: string | null
          adubacao_cobertura: string | null
          area_id: string
          created_at: string
          created_by: string | null
          cultivar: string | null
          custo_estimado_ha: number | null
          custo_total_estimado: number | null
          deleted_at: string | null
          espacamento: number | null
          id: string
          observacoes_tecnicas: string | null
          organization_id: string
          produtos_previstos: string | null
          profundidade: number | null
          safra_id: string
          sementes_por_ha: number | null
          tratamento_sementes: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          adubacao_base?: string | null
          adubacao_cobertura?: string | null
          area_id: string
          created_at?: string
          created_by?: string | null
          cultivar?: string | null
          custo_estimado_ha?: number | null
          custo_total_estimado?: number | null
          deleted_at?: string | null
          espacamento?: number | null
          id?: string
          observacoes_tecnicas?: string | null
          organization_id: string
          produtos_previstos?: string | null
          profundidade?: number | null
          safra_id: string
          sementes_por_ha?: number | null
          tratamento_sementes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          adubacao_base?: string | null
          adubacao_cobertura?: string | null
          area_id?: string
          created_at?: string
          created_by?: string | null
          cultivar?: string | null
          custo_estimado_ha?: number | null
          custo_total_estimado?: number | null
          deleted_at?: string | null
          espacamento?: number | null
          id?: string
          observacoes_tecnicas?: string | null
          organization_id?: string
          produtos_previstos?: string | null
          profundidade?: number | null
          safra_id?: string
          sementes_por_ha?: number | null
          tratamento_sementes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planejamento_plantio_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamento_plantio_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamento_plantio_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          status: string
          tipo: string
          ultimo_acesso: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          status?: string
          tipo?: string
          ultimo_acesso?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          status?: string
          tipo?: string
          ultimo_acesso?: string | null
          user_id?: string
        }
        Relationships: []
      }
      produtores: {
        Row: {
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          organization_id: string
          status: string
          telefone: string | null
          updated_at: string
          updated_by: string | null
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          organization_id: string
          status?: string
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          organization_id?: string
          status?: string
          telefone?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          status: string
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          status?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          status?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propriedades: {
        Row: {
          area_total_ha: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          estado: string | null
          id: string
          latitude: number | null
          localizacao: string | null
          longitude: number | null
          municipio: string | null
          nome: string
          observacoes: string | null
          organization_id: string
          produtor_id: string
          status: string
          tipo_atividade: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_total_ha?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          localizacao?: string | null
          longitude?: number | null
          municipio?: string | null
          nome: string
          observacoes?: string | null
          organization_id: string
          produtor_id: string
          status?: string
          tipo_atividade?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_total_ha?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          localizacao?: string | null
          longitude?: number | null
          municipio?: string | null
          nome?: string
          observacoes?: string | null
          organization_id?: string
          produtor_id?: string
          status?: string
          tipo_atividade?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propriedades_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propriedades_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "produtores"
            referencedColumns: ["id"]
          },
        ]
      }
      recomendacoes: {
        Row: {
          area_aplicar: string | null
          area_id: string | null
          categoria: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dose: string | null
          id: string
          observacoes: string | null
          organization_id: string
          prazo_sugerido: string | null
          prioridade: string
          produto_sugerido: string | null
          recomendacao: string
          safra_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
          visita_id: string
          volume_calda: string | null
        }
        Insert: {
          area_aplicar?: string | null
          area_id?: string | null
          categoria: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose?: string | null
          id?: string
          observacoes?: string | null
          organization_id: string
          prazo_sugerido?: string | null
          prioridade?: string
          produto_sugerido?: string | null
          recomendacao: string
          safra_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          visita_id: string
          volume_calda?: string | null
        }
        Update: {
          area_aplicar?: string | null
          area_id?: string | null
          categoria?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dose?: string | null
          id?: string
          observacoes?: string | null
          organization_id?: string
          prazo_sugerido?: string | null
          prioridade?: string
          produto_sugerido?: string | null
          recomendacao?: string
          safra_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          visita_id?: string
          volume_calda?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recomendacoes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recomendacoes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recomendacoes_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recomendacoes_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios: {
        Row: {
          codigo: string | null
          created_at: string
          data_geracao: string
          deleted_at: string | null
          gerado_por: string | null
          id: string
          organization_id: string
          produtor_id: string
          propriedade_id: string
          status: string
          storage_path: string | null
          visita_id: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          data_geracao?: string
          deleted_at?: string | null
          gerado_por?: string | null
          id?: string
          organization_id: string
          produtor_id: string
          propriedade_id: string
          status?: string
          storage_path?: string | null
          visita_id: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          data_geracao?: string
          deleted_at?: string | null
          gerado_por?: string | null
          id?: string
          organization_id?: string
          produtor_id?: string
          propriedade_id?: string
          status?: string
          storage_path?: string | null
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "produtores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      safras: {
        Row: {
          area_id: string
          created_at: string
          created_by: string | null
          cultivar: string | null
          cultura: string
          data_prevista_colheita: string | null
          data_prevista_plantio: string | null
          data_real_colheita: string | null
          data_real_plantio: string | null
          deleted_at: string | null
          espacamento: number | null
          finalidade: string | null
          id: string
          nome: string
          observacoes: string | null
          organization_id: string
          populacao_planejada: number | null
          profundidade_plantio: number | null
          propriedade_id: string
          sistema_plantio: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_id: string
          created_at?: string
          created_by?: string | null
          cultivar?: string | null
          cultura: string
          data_prevista_colheita?: string | null
          data_prevista_plantio?: string | null
          data_real_colheita?: string | null
          data_real_plantio?: string | null
          deleted_at?: string | null
          espacamento?: number | null
          finalidade?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          organization_id: string
          populacao_planejada?: number | null
          profundidade_plantio?: number | null
          propriedade_id: string
          sistema_plantio?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_id?: string
          created_at?: string
          created_by?: string | null
          cultivar?: string | null
          cultura?: string
          data_prevista_colheita?: string | null
          data_prevista_plantio?: string | null
          data_real_colheita?: string | null
          data_real_plantio?: string | null
          deleted_at?: string | null
          espacamento?: number | null
          finalidade?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          organization_id?: string
          populacao_planejada?: number | null
          profundidade_plantio?: number | null
          propriedade_id?: string
          sistema_plantio?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safras_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safras_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safras_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          condicoes_climaticas: string | null
          created_at: string
          created_by: string | null
          data_visita: string
          deleted_at: string | null
          hora_final: string | null
          hora_inicial: string | null
          id: string
          objetivo: string | null
          observacoes_finais: string | null
          organization_id: string
          produtor_id: string
          propriedade_id: string
          proximas_acoes: string | null
          responsavel_tecnico_id: string | null
          resumo_geral: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          condicoes_climaticas?: string | null
          created_at?: string
          created_by?: string | null
          data_visita?: string
          deleted_at?: string | null
          hora_final?: string | null
          hora_inicial?: string | null
          id?: string
          objetivo?: string | null
          observacoes_finais?: string | null
          organization_id: string
          produtor_id: string
          propriedade_id: string
          proximas_acoes?: string | null
          responsavel_tecnico_id?: string | null
          resumo_geral?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          condicoes_climaticas?: string | null
          created_at?: string
          created_by?: string | null
          data_visita?: string
          deleted_at?: string | null
          hora_final?: string | null
          hora_inicial?: string | null
          id?: string
          objetivo?: string | null
          observacoes_finais?: string | null
          organization_id?: string
          produtor_id?: string
          propriedade_id?: string
          proximas_acoes?: string | null
          responsavel_tecnico_id?: string | null
          resumo_geral?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "produtores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_propriedade_id_fkey"
            columns: ["propriedade_id"]
            isOneToOne: false
            referencedRelation: "propriedades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write_org: { Args: { org_id: string }; Returns: boolean }
      create_organization: {
        Args: {
          p_cidade?: string
          p_email?: string
          p_estado?: string
          p_nome: string
          p_telefone?: string
        }
        Returns: string
      }
      find_user_by_email: {
        Args: { p_email: string }
        Returns: {
          email: string
          id: string
          nome: string
        }[]
      }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      log_action: {
        Args: {
          p_acao: string
          p_detalhes?: Json
          p_entidade: string
          p_entidade_id?: string
          p_organization_id: string
        }
        Returns: undefined
      }
      user_role_in_org: { Args: { org_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
