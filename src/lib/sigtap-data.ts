
import { CategoriaPorte } from './types';

export interface SigtapProcedure {
  codigo: string;
  nome: string;
  porte: CategoriaPorte;
}

export const SIGTAP_PROCEDURES: SigtapProcedure[] = [
  // Pequeno Porte / Procedimentos Beira-Leito
  { codigo: '04.06.01.031-6', nome: 'Toracocentese', porte: 'Pequeno Porte' },
  { codigo: '04.06.01.032-4', nome: 'Drenagem Pleural Fechada', porte: 'Pequeno Porte' },
  { codigo: '04.06.01.001-4', nome: 'Biópsia de Pleura', porte: 'Pequeno Porte' },
  { codigo: '04.06.01.033-2', nome: 'Toracostomia', porte: 'Pequeno Porte' },
  { codigo: '04.06.01.021-9', nome: 'Punção de Coleção Líquida por Agulha', porte: 'Pequeno Porte' },
  { codigo: '03.01.01.007-2', nome: 'Visita Hospitalar / Avaliação Clínica', porte: 'Pequeno Porte' },
  
  // Broncoscopia e Endoscopia Respiratória
  { codigo: '02.09.01.002-4', nome: 'Broncoscopia com Biópsia Brônquica', porte: 'Broncoscopia' },
  { codigo: '02.09.01.003-2', nome: 'Laringoscopia Direta / Indireta', porte: 'Broncoscopia' },
  { codigo: '02.01.01.042-4', nome: 'Biópsia de Pulmão Transbrônquica', porte: 'Broncoscopia' },
  { codigo: '02.09.01.001-6', nome: 'Broncoscopia Diagnóstica', porte: 'Broncoscopia' },
  { codigo: '04.12.05.001-3', nome: 'Retirada de Corpo Estranho de Vias Aéreas', porte: 'Broncoscopia' },
  { codigo: '04.12.05.002-1', nome: 'Tratamento de Estenose de Traqueia/Brônquio (Dilatação)', porte: 'Broncoscopia' },
  
  // Traqueostomia
  { codigo: '04.12.05.004-8', nome: 'Traqueostomia com Colocação de Cânula', porte: 'Traqueostomia' },
  { codigo: '04.12.05.005-6', nome: 'Traqueostomia Percutânea', porte: 'Traqueostomia' },
  { codigo: '04.04.03.018-2', nome: 'Fechamento de Fístula Traqueocutânea', porte: 'Traqueostomia' },
  
  // Cirurgias de Grande Porte (Pulmão e Pleura)
  { codigo: '04.12.03.012-8', nome: 'Lobectomia Pulmonar', porte: 'Cirurgia' },
  { codigo: '04.12.03.024-1', nome: 'Segmentectomia Pulmonar', porte: 'Cirurgia' },
  { codigo: '04.12.03.016-0', nome: 'Pneumonectomia', porte: 'Cirurgia' },
  { codigo: '04.12.03.007-1', nome: 'Decorticação Pulmonar', porte: 'Cirurgia' },
  { codigo: '04.12.03.018-7', nome: 'Pleurectomia', porte: 'Cirurgia' },
  { codigo: '04.12.03.019-5', nome: 'Pleurodese (Cirúrgica)', porte: 'Cirurgia' },
  { codigo: '04.12.03.001-2', nome: 'Biópsia de Pulmão a Céu Aberto', porte: 'Cirurgia' },
  { codigo: '04.12.03.014-4', nome: 'Metastatectomia Pulmonar Única', porte: 'Cirurgia' },
  { codigo: '04.12.03.015-2', nome: 'Metastatectomia Pulmonar Múltipla', porte: 'Cirurgia' },
  { codigo: '04.12.03.003-9', nome: 'Bulectomia', porte: 'Cirurgia' },
  { codigo: '04.12.03.006-3', nome: 'Correção de Fístula Bronquica', porte: 'Cirurgia' },
  { codigo: '04.06.01.034-0', nome: 'Toracotomia Exploradora', porte: 'Cirurgia' },
  
  // Cirurgias de Parede Torácica e Mediastino
  { codigo: '04.06.01.026-0', nome: 'Ressecção de Tumor da Parede Torácica', porte: 'Cirurgia' },
  { codigo: '04.06.01.027-8', nome: 'Reconstrução da Parede Torácica (com Prótese/Retalho)', porte: 'Cirurgia' },
  { codigo: '04.12.01.011-9', nome: 'Mediastinoscopia', porte: 'Cirurgia' },
  { codigo: '04.12.01.007-0', nome: 'Exerese de Tumor de Mediastino', porte: 'Cirurgia' },
  { codigo: '04.12.01.009-7', nome: 'Linfadenectomia Mediastinal', porte: 'Cirurgia' },
  { codigo: '04.12.01.012-7', nome: 'Mediastinotomia', porte: 'Cirurgia' },
  { codigo: '04.12.01.010-0', nome: 'Traqueoplastia e/ou Laringotraqueoplastia', porte: 'Cirurgia' },
  { codigo: '04.12.05.003-0', nome: 'Reconstrução de Traqueia e Brônquios (Broncoplastia)', porte: 'Cirurgia' },
  { codigo: '04.12.01.013-5', nome: 'Timectomia', porte: 'Cirurgia' },
  
  // Procedimentos por Vídeo (VATS)
  { codigo: '04.12.03.021-7', nome: 'Ressecção de Bolha (VATS)', porte: 'Cirurgia' },
  { codigo: '04.12.03.022-5', nome: 'Ressecção de Nódulo Pulmonar (VATS)', porte: 'Cirurgia' },
  { codigo: '04.12.03.020-9', nome: 'Pleuroscopia / Vídeo-Toracoscopia Diagnóstica', porte: 'Cirurgia' },
  { codigo: '04.12.03.023-3', nome: 'Simpatectomia Torácica por Vídeo', porte: 'Cirurgia' },
  { codigo: '04.06.01.028-6', nome: 'Correção de Pectus Excavatum/Carinatum', porte: 'Cirurgia' },
];
