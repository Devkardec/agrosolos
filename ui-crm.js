// Módulo de UI - CRM (Clientes e Talhões)
// Estrutura: Cliente -> Talhão (sem Propriedade)
class CRMUI {
    constructor() {
        this.init();
    }

    init() {
        // Event listeners serão adicionados no render
    }

    // ========== RENDERIZAÇÃO PRINCIPAL ==========
    render() {
        this.renderClientesList();
    }

    // ========== LISTAGEM DE CLIENTES ==========
    renderClientesList() {
        const clientes = db.getClientes();

        const html = `
            <div class="mb-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-users mr-2 text-green-600"></i>Clientes
                    </h2>
                    <button onclick="crm.showClienteForm()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Novo Cliente
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div id="clientesListContent" class="space-y-4">
                    ${this.renderClientesListContent(clientes)}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-crm');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderClientesListContent(clientes) {
        if (clientes.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                    <p class="mb-4">Nenhum cliente cadastrado</p>
                    <button onclick="crm.showClienteForm()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Cadastrar Primeiro Cliente
                    </button>
                </div>
            `;
        }

        return clientes.map(cliente => {
            const talhoes = db.getTalhoes(cliente.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800 text-lg">${cliente.nome}</h4>
                            ${cliente.documento ? `<p class="text-sm text-gray-600"><i class="fas fa-id-card mr-1"></i>${cliente.documento}</p>` : ''}
                            ${cliente.localidade ? `<p class="text-sm text-gray-600"><i class="fas fa-map-marker-alt mr-1"></i>${cliente.localidade}${cliente.estado ? ' - ' + cliente.estado : ''}</p>` : ''}
                            ${cliente.contato ? `<p class="text-sm text-gray-600"><i class="fas fa-phone mr-1"></i>${cliente.contato}</p>` : ''}
                            <p class="text-sm text-gray-500 mt-2">
                                <i class="fas fa-th-large mr-1"></i>${talhoes.length} Talhão(ões) cadastrado(s)
                            </p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="crm.showTalhoesList('${cliente.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
                                <i class="fas fa-th-large mr-2"></i>Talhões
                            </button>
                            <button onclick="crm.showClienteForm('${cliente.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="crm.deleteCliente('${cliente.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== FORMULÁRIO DE CLIENTE ==========
    showClienteForm(clienteId = null) {
        const cliente = clienteId ? db.getCliente(clienteId) : null;
        
        const html = `
            <div class="mb-6">
                <button onclick="crm.render()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${cliente ? 'edit' : 'plus'} mr-2 text-green-600"></i>${cliente ? 'Editar' : 'Novo'} Cliente
                </h2>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <form id="clienteForm" onsubmit="crm.saveCliente(event)">
                    <input type="hidden" id="clienteId" value="${cliente ? cliente.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-user mr-2 text-green-600"></i>Dados do Cliente
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                            <input type="text" id="clienteNome" value="${cliente ? cliente.nome : ''}" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Nome completo ou razão social">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                            <input type="text" id="clienteDocumento" value="${cliente ? cliente.documento || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="000.000.000-00 ou 00.000.000/0000-00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                            <input type="text" id="clienteEndereco" value="${cliente ? cliente.endereco || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Rua, número, bairro">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Localidade/Estado</label>
                            <div class="grid grid-cols-2 gap-2">
                                <input type="text" id="clienteLocalidade" value="${cliente ? cliente.localidade || '' : ''}" 
                                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Cidade">
                                <select id="clienteEstado" 
                                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                    <option value="">Estado</option>
                                    <option value="AC" ${cliente?.estado === 'AC' ? 'selected' : ''}>AC</option>
                                    <option value="AL" ${cliente?.estado === 'AL' ? 'selected' : ''}>AL</option>
                                    <option value="AP" ${cliente?.estado === 'AP' ? 'selected' : ''}>AP</option>
                                    <option value="AM" ${cliente?.estado === 'AM' ? 'selected' : ''}>AM</option>
                                    <option value="BA" ${cliente?.estado === 'BA' ? 'selected' : ''}>BA</option>
                                    <option value="CE" ${cliente?.estado === 'CE' ? 'selected' : ''}>CE</option>
                                    <option value="DF" ${cliente?.estado === 'DF' ? 'selected' : ''}>DF</option>
                                    <option value="ES" ${cliente?.estado === 'ES' ? 'selected' : ''}>ES</option>
                                    <option value="GO" ${cliente?.estado === 'GO' ? 'selected' : ''}>GO</option>
                                    <option value="MA" ${cliente?.estado === 'MA' ? 'selected' : ''}>MA</option>
                                    <option value="MT" ${cliente?.estado === 'MT' ? 'selected' : ''}>MT</option>
                                    <option value="MS" ${cliente?.estado === 'MS' ? 'selected' : ''}>MS</option>
                                    <option value="MG" ${cliente?.estado === 'MG' ? 'selected' : ''}>MG</option>
                                    <option value="PA" ${cliente?.estado === 'PA' ? 'selected' : ''}>PA</option>
                                    <option value="PB" ${cliente?.estado === 'PB' ? 'selected' : ''}>PB</option>
                                    <option value="PR" ${cliente?.estado === 'PR' ? 'selected' : ''}>PR</option>
                                    <option value="PE" ${cliente?.estado === 'PE' ? 'selected' : ''}>PE</option>
                                    <option value="PI" ${cliente?.estado === 'PI' ? 'selected' : ''}>PI</option>
                                    <option value="RJ" ${cliente?.estado === 'RJ' ? 'selected' : ''}>RJ</option>
                                    <option value="RN" ${cliente?.estado === 'RN' ? 'selected' : ''}>RN</option>
                                    <option value="RS" ${cliente?.estado === 'RS' ? 'selected' : ''}>RS</option>
                                    <option value="RO" ${cliente?.estado === 'RO' ? 'selected' : ''}>RO</option>
                                    <option value="RR" ${cliente?.estado === 'RR' ? 'selected' : ''}>RR</option>
                                    <option value="SC" ${cliente?.estado === 'SC' ? 'selected' : ''}>SC</option>
                                    <option value="SP" ${cliente?.estado === 'SP' ? 'selected' : ''}>SP</option>
                                    <option value="SE" ${cliente?.estado === 'SE' ? 'selected' : ''}>SE</option>
                                    <option value="TO" ${cliente?.estado === 'TO' ? 'selected' : ''}>TO</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                            <input type="text" id="clienteContato" value="${cliente ? cliente.contato || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Telefone ou e-mail">
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Cliente
                        </button>
                        <button type="button" onclick="crm.render()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-crm');
        if (container) {
            container.innerHTML = html;
        }
    }

    saveCliente(event) {
        event.preventDefault();
        const id = document.getElementById('clienteId').value;
        const cliente = {
            nome: document.getElementById('clienteNome').value,
            documento: document.getElementById('clienteDocumento').value || null,
            endereco: document.getElementById('clienteEndereco').value || null,
            localidade: document.getElementById('clienteLocalidade').value || null,
            estado: document.getElementById('clienteEstado').value || null,
            contato: document.getElementById('clienteContato').value || null
        };

        if (id) {
            db.updateCliente(id, cliente);
        } else {
            db.addCliente(cliente);
        }

        this.render();
    }

    deleteCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente? Todos os talhões e coletas relacionados serão excluídos.')) {
            db.deleteCliente(id);
            this.render();
        }
    }

    // ========== LISTAGEM DE TALHÕES ==========
    showTalhoesList(clienteId) {
        const cliente = db.getCliente(clienteId);
        const talhoes = db.getTalhoes(clienteId);

        const html = `
            <div class="mb-6">
                <button onclick="crm.render()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar para Clientes
                </button>
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-th-large mr-2 text-green-600"></i>Talhões - ${cliente?.nome || 'Cliente'}
                    </h2>
                    <button onclick="crm.showTalhaoForm('${clienteId}')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
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

        const container = document.getElementById('screen-crm');
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
            const coletas = db.getColetas(talhao.id);
            const analises = db.getAnalises(talhao.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">${talhao.nome}</h4>
                            <p class="text-sm text-gray-600">Cultura Alvo: <strong>${talhao.culturaAlvo ? getCulturaData(talhao.culturaAlvo)?.nome || talhao.culturaAlvo : 'Não informada'}</strong></p>
                            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span><i class="fas fa-map-marked-alt mr-1"></i>${coletas.length} Coleta(s)</span>
                                <span><i class="fas fa-flask mr-1"></i>${analises.length} Análise(s)</span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="navigation.goToAnalise('${talhao.id}')" class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded transition" title="Nova Análise">
                                <i class="fas fa-flask"></i>
                            </button>
                            <button onclick="crm.showTalhaoForm('${talhao.clienteId}', '${talhao.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded transition" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="crm.deleteTalhao('${talhao.id}', '${talhao.clienteId}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== FORMULÁRIO DE TALHÃO ==========
    showTalhaoForm(clienteId, talhaoId = null) {
        const talhao = talhaoId ? db.getTalhao(talhaoId) : null;
        
        const html = `
            <div class="mb-6">
                <button onclick="crm.showTalhoesList('${clienteId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${talhao ? 'edit' : 'plus'} mr-2 text-green-600"></i>${talhao ? 'Editar' : 'Novo'} Talhão
                </h2>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <form id="talhaoForm" onsubmit="crm.saveTalhao(event, '${clienteId}')">
                    <input type="hidden" id="talhaoId" value="${talhao ? talhao.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-th-large mr-2 text-green-600"></i>Dados do Talhão
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Talhão *</label>
                            <input type="text" id="talhaoNome" value="${talhao ? talhao.nome : ''}" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: Talhão Norte, Área 01">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cultura Alvo *</label>
                            <select id="talhaoCulturaAlvo" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione a cultura</option>
                                <option value="soja" ${talhao?.culturaAlvo === 'soja' ? 'selected' : ''}>Soja</option>
                                <option value="milho" ${talhao?.culturaAlvo === 'milho' ? 'selected' : ''}>Milho</option>
                                <option value="algodao" ${talhao?.culturaAlvo === 'algodao' ? 'selected' : ''}>Algodão</option>
                                <option value="feijao" ${talhao?.culturaAlvo === 'feijao' ? 'selected' : ''}>Feijão</option>
                            </select>
                            ${talhao?.culturaAlvo ? `<p class="text-xs text-gray-500 mt-1">Extração: ${getCulturaData(talhao.culturaAlvo)?.p2o5 || 'N/A'} kg P2O5/ton, ${getCulturaData(talhao.culturaAlvo)?.k2o || 'N/A'} kg K2O/ton</p>` : ''}
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Talhão
                        </button>
                        <button type="button" onclick="crm.showTalhoesList('${clienteId}')" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-crm');
        if (container) {
            container.innerHTML = html;
        }
    }

    saveTalhao(event, clienteId) {
        event.preventDefault();
        const id = document.getElementById('talhaoId').value;
        const talhao = {
            clienteId: clienteId,
            nome: document.getElementById('talhaoNome').value,
            culturaAlvo: document.getElementById('talhaoCulturaAlvo').value
        };

        if (id) {
            db.updateTalhao(id, talhao);
        } else {
            db.addTalhao(talhao);
        }

        this.showTalhoesList(clienteId);
    }

    deleteTalhao(id, clienteId) {
        if (confirm('Tem certeza que deseja excluir este talhão? Todas as coletas e análises relacionadas serão excluídas.')) {
            db.deleteTalhao(id);
            this.showTalhoesList(clienteId);
        }
    }
}

// Instância global
window.crm = new CRMUI();

