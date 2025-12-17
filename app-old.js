// Banco de dados de culturas (Extração e Exportação por tonelada) - Valores do Manual Técnico
const culturasDB = {
    soja: {
        nome: 'Soja',
        p2o5: 15.6,  // kg de P2O5 por tonelada
        k2o: 58.1,   // kg de K2O por tonelada
        n: 80.0,
        ca: 8.0,
        mg: 4.0,
        s: 3.0
    },
    milho: {
        nome: 'Milho',
        p2o5: 5.8,   // kg de P2O5 por tonelada
        k2o: 18.8,   // kg de K2O por tonelada
        n: 25.0,
        ca: 2.0,
        mg: 2.0,
        s: 2.0
    },
    algodao: {
        nome: 'Algodão',
        p2o5: 9.0,   // kg de P2O5 por tonelada
        k2o: 82.0,   // kg de K2O por tonelada
        n: 45.0,
        ca: 15.0,
        mg: 8.0,
        s: 5.0
    },
    feijao: {
        nome: 'Feijão',
        p2o5: 3.6,   // kg de P2O5 por tonelada
        k2o: 16.4,   // kg de K2O por tonelada
        n: 40.0,
        ca: 3.0,
        mg: 2.0,
        s: 2.0
    }
};

// Tabela de interpretação de P por teor de argila (16-35%)
// Muito Baixo (0-5), Baixo (5.1-10), Médio (10.1-15), Adequado (15.1-20), Alto (>20)
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
// Muito Baixo (0-5), Baixo (5.1-10), Médio (10.1-15), Adequado (15.1-20), Alto (>20)
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

// Função principal de cálculo
function calcularRecomendacoes() {
    // Obter valores do formulário
    const ph = parseFloat(document.getElementById('ph').value) || 0;
    const p = parseFloat(document.getElementById('p').value) || 0;
    const k = parseFloat(document.getElementById('k').value) || 0;
    const ca = parseFloat(document.getElementById('ca').value) || 0;
    const mg = parseFloat(document.getElementById('mg').value) || 0;
    const al = parseFloat(document.getElementById('al').value) || 0;
    const hal = parseFloat(document.getElementById('hal').value) || 0;
    const ctc = parseFloat(document.getElementById('ctc').value) || 0;
    const argila = parseFloat(document.getElementById('argila').value) || 0;
    const profundidade = parseInt(document.getElementById('profundidade').value) || 20;
    
    // Obter região/boletim
    const regiao = document.getElementById('regiao').value;
    
    // Calcular V% atual
    const v1 = calcularV(ca, mg, k, hal);
    document.getElementById('v').value = v1.toFixed(2);
    
    // Armazenar dados para uso posterior
    window.dadosSolo = {
        ph, p, k, ca, mg, al, hal, ctc, argila, profundidade, v1, regiao
    };
    
    // Calcular e exibir resultados
    calcularCalagem();
    calcularGessagem();
    calcularCorrecaoPK();
}

