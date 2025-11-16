// calculator.js
// Funções de cálculo para os diferentes regimes tributários

// calculateMEI: calcula o DAS-MEI e o líquido para o regime MEI
function calculateMEI(bruto, rendaExterior) {
  const faturamentoAnual = bruto * 12;
  if (faturamentoAnual > MEI_FATURAMENTO_ANUAL_MAX) {
    return { das: 0, liquido: 0, isOverLimit: true };
  }

  // Para serviços, o DAS-MEI inclui INSS + ISS
  const das = MEI_DAS_INSS + MEI_DAS_ISS;
  const liquido = bruto - das + rendaExterior; // Renda exterior não é tributada pelo MEI
  const totalImpostos = das;

  return { das, liquido, totalImpostos, isOverLimit: false };
}

// calculateSimplesNacional: calcula DAS (Simples), INSS pró-labore, IRPF sobre pró-labore e líquido para regimes PJ (Simples Nacional)
// Esta função agora compara Anexo III e Anexo V e retorna o melhor resultado
function calculateSimplesNacional(bruto, proLabore, issRate, rendaExterior) {
  const calculateAnexo = (anexoTable) => {
    const RBT = bruto * 12; // Receita Bruta Total anualizada (apenas nacional para cálculo do DAS)
    let table = null;
    // Encontra a faixa de alíquota correta na tabela do Simples Nacional
    for (const faixa of anexoTable) {
      if (RBT <= faixa.limit) {
        table = faixa;
        break;
      }
    }
    if (!table) return { das: 0, inss: 0, liquido: 0, efetiva: 0 }; // Retorna zero se a tabela não for encontrada

    // Calcula a alíquota efetiva e o DAS
    const aliquotaEfetiva = ((RBT * table.rate) - table.deduction) / RBT;
    const das = bruto * aliquotaEfetiva; // O DAS é calculado apenas sobre o faturamento bruto (nacional)

    // Calcula o INSS sobre o pró-labore
    let inssProLabore = proLabore * 0.11;
    inssProLabore = Math.min(inssProLabore, TETO_INSS_PJ * 0.11); // Limita ao teto do INSS

    // Calcula o IRPF sobre o pró-labore
    const baseIrpf = proLabore - inssProLabore;
    let irpf = 0;
    for (const { base, rate, deduction } of IR_TABLE) {
      if (baseIrpf >= base) {
        irpf = (baseIrpf * rate) - deduction;
      }
    }
    irpf = Math.max(0, irpf); // Garante que o IRPF não seja negativo

    let liquido = bruto - das + rendaExterior;
    const totalImpostos = das;
    return { das, inss: inssProLabore, irpf, liquido, totalImpostos, efetiva: aliquotaEfetiva * 100 };
  };

  const resultAnexoIII = calculateAnexo(SN_ANEXO_III);
  const resultAnexoV = calculateAnexo(SN_ANEXO_V);

  // Retorna o resultado com maior valor líquido
  return resultAnexoIII.liquido > resultAnexoV.liquido ? resultAnexoIII : resultAnexoV;
}

// calculateLucroPresumido: calcula impostos e líquido para o regime de Lucro Presumido
function calculateLucroPresumido(bruto, proLabore, issRate, rendaExterior) {
  // Faturamento anual para cálculo de IRPJ adicional
  const faturamentoAnual = bruto * 12;

  // Base de cálculo IRPJ/CSLL (presunção de lucro)
  const basePresumida = bruto * LP_PRESUMPTION_RATE_SERVICOS;

  // IRPJ
  let irpj = basePresumida * LP_IRPJ_RATE;
  // Adicional de IRPJ para lucro acima de R$ 20.000/mês
  if (basePresumida > 20000) {
    irpj += (basePresumida - 20000) * LP_IRPJ_ADDITIONAL_RATE;
  }

  // CSLL
  const csll = basePresumida * LP_CSLL_RATE;

  // PIS e COFINS (calculados sobre o faturamento bruto)
  const pis = bruto * LP_PIS_RATE;
  const cofins = bruto * LP_COFINS_RATE;

  // ISS (calculado sobre o faturamento bruto, usando a alíquota do município)
  const iss = bruto * (issRate / 100);

  // INSS sobre o pró-labore
  let inssProLabore = proLabore * 0.11;
  inssProLabore = Math.min(inssProLabore, TETO_INSS_PJ * 0.11);

  // IRPF sobre o pró-labore
  const baseIrpf = proLabore - inssProLabore;
  let irpfProLabore = 0;
  for (const { base, rate, deduction } of IR_TABLE) {
    if (baseIrpf >= base) {
      irpfProLabore = (baseIrpf * rate) - deduction;
    }
  }
  irpfProLabore = Math.max(0, irpfProLabore);

  const totalImpostos = irpj + csll + pis + cofins + iss;
  const liquido = bruto - totalImpostos + rendaExterior;

  return { irpj, csll, pis, cofins, iss, inss: inssProLabore, irpf: irpfProLabore, liquido, totalImpostos, irpjcsll: irpj + csll, pisCofins: pis + cofins };
}
