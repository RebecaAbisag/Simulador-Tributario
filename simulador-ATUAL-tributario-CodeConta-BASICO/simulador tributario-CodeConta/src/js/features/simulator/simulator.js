// simulator.js
// Lida com a interação do usuário e a exibição dos resultados da simulação.

// handleSimulation: lê as entradas, executa os cálculos e atualiza a UI via DOM
function handleSimulation() {
  // Obtém os valores dos inputs
  const salarioBruto = parseFloat(document.getElementById('salarioBruto').value) || 0;
  const salarioAnual = parseFloat(document.getElementById('salarioAnual').value) || salarioBruto * 12;
  const proLaboreInput = parseFloat(document.getElementById('proLabore').value) || 0;
  const issRate = parseFloat(document.getElementById('municipioISS').value) || 5;
  const rendaExterior = parseFloat(document.getElementById('rendaExterior').value) || 0;

  // Se o salário bruto for zero ou negativo, oculta a seção de resultados
  if (salarioBruto < 0 || rendaExterior < 0) {
    return;
  }
  if (salarioAnual <=0) {
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
