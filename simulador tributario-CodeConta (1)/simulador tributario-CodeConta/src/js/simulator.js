// simulator.js
// Lógica do simulador MEI x PJ (Simples Nacional e Lucro Presumido)

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

    let liquido = bruto - das - inssProLabore - irpf + rendaExterior;
    const totalImpostos = das + inssProLabore + irpf;
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

  const totalImpostos = irpj + csll + pis + cofins + iss + inssProLabore + irpfProLabore;
  const liquido = bruto - totalImpostos + rendaExterior;

  return { irpj, csll, pis, cofins, iss, inss: inssProLabore, irpf: irpfProLabore, liquido, totalImpostos, irpjcsll: irpj + csll, pisCofins: pis + cofins };
}

// calculateAndDisplay: lê as entradas, executa os cálculos e atualiza a UI via DOM
function calculateAndDisplay() {
  // Obtém os valores dos inputs
  const salarioBruto = parseFloat(document.getElementById('salarioBruto').value) || 0;
  const proLaboreInput = parseFloat(document.getElementById('proLabore').value) || 0;
  const issRate = parseFloat(document.getElementById('municipioISS').value) || 5;
  const rendaExterior = parseFloat(document.getElementById('rendaExterior').value) || 0;

  // Se o salário bruto for zero ou negativo, oculta a seção de resultados
  if (salarioBruto <= 0) {
    return;
  }

  // Validação e ajuste do pró-labore mínimo
  const minProLabore = salarioBruto * 0.28;
  let effectiveProLabore = proLaboreInput;
  const warningElement = document.getElementById('proLaboreWarning');

  if (proLaboreInput < minProLabore) {
    effectiveProLabore = minProLabore;
    warningElement.textContent = `Atenção: O valor mínimo obrigatório (28% Faturamento) é ${formatBRL(minProLabore)}. O cálculo PJ está usando este valor.`;
    warningElement.classList.remove('hidden');
  } else {
    warningElement.classList.add('hidden');
  }

  // Executa os cálculos para cada regime
  const resultMEI = calculateMEI(salarioBruto, rendaExterior);
  const resultSimplesNacional = calculateSimplesNacional(salarioBruto, effectiveProLabore, issRate, rendaExterior);
  const resultLucroPresumido = calculateLucroPresumido(salarioBruto, effectiveProLabore, issRate, rendaExterior);

  // Agrupa os resultados para comparação
  const results = [
    { name: 'MEI (Microempreendedor Individual)', liquido: resultMEI.liquido, details: resultMEI, id: 'mei' },
    { name: 'PJ - Simples Nacional', liquido: resultSimplesNacional.liquido, details: resultSimplesNacional, id: 'pjSimples' },
    { name: 'PJ - Lucro Presumido', liquido: resultLucroPresumido.liquido, details: resultLucroPresumido, id: 'lucroPresumido' }
  ];

  // Encontra a melhor opção (maior valor líquido)
  let bestOption = results.reduce((prev, current) => (prev.liquido > current.liquido) ? prev : current);

  // Atualiza o destaque da melhor opção na UI
  document.querySelectorAll('.card--comparison').forEach(card => card.classList.remove('card--best'));
  document.getElementById(`${bestOption.id}Card`).classList.add('card--best');

  // Calcula a economia em relação à MEI
  const savings = bestOption.liquido - resultMEI.liquido;
  document.getElementById('bestOptionName').textContent = bestOption.name;
  document.getElementById('bestOptionValue').textContent = formatBRL(bestOption.liquido);

  const highlightElement = document.getElementById('bestOptionHighlight');
  const comparisonSavingsElement = document.getElementById('comparisonSavings');

  if (savings >= 0) {
    comparisonSavingsElement.textContent = formatBRL(savings);
    highlightElement.classList.add('card--highlight');
  } else {
    comparisonSavingsElement.textContent = formatBRL(Math.abs(savings));
  }

  // Popula o nome do contador recomendado
  document.getElementById('recommendedAccountantLink').textContent = 'Dra. Contadora Expert';

  // Atualiza os valores na UI para cada regime
  document.getElementById('meiDAS').textContent = formatBRL(resultMEI.das);
  document.getElementById('meiTotalImpostos').textContent = formatBRL(resultMEI.totalImpostos);
  document.getElementById('meiLiquido').textContent = formatBRL(resultMEI.liquido);

  document.getElementById('pjSimplesDAS').textContent = formatBRL(resultSimplesNacional.das);
  document.getElementById('pjSimplesINSS').textContent = formatBRL(resultSimplesNacional.inss);
  document.getElementById('pjSimplesTotalImpostos').textContent = formatBRL(resultSimplesNacional.totalImpostos);
  document.getElementById('pjSimplesLiquido').textContent = formatBRL(resultSimplesNacional.liquido);

  document.getElementById('lpIRPJCSLL').textContent = formatBRL(resultLucroPresumido.irpjcsll);
  document.getElementById('lpPISCOFINS').textContent = formatBRL(resultLucroPresumido.pisCofins);
  document.getElementById('lpINSS').textContent = formatBRL(resultLucroPresumido.inss);
  document.getElementById('lpTotalImpostos').textContent = formatBRL(resultLucroPresumido.totalImpostos);
  document.getElementById('lpLiquido').textContent = formatBRL(resultLucroPresumido.liquido);

  // Popula as tabelas de detalhes
  // MEI
  document.getElementById('meiDetailsINSS').textContent = formatBRL(MEI_DAS_INSS);
  document.getElementById('meiDetailsISS').textContent = formatBRL(MEI_DAS_ISS);
  document.getElementById('meiDetailsDASTotal').textContent = formatBRL(resultMEI.das);
  document.getElementById('meiDetailsLiquido').textContent = formatBRL(resultMEI.liquido);

  // Simples Nacional
  document.getElementById('pjSimplesDetailsAliquota').textContent = `${resultSimplesNacional.efetiva.toFixed(2)}%`;
  document.getElementById('pjSimplesDetailsDAS').textContent = formatBRL(resultSimplesNacional.das);
  document.getElementById('pjSimplesDetailsINSS').textContent = formatBRL(resultSimplesNacional.inss);
  document.getElementById('pjSimplesDetailsIRPF').textContent = formatBRL(resultSimplesNacional.irpf);
  document.getElementById('pjSimplesDetailsLiquido').textContent = formatBRL(resultSimplesNacional.liquido);

  // Lucro Presumido
  document.getElementById('lpDetailsIRPJ').textContent = formatBRL(resultLucroPresumido.irpj);
  document.getElementById('lpDetailsCSLL').textContent = formatBRL(resultLucroPresumido.csll);
  document.getElementById('lpDetailsPIS').textContent = formatBRL(resultLucroPresumido.pis);
  document.getElementById('lpDetailsCOFINS').textContent = formatBRL(resultLucroPresumido.cofins);
  document.getElementById('lpDetailsISS').textContent = formatBRL(resultLucroPresumido.iss);
  document.getElementById('lpDetailsINSS').textContent = formatBRL(resultLucroPresumido.inss);
  document.getElementById('lpDetailsIRPF').textContent = formatBRL(resultLucroPresumido.irpf);
  document.getElementById('lpDetailsLiquido').textContent = formatBRL(resultLucroPresumido.liquido);


  // Mostra ou oculta a nota sobre renda do exterior
  const foreignIncomeNotes = document.querySelectorAll('.foreign-income-note');
  if (rendaExterior > 0) {
    foreignIncomeNotes.forEach(note => note.classList.remove('hidden'));
  } else {
    foreignIncomeNotes.forEach(note => note.classList.add('hidden'));
  }

  // Recria os ícones Lucide, caso tenham sido alterados
  if (window.lucide) lucide.createIcons();

  // Exibe a seção de indicações de contador
  document.getElementById('indicacoes').classList.remove('hidden');
}
