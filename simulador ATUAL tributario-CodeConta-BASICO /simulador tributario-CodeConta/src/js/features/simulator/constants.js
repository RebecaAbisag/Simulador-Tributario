// constants.js
// Tabelas e valores fixos (IR, INSS, Simples Nacional, MEI, Lucro Presumido) utilizados nos cálculos do simulador.

// Salário mínimo atual (referência para alguns cálculos)
const SALARIO_MINIMO = 1412.00;
// Teto de contribuição do INSS para regime PJ (pró-labore)
const TETO_INSS_PJ = 7786.02;

// Tabela progressiva do Imposto de Renda (IRPF)
const IR_TABLE = [
  { base: 0.00, limit: 2259.20, rate: 0.00, deduction: 0.00 }, // Isento
  { base: 2259.21, limit: 2826.65, rate: 0.075, deduction: 169.44 }, // 7,5%
  { base: 2826.66, limit: 3751.05, rate: 0.15, deduction: 381.44 }, // 15%
  { base: 3751.06, limit: 4664.68, rate: 0.225, deduction: 662.77 }, // 22,5%
  { base: 4664.69, limit: Infinity, rate: 0.275, deduction: 896.00 } // 27,5%
];

// Tabela do Simples Nacional - Anexo III (para serviços com Fator R >= 28%)
const SN_ANEXO_III = [
  { limit: 180000.00, rate: 0.060, deduction: 0.00 },    // Até 180 mil
  { limit: 360000.00, rate: 0.112, deduction: 9360.00 },   // De 180 mil a 360 mil
  { limit: 720000.00, rate: 0.135, deduction: 17640.00 },  // De 360 mil a 720 mil
  { limit: 1800000.00, rate: 0.160, deduction: 35640.00 }, // De 720 mil a 1.8 milhões
  { limit: 3600000.00, rate: 0.210, deduction: 125640.00 },// De 1.8 milhões a 3.6 milhões
  { limit: Infinity, rate: 0.330, deduction: 648000.00 }  // Acima de 3.6 milhões
];

// Tabela do Simples Nacional - Anexo V (para serviços com Fator R < 28%)
const SN_ANEXO_V = [
  { limit: 180000.00, rate: 0.155, deduction: 0.00 },    // Até 180 mil
  { limit: 360000.00, rate: 0.180, deduction: 4500.00 },   // De 180 mil a 360 mil
  { limit: 720000.00, rate: 0.195, deduction: 9900.00 },  // De 360 mil a 720 mil
  { limit: 1800000.00, rate: 0.205, deduction: 17100.00 }, // De 720 mil a 1.8 milhões
  { limit: 3600000.00, rate: 0.230, deduction: 62100.00 },// De 1.8 milhões a 3.6 milhões
  { limit: Infinity, rate: 0.305, deduction: 142800.00 }  // Acima de 3.6 milhões
];

// Constantes para MEI
const MEI_FATURAMENTO_ANUAL_MAX = 81000.00;
const MEI_DAS_INSS = SALARIO_MINIMO * 0.05; // 5% do salário mínimo para INSS
const MEI_DAS_ISS = 5.00; // R$ 5,00 para ISS (serviços)
const MEI_DAS_ICMS = 1.00; // R$ 1,00 para ICMS (comércio/indústria)

// Constantes para Lucro Presumido (Serviços)
const LP_PRESUMPTION_RATE_SERVICOS = 0.32; // 32% para serviços
const LP_IRPJ_RATE = 0.15; // 15% IRPJ
const LP_IRPJ_ADDITIONAL_RATE = 0.10; // 10% adicional IRPJ para lucro acima de R$ 20.000/mês
const LP_CSLL_RATE = 0.09; // 9% CSLL
const LP_PIS_RATE = 0.0065; // 0.65% PIS
const LP_COFINS_RATE = 0.03; // 3% COFINS
const LP_ISS_RATE_DEFAULT = 0.05; // 5% ISS (pode variar por município)