// Calcular Calagem
function calcularCalagem() {
    if (!window.dadosSolo) return;
    
    const { v1, ctc, ca, mg, k, regiao } = window.dadosSolo;
    
    // Se Boletim 100 selecionado, usar V2 = 70%
    let v2 = parseFloat(document.getElementById('v2').value) || 70;
    if (regiao === 'boletim100') {
        v2 = 70;
        document.getElementById('v2').value = 70;
    }
    
    const prnt = parseFloat(document.getElementById('prnt').value) || 100;
    const equilibrioBases = document.getElementById('equilibrioBases').checked;
    
    // NC (t/ha) = ((V2 - V1) * CTC) / (PRNT/100)
    const nc = calcularNC(v1, v2, ctc, prnt);
    
    let html = `
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md">
            <h4 class="font-bold text-green-800 mb-2">Necessidade de Calcário (NC)</h4>
            <p class="text-gray-700"><strong>NC = ((V2 - V1) × CTC) / (PRNT/100)</strong></p>
            <p class="text-gray-700">NC = ((${v2} - ${v1.toFixed(2)}) × ${ctc}) / (${prnt}/100)</p>
            <p class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">${nc.toFixed(2)} t/ha</p>
            ${regiao === 'boletim100' ? '<p class="text-xs text-gray-500 mt-1">V2 = 70% (Boletim 100)</p>' : ''}
        </div>
    `;
    
    if (equilibrioBases) {
        const caPercent = parseFloat(document.getElementById('caPercent').value) || 50;
        const mgPercent = parseFloat(document.getElementById('mgPercent').value) || 15;
        const kPercent = parseFloat(document.getElementById('kPercent').value) || 4;
        
        const equilibrio = calcularEquilibrioBases(ctc, caPercent, mgPercent, kPercent);
        
        html += `
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md mt-4">
                <h4 class="font-bold text-blue-800 mb-2">Equilíbrio de Bases na CTC</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Ca desejado (${caPercent}%):</p>
                        <p class="text-lg font-bold text-blue-700">${equilibrio.caDesejado.toFixed(2)} cmolc/dm³</p>
                        <p class="text-xs text-gray-500">Atual: ${ca.toFixed(2)} cmolc/dm³</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Mg desejado (${mgPercent}%):</p>
                        <p class="text-lg font-bold text-blue-700">${equilibrio.mgDesejado.toFixed(2)} cmolc/dm³</p>
                        <p class="text-xs text-gray-500">Atual: ${mg.toFixed(2)} cmolc/dm³</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">K desejado (${kPercent}%):</p>
                        <p class="text-lg font-bold text-blue-700">${equilibrio.kDesejado.toFixed(2)} cmolc/dm³</p>
                        <p class="text-xs text-gray-500">Atual: ${k.toFixed(2)} cmolc/dm³</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('resultadoCalagem').innerHTML = html;
}

// Calcular Gessagem
function calcularGessagem() {
    if (!window.dadosSolo) return;
    
    const { al, ca, mg, k, hal, argila, profundidade } = window.dadosSolo;
    const gatilhos = verificarGatilhoGessagem(al, ca, mg, k, hal, profundidade);
    const ng = calcularNG(argila);
    
    let html = '';
    
    if (gatilhos.length > 0) {
        html = `
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md mb-4">
                <h4 class="font-bold text-yellow-800 mb-2">Gatilhos para Gessagem Detectados:</h4>
                <ul class="list-disc list-inside text-gray-700">
                    ${gatilhos.map(g => `<li>${g}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        html = `
            <div class="bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400 p-4 rounded-lg shadow-md mb-4">
                <p class="text-gray-700">Nenhum gatilho para gessagem detectado.</p>
                <p class="text-sm text-gray-500 mt-1">Gatilhos: Al > 20% ou Ca < 1 cmolc/dm³ (20-40cm)</p>
            </div>
        `;
    }
    
    html += `
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md">
            <h4 class="font-bold text-green-800 mb-2">Necessidade de Gesso (NG)</h4>
            <p class="text-gray-700"><strong>NG = 50 × % de Argila</strong></p>
            <p class="text-gray-700">NG = 50 × ${argila}</p>
            <p class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">${ng.toFixed(2)} kg/ha</p>
            <p class="text-sm text-gray-500 mt-2">Para culturas anuais</p>
        </div>
    `;
    
    document.getElementById('resultadoGessagem').innerHTML = html;
}

// Calcular Correção de P e K
function calcularCorrecaoPK() {
    if (!window.dadosSolo) return;
    
    const { p, k, argila, profundidade, ctc } = window.dadosSolo;
    const interpretacaoP_result = interpretarP(p, argila);
    
    // Calcular necessidade de P (fator: 1 mg/dm³ de P = 10 kg/ha de P2O5)
    const p2o5_necessario = interpretacaoP_result.necessidade > 0 
        ? interpretacaoP_result.necessidade * 10 * (profundidade === 20 ? 2 : 1)
        : 0;
    
    // Calcular necessidade de K baseada em % na CTC
    const potassagem = calcularPotassagem(k, ctc);
    
    // Converter necessidade de K (cmolc/dm³) para K2O (kg/ha)
    // 1 cmolc/dm³ de K = 391 mg/dm³, depois converter para kg/ha e multiplicar por 1.2 para K2O
    let k2o_necessario = 0;
    if (potassagem.necessidade > 0) {
        const k_mg_dm3 = potassagem.necessidade * 391;
        const k_kg_ha = k_mg_dm3 * (profundidade === 20 ? 2 : 1);
        k2o_necessario = k_kg_ha * 1.2; // Transformar K em K2O
    }
    
    // Obter fonte selecionada
    const fonteP = document.getElementById('fonteP').value;
    const fonteK = document.getElementById('fonteK').value;
    const garantiaP = fontesFertilizantes.p[fonteP].garantia;
    const garantiaK = fontesFertilizantes.k[fonteK].garantia;
    
    // Calcular dose de adubo comercial
    const doseP = p2o5_necessario > 0 ? (p2o5_necessario / garantiaP) * 100 : 0;
    const doseK = k2o_necessario > 0 ? (k2o_necessario / garantiaK) * 100 : 0;
    
    let html = `
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md mb-4">
            <h4 class="font-bold text-blue-800 mb-2">Interpretação de Fósforo</h4>
            <p class="text-gray-700"><strong>P no solo:</strong> ${p.toFixed(2)} mg/dm³</p>
            <p class="text-gray-700"><strong>% Argila:</strong> ${argila.toFixed(1)}%</p>
            ${argila >= 16 && argila <= 35 
                ? `<p class="text-gray-700"><strong>Interpretação:</strong> <span class="font-bold">${interpretacaoP_result.interpretacao}</span></p>`
                : '<p class="text-yellow-700"><strong>Atenção:</strong> Interpretação válida apenas para argila entre 16-35%</p>'
            }
            ${interpretacaoP_result.necessidade > 0 
                ? `<p class="text-gray-700"><strong>Necessidade:</strong> ${interpretacaoP_result.necessidade.toFixed(2)} mg/dm³ (para atingir nível adequado)</p>`
                : '<p class="text-green-700">Nível adequado de fósforo (≥15.1 mg/dm³)</p>'
            }
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md">
                <h4 class="font-bold text-green-800 mb-2">Fósforo (P2O5)</h4>
                ${p2o5_necessario > 0 
                    ? `
                        <p class="text-sm text-gray-600">Necessidade: ${p2o5_necessario.toFixed(2)} kg/ha de P2O5</p>
                        <p class="text-sm text-gray-600">Fonte: ${fontesFertilizantes.p[fonteP].nome} (${garantiaP}% P2O5)</p>
                        <p class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">${doseP.toFixed(2)} kg/ha</p>
                    `
                    : '<p class="text-green-700 mt-2">Nível adequado - não há necessidade de correção</p>'
                }
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-lg shadow-md">
                <h4 class="font-bold text-purple-800 mb-2">Potássio (K2O)</h4>
                <p class="text-sm text-gray-600">K atual na CTC: ${potassagem.kPercentAtual.toFixed(2)}%</p>
                <p class="text-sm text-gray-600">Meta: 3-5% na CTC</p>
                ${potassagem.necessidade > 0 
                    ? `
                        <p class="text-sm text-gray-600">Necessidade: ${k2o_necessario.toFixed(2)} kg/ha de K2O</p>
                        <p class="text-sm text-gray-600">Fonte: ${fontesFertilizantes.k[fonteK].nome} (${garantiaK}% K2O)</p>
                        <p class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">${doseK.toFixed(2)} kg/ha</p>
                    `
                    : '<p class="text-green-700 mt-2">K já está adequado (≥3% na CTC)</p>'
                }
            </div>
        </div>
    `;
    
    document.getElementById('resultadoCorrecao').innerHTML = html;
}

// Calcular Manutenção por Cultura
function calcularManutencao() {
    if (!window.dadosSolo) return;
    
    const cultura = document.getElementById('cultura').value;
    const produtividadeSacas = parseFloat(document.getElementById('produtividadeSacas').value) || 0;
    
    if (!cultura || produtividadeSacas === 0) {
        document.getElementById('resultadoManutencao').innerHTML = 
            '<p class="text-gray-500">Selecione a cultura e informe a meta de produtividade em sacas/ha.</p>';
        return;
    }
    
    // Converter sacas para toneladas: Sacas * 0.06
    const produtividadeTon = produtividadeSacas * 0.06;
    
    const dadosCultura = culturasDB[cultura];
    const p2o5_necessario = dadosCultura.p2o5 * produtividadeTon;
    const k2o_necessario = dadosCultura.k2o * produtividadeTon;
    
    // Obter fonte selecionada
    const fonteP = document.getElementById('fonteP').value;
    const fonteK = document.getElementById('fonteK').value;
    const garantiaP = fontesFertilizantes.p[fonteP].garantia;
    const garantiaK = fontesFertilizantes.k[fonteK].garantia;
    
    const doseP = (p2o5_necessario / garantiaP) * 100;
    const doseK = (k2o_necessario / garantiaK) * 100;
    
    let html = `
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-md mb-4">
            <h4 class="font-bold text-indigo-800 mb-2">Extração e Exportação - ${dadosCultura.nome}</h4>
            <p class="text-gray-700"><strong>Meta de Produtividade:</strong> ${produtividadeSacas.toFixed(1)} sacas/ha (${produtividadeTon.toFixed(2)} ton/ha)</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                    <p class="text-sm text-gray-600">P2O5: ${dadosCultura.p2o5} kg/ton</p>
                    <p class="text-sm text-gray-600">K2O: ${dadosCultura.k2o} kg/ton</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">N: ${dadosCultura.n} kg/ton</p>
                    <p class="text-sm text-gray-600">Ca: ${dadosCultura.ca} kg/ton</p>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md">
                <h4 class="font-bold text-green-800 mb-2">Adubação de Manutenção - P2O5</h4>
                <p class="text-sm text-gray-600">Necessidade: ${p2o5_necessario.toFixed(2)} kg/ha</p>
                <p class="text-sm text-gray-600">Fonte: ${fontesFertilizantes.p[fonteP].nome}</p>
                <p class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">${doseP.toFixed(2)} kg/ha</p>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-lg shadow-md">
                <h4 class="font-bold text-purple-800 mb-2">Adubação de Manutenção - K2O</h4>
                <p class="text-sm text-gray-600">Necessidade: ${k2o_necessario.toFixed(2)} kg/ha</p>
                <p class="text-sm text-gray-600">Fonte: ${fontesFertilizantes.k[fonteK].nome}</p>
                <p class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">${doseK.toFixed(2)} kg/ha</p>
            </div>
        </div>
    `;
    
    document.getElementById('resultadoManutencao').innerHTML = html;
}

// Sistema de abas
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover active de todos
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'border-green-600', 'text-gray-700');
                btn.classList.add('text-gray-500');
            });
            
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Ativar aba selecionada
            button.classList.add('active', 'border-green-600', 'text-gray-700');
            button.classList.remove('text-gray-500');
            document.getElementById(`tab-${targetTab}`).classList.remove('hidden');
            
            // Recalcular se necessário
            if (window.dadosSolo) {
                if (targetTab === 'manutencao') {
                    calcularManutencao();
                }
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    
    // Calcular ao clicar no botão
    document.getElementById('calcularBtn').addEventListener('click', calcularRecomendacoes);
    
    // Recalcular calagem quando mudar parâmetros
    document.getElementById('v2').addEventListener('input', calcularCalagem);
    document.getElementById('prnt').addEventListener('input', calcularCalagem);
    document.getElementById('equilibrioBases').addEventListener('change', (e) => {
        document.getElementById('equilibrioConfig').classList.toggle('hidden', !e.target.checked);
        calcularCalagem();
    });
    document.getElementById('caPercent').addEventListener('input', calcularCalagem);
    document.getElementById('mgPercent').addEventListener('input', calcularCalagem);
    document.getElementById('kPercent').addEventListener('input', calcularCalagem);
    
    // Recalcular correção quando mudar fonte
    document.getElementById('fonteP').addEventListener('change', calcularCorrecaoPK);
    document.getElementById('fonteK').addEventListener('change', calcularCorrecaoPK);
    
    // Calcular manutenção
    document.getElementById('cultura').addEventListener('change', calcularManutencao);
    document.getElementById('produtividadeSacas').addEventListener('input', (e) => {
        const sacas = parseFloat(e.target.value) || 0;
        const toneladas = sacas * 0.06;
        document.getElementById('produtividadeConvertida').textContent = `Toneladas: ${toneladas.toFixed(2)} ton/ha`;
        calcularManutencao();
    });
    
    // Atualizar V2 quando selecionar Boletim 100
    document.getElementById('regiao').addEventListener('change', (e) => {
        if (e.target.value === 'boletim100') {
            document.getElementById('v2').value = 70;
            if (window.dadosSolo) {
                calcularCalagem();
            }
        }
    });
    
    // Exportar PDF
    document.getElementById('exportPdfBtn').addEventListener('click', exportarPDF);
});

// Exportar para PDF
function exportarPDF() {
    if (!window.dadosSolo) {
        alert('Por favor, calcule as recomendações primeiro.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Recomendação de Adubação e Calagem', 20, 20);
    doc.setFontSize(12);
    doc.text('AgroCultive Soluções Rurais', 20, 30);
    
    let y = 45;
    
    // Dados da análise
    doc.setFontSize(14);
    doc.text('Dados da Análise de Solo', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    const dados = window.dadosSolo;
    doc.text(`pH: ${dados.ph || 'N/A'}`, 20, y);
    doc.text(`P: ${dados.p || 'N/A'} mg/dm³`, 100, y);
    y += 7;
    doc.text(`K: ${dados.k || 'N/A'} cmolc/dm³`, 20, y);
    doc.text(`Ca: ${dados.ca || 'N/A'} cmolc/dm³`, 100, y);
    y += 7;
    doc.text(`Mg: ${dados.mg || 'N/A'} cmolc/dm³`, 20, y);
    doc.text(`Al: ${dados.al || 'N/A'} cmolc/dm³`, 100, y);
    y += 7;
    doc.text(`H+Al: ${dados.hal || 'N/A'} cmolc/dm³`, 20, y);
    doc.text(`CTC: ${dados.ctc || 'N/A'} cmolc/dm³`, 100, y);
    y += 7;
    doc.text(`% Argila: ${dados.argila || 'N/A'}`, 20, y);
    doc.text(`V%: ${dados.v1.toFixed(2)}`, 100, y);
    y += 15;
    
    // Calagem
    const v2 = parseFloat(document.getElementById('v2').value) || 70;
    const prnt = parseFloat(document.getElementById('prnt').value) || 100;
    const nc = calcularNC(dados.v1, v2, dados.ctc, prnt);
    
    doc.setFontSize(14);
    doc.text('Recomendação de Calagem', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Necessidade de Calcário: ${nc.toFixed(2)} t/ha`, 20, y);
    y += 10;
    
    // Gessagem
    const ng = calcularNG(dados.argila);
    doc.setFontSize(14);
    doc.text('Recomendação de Gessagem', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Necessidade de Gesso: ${ng.toFixed(2)} kg/ha`, 20, y);
    y += 10;
    
    // Rodapé
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
    
    // Salvar
    doc.save('recomendacao-agrocultive.pdf');
}

