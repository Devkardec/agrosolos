// Módulo de UI - Propriedades
class PropriedadesUI {
    constructor() {
        this.init();
    }

    init() {}

    render(clienteId, propriedadeId = null) {
        if (!clienteId) {
            navigation.goToClientes();
            return;
        }

        if (propriedadeId) {
            this.renderPropriedadeForm(clienteId, propriedadeId);
        } else {
            this.renderPropriedadesList(clienteId);
        }
    }

    renderPropriedadesList(clienteId) {
        const cliente = db.getClientes().find(c => c.id === clienteId);
        const propriedades = db.getPropriedades(clienteId);

        const html = `
            <div class="mb-6">
                <button onclick="navigation.goToClientes()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar para Clientes
                </button>
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-map-marked-alt mr-2 text-green-600"></i>Propriedades - ${cliente?.nome || 'Cliente'}
                    </h2>
                    <button onclick="propriedades.showForm('${clienteId}')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Nova Propriedade
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div id="propriedadesListContent" class="space-y-4">
                    ${this.renderPropriedadesListContent(propriedades)}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-propriedades');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderPropriedadesListContent(propriedades) {
        if (propriedades.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-map-marked-alt text-4xl mb-4 opacity-50"></i>
                    <p>Nenhuma propriedade cadastrada</p>
                </div>
            `;
        }

        return propriedades.map(prop => {
            const talhoes = db.getTalhoes(prop.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">${prop.nome}</h4>
                            ${prop.area ? `<p class="text-sm text-gray-600"><i class="fas fa-ruler-combined mr-1"></i>${prop.area} ha</p>` : ''}
                            <p class="text-sm text-gray-600">${prop.endereco || prop.cidade || 'Localização não informada'}</p>
                            ${prop.cidade ? `<p class="text-sm text-gray-500">${prop.cidade}${prop.cep ? ' - CEP: ' + prop.cep : ''}</p>` : ''}
                            <p class="text-sm text-gray-500 mt-1">${talhoes.length} Talhão(ões)</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="propriedades.edit('${prop.clienteId}', '${prop.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="propriedades.delete('${prop.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="talhoes.render('${prop.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showForm(clienteId, propriedadeId = null) {
        const propriedade = propriedadeId ? db.getPropriedades().find(p => p.id === propriedadeId) : null;
        
        const html = `
            <div class="mb-6">
                <button onclick="propriedades.render('${clienteId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${propriedade ? 'edit' : 'plus'} mr-2 text-green-600"></i>${propriedade ? 'Editar' : 'Nova'} Propriedade
                </h2>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <form id="propriedadeForm" onsubmit="propriedades.save(event, '${clienteId}')">
                    <input type="hidden" id="propriedadeId" value="${propriedade ? propriedade.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-map-marked-alt mr-2 text-green-600"></i>Dados da Propriedade
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Propriedade *</label>
                            <input type="text" id="propriedadeNome" value="${propriedade ? propriedade.nome : ''}" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: Fazenda São João">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Área Total (hectares)</label>
                            <input type="number" id="propriedadeArea" step="0.01" value="${propriedade ? propriedade.area || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: 150.5">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                        <input type="text" id="propriedadeEndereco" value="${propriedade ? propriedade.endereco || '' : ''}" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Rua, número, bairro, cidade">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input type="text" id="propriedadeCidade" value="${propriedade ? propriedade.cidade || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Cidade">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                            <input type="text" id="propriedadeCEP" value="${propriedade ? propriedade.cep || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="00000-000">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea id="propriedadeObservacoes" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Informações adicionais sobre a propriedade...">${propriedade ? propriedade.observacoes || '' : ''}</textarea>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Propriedade
                        </button>
                        <button type="button" onclick="propriedades.render('${clienteId}')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-propriedades');
        if (container) {
            container.innerHTML = html;
        }
    }

    save(event, clienteId) {
        event.preventDefault();
        const id = document.getElementById('propriedadeId').value;
        const propriedade = {
            clienteId: clienteId,
            nome: document.getElementById('propriedadeNome').value,
            area: parseFloat(document.getElementById('propriedadeArea').value) || null,
            endereco: document.getElementById('propriedadeEndereco').value || null,
            cidade: document.getElementById('propriedadeCidade').value || null,
            cep: document.getElementById('propriedadeCEP').value || null,
            observacoes: document.getElementById('propriedadeObservacoes').value || null
        };

        if (id) {
            db.updatePropriedade(id, propriedade);
        } else {
            db.addPropriedade(propriedade);
        }

        this.render(clienteId);
    }

    edit(clienteId, id) {
        this.showForm(clienteId, id);
    }

    delete(id) {
        if (confirm('Tem certeza que deseja excluir esta propriedade? Todos os talhões relacionados serão excluídos.')) {
            const propriedade = db.getPropriedades().find(p => p.id === id);
            db.deletePropriedade(id);
            if (propriedade) {
                this.render(propriedade.clienteId);
            }
        }
    }
}

// Instância global
window.propriedades = new PropriedadesUI();

