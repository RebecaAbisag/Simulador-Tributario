document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos principais ---
  const checkboxOpcional = document.getElementById("mostrarOpcional");
  const campoOpcional = document.getElementById("campoOpcional");
  const salarioBrutoInput = document.getElementById("salarioBruto");
  const salarioAnualInput = document.getElementById("salarioAnual");
  const proLaboreInput = document.getElementById("proLabore");
  const rendaExteriorInput = document.getElementById("rendaExterior");
  const proLaboreWarning = document.getElementById("proLaboreWarning");
  const form = document.getElementById("calculatorForm");
  const resetButton = document.getElementById("resetButton");

  // Erro global
  const errorBox = document.createElement("div");
  errorBox.id = "errorBox";
  errorBox.className = "form__warning hidden";
  form.prepend(errorBox);
  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  };
  const clearError = () => {
    errorBox.textContent = "";
    errorBox.classList.add("hidden");
  };

  // Toggle campo opcional
  checkboxOpcional.addEventListener("change", () => {
    campoOpcional.classList.toggle("hidden", !checkboxOpcional.checked);
  });

  // Validação pró-labore (mínimo 28% do faturamento quando há faturamento)
    // --- Validação e dica do pró-labore ---
    function atualizarMensagemProLabore() {
      const salarioBruto = parseFloat(salarioBrutoInput.value) || 0;
      const proLabore = parseFloat(proLaboreInput.value) || 0;
  
      // Se salário não informado, limpa mensagem
      if (salarioBruto <= 0) {
        proLaboreWarning.textContent = "";
        proLaboreInput.classList.remove("input-error");
        return;
      }
  
      const minimo = salarioBruto * 0.28;
  
      if (proLabore <= 0) {
        // Apenas mostra o mínimo recomendado
        proLaboreWarning.textContent = `💡 Pró-labore mínimo recomendado: R$ ${minimo.toFixed(2)}`;
        proLaboreInput.classList.remove("input-error");
        return;
      }
  
      if (proLabore < minimo) {
        // Valor abaixo do permitido
        proLaboreWarning.textContent = `⚠️ O pró-labore deve ser pelo menos 28% do salário bruto (mínimo: R$ ${minimo.toFixed(2)}).`;
        proLaboreInput.classList.add("input-error");
      } else {
        // Valor suficiente → limpa mensagem
        proLaboreWarning.textContent = "";
        proLaboreInput.classList.remove("input-error");
      }
    }
  
    salarioBrutoInput.addEventListener("input", atualizarMensagemProLabore);
    proLaboreInput.addEventListener("input", atualizarMensagemProLabore);
  

  // Reativa toggles "Saber mais"
  function ativarToggles() {
    document.querySelectorAll(".toggle-details-btn").forEach((btn) => {
      // remove listener antigo evitando duplicidade
      btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll(".toggle-details-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        target.classList.toggle("hidden");
        btn.textContent = target.classList.contains("hidden") ? "Saber mais" : "Esconder detalhes";
      });
    });
  }
  ativarToggles();

  const formatMoney = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // --- Tabelas / constantes (Simples) ---
  const anexos = {
    III: [
      { limite: 180000, aliquota: 0.06, deducao: 0 },
      { limite: 360000, aliquota: 0.112, deducao: 9360 },
      { limite: 720000, aliquota: 0.135, deducao: 17640 },
      { limite: 1800000, aliquota: 0.16, deducao: 35640 },
      { limite: 3600000, aliquota: 0.21, deducao: 125640 },
      { limite: 4800000, aliquota: 0.33, deducao: 648000 },
    ],
    V: [
      { limite: 180000, aliquota: 0.155, deducao: 0 },
      { limite: 360000, aliquota: 0.18, deducao: 4500 },
      { limite: 720000, aliquota: 0.195, deducao: 9900 },
      { limite: 1800000, aliquota: 0.205, deducao: 17100 },
      { limite: 3600000, aliquota: 0.23, deducao: 62100 },
      { limite: 4800000, aliquota: 0.305, deducao: 540000 },
    ],
  };

  function calcularAliquotaEfetivaAnexo(faturamentoAnual, anexo) {
    const tabela = anexos[anexo];
    const faixa = tabela.find((f) => faturamentoAnual <= f.limite) || tabela[tabela.length - 1];
    // alíquota efetiva mensal (faixa.aliquota com dedução)
    return ((faturamentoAnual * faixa.aliquota - faixa.deducao) / faturamentoAnual) || faixa.aliquota;
  }

  // --- IRPF simplificado (tabela mensal usada em exemplos) ---
  function calcularIRPFMensal(salarioMensal) {
    // Faixas aproximadas (exemplo prático para simulação)
    // 0 - 1903.98 -> isento
    // 1903.99 - 2826.65 -> 7.5% (dedução 142.80)
    // 2826.66 - 3751.05 -> 15% (dedução 354.80)
    // 3751.06 - 4664.68 -> 22.5% (dedução 636.13)
    // >4664.68 -> 27.5% (dedução 869.36)
    const v = salarioMensal;
    if (v <= 1903.98) return 0;
    if (v <= 2826.65) return Math.max(0, v * 0.075 - 142.8);
    if (v <= 3751.05) return Math.max(0, v * 0.15 - 354.8);
    if (v <= 4664.68) return Math.max(0, v * 0.225 - 636.13);
    return Math.max(0, v * 0.275 - 869.36);
  }

  // --- Função utilitária: verifica negativos ---
  function temValorNegativo(...valores) {
    return valores.some((v) => typeof v === "number" && v < 0);
  }

  // --- Cálculo MEI ---
  function calcularMEI(faturamentoMensal, rendaExterior) {
    // assumimos DAS fixo aproximado (valor de exemplo; ajuste conforme necessidade)
    // e que rendaExterior não é tributada pelo DAS-MEI (adicionada ao líquido)
    const DAS = 70.6; // mensal aproximado
    const inss = 0; // no DAS já incluso INSS/encargos do MEI
    const iss = 0; // MEI não separa ISS aqui; incluído no DAS se aplicável
    const totalImpostos = DAS;
    const liquido = faturamentoMensal - totalImpostos + (rendaExterior || 0);
    return {
      DAS,
      totalImpostos,
      inss,
      iss,
      liquido,
    };
  }

  // --- Cálculo Simples (decide Anexo III ou V usando Fator R) ---
  function calcularSimples(faturamentoMensal, proLabore, rendaExterior) {
    // Fator R = (pró-labore anual / faturamento anual)
    const faturamentoAnual = (faturamentoMensal || 0) * 12;
    const proLaboreAnual = (proLabore || 0) * 12;
    const fatorR = faturamentoAnual > 0 ? proLaboreAnual / faturamentoAnual : 0;
    const anexo = fatorR >= 0.28 ? "III" : "V";

    // Renda exterior NÃO entra na base do DAS (assumimos)
    const faturamentoBaseMensal = (faturamentoMensal || 0); // já excluímos rendaExterior aqui (não somamos)
    const aliquotaEfetiva = calcularAliquotaEfetivaAnexo(faturamentoAnual, anexo);
    const das = faturamentoBaseMensal * aliquotaEfetiva;

    // INSS e IRPF sobre pró-labore (mensal)
    const inss = proLabore * 0.11; // 11% de INSS patronal (simples simulado)
    const irpf = calcularIRPFMensal(proLabore);

    const totalImpostos = das + inss + irpf;
    const liquido = faturamentoMensal - totalImpostos + (rendaExterior || 0);

    return {
      anexo,
      fatorR,
      aliquotaEfetiva,
      das,
      inss,
      irpf,
      totalImpostos,
      liquido,
    };
  }

  // --- Cálculo Lucro Presumido ---
  function calcularLucroPresumido(faturamentoMensal, proLabore, aliquotaISS, rendaExterior) {
    // Excluímos rendaExterior da base de PIS/COFINS/IRPJ/CSLL/ISS
    const faturamentoBase = (faturamentoMensal || 0);
    // Base presumida (ex.: 32% para serviços de TI)
    const basePresumida = faturamentoBase * 0.32;

    const IRPJ = basePresumida * 0.15; // 15%
    // adicional IRPJ mensal (simples aproximação): se basePresumida mensal > 20k aplicar 10% adicional sobre excedente
    const adicionalIR = basePresumida > 20000 ? (basePresumida - 20000) * 0.1 : 0;
    const CSLL = basePresumida * 0.09;
    // PIS/COFINS (não incidem sobre renda exterior) - alíquotas cumulativas padrão
    const PIS = faturamentoBase * 0.0065;
    const COFINS = faturamentoBase * 0.03;
    const ISS = faturamentoBase * (aliquotaISS / 100);

    const inss = proLabore * 0.11;
    const irpf = calcularIRPFMensal(proLabore);

    const totalImpostos = IRPJ + adicionalIR + CSLL + PIS + COFINS + ISS + inss + irpf;
    const liquido = faturamentoBase - totalImpostos + (rendaExterior || 0);

    return {
      IRPJ,
      adicionalIR,
      CSLL,
      PIS,
      COFINS,
      ISS,
      inss,
      irpf,
      totalImpostos,
      liquido,
    };
  }

  // --- SUBMIT ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();

    // Leitura dos valores
    const salarioBruto = parseFloat(salarioBrutoInput.value) || 0; // faturamento/PJ mensal
    const rendaExterior = parseFloat(rendaExteriorInput.value) || 0;
    const proLabore = parseFloat(proLaboreInput.value) || 0;
    const salarioAnualCampo = salarioAnualInput.value.trim();
    const salarioAnual = salarioAnualCampo ? parseFloat(salarioAnualCampo) || 0 : null;

    // Bloqueios: qualquer campo negativo => erro
    if (temValorNegativo(salarioBruto, rendaExterior, proLabore, (salarioAnual ?? 0))) {
      showError("⚠️ Nenhum valor pode ser negativo. Corrija antes de continuar.");
      return;
    }

    // Bloqueio se ambos salários (bruto e exterior) forem zero ou menores
    if (salarioBruto <= 0 && rendaExterior <= 0) {
      showError("⚠️ É necessário informar pelo menos um tipo de salário (bruto ou exterior).");
      return;
    }

    // Cálculo do salário anual se não informado:
    let salarioAnualFinal;
    if (salarioAnualCampo) {
      salarioAnualFinal = salarioAnual;
    } else {
      const positivos = [salarioBruto, rendaExterior].filter((v) => v > 0);
      salarioAnualFinal = positivos.length === 2 ? ((salarioBruto + rendaExterior) / 2) * 12 : positivos[0] * 12;
    }

    // Valida pró-labore
    //if (!atualizarMensagemProLabore()) return;

    const aliquotaISS = parseFloat(document.getElementById("municipioISS").value) || 5;

    // Executa cálculos reais
    const mei = calcularMEI(salarioBruto, rendaExterior);
    const simples = calcularSimples(salarioBruto, proLabore, rendaExterior);
    const lp = calcularLucroPresumido(salarioBruto, proLabore, aliquotaISS, rendaExterior);

    // Preenche MEI
    document.getElementById("meiDAS").textContent = formatMoney(mei.DAS || 0);
    document.getElementById("meiTotalImpostos").textContent = formatMoney(mei.totalImpostos || 0);
    document.getElementById("meiLiquido").textContent = formatMoney(mei.liquido || 0);
    document.getElementById("meiDetailsINSS").textContent = formatMoney(mei.inss || 0);
    document.getElementById("meiDetailsISS").textContent = formatMoney(mei.iss || 0);
    document.getElementById("meiDetailsDASTotal").textContent = formatMoney(mei.totalImpostos || 0);
    document.getElementById("meiDetailsLiquido").textContent = formatMoney(mei.liquido || 0);

    // Preenche Simples
    document.getElementById("pjSimplesDAS").textContent = formatMoney(simples.das || 0);
    document.getElementById("pjSimplesINSS").textContent = formatMoney(simples.inss || 0);
    document.getElementById("pjSimplesTotalImpostos").textContent = formatMoney(simples.totalImpostos || 0);
    document.getElementById("pjSimplesLiquido").textContent = formatMoney(simples.liquido || 0);

    document.getElementById("pjSimplesDetailsAliquota").textContent = ((simples.aliquotaEfetiva || 0) * 100).toFixed(2) + "%";
    document.getElementById("pjSimplesDetailsDAS").textContent = formatMoney(simples.das || 0);
    document.getElementById("pjSimplesDetailsINSS").textContent = formatMoney(simples.inss || 0);
    document.getElementById("pjSimplesDetailsIRPF").textContent = formatMoney(simples.irpf || 0);
    document.getElementById("pjSimplesDetailsLiquido").textContent = formatMoney(simples.liquido || 0);

    // Indica qual anexo
    document.getElementById("pjSimplesCard").querySelector(".card__description").textContent =
      `Melhor opção entre Anexo ${simples.anexo} (Fator R = ${(simples.fatorR * 100).toFixed(2)}%).`;

    // Preenche Lucro Presumido
    document.getElementById("lpIRPJCSLL").textContent = formatMoney((lp.IRPJ + lp.CSLL) || 0);
    document.getElementById("lpPISCOFINS").textContent = formatMoney((lp.PIS + lp.COFINS) || 0);
    document.getElementById("lpINSS").textContent = formatMoney(lp.inss || 0);
    document.getElementById("lpTotalImpostos").textContent = formatMoney(lp.totalImpostos || 0);
    document.getElementById("lpLiquido").textContent = formatMoney(lp.liquido || 0);

    document.getElementById("lpDetailsIRPJ").textContent = formatMoney(lp.IRPJ || 0);
    document.getElementById("lpDetailsCSLL").textContent = formatMoney(lp.CSLL || 0);
    document.getElementById("lpDetailsPIS").textContent = formatMoney(lp.PIS || 0);
    document.getElementById("lpDetailsCOFINS").textContent = formatMoney(lp.COFINS || 0);
    document.getElementById("lpDetailsISS").textContent = formatMoney(lp.ISS || 0);
    document.getElementById("lpDetailsINSS").textContent = formatMoney(lp.inss || 0);
    document.getElementById("lpDetailsIRPF").textContent = formatMoney(lp.irpf || 0);
    document.getElementById("lpDetailsLiquido").textContent = formatMoney(lp.liquido || 0);

    // Melhor regime (com base no líquido calculado)
    const regimes = [
      { nome: "MEI", valor: mei.liquido || -Infinity },
      { nome: "PJ - Simples Nacional", valor: simples.liquido || -Infinity },
      { nome: "PJ - Lucro Presumido", valor: lp.liquido || -Infinity },
    ];
    const melhor = regimes.reduce((a, b) => (b.valor > a.valor ? b : a));
    document.getElementById("bestOptionName").textContent = melhor.nome;
    document.getElementById("bestOptionValue").textContent = formatMoney(melhor.valor || 0);
    document.getElementById("comparisonSavings").textContent = formatMoney((melhor.valor || 0) - (mei.liquido || 0));

    // Exibe header (caso estivesse oculto)
    document.querySelector(".header").classList.remove("hidden");
  });

  // --- RESET ---
  resetButton.addEventListener("click", () => {
    form.reset();
    campoOpcional.classList.add("hidden");
    proLaboreWarning.textContent = "";
    clearError();
    document.querySelector(".header").classList.add("hidden");

    document.querySelectorAll(".text-tax, .text-liquid").forEach((el) => {
      el.textContent = "R$ 0,00";
    });

    document.getElementById("bestOptionName").textContent = "...";
    document.getElementById("bestOptionValue").textContent = "R$ 0,00";
    document.getElementById("comparisonSavings").textContent = "R$ 0,00";

    // reativa toggles
    ativarToggles();
  });
});
