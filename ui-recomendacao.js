// Módulo de UI - Recomendação Técnica Final
// Gera relatório final de recomendação após análise de solo
class RecomendacaoUI {
    constructor() {
        this.currentAnaliseId = null;
        this.init();
    }

    init() {}

    // ========== GERAR RECOMENDAÇÃO ==========
    async gerarRecomendacao(analiseId) {
        await this.render(analiseId);
    }

    // ========== RENDERIZAR TELA DE RECOMENDAÇÃO ==========
    async render(analiseId) {
        if (!analiseId) {
            alert('Análise não encontrada');
            return;
        }
        
        if (!window.db) {
            console.warn('Database não está pronto ainda');
            setTimeout(() => this.render(analiseId), 200);
            return;
        }

        this.currentAnaliseId = analiseId;
        
        let analise = null;
        let talhao = null;
        let cliente = null;
        
        try {
            const analiseResult = window.db.getAnalise(analiseId);
            analise = analiseResult instanceof Promise ? await analiseResult : analiseResult;
            
            if (!analise) {
                alert('Análise não encontrada');
                return;
            }
            
            const talhaoResult = window.db.getTalhao(analise.talhaoId);
            talhao = talhaoResult instanceof Promise ? await talhaoResult : talhaoResult;
            
            if (talhao) {
                const clienteResult = window.db.getCliente(talhao.clienteId);
                cliente = clienteResult instanceof Promise ? await clienteResult : clienteResult;
            }
        } catch (error) {
            console.error('Erro ao carregar dados da recomendação:', error);
            alert('Erro ao carregar análise.');
            return;
        }

        // Calcular V% atual
        const v1 = calcularV(analise.ca || 0, analise.mg || 0, analise.k || 0, analise.hal || 0);
        
        // Armazenar dados para cálculos
        window.dadosSolo = {
            ph: analise.ph || 0,
            p: analise.p || 0,
            k: analise.k || 0,
            ca: analise.ca || 0,
            mg: analise.mg || 0,
            al: analise.al || 0,
            hal: analise.hal || 0,
            ctc: analise.ctc || 0,
            argila: analise.argila || 0,
            profundidade: analise.profundidade || 20,
            v1: v1
        };

        // Calcular recomendações
        const v2 = 70; // Valor padrão
        const prnt = 100; // Valor padrão
        const nc = calcularNC(v1, v2, analise.ctc || 0, prnt);
        const ng = calcularNG(analise.argila || 0);
        
        // Interpretação de P
        const interpretacaoP = interpretarP(analise.p || 0, analise.argila || 0);
        
        // Correção de P e K
        const correcaoPK = this.calcularCorrecaoPK(analise, talhao);
        
        // Manutenção
        const manutencao = this.calcularManutencao(talhao);

        // Salvar recomendação
        const recomendacao = {
            analiseId: analiseId,
            talhaoId: analise.talhaoId,
            v1: v1,
            v2: v2,
            prnt: prnt,
            nc: nc,
            ng: ng,
            interpretacaoP: interpretacaoP,
            correcaoPK: correcaoPK,
            manutencao: manutencao,
            dadosSolo: window.dadosSolo
        };

        // Salvar recomendação de forma assíncrona
        let recomendacaoSalva = null;
        if (window.db) {
            try {
                recomendacaoSalva = await window.db.addRecomendacao(recomendacao);
            } catch (error) {
                console.error('Erro ao salvar recomendação:', error);
                recomendacaoSalva = recomendacao; // Usar objeto local se falhar
            }
        } else {
            recomendacaoSalva = recomendacao;
        }

        // Renderizar resultados
        this.renderResultados(recomendacaoSalva || recomendacao, analise, talhao, cliente);
    }

    calcularCorrecaoPK(analise, talhao) {
        const culturaData = talhao?.culturaAlvo ? getCulturaData(talhao.culturaAlvo) : null;
        if (!culturaData) return null;

        // Correção de P
        const interpretacaoP = interpretarP(analise.p || 0, analise.argila || 0);
        let p2o5Necessario = 0;
        if (interpretacaoP.necessidade > 0) {
            p2o5Necessario = interpretacaoP.necessidade * 10 * (analise.profundidade === 20 ? 2 : 1);
        }

        // Correção de K (3-5% na CTC)
        const kAtualPercentual = analise.ctc > 0 ? ((analise.k || 0) / analise.ctc) * 100 : 0;
        let k2oNecessario = 0;
        if (kAtualPercentual < 3) {
            const kDesejado = (analise.ctc * 0.03); // 3% da CTC
            const kDiferenca = kDesejado - (analise.k || 0);
            const kMgDm3 = kDiferenca;
            const kMgDm3ParaKgHa = kMgDm3 * 391; // Conversão
            const kKgHa = kMgDm3ParaKgHa * (analise.profundidade === 20 ? 2 : 1);
            k2oNecessario = kKgHa * 1.2; // Conversão para K2O
        }

        return {
            p2o5Necessario: p2o5Necessario,
            k2oNecessario: k2oNecessario,
            interpretacaoP: interpretacaoP
        };
    }

