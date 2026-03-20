
import { Paciente, Usuario, ProcedimentoRealizado, Evolucao } from './types';

export const CURRENT_USER: Usuario = {
  uid: 'user_1',
  nome: 'Dr. Ricardo Silva',
  crm: '123456',
  role: 'master'
};

export const MOCK_PACIENTES: Paciente[] = [
  {
    id: 'p1',
    registro_hc: '1234567',
    nome: 'João da Silva',
    data_nasc: '1980-05-15',
    data_entrada: '2023-10-20',
    unidade_setor: 'UTI',
    status: 'internado',
    indicacao_cirurgica: 'Lobectomia Pulmonar Superior Direita',
    data_indicacao: '2023-10-21T10:00:00Z'
  },
  {
    id: 'p2',
    registro_hc: '7654321',
    nome: 'Maria Oliveira',
    data_nasc: '1975-08-22',
    data_entrada: '2023-10-21',
    unidade_setor: 'Vermelha',
    status: 'internado'
  },
  {
    id: 'p3',
    registro_hc: '1122334',
    nome: 'Antônio Santos',
    data_nasc: '1962-03-10',
    data_entrada: '2023-10-18',
    unidade_setor: 'Enfermaria',
    status: 'internado'
  },
  {
    id: 'p4',
    registro_hc: '9988776',
    nome: 'Francisca Lima',
    data_nasc: '1992-11-30',
    data_entrada: '2023-09-01',
    unidade_setor: 'Enfermaria',
    status: 'alta'
  }
];

export const MOCK_EVOLUCOES: Evolucao[] = [
  {
    id: 'e1',
    pacienteId: 'p1',
    timestamp: '2023-10-22T10:00:00Z',
    texto_evolucao: 'Paciente estável, aguardando exames laboratoriais.',
    autor_crm: '123456'
  },
  {
    id: 'e2',
    pacienteId: 'p2',
    timestamp: '2023-10-22T11:30:00Z',
    texto_evolucao: 'Melhora no padrão respiratório após procedimento.',
    autor_crm: '123456'
  }
];

export const MOCK_PROCEDIMENTOS: ProcedimentoRealizado[] = [
  {
    id: 'proc1',
    id_paciente: 'p1',
    crm_cirurgiao: '123456',
    data_hora: '2023-10-21T14:00:00Z',
    unidade_origem: 'UTI',
    categoria_porte: 'Traqueostomia',
    nome_procedimento_sigtap: 'Traqueostomia com colocação de cânula',
    cod_sigtap: '04.12.05.004-8'
  },
  {
    id: 'proc2',
    id_paciente: 'p2',
    crm_cirurgiao: '654321',
    data_hora: '2023-10-22T08:00:00Z',
    unidade_origem: 'Vermelha',
    categoria_porte: 'Cirurgia',
    nome_procedimento_sigtap: 'Toracotomia Exploradora',
    cod_sigtap: '04.12.05.006-4'
  }
];
