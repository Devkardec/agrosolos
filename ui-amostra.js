// Módulo de UI - Amostra de Solo
class AmostraUI {
    constructor() {
        this.init();
    }

    init() {}

    render(talhaoId, amostraId = null) {
        if (!talhaoId) {
            navigation.goToDashboard();
            return;
        }

        if (amostraId) {
            this.renderAmostraForm(talhaoId, amostraId);
        } else {
            this.renderAmostrasList(talhaoId);
        }
    }

    renderAmostrasList(talhaoId) {
        const talhao = db.getTalhoes().find(t => t.id === talhaoId);
        const propriedade = talhao ? db.getPropriedades().find(p => p.id === talhao.propriedadeId) : null;
        const amostras = db.getAmostras(talhaoId);

        const html = `
            <div class="mb-6">
                <button onclick="talhoes.render('${talhao?.propriedadeId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar para Talhões
                </button>
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-flask mr-2 text-green-600"></i>Amostras - ${talhao?.nome || 'Talhão'}
                    </h2>
                    <button onclick="amostra.showForm('${talhaoId}')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Nova Amostra
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div id="amostrasListContent" class="space-y-4">
                    ${this.renderAmostrasListContent(amostras)}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-amostra');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderAmostrasListContent(amostras) {
        if (amostras.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-flask text-4xl mb-4 opacity-50"></i>
                    <p>Nenhuma amostra cadastrada</p>
                </div>
            `;
        }

        return amostras.map(amostra => {
            const recomendacoes = db.getRecomendacoes(amostra.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">Amostra - ${new Date(amostra.createdAt).toLocaleDateString('pt-BR')}</h4>
                            <p class="text-sm text-gray-600">pH: ${amostra.ph || 'N/A'} | P: ${amostra.p || 'N/A'} mg/dm³</p>
                            <p class="text-sm text-gray-500 mt-1">${recomendacoes.length} Recomendação(ões)</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="amostra.edit('${amostra.talhaoId}', '${amostra.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="amostra.delete('${amostra.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="navigation.goToMapeamento('${amostra.talhaoId}', null, '${amostra.id}')" class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded transition" title="Ver/Editar Mapeamento">
                                <i class="fas fa-map-marked-alt"></i>
                            </button>
                            <button onclick="recomendacao.render('${amostra.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-calculator"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showForm(talhaoId, amostraId = null) {
        const amostra = amostraId ? db.getAmostras().find(a => a.id === amostraId) : null;
        const talhao = db.getTalhoes().find(t => t.id === talhaoId);
        const propriedade = talhao ? db.getPropriedades().find(p => p.id === talhao.propriedadeId) : null;
        const cliente = propriedade ? db.getClientes().find(c => c.id === propriedade.clienteId) : null;
        
        // Carregar dados da cultura do talhão
        const culturaData = talhao?.cultura ? getCulturaData(talhao.cultura) : null;
        
        const html = `
            <div class="mb-6">
                <button onclick="amostra.render('${talhaoId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${amostra ? 'edit' : 'plus'} mr-2 text-green-600"></i>${amostra ? 'Editar' : 'Nova'} Amostra de Solo
                </h2>
                ${cliente ? `<p class="text-sm text-gray-600 mt-1">Região: ${cliente.regiao || 'Não informada'}</p>` : ''}
                ${culturaData ? `<p class="text-sm text-gray-600">Cultura: ${culturaData.nome}</p>` : ''}
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <form id="amostraForm" onsubmit="amostra.save(event, '${talhaoId}')">
                    <input type="hidden" id="amostraId" value="${amostra ? amostra.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Dados da Análise de Solo</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">pH (água)</label>
                            <input type="number" id="amostraPh" step="0.1" value="${amostra ? amostra.ph || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">P (mg/dm³)</label>
                            <input type="number" id="amostraP" step="0.1" value="${amostra ? amostra.p || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">K (cmolc/dm³)</label>
                            <input type="number" id="amostraK" step="0.01" value="${amostra ? amostra.k || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ca (cmolc/dm³)</label>
                            <input type="number" id="amostraCa" step="0.01" value="${amostra ? amostra.ca || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mg (cmolc/dm³)</label>
                            <input type="number" id="amostraMg" step="0.01" value="${amostra ? amostra.mg || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Al (cmolc/dm³)</label>
                            <input type="number" id="amostraAl" step="0.01" value="${amostra ? amostra.al || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">H+Al (cmolc/dm³)</label>
                            <input type="number" id="amostraHal" step="0.01" value="${amostra ? amostra.hal || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CTC (T) (cmolc/dm³)</label>
                            <input type="number" id="amostraCtc" step="0.01" value="${amostra ? amostra.ctc || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">% de Argila</label>
                            <input type="number" id="amostraArgila" step="0.1" value="${amostra ? amostra.argila || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Profundidade (cm)</label>
                            <select id="amostraProfundidade" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="20" ${amostra?.profundidade === 20 ? 'selected' : ''}>0-20 cm</option>
                                <option value="40" ${amostra?.profundidade === 40 ? 'selected' : ''}>20-40 cm</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Amostra
                        </button>
                        <button type="button" onclick="amostra.render('${talhaoId}')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-amostra');
        if (container) {
            container.innerHTML = html;
        }
    }

    save(event, talhaoId) {
        event.preventDefault();
        const id = document.getElementById('amostraId').value;
        const amostra = {
            talhaoId: talhaoId,
            ph: parseFloat(document.getElementById('amostraPh').value) || null,
            p: parseFloat(document.getElementById('amostraP').value) || null,
            k: parseFloat(document.getElementById('amostraK').value) || null,
            ca: parseFloat(document.getElementById('amostraCa').value) || null,
            mg: parseFloat(document.getElementById('amostraMg').value) || null,
            al: parseFloat(document.getElementById('amostraAl').value) || null,
            hal: parseFloat(document.getElementById('amostraHal').value) || null,
            ctc: parseFloat(document.getElementById('amostraCtc').value) || null,
            argila: parseFloat(document.getElementById('amostraArgila').value) || null,
            profundidade: parseInt(document.getElementById('amostraProfundidade').value) || 20
        };

        let amostraSalva;
        if (id) {
            amostraSalva = db.updateAmostra(id, amostra);
        } else {
            amostraSalva = db.addAmostra(amostra);
            
            // Vincular coleta temporária se houver
            if (window.coletaTemporariaId) {
                const coleta = db.getColetas().find(c => c.id === window.coletaTemporariaId);
                if (coleta) {
                    db.updateColeta(window.coletaTemporariaId, { amostraId: amostraSalva.id });
                    delete window.coletaTemporariaId;
                }
            }
        }

        this.render(talhaoId);
    }

    edit(talhaoId, id) {
        this.showForm(talhaoId, id);
    }

    delete(id) {
        if (confirm('Tem certeza que deseja excluir esta amostra? Todas as recomendações relacionadas serão excluídas.')) {
            const amostra = db.getAmostras().find(a => a.id === id);
            db.deleteAmostra(id);
            if (amostra) {
                this.render(amostra.talhaoId);
            }
        }
    }
}

// Instância global
window.amostra = new AmostraUI();

