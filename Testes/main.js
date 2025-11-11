const folhaAnual = 60000;
const faturamentoAnual = 185000;
const faturamentoMensal = 25000;
let valorFinal = 0;
class AnexoDados {
    constructor(receitaBruta, aliquotaNominal, parcelaDeduzir) {
        this.receitaBruta = receitaBruta;
        this.aliquotaNominal = aliquotaNominal;
        this.parcelaDeduzir = parcelaDeduzir;
    }
    AliquotaSimples(valor,index){
       return (valor * this.aliquotaNominal[index] - this.parcelaDeduzir[index])/valor;
    }
    ChecarReceitaBruta(faturamentoAnual, faturamentoMes){
        for (let index = 0; index < this.receitaBruta.length; index++) {
            const element = this.receitaBruta[index];
            console.log(element);
            if (faturamentoAnual <= element) {
                console.log("faixa: "+ element);
                console.log("porcentagem da faixa: "+Number(this.AliquotaSimples(faturamentoAnual, index).toFixed(4)));
                console.log("resultado: "+faturamentoMes * Number(this.AliquotaSimples(faturamentoAnual, index).toFixed(4)));
                return faturamentoMes * Number(this.AliquotaSimples(faturamentoAnual, index).toFixed(4))
                
            }
        }
    }
}
class AnexoIIIDados extends AnexoDados {
    constructor() {
        super(
            [180000, 360000, 720000, 1800000, 3600000, 4800000],
            [0.06, 0.112, 0.135, 0.16, 0.21, 0.33],
            [0, 9360, 17640, 35640, 125640, 648000]
        );
    }
}
class AnexoVDados extends AnexoDados {
    constructor() {
        super(
            [180000, 360000, 720000, 1800000, 3600000, 4800000],
            [0.155, 0.18, 0.195, 0.205, 0.23, 0.305],
            [0, 4500, 9900, 17100, 62100, 540000]
        );
    }
}
if (folhaAnual/faturamentoAnual > 0.28) {
    const AnexoIII = new AnexoIIIDados();
    valorFinal = AnexoIII.ChecarReceitaBruta(faturamentoAnual, faturamentoMensal);
}
else{
    const AnexoV = new AnexoVDados();
    valorFinal = AnexoV.ChecarReceitaBruta(faturamentoAnual, faturamentoMensal);
}

console.log(valorFinal);




