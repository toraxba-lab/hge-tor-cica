export type Role = 'master' | 'cirurgiao';

export interface Usuario {
  uid: string;
  nome: string;
  crm: string;
  role: Role;
  password?: string;
}

export type StatusPaciente = 'internado' | 'alta';
export type DesfechoPaciente = 'alta_medica' | 'obito';

export interface Paciente {
  id: string;
  registro_hc: string;
  nome: string;
  data_nasc: string;
  data_entrada: string;
  unidade_setor: string;
  status: StatusPaciente;
  indicacao_cirurgica?: string;
  data_indicacao?: string;
  desfecho?: DesfechoPaciente;
  data_desfecho?: string;
}

export interface Evolucao {
  id: string;
  pacienteId: string;
  timestamp: string;
  texto_evolucao: string;
  autor_crm: string;
}

export type CategoriaPorte = 'Broncoscopia' | 'Traqueostomia' | 'Pequeno Porte' | 'Cirurgia';

export interface ProcedimentoRealizado {
  id: string;
  id_paciente: string;
  crm_cirurgiao: string;
  data_hora: string;
  unidade_origem: string;
  categoria_porte: CategoriaPorte;
  nome_procedimento_sigtap: string;
  cod_sigtap: string;
}
