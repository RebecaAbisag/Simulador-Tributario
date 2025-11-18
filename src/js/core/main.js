document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  const form = document.getElementById("calculatorForm");
  const checkboxOpcional = document.getElementById("mostrarOpcional");
  const campoOpcional = document.getElementById("campoOpcional");
  const salarioBrutoInput = document.getElementById("salarioBruto");
  const salarioAnualInput = document.getElementById("salarioAnual");
  const proLaboreInput = document.getElementById("proLabore");
  const proLaboreWarning = document.getElementById("proLaboreWarning");
  const rendaExteriorInput = document.getElementById("rendaExterior");
  const municipioISSSelect = document.getElementById("municipioISS");
  const resetButton = document.getElementById("resetButton");

  const errorBox = document.createElement("div");
  errorBox.id = "errorBox";
  errorBox.className = "form__warning hidden";
  form.prepend(errorBox);

  function formatMoney(v) {
    return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function showGlobalError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  }

  function hideGlobalError() {
    errorBox.textContent = "";
    errorBox.classList.add("hidden");
  }

  function setFieldError(input, msg, ms = 2000) {
    if (!input) {
      showGlobalError(msg);
      return;
    }
    input.setCustomValidity(msg);
    input.reportValidity();
    setTimeout(() => {
      input.setCustomValidity("");
    }, ms);
  }

  function clearAllFieldValidity() {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach(i => i.setCustomValidity(""));
    hideGlobalError();
  }

  function temValorNegativo(...vals) {
    return vals.some(v => typeof v === "number" && v < 0);
  }

  checkboxOpcional.addEventListener("change", () => {
    campoOpcional.classList.toggle("hidden", !checkboxOpcional.checked);
  });

  function atualizarMensagemProLabore() {
    const salarioBruto = parseFloat(salarioBrutoInput.value) || 0;
    const proLabore = parseFloat(proLaboreInput.value) || 0;

    if (salarioBruto <= 0) {
      proLaboreWarning.textContent = "";
      proLaboreInput.classList.remove("input-error");
      return;
    }

    const minimo = salarioBruto * 0.28;

    if (proLabore <= 0) {
      proLaboreWarning.textContent = `💡 Pró-labore mínimo recomendado: ${formatMoney(minimo)}`;
      proLaboreInput.classList.remove("input-error");
      return;
    }

    if (proLabore < minimo) {
      proLaboreWarning.textContent = `⚠️ Recomenda-se pró-labore ≥ 28% do faturamento (mínimo: ${formatMoney(minimo)}).`;
      proLaboreInput.classList.add("input-error");
    } else {
      proLaboreWarning.textContent = "";
      proLaboreInput.classList.remove("input-error");
    }
  }

  salarioBrutoInput.addEventListener("input", atualizarMensagemProLabore);
  proLaboreInput.addEventListener("input", atualizarMensagemProLabore);

  function ativarToggles() {
    document.querySelectorAll(".toggle-details-btn").forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
    });
    document.querySelectorAll(".toggle-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        target.classList.toggle("hidden");
        btn.textContent = target.classList.contains("hidden") ? "Saber mais" : "Esconder detalhes";
      });
    });
  }
  ativarToggles();

  const anexos = {
    III: [
      { limite: 180000, aliquota: 0.06, deducao: 0 },
      { limite: 360000, aliquota: 0.112, deducao: 9360 },
      { limite: 720000, aliquota: 0.135, deducao: 17640 },
      { limite: 1800000, aliquota: 0.16, deducao: 35640 },
      { limite: 3600000, aliquota: 0.21, deducao: 125640 },
      { limite: 4800000, aliquota: 0.33, deducao: 648000 }
    ],
    V: [
      { limite: 180000, aliquota: 0.155, deducao: 0 },
      { limite: 360000, aliquota: 0.18, deducao: 4500 },
      { limite: 720000, aliquota: 0.195, deducao: 9900 },
      { limite: 1800000, aliquota: 0.205, deducao: 17100 },
      { limite: 3600000, aliquota: 0.23, deducao: 62100 },
      { limite: 4800000, aliquota: 0.305, deducao: 540000 }
    ]
  };

  function calcularAliquotaEfetiva(faturamentoAnual, anexoKey) {
    const tabela = anexos[anexoKey];
    const faixa = tabela.find(f => faturamentoAnual <= f.limite) || tabela[tabela.length - 1];
    if (!faturamentoAnual || faturamentoAnual <= 0) return faixa.aliquota;
    return ((faturamentoAnual * faixa.aliquota - faixa.deducao) / faturamentoAnual);
  }

  // MEI: recebe faturamento doméstico e faturamento exterior separadamente.
  function calcularMEI(faturamentoDomesticoMensal, faturamentoExteriorMensal) {
    const rd = faturamentoDomesticoMensal || 0;
    const re = faturamentoExteriorMensal || 0;
    const totalFaturamento = rd + re;
    const DAS = 70.6; // valor aproximado mensal do DAS-MEI
    const totalImpostos = DAS;
    const liquido = totalFaturamento - totalImpostos;
    return { DAS, totalImpostos, liquido };
  }

  // Simples: usa faturamento anual total para faixa e fator R,
  // aplica aliquotaEfetiva sobre doméstico, e remove PIS/COFINS da parcela externa
  function calcularSimples(faturamentoAnualTotal, faturamentoDomesticoMensal, faturamentoExteriorMensal, proLabore) {
    const proLaboreAnual = (proLabore || 0) * 12;
    const fatorR = faturamentoAnualTotal > 0 ? proLaboreAnual / faturamentoAnualTotal : 0;
    const anexoKey = fatorR >= 0.28 ? "III" : "V";
    const aliquotaEfetiva = calcularAliquotaEfetiva(faturamentoAnualTotal, anexoKey);

    const pisCofinsRate = 0.0065 + 0.03; // 0.0365 combinado

    const rd = faturamentoDomesticoMensal || 0;
    const re = faturamentoExteriorMensal || 0;

    const dasDomestico = rd * aliquotaEfetiva;
    const aliquotaExternaAplicavel = Math.max(0, aliquotaEfetiva - pisCofinsRate);
    const dasExterno = re * aliquotaExternaAplicavel;

    const dasMensal = dasDomestico + dasExterno;
    const totalImpostos = dasMensal; // neste modelo simplificado consideramos só DAS
    const liquido = rd + re - totalImpostos;

    return { anexo: anexoKey, fatorR, aliquotaEfetiva, dasMensal, totalImpostos, liquido };
  }

  // Lucro Presumido: IRPJ/CSLL sobre base presumida (total), PIS/COFINS só sobre doméstico, ISS sobre total
  function calcularLucroPresumido(faturamentoDomesticoMensal, faturamentoExteriorMensal, aliquotaISS) {
    const rd = faturamentoDomesticoMensal || 0;
    const re = faturamentoExteriorMensal || 0;
    const faturamentoTotal = rd + re;

    const basePresumida = faturamentoTotal * 0.32;
    const IRPJ = basePresumida * 0.15;
    const adicionalIR = basePresumida > 20000 ? (basePresumida - 20000) * 0.1 : 0;
    const CSLL = basePresumida * 0.09;

    const PIS = rd * 0.0065;
    const COFINS = rd * 0.03;

    const ISS = faturamentoTotal * (aliquotaISS / 100);

    const total = IRPJ + adicionalIR + CSLL + PIS + COFINS + ISS;
    const liquido = faturamentoTotal - total;

    return { IRPJ, adicionalIR, CSLL, PIS, COFINS, ISS, total, liquido };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllFieldValidity();

    const salarioBruto = parseFloat(salarioBrutoInput.value) || 0;
    const rendaExterior = parseFloat(rendaExteriorInput.value) || 0;
    const proLabore = parseFloat(proLaboreInput.value) || 0;
    let salarioAnualInformado = null;

    if (checkboxOpcional.checked) {
      const salarioAnualRaw = salarioAnualInput.value.trim();
      salarioAnualInformado = salarioAnualRaw !== "" ? parseFloat(salarioAnualRaw) || 0 : null;
    }

    if (salarioBruto < 0) {
      setFieldError(salarioBrutoInput, "⚠️ Nenhum valor pode ser negativo. Corrija antes de continuar.");
      return;
    }
    if (rendaExterior < 0) {
      setFieldError(rendaExteriorInput, "⚠️ Nenhum valor pode ser negativo. Corrija antes de continuar.");
      return;
    }
    if (proLabore < 0) {
      setFieldError(proLaboreInput, "⚠️ Nenhum valor pode ser negativo. Corrija antes de continuar.");
      return;
    }
    if (checkboxOpcional.checked && salarioAnualInformado !== null && salarioAnualInformado < 0) {
      setFieldError(salarioAnualInput, "⚠️ Nenhum valor pode ser negativo. Corrija antes de continuar.");
      return;
    }

    if (salarioBruto <= 0 && rendaExterior <= 0) {
      setFieldError(salarioBrutoInput, "⚠️ Informe pelo menos um salário (bruto ou renda do exterior).");
      setTimeout(() => {
        setFieldError(rendaExteriorInput, "⚠️ Informe pelo menos um salário (bruto ou renda do exterior).");
      }, 300);
      return;
    }

    if (checkboxOpcional.checked && (salarioAnualInformado === null || salarioAnualInformado <= 0)) {
      setFieldError(salarioAnualInput, "⚠️ O campo Salário Anual está ativo — preencha um valor maior que zero ou desative o campo opcional.");
      return;
    }

    let salarioAnualFinal;
    if (checkboxOpcional.checked && salarioAnualInformado !== null && salarioAnualInformado > 0) {
      salarioAnualFinal = salarioAnualInformado;
    } else {
      const positivos = [salarioBruto, rendaExterior].filter(v => v > 0);
      salarioAnualFinal = positivos.length === 2 ? ((salarioBruto + rendaExterior) / 2) * 12 : (positivos[0] || 0) * 12;
    }

    const faturamentoAnualTotal = salarioAnualFinal;
    const faturamentoMensalParaDAS = faturamentoAnualTotal / 12;

    const rd = salarioBruto;      // faturamento doméstico mensal (bruto)
    const re = rendaExterior;     // faturamento exterior mensal

    const aliquotaISS = parseFloat(municipioISSSelect.value) || 5;

    atualizarMensagemProLabore();

    const mei = calcularMEI(rd, re);
    const simples = calcularSimples(faturamentoAnualTotal, rd, re, proLabore);
    const lp = calcularLucroPresumido(rd, re, aliquotaISS);

    // preencher MEI
    const meiDAS = document.getElementById("meiDAS");
    const meiTotalImpostos = document.getElementById("meiTotalImpostos");
    const meiLiquido = document.getElementById("meiLiquido");
    const meiDetailsDASTotal = document.getElementById("meiDetailsDASTotal");
    const meiDetailsLiquido = document.getElementById("meiDetailsLiquido");
    if (meiDAS) meiDAS.textContent = formatMoney(mei.DAS);
    if (meiTotalImpostos) meiTotalImpostos.textContent = formatMoney(mei.totalImpostos);
    if (meiLiquido) meiLiquido.textContent = formatMoney(mei.liquido);
    if (meiDetailsDASTotal) meiDetailsDASTotal.textContent = formatMoney(mei.totalImpostos);
    if (meiDetailsLiquido) meiDetailsLiquido.textContent = formatMoney(mei.liquido);

    // preencher Simples
    const pjSimplesDAS = document.getElementById("pjSimplesDAS");
    const pjSimplesTotalImpostos = document.getElementById("pjSimplesTotalImpostos");
    const pjSimplesLiquido = document.getElementById("pjSimplesLiquido");
    if (pjSimplesDAS) pjSimplesDAS.textContent = formatMoney(simples.dasMensal);
    if (pjSimplesTotalImpostos) pjSimplesTotalImpostos.textContent = formatMoney(simples.totalImpostos);
    if (pjSimplesLiquido) pjSimplesLiquido.textContent = formatMoney(simples.liquido);

    const pjSimplesDetailsAliquota = document.getElementById("pjSimplesDetailsAliquota");
    const pjSimplesDetailsDAS = document.getElementById("pjSimplesDetailsDAS");
    const pjSimplesDetailsLiquido = document.getElementById("pjSimplesDetailsLiquido");
    if (pjSimplesDetailsAliquota) pjSimplesDetailsAliquota.textContent = ((simples.aliquotaEfetiva || 0) * 100).toFixed(2) + "%";
    if (pjSimplesDetailsDAS) pjSimplesDetailsDAS.textContent = formatMoney(simples.dasMensal);
    if (pjSimplesDetailsLiquido) pjSimplesDetailsLiquido.textContent = formatMoney(simples.liquido);

    const pjSimplesCard = document.getElementById("pjSimplesCard");
    if (pjSimplesCard) {
      const descEl = pjSimplesCard.querySelector(".card__description");
      if (descEl) descEl.textContent = `Melhor opção entre Anexo ${simples.anexo} (Fator R = ${(simples.fatorR * 100).toFixed(2)}%).`;
    }

    // preencher Lucro Presumido (ATENÇÃO: atualiza *ambos* os lugares do ISS)
    const lpIRPJCSLL = document.getElementById("lpIRPJCSLL");
    const lpPISCOFINS = document.getElementById("lpPISCOFINS");
    const lpTotalImpostos = document.getElementById("lpTotalImpostos");
    const lpLiquido = document.getElementById("lpLiquido");

    if (lpIRPJCSLL) lpIRPJCSLL.textContent = formatMoney((lp.IRPJ || 0) + (lp.CSLL || 0));
    if (lpPISCOFINS) lpPISCOFINS.textContent = formatMoney((lp.PIS || 0) + (lp.COFINS || 0));
    if (lpTotalImpostos) lpTotalImpostos.textContent = formatMoney(lp.total);
    if (lpLiquido) lpLiquido.textContent = formatMoney(lp.liquido);

    // **CORREÇÃO IMPORTANTE**: o ISS aparece em dois elementos no HTML.
    const lpDetailsISS_top = document.getElementById("lpDetailsISS");       // mostra junto aos resumos
    const lpDetailsISS_saber = document.getElementById("lpSaberMaisISS");  // mostra dentro do "Saber mais"
    if (lpDetailsISS_top) lpDetailsISS_top.textContent = formatMoney(lp.ISS || 0);
    if (lpDetailsISS_saber) lpDetailsISS_saber.textContent = formatMoney(lp.ISS || 0);

    const lpDetailsIRPJ = document.getElementById("lpDetailsIRPJ");
    const lpDetailsCSLL = document.getElementById("lpDetailsCSLL");
    const lpDetailsPIS = document.getElementById("lpDetailsPIS");
    const lpDetailsCOFINS = document.getElementById("lpDetailsCOFINS");
    const lpDetailsLiquido = document.getElementById("lpDetailsLiquido");
    if (lpDetailsIRPJ) lpDetailsIRPJ.textContent = formatMoney(lp.IRPJ || 0);
    if (lpDetailsCSLL) lpDetailsCSLL.textContent = formatMoney(lp.CSLL || 0);
    if (lpDetailsPIS) lpDetailsPIS.textContent = formatMoney(lp.PIS || 0);
    if (lpDetailsCOFINS) lpDetailsCOFINS.textContent = formatMoney(lp.COFINS || 0);
    if (lpDetailsLiquido) lpDetailsLiquido.textContent = formatMoney(lp.liquido);

    const candidatos = [
      { nome: "MEI", valor: mei.liquido || -Infinity },
      { nome: "PJ - Simples Nacional", valor: simples.liquido || -Infinity },
      { nome: "PJ - Lucro Presumido", valor: lp.liquido || -Infinity }
    ];
    const melhor = candidatos.reduce((a, b) => (b.valor > a.valor ? b : a));
    const bestOptionName = document.getElementById("bestOptionName");
    const bestOptionValue = document.getElementById("bestOptionValue");
    const comparisonSavings = document.getElementById("comparisonSavings");
    if (bestOptionName) bestOptionName.textContent = melhor.nome;
    if (bestOptionValue) bestOptionValue.textContent = formatMoney(melhor.valor);
    if (comparisonSavings) comparisonSavings.textContent = formatMoney(melhor.valor - (mei.liquido || 0));

    const headerEl = document.querySelector(".header");
    if (headerEl) headerEl.classList.remove("hidden");

    // reactivar toggles caso detalhes tenham sido alterados dinamicamente
    ativarToggles();
  });

  resetButton.addEventListener("click", () => {
    form.reset();
    campoOpcional.classList.add("hidden");
    proLaboreWarning.textContent = "";
    clearAllFieldValidity();
    document.querySelectorAll(".text-tax, .text-liquid").forEach(el => el.textContent = "R$ 0,00");
    const bestOptionName = document.getElementById("bestOptionName");
    const bestOptionValue = document.getElementById("bestOptionValue");
    const comparisonSavings = document.getElementById("comparisonSavings");
    if (bestOptionName) bestOptionName.textContent = "...";
    if (bestOptionValue) bestOptionValue.textContent = "R$ 0,00";
    if (comparisonSavings) comparisonSavings.textContent = "R$ 0,00";
    const headerEl = document.querySelector(".header");
    if (headerEl) headerEl.classList.add("hidden");
    ativarToggles();
  });
});



