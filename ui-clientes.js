// Módulo de UI - Clientes
class ClientesUI {
    constructor() {
        this.init();
    }

    init() {
        // Event listeners serão adicionados no render
    }

    render(clienteId = null) {
        if (clienteId) {
            this.showForm(clienteId);
        } else {
            this.renderClientesList();
        }
    }

    renderClientesList() {
        const clientes = db.getClientes();

        const html = `
            <div class="mb-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-users mr-2 text-green-600"></i>Clientes
                    </h2>
                    <button onclick="clientes.showForm()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
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

        const container = document.getElementById('screen-clientes');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderClientesListContent(clientes) {
        if (clientes.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                    <p>Nenhum cliente cadastrado</p>
                </div>
            `;
        }

        return clientes.map(cliente => {
            const propriedades = db.getPropriedades(cliente.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">${cliente.nome}</h4>
                            <p class="text-sm text-gray-600">${cliente.regiao || 'Região não informada'}</p>
                            ${cliente.telefone ? `<p class="text-sm text-gray-500"><i class="fas fa-phone mr-1"></i>${cliente.telefone}</p>` : ''}
                            ${cliente.email ? `<p class="text-sm text-gray-500"><i class="fas fa-envelope mr-1"></i>${cliente.email}</p>` : ''}
                            <p class="text-sm text-gray-500 mt-1">${propriedades.length} Propriedade(s)</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="clientes.edit('${cliente.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="clientes.delete('${cliente.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button onclick="propriedades.render('${cliente.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showForm(clienteId = null) {
        const cliente = clienteId ? db.getClientes().find(c => c.id === clienteId) : null;
        
        const html = `
            <div class="mb-6">
                <button onclick="clientes.render()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${cliente ? 'edit' : 'plus'} mr-2 text-green-600"></i>${cliente ? 'Editar' : 'Novo'} Cliente
                </h2>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <form id="clienteForm" onsubmit="clientes.save(event)">
                    <input type="hidden" id="clienteId" value="${cliente ? cliente.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-user mr-2 text-green-600"></i>Dados Pessoais
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome/Razão Social *</label>
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
                            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input type="tel" id="clienteTelefone" value="${cliente ? cliente.telefone || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="(00) 00000-0000">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input type="email" id="clienteEmail" value="${cliente ? cliente.email || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="email@exemplo.com">
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-4 mt-6">
                        <i class="fas fa-map-marker-alt mr-2 text-green-600"></i>Localização e Região
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Região/Boletim *</label>
                            <select id="clienteRegiao" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione a região</option>
                                <option value="boletim100" ${cliente?.regiao === 'boletim100' ? 'selected' : ''}>Boletim 100 (V2 = 70%)</option>
                                <option value="sp" ${cliente?.regiao === 'sp' ? 'selected' : ''}>São Paulo (IAC)</option>
                                <option value="pr" ${cliente?.regiao === 'pr' ? 'selected' : ''}>Paraná</option>
                                <option value="rs" ${cliente?.regiao === 'rs' ? 'selected' : ''}>Rio Grande do Sul</option>
                                <option value="mg" ${cliente?.regiao === 'mg' ? 'selected' : ''}>Minas Gerais</option>
                                <option value="go" ${cliente?.regiao === 'go' ? 'selected' : ''}>Goiás</option>
                                <option value="ms" ${cliente?.regiao === 'ms' ? 'selected' : ''}>Mato Grosso do Sul</option>
                                <option value="mt" ${cliente?.regiao === 'mt' ? 'selected' : ''}>Mato Grosso</option>
                            </select>
                            <p class="text-xs text-gray-500 mt-1">A região define os níveis críticos aplicados nas recomendações</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input type="text" id="clienteCidade" value="${cliente ? cliente.cidade || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Cidade">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select id="clienteEstado" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione</option>
                                <option value="AC" ${cliente?.estado === 'AC' ? 'selected' : ''}>Acre</option>
                                <option value="AL" ${cliente?.estado === 'AL' ? 'selected' : ''}>Alagoas</option>
                                <option value="AP" ${cliente?.estado === 'AP' ? 'selected' : ''}>Amapá</option>
                                <option value="AM" ${cliente?.estado === 'AM' ? 'selected' : ''}>Amazonas</option>
                                <option value="BA" ${cliente?.estado === 'BA' ? 'selected' : ''}>Bahia</option>
                                <option value="CE" ${cliente?.estado === 'CE' ? 'selected' : ''}>Ceará</option>
                                <option value="DF" ${cliente?.estado === 'DF' ? 'selected' : ''}>Distrito Federal</option>
                                <option value="ES" ${cliente?.estado === 'ES' ? 'selected' : ''}>Espírito Santo</option>
                                <option value="GO" ${cliente?.estado === 'GO' ? 'selected' : ''}>Goiás</option>
                                <option value="MA" ${cliente?.estado === 'MA' ? 'selected' : ''}>Maranhão</option>
                                <option value="MT" ${cliente?.estado === 'MT' ? 'selected' : ''}>Mato Grosso</option>
                                <option value="MS" ${cliente?.estado === 'MS' ? 'selected' : ''}>Mato Grosso do Sul</option>
                                <option value="MG" ${cliente?.estado === 'MG' ? 'selected' : ''}>Minas Gerais</option>
                                <option value="PA" ${cliente?.estado === 'PA' ? 'selected' : ''}>Pará</option>
                                <option value="PB" ${cliente?.estado === 'PB' ? 'selected' : ''}>Paraíba</option>
                                <option value="PR" ${cliente?.estado === 'PR' ? 'selected' : ''}>Paraná</option>
                                <option value="PE" ${cliente?.estado === 'PE' ? 'selected' : ''}>Pernambuco</option>
                                <option value="PI" ${cliente?.estado === 'PI' ? 'selected' : ''}>Piauí</option>
                                <option value="RJ" ${cliente?.estado === 'RJ' ? 'selected' : ''}>Rio de Janeiro</option>
                                <option value="RN" ${cliente?.estado === 'RN' ? 'selected' : ''}>Rio Grande do Norte</option>
                                <option value="RS" ${cliente?.estado === 'RS' ? 'selected' : ''}>Rio Grande do Sul</option>
                                <option value="RO" ${cliente?.estado === 'RO' ? 'selected' : ''}>Rondônia</option>
                                <option value="RR" ${cliente?.estado === 'RR' ? 'selected' : ''}>Roraima</option>
                                <option value="SC" ${cliente?.estado === 'SC' ? 'selected' : ''}>Santa Catarina</option>
                                <option value="SP" ${cliente?.estado === 'SP' ? 'selected' : ''}>São Paulo</option>
                                <option value="SE" ${cliente?.estado === 'SE' ? 'selected' : ''}>Sergipe</option>
                                <option value="TO" ${cliente?.estado === 'TO' ? 'selected' : ''}>Tocantins</option>
                            </select>
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-4 mt-6">
                        <i class="fas fa-info-circle mr-2 text-green-600"></i>Informações Adicionais
                    </h3>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                        <input type="text" id="clienteEndereco" value="${cliente ? cliente.endereco || '' : ''}" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Rua, número, bairro">
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea id="clienteObservacoes" rows="4" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Anotações adicionais sobre o cliente...">${cliente ? cliente.observacoes || '' : ''}</textarea>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Cliente
                        </button>
                        <button type="button" onclick="clientes.render()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-clientes');
        if (container) {
            container.innerHTML = html;
        }
    }

    save(event) {
        event.preventDefault();
        const id = document.getElementById('clienteId').value;
        const cliente = {
            nome: document.getElementById('clienteNome').value,
            documento: document.getElementById('clienteDocumento').value || null,
            telefone: document.getElementById('clienteTelefone').value || null,
            email: document.getElementById('clienteEmail').value || null,
            regiao: document.getElementById('clienteRegiao').value,
            cidade: document.getElementById('clienteCidade').value || null,
            estado: document.getElementById('clienteEstado').value || null,
            endereco: document.getElementById('clienteEndereco').value || null,
            observacoes: document.getElementById('clienteObservacoes').value || null
        };

        if (id) {
            db.updateCliente(id, cliente);
        } else {
            db.addCliente(cliente);
        }

        this.render();
        if (window.dashboard) window.dashboard.render();
    }

    edit(id) {
        this.showForm(id);
    }

    delete(id) {
        if (confirm('Tem certeza que deseja excluir este cliente? Todas as propriedades e talhões relacionados serão excluídos.')) {
            db.deleteCliente(id);
            this.render();
            if (window.dashboard) window.dashboard.render();
        }
    }
}

// Instância global
window.clientes = new ClientesUI();