    calcularManutencao(talhao) {
        const culturaData = talhao?.culturaAlvo ? getCulturaData(talhao.culturaAlvo) : null;
        if (!culturaData) return null;

        // Valores padrão (pode ser ajustado com produtividade)
        return {
            p2o5: culturaData.p2o5,
            k2o: culturaData.k2o,
            n: culturaData.n
        };
    }

    // ========== RENDERIZAR RESULTADOS ==========
    renderResultados(recomendacao, analise, talhao, cliente) {
        const html = `
            <div class="mb-6">
                <button onclick="analise.render()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-file-pdf mr-2 text-green-600"></i>Relatório Final de Recomendação
                </h2>
                <p class="text-sm text-gray-600 mt-1">Cliente: ${cliente?.nome || 'N/A'} | Talhão: ${talhao?.nome || 'N/A'}</p>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mb-4">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-cube mr-2 text-green-600"></i>Calagem
                </h3>
                <div class="space-y-2">
                    <p><strong>Necessidade de Calcário:</strong> ${recomendacao.nc.toFixed(2)} t/ha</p>
                    <p><strong>V% Atual:</strong> ${recomendacao.v1.toFixed(2)}%</p>
                    <p><strong>V% Desejado:</strong> ${recomendacao.v2}%</p>
                    <p><strong>PRNT:</strong> ${recomendacao.prnt}%</p>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mb-4">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-mountain mr-2 text-green-600"></i>Gessagem
                </h3>
                <div class="space-y-2">
                    <p><strong>Necessidade de Gesso:</strong> ${recomendacao.ng.toFixed(2)} kg/ha</p>
                </div>
            </div>

            ${recomendacao.correcaoPK ? `
                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-flask mr-2 text-green-600"></i>Correção de Fósforo e Potássio
                    </h3>
                    <div class="space-y-2">
                        <p><strong>Interpretação de P:</strong> ${recomendacao.correcaoPK.interpretacaoP.classificacao}</p>
                        ${recomendacao.correcaoPK.p2o5Necessario > 0 ? `<p><strong>P2O5 Necessário:</strong> ${recomendacao.correcaoPK.p2o5Necessario.toFixed(2)} kg/ha</p>` : '<p>P está adequado</p>'}
                        ${recomendacao.correcaoPK.k2oNecessario > 0 ? `<p><strong>K2O Necessário:</strong> ${recomendacao.correcaoPK.k2oNecessario.toFixed(2)} kg/ha</p>` : '<p>K está adequado</p>'}
                    </div>
                </div>
            ` : ''}

            ${recomendacao.manutencao ? `
                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mb-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-seedling mr-2 text-green-600"></i>Manutenção (Extração da Cultura)
                    </h3>
                    <div class="space-y-2">
                        <p><strong>Cultura:</strong> ${getCulturaData(talhao?.culturaAlvo)?.nome || talhao?.culturaAlvo || 'N/A'}</p>
                        <p><strong>Extração por tonelada:</strong></p>
                        <ul class="list-disc list-inside ml-4">
                            <li>P2O5: ${recomendacao.manutencao.p2o5} kg/ton</li>
                            <li>K2O: ${recomendacao.manutencao.k2o} kg/ton</li>
                            ${recomendacao.manutencao.n ? `<li>N: ${recomendacao.manutencao.n} kg/ton</li>` : ''}
                        </ul>
                    </div>
                </div>
            ` : ''}

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <button onclick="recomendacao.gerarPDF('${recomendacao.id}')" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition text-lg font-semibold">
                    <i class="fas fa-file-pdf mr-2"></i>Gerar Relatório Final em PDF
                </button>
            </div>
        `;

        const container = document.getElementById('screen-recomendacao');
        if (container) {
            container.innerHTML = html;
        }
    }

