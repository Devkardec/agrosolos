// Módulo de UI - Talhões
class TalhoesUI {
    constructor() {
        this.init();
    }

    init() {}

    render(propriedadeId, talhaoId = null) {
        if (!propriedadeId) {
            navigation.goToDashboard();
            return;
        }

        if (talhaoId) {
            this.showForm(propriedadeId, talhaoId);
        } else {
            this.renderTalhoesList(propriedadeId);
        }
    }

    renderTalhoesList(propriedadeId) {
        const propriedade = db.getPropriedades().find(p => p.id === propriedadeId);
        const cliente = propriedade ? db.getClientes().find(c => c.id === propriedade.clienteId) : null;
        const talhoes = db.getTalhoes(propriedadeId);

        const html = `
            <div class="mb-6">
                <button onclick="propriedades.render('${propriedade?.clienteId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar para Propriedades
                </button>
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-th-large mr-2 text-green-600"></i>Talhões - ${propriedade?.nome || 'Propriedade'}
                    </h2>
                    <button onclick="talhoes.showForm('${propriedadeId}')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Novo Talhão
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div id="talhoesListContent" class="space-y-4">
                    ${this.renderTalhoesListContent(talhoes)}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-talhoes');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderTalhoesListContent(talhoes) {
        if (talhoes.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-th-large text-4xl mb-4 opacity-50"></i>
                    <p>Nenhum talhão cadastrado</p>
                </div>
            `;
        }

        return talhoes.map(talhao => {
            const amostras = db.getAmostras(talhao.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">${talhao.nome}</h4>
                            <p class="text-sm text-gray-600">Cultura: ${talhao.cultura || 'Não informada'}</p>
                            <p class="text-sm text-gray-500 mt-1">${amostras.length} Amostra(s)</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="talhoes.edit('${talhao.propriedadeId}', '${talhao.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="talhoes.delete('${talhao.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="amostra.render('${talhao.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showForm(propriedadeId, talhaoId = null) {
        const talhao = talhaoId ? db.getTalhoes().find(t => t.id === talhaoId) : null;
        
        const html = `
            <div class="mb-6">
                <button onclick="talhoes.render('${propriedadeId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${talhao ? 'edit' : 'plus'} mr-2 text-green-600"></i>${talhao ? 'Editar' : 'Novo'} Talhão
                </h2>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <form id="talhaoForm" onsubmit="talhoes.save(event, '${propriedadeId}')">
                    <input type="hidden" id="talhaoId" value="${talhao ? talhao.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-th-large mr-2 text-green-600"></i>Dados do Talhão
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Talhão *</label>
                            <input type="text" id="talhaoNome" value="${talhao ? talhao.nome : ''}" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: Talhão 1, Área Norte">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cultura *</label>
                            <select id="talhaoCultura" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione a cultura</option>
                                <option value="soja" ${talhao?.cultura === 'soja' ? 'selected' : ''}>Soja</option>
                                <option value="milho" ${talhao?.cultura === 'milho' ? 'selected' : ''}>Milho</option>
                                <option value="algodao" ${talhao?.cultura === 'algodao' ? 'selected' : ''}>Algodão</option>
                                <option value="feijao" ${talhao?.cultura === 'feijao' ? 'selected' : ''}>Feijão</option>
                            </select>
                            ${talhao?.cultura ? `<p class="text-xs text-gray-500 mt-1">Extração: ${getCulturaData(talhao.cultura)?.p2o5 || 'N/A'} kg P2O5/ton, ${getCulturaData(talhao.cultura)?.k2o || 'N/A'} kg K2O/ton</p>` : ''}
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Área (hectares) *</label>
                            <input type="number" id="talhaoArea" step="0.01" value="${talhao ? talhao.area || '' : ''}" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: 25.5">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sistema de Cultivo</label>
                            <select id="talhaoSistema" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione</option>
                                <option value="convencional" ${talhao?.sistema === 'convencional' ? 'selected' : ''}>Convencional</option>
                                <option value="plantio_direto" ${talhao?.sistema === 'plantio_direto' ? 'selected' : ''}>Plantio Direto</option>
                                <option value="integracao" ${talhao?.sistema === 'integracao' ? 'selected' : ''}>Integração Lavoura-Pecuária</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea id="talhaoObservacoes" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Informações adicionais sobre o talhão...">${talhao ? talhao.observacoes || '' : ''}</textarea>
                    </div>

                    <div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 class="text-sm font-semibold text-blue-800 mb-2">
                            <i class="fas fa-map-marked-alt mr-2"></i>Mapeamento de Coleta
                        </h4>
                        <p class="text-xs text-blue-700 mb-2">Use o GPS para marcar os pontos de coleta de amostras no campo</p>
                        <button type="button" onclick="navigation.goToMapeamento('${talhaoId || propriedadeId}', null, null)" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
                            <i class="fas fa-map-marked-alt mr-2"></i>Iniciar Mapeamento de Coleta
                        </button>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Talhão
                        </button>
                        <button type="button" onclick="talhoes.render('${propriedadeId}')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-talhoes');
        if (container) {
            container.innerHTML = html;
        }
    }

    save(event, propriedadeId) {
        event.preventDefault();
        const id = document.getElementById('talhaoId').value;
        const talhao = {
            propriedadeId: propriedadeId,
            nome: document.getElementById('talhaoNome').value,
            cultura: document.getElementById('talhaoCultura').value,
            area: parseFloat(document.getElementById('talhaoArea').value) || 0,
            sistema: document.getElementById('talhaoSistema').value || null,
            observacoes: document.getElementById('talhaoObservacoes').value || null
        };

        if (id) {
            db.updateTalhao(id, talhao);
        } else {
            db.addTalhao(talhao);
        }

        this.render(propriedadeId);
    }

    edit(propriedadeId, id) {
        this.showForm(propriedadeId, id);
    }

    delete(id) {
        if (confirm('Tem certeza que deseja excluir este talhão? Todas as amostras relacionadas serão excluídas.')) {
            const talhao = db.getTalhoes().find(t => t.id === id);
            db.deleteTalhao(id);
            if (talhao) {
                this.render(talhao.propriedadeId);
            }
        }
    }
}

// Instância global
window.talhoes = new TalhoesUI();

