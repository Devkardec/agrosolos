// Módulo de Cálculos - Todas as fórmulas do manual técnico
// Este módulo contém todas as fórmulas de cálculo mantendo a lógica original

// Tabela de interpretação de P por teor de argila (16-35%)
const interpretacaoP = {
    muitoBaixo: { min: 0, max: 5 },
    baixo: { min: 5.1, max: 10 },
    medio: { min: 10.1, max: 15 },
    adequado: { min: 15.1, max: 20 },
    alto: { min: 20.1, max: 999 }
};

// Fontes de fertilizantes - Valores do Manual Técnico
const fontesFertilizantes = {
    p: {
        ssp: { nome: 'SSP - Superfosfato Simples', garantia: 20 },
        map: { nome: 'MAP - Fosfato Monoamônico', garantia: 48 }
    },
    k: {
        kcl: { nome: 'KCl - Cloreto de Potássio', garantia: 60 }
    },
    n: {
        ureia: { nome: 'Ureia', garantia: 45 }
    }
};

// Funções de conversão
function converterK_cmolc_para_mg_dm3(k_cmolc) {
    return k_cmolc * 391; // Fator de conversão
}

function converterP_mg_dm3_para_kg_ha(p_mg_dm3, profundidade = 20) {
    const fator = profundidade === 20 ? 2 : 1; // Fator 2 para 0-20cm
    return p_mg_dm3 * fator;
}

function converterP_mg_dm3_para_P2O5_kg_ha(p_mg_dm3, profundidade = 20) {
    // Fator: 1 mg/dm³ de P = 10 kg/ha de P2O5
    const fator = profundidade === 20 ? 2 : 1; // Fator 2 para 0-20cm
    return p_mg_dm3 * 10 * fator;
}

function converterK_cmolc_para_K2O_kg_ha(k_cmolc, profundidade = 20) {
    const k_mg_dm3 = converterK_cmolc_para_mg_dm3(k_cmolc);
    const k_kg_ha = converterP_mg_dm3_para_kg_ha(k_mg_dm3, profundidade);
    return k_kg_ha * 1.2; // Fator de conversão K para K2O
}

// Calcular V% (Saturação por Bases)
function calcularV(ca, mg, k, hal) {
    const s = ca + mg + k; // Soma de bases
    const t = s + hal; // CTC efetiva
    if (t === 0) return 0;
    return (s / t) * 100;
}

// Interpretação de P baseada no teor de argila (16-35%)
function interpretarP(p_mg_dm3, argila) {
    // A interpretação é válida apenas para argila entre 16-35%
    if (argila < 16 || argila > 35) {
        return { 
            interpretacao: 'Fora da faixa (16-35%)', 
            necessidade: 0, 
            nivelCritico: 15.1 
        };
    }
    
    let interpretacao = 'Muito Baixo';
    let necessidade = 0;
    const nivelCritico = 15.1; // Nível crítico para correção
    
    if (p_mg_dm3 <= interpretacaoP.muitoBaixo.max) {
        interpretacao = 'Muito Baixo';
        necessidade = nivelCritico - p_mg_dm3;
    } else if (p_mg_dm3 <= interpretacaoP.baixo.max) {
        interpretacao = 'Baixo';
        necessidade = nivelCritico - p_mg_dm3;
    } else if (p_mg_dm3 <= interpretacaoP.medio.max) {
        interpretacao = 'Médio';
        necessidade = nivelCritico - p_mg_dm3;
    } else if (p_mg_dm3 <= interpretacaoP.adequado.max) {
        interpretacao = 'Adequado';
        necessidade = 0; // Já está adequado
    } else {
        interpretacao = 'Alto';
        necessidade = 0; // Acima do adequado
    }
    
    return { interpretacao, necessidade, nivelCritico };
}

// Calcular Necessidade de Calcário (NC)
// NC (t/ha) = ((V2 - V1) * CTC) / (PRNT/100)
function calcularNC(v1, v2, ctc, prnt) {
    if (prnt === 0) return 0;
    return ((v2 - v1) * ctc) / (prnt / 100);
}

// Calcular equilíbrio de bases
function calcularEquilibrioBases(ctc, caPercent, mgPercent, kPercent) {
    const caDesejado = (ctc * caPercent) / 100;
    const mgDesejado = (ctc * mgPercent) / 100;
    const kDesejado = (ctc * kPercent) / 100;
    return { caDesejado, mgDesejado, kDesejado };
}

// Calcular Necessidade de Gesso (NG)
// Dose Gesso: 50 * % Argila (Anuais) ou 75 * % Argila (Perenes)
function calcularNG(argila, tipoCultura = 'anual') {
    const fator = tipoCultura === 'perene' ? 75 : 50;
    return fator * argila;
}

// Verificar gatilhos para gessagem
// Se Al > 20% ou Ca < 1,0 cmolc/dm³ na camada 20-40cm
function verificarGatilhoGessagem(al, ca, mg, k, hal, profundidade) {
    const gatilhos = [];
    
    // Calcular CTC para percentual de Al
    const s = ca + mg + k;
    const ctc = s + hal;
    
    // Gatilho 1: Al > 20% da CTC
    if (al > 0 && ctc > 0) {
        const percentualAl = (al / ctc) * 100;
        if (percentualAl > 20) {
            gatilhos.push(`Al > 20% da CTC (${percentualAl.toFixed(1)}%)`);
        }
    }
    
    // Gatilho 2: Ca < 1,0 cmolc/dm³ na camada 20-40cm
    if (profundidade === 40 && ca < 1.0) {
        gatilhos.push('Ca < 1,0 cmolc/dm³ na camada 20-40cm');
    }
    
    return gatilhos;
}

// Calcular necessidade de Potássio baseada em % na CTC
// Objetivo: 3% a 5% de K na CTC (T)
function calcularPotassagem(k_cmolc, ctc) {
    if (ctc === 0) return { kPercentAtual: 0, necessidade: 0, kDesejado: 0 };
    
    const kPercentAtual = (k_cmolc / ctc) * 100;
    const kPercentMinimo = 3; // 3% mínimo
    const kPercentDesejado = 4; // Meta: 4% (meio do intervalo 3-5%)
    
    let necessidade = 0;
    if (kPercentAtual < kPercentMinimo) {
        const kDesejado = (ctc * kPercentDesejado) / 100;
        necessidade = kDesejado - k_cmolc;
    }
    
    return {
        kPercentAtual: kPercentAtual,
        necessidade: necessidade, // em cmolc/dm³
        kDesejado: (ctc * kPercentDesejado) / 100
    };
}

// Calcular necessidade de micronutrientes baseado na produtividade
function calcularMicronutrientes(cultura, produtividadeTon) {
    const dadosCultura = getCulturaData(cultura);
    if (!dadosCultura) return null;
    
    return {
        boro: (dadosCultura.boro * produtividadeTon) / 1000, // converter g para kg
        cobre: (dadosCultura.cobre * produtividadeTon) / 1000,
        manganes: (dadosCultura.manganes * produtividadeTon) / 1000,
        zinco: (dadosCultura.zinco * produtividadeTon) / 1000
    };
}

// Exportar funções e constantes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        interpretacaoP,
        fontesFertilizantes,
        converterK_cmolc_para_mg_dm3,
        converterP_mg_dm3_para_kg_ha,
        converterP_mg_dm3_para_P2O5_kg_ha,
        converterK_cmolc_para_K2O_kg_ha,
        calcularV,
        interpretarP,
        calcularNC,
        calcularEquilibrioBases,
        calcularNG,
        verificarGatilhoGessagem,
        calcularPotassagem,
        calcularMicronutrientes
    };
}