    // ========== GERAR PDF DO RELATÓRIO FINAL ==========
    async gerarPDF(recomendacaoId) {
        if (!window.db) {
            alert('Banco de dados não está pronto.');
            return;
        }
        
        let recomendacoes = [];
        try {
            const recomendacoesResult = window.db.getRecomendacoes();
            recomendacoes = recomendacoesResult instanceof Promise ? await recomendacoesResult : recomendacoesResult;
        } catch (error) {
            console.error('Erro ao carregar recomendações:', error);
            alert('Erro ao carregar recomendação.');
            return;
        }
        
        const recomendacao = recomendacoes.find(r => r.id === recomendacaoId);
        if (!recomendacao) {
            alert('Recomendação não encontrada');
            return;
        }

        let analise = null;
        let talhao = null;
        let cliente = null;
        let coletas = [];
        
        try {
            const analiseResult = window.db.getAnalise(recomendacao.analiseId);
            analise = analiseResult instanceof Promise ? await analiseResult : analiseResult;
            
            const talhaoResult = window.db.getTalhao(recomendacao.talhaoId);
            talhao = talhaoResult instanceof Promise ? await talhaoResult : talhaoResult;
            
            if (talhao) {
                const clienteResult = window.db.getCliente(talhao.clienteId);
                cliente = clienteResult instanceof Promise ? await clienteResult : clienteResult;
            }
            
            const coletasResult = window.db.getColetas(recomendacao.talhaoId);
            coletas = coletasResult instanceof Promise ? await coletasResult : coletasResult;
        } catch (error) {
            console.error('Erro ao carregar dados para PDF:', error);
            alert('Erro ao gerar PDF. Alguns dados podem estar faltando.');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('RELATÓRIO FINAL DE RECOMENDAÇÃO', 20, 20);
        doc.setFontSize(12);
        doc.text('AgroCultive Soluções Rurais', 20, 30);

        let y = 45;

        // Dados do Cliente e Talhão
        doc.setFontSize(14);
        doc.text('IDENTIFICAÇÃO', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Cliente: ${cliente?.nome || 'N/A'}`, 20, y);
        y += 7;
        doc.text(`Talhão: ${talhao?.nome || 'N/A'}`, 20, y);
        y += 7;
        doc.text(`Cultura Alvo: ${getCulturaData(talhao?.culturaAlvo)?.nome || talhao?.culturaAlvo || 'N/A'}`, 20, y);
        y += 10;

        // Dados da Análise
        doc.setFontSize(14);
        doc.text('RESULTADOS DA ANÁLISE DE SOLO', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`pH: ${analise?.ph || 'N/A'}`, 20, y);
        doc.text(`P: ${analise?.p || 'N/A'} mg/dm³`, 100, y);
        y += 7;
        doc.text(`K: ${analise?.k || 'N/A'} cmolc/dm³`, 20, y);
        doc.text(`Ca: ${analise?.ca || 'N/A'} cmolc/dm³`, 100, y);
        y += 7;
        doc.text(`Mg: ${analise?.mg || 'N/A'} cmolc/dm³`, 20, y);
        doc.text(`Al: ${analise?.al || 'N/A'} cmolc/dm³`, 100, y);
        y += 7;
        doc.text(`H+Al: ${analise?.hal || 'N/A'} cmolc/dm³`, 20, y);
        doc.text(`CTC: ${analise?.ctc || 'N/A'} cmolc/dm³`, 100, y);
        y += 7;
        doc.text(`% Argila: ${analise?.argila || 'N/A'}`, 20, y);
        doc.text(`V%: ${recomendacao.v1.toFixed(2)}%`, 100, y);
        y += 10;

        // Recomendações
        doc.setFontSize(14);
        doc.text('RECOMENDAÇÕES TÉCNICAS', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Calagem: ${recomendacao.nc.toFixed(2)} t/ha de calcário (PRNT ${recomendacao.prnt}%)`, 20, y);
        y += 7;
        doc.text(`Gessagem: ${recomendacao.ng.toFixed(2)} kg/ha de gesso`, 20, y);
        y += 7;
        
        if (recomendacao.correcaoPK) {
            if (recomendacao.correcaoPK.p2o5Necessario > 0) {
                doc.text(`Correção de Fósforo: ${recomendacao.correcaoPK.p2o5Necessario.toFixed(2)} kg/ha de P2O5`, 20, y);
                y += 7;
            }
            if (recomendacao.correcaoPK.k2oNecessario > 0) {
                doc.text(`Correção de Potássio: ${recomendacao.correcaoPK.k2oNecessario.toFixed(2)} kg/ha de K2O`, 20, y);
                y += 7;
            }
        }

        // Coordenadas de coleta (se houver)
        if (coletas.length > 0 && coletas[0].subamostras && coletas[0].subamostras.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.text('COORDENADAS DE COLETA', 20, y);
            y += 10;
            doc.setFontSize(9);
            coletas[0].subamostras.forEach((sub, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`Subamostra ${index + 1}: Lat ${sub.latitude.toFixed(6)}, Lng ${sub.longitude.toFixed(6)}`, 20, y);
                y += 6;
            });
        }

        // Rodapé
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(8);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, y);

        // Salvar
        const nomeArquivo = `Relatorio_Recomendacao_${cliente?.nome?.replace(/\s+/g, '_') || 'Cliente'}_${talhao?.nome?.replace(/\s+/g, '_') || 'Talhao'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
    }
}

// Instância global
window.recomendacao = new RecomendacaoUI();
