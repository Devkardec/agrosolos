// Módulo de UI - Análise de Solo
// Interface para preencher os resultados da análise de solo do laboratório
// COM CÁLCULOS AUTOMÁTICOS EM TEMPO REAL
class AnaliseUI {
    constructor() {
        this.init();
    }

    init() {
        // Event listeners serão adicionados no render
    }

    // ========== RENDERIZAR TELA DE ANÁLISE ==========
    render(talhaoId = null) {
        if (talhaoId) {
            this.showForm(talhaoId);
        } else {
            this.renderLista();
        }
    }

    renderLista() {
        const analises = db.getAnalises();
        
        const html = `
            <div class="mb-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-flask mr-2 text-green-600"></i>Análises de Solo
                    </h2>
                    <button onclick="analise.showSelecaoTalhao()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Nova Análise
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div id="analisesListContent" class="space-y-4">
                    ${this.renderAnalisesListContent(analises)}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-analise');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderAnalisesListContent(analises) {
        if (analises.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-flask text-4xl mb-4 opacity-50"></i>
                    <p>Nenhuma análise cadastrada</p>
                </div>
            `;
        }

        return analises.map(analise => {
            const talhao = db.getTalhao(analise.talhaoId);
            const cliente = talhao ? db.getCliente(talhao.clienteId) : null;
            const recomendacoes = db.getRecomendacoes(analise.id);
            
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">${cliente?.nome || 'Cliente'} - ${talhao?.nome || 'Talhão'}</h4>
                            <p class="text-sm text-gray-600">Data: ${new Date(analise.createdAt).toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-500 mt-1">${recomendacoes.length > 0 ? 'Recomendação gerada' : 'Aguardando recomendação'}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="analise.showForm(null, '${analise.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${recomendacoes.length > 0 ? `
                                <button onclick="recomendacao.render('${analise.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">
                                    <i class="fas fa-file-pdf"></i> Ver Relatório
                                </button>
                            ` : `
                                <button onclick="recomendacao.gerarRecomendacao('${analise.id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition">
                                    <i class="fas fa-calculator"></i> Gerar Recomendação
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showSelecaoTalhao() {
        const talhoes = db.getTalhoes();
        const clientes = db.getClientes();
        
        if (talhoes.length === 0) {
            alert('Por favor, cadastre pelo menos um talhão antes de criar uma análise.');
            if (window.crm) {
                window.crm.render();
            }
            return;
        }

        const html = `
            <div id="modalSelecaoTalhao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-flask mr-2 text-green-600"></i>Nova Análise de Solo
                        </h3>
                        <button onclick="analise.closeModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="formSelecaoTalhao" onsubmit="analise.iniciarNovaAnalise(event)">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <select id="selectClienteAnalise" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                onchange="analise.onClienteChangeAnalise()">
                                <option value="">Todos os clientes</option>
                                ${clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Talhão *</label>
                            <select id="selectTalhaoAnalise" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione o talhão</option>
                                ${talhoes.map(t => {
                                    const cliente = db.getCliente(t.clienteId);
                                    return `<option value="${t.id}">${cliente?.nome || 'Cliente'} - ${t.nome}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        
                        <div class="flex space-x-4">
                            <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-arrow-right mr-2"></i>Continuar
                            </button>
                            <button type="button" onclick="analise.closeModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    onClienteChangeAnalise() {
        const clienteId = document.getElementById('selectClienteAnalise').value;
        const selectTalhao = document.getElementById('selectTalhaoAnalise');
        
        const talhoes = clienteId ? db.getTalhoes(clienteId) : db.getTalhoes();
        
        selectTalhao.innerHTML = '<option value="">Selecione o talhão</option>';
        talhoes.forEach(talhao => {
            const cliente = db.getCliente(talhao.clienteId);
            const option = document.createElement('option');
            option.value = talhao.id;
            option.textContent = `${cliente?.nome || 'Cliente'} - ${talhao.nome}`;
            selectTalhao.appendChild(option);
        });
    }

    iniciarNovaAnalise(event) {
        event.preventDefault();
        const talhaoId = document.getElementById('selectTalhaoAnalise').value;
        
        if (!talhaoId) {
            alert('Por favor, selecione o talhão.');
            return;
        }

        this.closeModal();
        this.showForm(talhaoId);
    }

    closeModal() {
        const modal = document.getElementById('modalSelecaoTalhao');
        if (modal) {
            modal.remove();
        }
    }

    // ========== FORMULÁRIO DE ANÁLISE COM CÁLCULOS AUTOMÁTICOS ==========
    showForm(talhaoId, analiseId = null) {
        const analise = analiseId ? db.getAnalise(analiseId) : null;
        const talhao = talhaoId ? db.getTalhao(talhaoId) : (analise ? db.getTalhao(analise.talhaoId) : null);
        const cliente = talhao ? db.getCliente(talhao.clienteId) : null;
        const culturaAlvo = talhao?.culturaAlvo || analise?.culturaAlvo || '';
        
        const html = `
            <div class="mb-6">
                <button onclick="analise.render()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-${analise ? 'edit' : 'plus'} mr-2 text-green-600"></i>${analise ? 'Editar' : 'Nova'} Análise de Solo
                </h2>
                ${cliente ? `<p class="text-sm text-gray-600 mt-1">Cliente: ${cliente.nome} | Talhão: ${talhao?.nome || 'N/A'}</p>` : ''}
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mb-4">
                <form id="analiseForm" onsubmit="analise.save(event, '${talhaoId || analise?.talhaoId}')">
                    <input type="hidden" id="analiseId" value="${analise ? analise.id : ''}">
                    
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-flask mr-2 text-green-600"></i>Resultados da Análise de Solo
                    </h3>
                    
                    <!-- Valores Calculados Automaticamente -->
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-semibold text-gray-800 mb-2">Valores Calculados Automaticamente</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Soma de Bases (S)</label>
                                <p class="text-lg font-bold text-gray-800" id="resultadoS">0.00 cmolc/dm³</p>
                                <p class="text-xs text-gray-500">S = Ca + Mg + K</p>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Relação Ca/Mg</label>
                                <p class="text-lg font-bold text-gray-800" id="resultadoCaMg">-</p>
                                <p class="text-xs text-gray-500">Ca ÷ Mg</p>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Saturação de Al (%)</label>
                                <p class="text-lg font-bold text-gray-800" id="resultadoSatAl">0.00%</p>
                                <p class="text-xs text-gray-500">(Al / CTC) × 100</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">pH (água)</label>
                            <input type="number" id="analisePh" step="0.1" value="${analise ? analise.ph || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">P (mg/dm³)</label>
                            <input type="number" id="analiseP" step="0.1" value="${analise ? analise.p || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">K (cmolc/dm³)</label>
                            <input type="number" id="analiseK" step="0.01" value="${analise ? analise.k || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ca (cmolc/dm³)</label>
                            <input type="number" id="analiseCa" step="0.01" value="${analise ? analise.ca || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mg (cmolc/dm³)</label>
                            <input type="number" id="analiseMg" step="0.01" value="${analise ? analise.mg || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Al (cmolc/dm³)</label>
                            <input type="number" id="analiseAl" step="0.01" value="${analise ? analise.al || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">H+Al (cmolc/dm³)</label>
                            <input type="number" id="analiseHal" step="0.01" value="${analise ? analise.hal || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CTC (T) (cmolc/dm³)</label>
                            <input type="number" id="analiseCtc" step="0.01" value="${analise ? analise.ctc || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">% de Argila</label>
                            <input type="number" id="analiseArgila" step="0.1" value="${analise ? analise.argila || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Profundidade (cm)</label>
                            <select id="analiseProfundidade" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                onchange="analise.calcularTudo()">
                                <option value="20" ${analise?.profundidade === 20 ? 'selected' : ''}>0-20 cm</option>
                                <option value="40" ${analise?.profundidade === 40 ? 'selected' : ''}>20-40 cm</option>
                            </select>
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-4 mt-6">
                        <i class="fas fa-cube mr-2 text-green-600"></i>Calagem
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">V% Atual (Calculado)</label>
                            <input type="number" id="analiseV1" step="0.01" readonly
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                placeholder="Calculado automaticamente">
                            <p class="text-xs text-gray-500 mt-1">V1 = [(Ca + Mg + K) / CTC] * 100</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">V% Desejado</label>
                            <input type="number" id="analiseV2" step="1" value="${analise ? analise.v2 || '70' : '70'}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="70"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">PRNT do Calcário (%)</label>
                            <input type="number" id="analisePrnt" step="1" value="${analise ? analise.prnt || '100' : '100'}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="100"
                                oninput="analise.calcularTudo()">
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-blue-800">Necessidade de Calcário (NC)</p>
                                <p class="text-2xl font-bold text-blue-600" id="resultadoNC">0.00 t/ha</p>
                                <p class="text-xs text-blue-600 mt-1">NC = [(V2 - V1) * CTC] / (PRNT/100)</p>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-4 mt-6">
                        <i class="fas fa-mountain mr-2 text-green-600"></i>Gessagem
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ca na camada 20-40 cm (cmolc/dm³)</label>
                            <input type="number" id="analiseCa2040" step="0.01" value="${analise ? analise.ca2040 || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Para verificar necessidade"
                                oninput="analise.calcularTudo()">
                        </div>
                    </div>
                    
                    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-purple-800">Necessidade de Gesso (NG)</p>
                                <p class="text-2xl font-bold text-purple-600" id="resultadoNG">0.00 kg/ha</p>
                                <p class="text-xs text-purple-600 mt-1" id="gatilhoGessagem">Gatilho: Al > 20% OU Ca < 1.0 cmolc/dm³ (20-40cm)</p>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-4 mt-6">
                        <i class="fas fa-seedling mr-2 text-green-600"></i>Cultura Alvo e Manutenção
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cultura Alvo *</label>
                            <select id="analiseCultura" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                onchange="analise.onCulturaChange()">
                                <option value="">Selecione a cultura</option>
                                <option value="soja" ${culturaAlvo === 'soja' ? 'selected' : ''}>SOJA</option>
                                <option value="milho" ${culturaAlvo === 'milho' ? 'selected' : ''}>MILHO</option>
                                <option value="sorgo" ${culturaAlvo === 'sorgo' ? 'selected' : ''}>SORGO</option>
                                <option value="outros" ${culturaAlvo === 'outros' ? 'selected' : ''}>OUTROS</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Expectativa de Produtividade</label>
                            <div class="flex gap-2">
                                <input type="number" id="analiseProdutividade" step="0.1" value="${analise ? analise.produtividade || '' : ''}" 
                                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Ex: 75"
                                    oninput="analise.calcularTudo()">
                                <select id="unidadeProdutividade" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    onchange="analise.calcularTudo()">
                                    <option value="sacas" ${analise?.unidadeProdutividade === 'sacas' ? 'selected' : ''}>Sacas/ha</option>
                                    <option value="toneladas" ${analise?.unidadeProdutividade === 'toneladas' || !analise ? 'selected' : ''}>Ton/ha</option>
                                </select>
                            </div>
                            <p class="text-xs text-gray-500 mt-1" id="conversaoProdutividade">Conversão: 1 saca = 0.06 toneladas</p>
                        </div>
                    </div>

                    <!-- Campos para "Outros" -->
                    <div id="camposOutros" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 hidden">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">N (kg/t) *</label>
                            <input type="number" id="extracaoN" step="0.1" value="${analise ? analise.extracaoN || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: 25.0"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">P2O5 (kg/t) *</label>
                            <input type="number" id="extracaoP2O5" step="0.1" value="${analise ? analise.extracaoP2O5 || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: 10.0"
                                oninput="analise.calcularTudo()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">K2O (kg/t) *</label>
                            <input type="number" id="extracaoK2O" step="0.1" value="${analise ? analise.extracaoK2O || '' : ''}" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="Ex: 20.0"
                                oninput="analise.calcularTudo()">
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 mb-4 mt-6">
                        <i class="fas fa-calculator mr-2 text-green-600"></i>Resultados dos Cálculos
                    </h3>

                    <!-- Correção de P e K -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-semibold text-yellow-800 mb-2">Correção de Fósforo e Potássio</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs text-yellow-700 mb-1">P2O5 de Correção</p>
                                <p class="text-xl font-bold text-yellow-600" id="resultadoP2O5Correcao">0.00 kg/ha</p>
                                <p class="text-xs text-yellow-600" id="interpretacaoP">-</p>
                            </div>
                            <div>
                                <p class="text-xs text-yellow-700 mb-1">K2O de Correção</p>
                                <p class="text-xl font-bold text-yellow-600" id="resultadoK2OCorrecao">0.00 kg/ha</p>
                                <p class="text-xs text-yellow-600" id="interpretacaoK">-</p>
                            </div>
                        </div>
                    </div>

                    <!-- Manutenção -->
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-semibold text-green-800 mb-2">Manutenção (Fome da Planta)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p class="text-xs text-green-700 mb-1">N de Manutenção</p>
                                <p class="text-xl font-bold text-green-600" id="resultadoNManutencao">0.00 kg/ha</p>
                            </div>
                            <div>
                                <p class="text-xs text-green-700 mb-1">P2O5 de Manutenção</p>
                                <p class="text-xl font-bold text-green-600" id="resultadoP2O5Manutencao">0.00 kg/ha</p>
                            </div>
                            <div>
                                <p class="text-xs text-green-700 mb-1">K2O de Manutenção</p>
                                <p class="text-xl font-bold text-green-600" id="resultadoK2OManutencao">0.00 kg/ha</p>
                            </div>
                        </div>
                    </div>

                    <!-- Recomendação Total -->
                    <div class="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 mb-4 shadow-lg">
                        <h4 class="text-lg font-bold mb-4">Recomendação Total</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p class="text-sm text-green-100 mb-1">N Total</p>
                                <p class="text-2xl font-bold" id="resultadoNTotal">0.00 kg/ha</p>
                            </div>
                            <div>
                                <p class="text-sm text-green-100 mb-1">P2O5 Total</p>
                                <p class="text-2xl font-bold" id="resultadoP2O5Total">0.00 kg/ha</p>
                            </div>
                            <div>
                                <p class="text-sm text-green-100 mb-1">K2O Total</p>
                                <p class="text-2xl font-bold" id="resultadoK2OTotal">0.00 kg/ha</p>
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-green-500">
                            <p class="text-sm text-green-100">Total = Correção + Manutenção</p>
                        </div>
                    </div>

                    <!-- Adubos Comerciais -->
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-semibold text-gray-800 mb-3">Sugestão de Adubos Comerciais</h4>
                        <div id="sugestaoAdubos" class="space-y-2 text-sm">
                            <p class="text-gray-600">Preencha os dados acima para ver sugestões</p>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea id="analiseObservacoes" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Observações sobre a análise...">${analise ? analise.observacoes || '' : ''}</textarea>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar Análise
                        </button>
                        <button type="button" onclick="analise.render()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        const container = document.getElementById('screen-analise');
        if (container) {
            container.innerHTML = html;
        }

        // Inicializar cálculos
        setTimeout(() => {
            this.calcularTudo();
            this.onCulturaChange();
        }, 100);
    }

    onCulturaChange() {
        const cultura = document.getElementById('analiseCultura')?.value;
        const camposOutros = document.getElementById('camposOutros');
        
        if (camposOutros) {
            if (cultura === 'outros') {
                camposOutros.classList.remove('hidden');
            } else {
                camposOutros.classList.add('hidden');
            }
        }
        
        this.calcularTudo();
    }

    // ========== CÁLCULOS AUTOMÁTICOS ==========
    calcularTudo() {
        // Obter valores dos campos
        const ca = parseFloat(document.getElementById('analiseCa')?.value) || 0;
        const mg = parseFloat(document.getElementById('analiseMg')?.value) || 0;
        const k = parseFloat(document.getElementById('analiseK')?.value) || 0;
        const hal = parseFloat(document.getElementById('analiseHal')?.value) || 0;
        const ctc = parseFloat(document.getElementById('analiseCtc')?.value) || 0;
        const p = parseFloat(document.getElementById('analiseP')?.value) || 0;
        const argila = parseFloat(document.getElementById('analiseArgila')?.value) || 0;
        const al = parseFloat(document.getElementById('analiseAl')?.value) || 0;
        const profundidade = parseInt(document.getElementById('analiseProfundidade')?.value) || 20;
        const v2 = parseFloat(document.getElementById('analiseV2')?.value) || 70;
        const prnt = parseFloat(document.getElementById('analisePrnt')?.value) || 100;
        const ca2040 = parseFloat(document.getElementById('analiseCa2040')?.value) || 0;
        const cultura = document.getElementById('analiseCultura')?.value || '';
        const produtividade = parseFloat(document.getElementById('analiseProdutividade')?.value) || 0;

        // 1. CALCULAR SOMA DE BASES (S) e V1
        const s = ca + mg + k; // Soma de Bases
        const v1 = calcularV(ca, mg, k, hal);
        
        // Exibir Soma de Bases
        const resultadoS = document.getElementById('resultadoS');
        if (resultadoS) {
            resultadoS.textContent = `${s.toFixed(2)} cmolc/dm³`;
        }
        
        // Exibir Relação Ca/Mg
        const resultadoCaMg = document.getElementById('resultadoCaMg');
        if (resultadoCaMg && mg > 0) {
            const caMg = (ca / mg).toFixed(2);
            resultadoCaMg.textContent = caMg;
        } else if (resultadoCaMg) {
            resultadoCaMg.textContent = '-';
        }
        
        // Exibir Saturação de Al
        const resultadoSatAl = document.getElementById('resultadoSatAl');
        if (resultadoSatAl && ctc > 0) {
            const satAl = (al / ctc) * 100;
            resultadoSatAl.textContent = `${satAl.toFixed(2)}%`;
        } else if (resultadoSatAl) {
            resultadoSatAl.textContent = '0.00%';
        }
        
        const v1Input = document.getElementById('analiseV1');
        if (v1Input) {
            v1Input.value = v1.toFixed(2);
        }

        // 2. CALCULAR CALAGEM (NC) - Lógica: Se V1 < V% Desejado
        let nc = 0;
        let calagemTexto = '';
        if (ctc > 0 && prnt > 0) {
            if (v1 < v2) {
                // Se V1 < V% Desejado, calcular NC
                nc = calcularNC(v1, v2, ctc, prnt);
                calagemTexto = `V1 (${v1.toFixed(2)}%) < V% Desejado (${v2}%) - Necessário corrigir`;
            } else {
                calagemTexto = `V1 (${v1.toFixed(2)}%) ≥ V% Desejado (${v2}%) - Não necessária`;
            }
        }
        const resultadoNC = document.getElementById('resultadoNC');
        if (resultadoNC) {
            resultadoNC.textContent = `${nc.toFixed(2)} t/ha`;
        }
        // Atualizar texto explicativo
        const calagemExplicacao = document.getElementById('calagemExplicacao');
        if (calagemExplicacao) {
            if (calagemTexto) {
                calagemExplicacao.textContent = calagemTexto;
            } else {
                calagemExplicacao.textContent = 'NC = [(V2 - V1) * CTC] / (PRNT/100)';
            }
        }

        // 3. CALCULAR GESSAGEM (NG)
        let ng = 0;
        let gatilhoTexto = 'Não aplicável';
        const satAl = ctc > 0 ? (al / ctc) * 100 : 0;
        
        // Verificar gatilho: Al > 20% OU Ca < 1.0 cmolc/dm³ na camada 20-40cm
        if (profundidade === 40) {
            // Se a análise é da camada 20-40cm, usar Ca dessa camada
            if (satAl > 20 || ca < 1.0) {
                ng = 50 * argila; // Para culturas anuais
                gatilhoTexto = `Aplicável: Al ${satAl.toFixed(1)}% > 20% OU Ca ${ca.toFixed(2)} < 1.0 cmolc/dm³`;
            } else {
                gatilhoTexto = `Não aplicável: Al ${satAl.toFixed(1)}% ≤ 20% E Ca ${ca.toFixed(2)} ≥ 1.0 cmolc/dm³`;
            }
        } else if (profundidade === 20 && ca2040 > 0) {
            // Se a análise é 0-20cm mas temos Ca da 20-40cm
            if (satAl > 20 || ca2040 < 1.0) {
                ng = 50 * argila;
                gatilhoTexto = `Aplicável: Al ${satAl.toFixed(1)}% > 20% OU Ca 20-40cm ${ca2040.toFixed(2)} < 1.0 cmolc/dm³`;
            } else {
                gatilhoTexto = `Não aplicável: Al ${satAl.toFixed(1)}% ≤ 20% E Ca 20-40cm ${ca2040.toFixed(2)} ≥ 1.0 cmolc/dm³`;
            }
        } else {
            gatilhoTexto = 'Informe Ca da camada 20-40cm para verificar necessidade';
        }
        
        const resultadoNG = document.getElementById('resultadoNG');
        const gatilhoGessagem = document.getElementById('gatilhoGessagem');
        if (resultadoNG) {
            resultadoNG.textContent = `${ng.toFixed(2)} kg/ha`;
        }
        if (gatilhoGessagem) {
            gatilhoGessagem.textContent = gatilhoTexto;
        }

        // 4. CALCULAR CORREÇÃO DE P (FOSFATAGEM)
        let p2o5Correcao = 0;
        let interpretacaoPTexto = '-';
        
        // Determinar nível crítico baseado na argila
        let nivelCritico = 0;
        if (argila > 35 && argila <= 60) {
            nivelCritico = 8.0; // Argila > 35% e ≤ 60%
        } else if (argila >= 16 && argila <= 35) {
            nivelCritico = 15.0; // Argila 16-35% (corrigido: 15 mg/dm³, não 15.1)
        }
        
        if (nivelCritico > 0) {
            if (p < nivelCritico) {
                // P a adicionar = Nível Crítico - P atual
                const pAdicionar = nivelCritico - p;
                // Fator de conversão: 1 mg/dm³ de P = 10 kg/ha de P2O5
                // Fator de profundidade: 2 para 0-20cm, 1 para 20-40cm
                const fatorProfundidade = profundidade === 20 ? 2 : 1;
                p2o5Correcao = pAdicionar * 10 * fatorProfundidade;
                interpretacaoPTexto = `P ${p.toFixed(1)} mg/dm³ < Nível Crítico (${nivelCritico} mg/dm³) | P a adicionar: ${pAdicionar.toFixed(1)} mg/dm³`;
            } else {
                interpretacaoPTexto = `P ${p.toFixed(1)} mg/dm³ ≥ Nível Crítico (${nivelCritico} mg/dm³) - Adequado`;
            }
        } else {
            interpretacaoPTexto = `Argila ${argila.toFixed(1)}% fora da faixa (16-60%)`;
        }

        const resultadoP2O5Correcao = document.getElementById('resultadoP2O5Correcao');
        const interpretacaoPElem = document.getElementById('interpretacaoP');
        if (resultadoP2O5Correcao) {
            resultadoP2O5Correcao.textContent = `${p2o5Correcao.toFixed(2)} kg/ha`;
        }
        if (interpretacaoPElem) {
            interpretacaoPElem.textContent = interpretacaoPTexto;
        }

        // 5. CALCULAR CORREÇÃO DE K
        let k2oCorrecao = 0;
        let interpretacaoKTexto = '-';
        if (ctc > 0) {
            const kPercentual = (k / ctc) * 100;
            if (kPercentual < 3) {
                const kDesejado = ctc * 0.03; // 3% da CTC
                const kDiferenca = kDesejado - k;
                const kMgDm3 = kDiferenca;
                const kMgDm3ParaKgHa = kMgDm3 * 391; // Conversão
                const kKgHa = kMgDm3ParaKgHa * (profundidade === 20 ? 2 : 1);
                k2oCorrecao = kKgHa * 1.2; // Conversão para K2O
                interpretacaoKTexto = `K ${kPercentual.toFixed(2)}% na CTC < 3% (necessário ${k2oCorrecao.toFixed(2)} kg/ha)`;
            } else {
                interpretacaoKTexto = `K ${kPercentual.toFixed(2)}% na CTC ≥ 3% - Adequado`;
            }
        }

        const resultadoK2OCorrecao = document.getElementById('resultadoK2OCorrecao');
        const interpretacaoKElem = document.getElementById('interpretacaoK');
        if (resultadoK2OCorrecao) {
            resultadoK2OCorrecao.textContent = `${k2oCorrecao.toFixed(2)} kg/ha`;
        }
        if (interpretacaoKElem) {
            interpretacaoKElem.textContent = interpretacaoKTexto;
        }

        // 6. CALCULAR MANUTENÇÃO (Fome da Planta)
        let nManutencao = 0;
        let p2o5Manutencao = 0;
        let k2oManutencao = 0;
        let produtividadeToneladas = 0;

        if (cultura && produtividade > 0) {
            // Converter produtividade para toneladas
            const unidade = document.getElementById('unidadeProdutividade')?.value || 'toneladas';
            if (unidade === 'sacas') {
                produtividadeToneladas = produtividade * 0.06; // Conversão: 1 saca = 0.06 toneladas
                const conversaoElem = document.getElementById('conversaoProdutividade');
                if (conversaoElem) {
                    conversaoElem.textContent = `Conversão: ${produtividade} sacas/ha = ${produtividadeToneladas.toFixed(2)} ton/ha`;
                }
            } else {
                produtividadeToneladas = produtividade;
                const conversaoElem = document.getElementById('conversaoProdutividade');
                if (conversaoElem) {
                    conversaoElem.textContent = `Produtividade: ${produtividadeToneladas.toFixed(2)} ton/ha`;
                }
            }

            // Calcular manutenção baseado na cultura
            if (cultura === 'outros') {
                const extracaoN = parseFloat(document.getElementById('extracaoN')?.value) || 0;
                const extracaoP2O5 = parseFloat(document.getElementById('extracaoP2O5')?.value) || 0;
                const extracaoK2O = parseFloat(document.getElementById('extracaoK2O')?.value) || 0;
                nManutencao = extracaoN * produtividadeToneladas;
                p2o5Manutencao = extracaoP2O5 * produtividadeToneladas;
                k2oManutencao = extracaoK2O * produtividadeToneladas;
            } else {
                const culturaData = getCulturaData(cultura);
                if (culturaData) {
                    // Dose de Manutenção = Extração da Cultura × Toneladas Produzidas
                    nManutencao = (culturaData.n || 0) * produtividadeToneladas;
                    p2o5Manutencao = (culturaData.p2o5 || 0) * produtividadeToneladas;
                    k2oManutencao = (culturaData.k2o || 0) * produtividadeToneladas;
                }
            }
        }

        const resultadoNManutencao = document.getElementById('resultadoNManutencao');
        const resultadoP2O5Manutencao = document.getElementById('resultadoP2O5Manutencao');
        const resultadoK2OManutencao = document.getElementById('resultadoK2OManutencao');
        
        if (resultadoNManutencao) resultadoNManutencao.textContent = `${nManutencao.toFixed(2)} kg/ha`;
        if (resultadoP2O5Manutencao) resultadoP2O5Manutencao.textContent = `${p2o5Manutencao.toFixed(2)} kg/ha`;
        if (resultadoK2OManutencao) resultadoK2OManutencao.textContent = `${k2oManutencao.toFixed(2)} kg/ha`;

        // 7. CALCULAR TOTAL (Correção + Manutenção)
        const nTotal = nManutencao; // N só tem manutenção
        const p2o5Total = p2o5Correcao + p2o5Manutencao;
        const k2oTotal = k2oCorrecao + k2oManutencao;

        const resultadoNTotal = document.getElementById('resultadoNTotal');
        const resultadoP2O5Total = document.getElementById('resultadoP2O5Total');
        const resultadoK2OTotal = document.getElementById('resultadoK2OTotal');
        
        if (resultadoNTotal) resultadoNTotal.textContent = `${nTotal.toFixed(2)} kg/ha`;
        if (resultadoP2O5Total) resultadoP2O5Total.textContent = `${p2o5Total.toFixed(2)} kg/ha`;
        if (resultadoK2OTotal) resultadoK2OTotal.textContent = `${k2oTotal.toFixed(2)} kg/ha`;

        // 8. SUGERIR ADUBOS COMERCIAIS
        this.sugerirAdubosComerciais(nTotal, p2o5Total, k2oTotal);
    }

    sugerirAdubosComerciais(nTotal, p2o5Total, k2oTotal) {
        const sugestaoAdubos = document.getElementById('sugestaoAdubos');
        if (!sugestaoAdubos) return;

        let html = '';

        if (p2o5Total > 0 || k2oTotal > 0 || nTotal > 0) {
            html += '<div class="space-y-3">';
            
            // MAP (48% P2O5)
            if (p2o5Total > 0) {
                const mapNecessario = p2o5Total / 0.48;
                html += `
                    <div class="bg-white p-3 rounded border border-gray-200">
                        <p class="font-semibold text-gray-800 mb-1">MAP - Fosfato Monoamônico (48% P2O5)</p>
                        <p class="text-lg font-bold text-blue-600">${mapNecessario.toFixed(2)} kg/ha</p>
                        <p class="text-xs text-gray-500">Para atender ${p2o5Total.toFixed(2)} kg/ha de P2O5</p>
                    </div>
                `;
            }

            // SSP (20% P2O5) - alternativa
            if (p2o5Total > 0) {
                const sspNecessario = p2o5Total / 0.20;
                html += `
                    <div class="bg-white p-3 rounded border border-gray-200">
                        <p class="font-semibold text-gray-800 mb-1">SSP - Superfosfato Simples (20% P2O5)</p>
                        <p class="text-lg font-bold text-blue-600">${sspNecessario.toFixed(2)} kg/ha</p>
                        <p class="text-xs text-gray-500">Alternativa para ${p2o5Total.toFixed(2)} kg/ha de P2O5</p>
                    </div>
                `;
            }

            // KCl (60% K2O)
            if (k2oTotal > 0) {
                const kclNecessario = k2oTotal / 0.60;
                html += `
                    <div class="bg-white p-3 rounded border border-gray-200">
                        <p class="font-semibold text-gray-800 mb-1">KCl - Cloreto de Potássio (60% K2O)</p>
                        <p class="text-lg font-bold text-green-600">${kclNecessario.toFixed(2)} kg/ha</p>
                        <p class="text-xs text-gray-500">Para atender ${k2oTotal.toFixed(2)} kg/ha de K2O</p>
                    </div>
                `;
            }

            // Ureia (45% N)
            if (nTotal > 0) {
                const ureiaNecessaria = nTotal / 0.45;
                html += `
                    <div class="bg-white p-3 rounded border border-gray-200">
                        <p class="font-semibold text-gray-800 mb-1">Ureia (45% N)</p>
                        <p class="text-lg font-bold text-purple-600">${ureiaNecessaria.toFixed(2)} kg/ha</p>
                        <p class="text-xs text-gray-500">Para atender ${nTotal.toFixed(2)} kg/ha de N</p>
                    </div>
                `;
            }

            // Fórmulas NPK combinadas
            if ((p2o5Total > 0 && k2oTotal > 0) || (nTotal > 0 && p2o5Total > 0 && k2oTotal > 0)) {
                html += `
                    <div class="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p class="text-sm font-semibold text-yellow-800 mb-1">💡 Sugestão</p>
                        <p class="text-xs text-yellow-700">Considere fórmulas NPK combinadas (ex: 08-28-16, 20-05-20) para otimizar aplicação e reduzir custos</p>
                    </div>
                `;
            }

            html += '</div>';
        } else {
            html = '<p class="text-gray-600">Preencha os dados da análise e cultura para ver sugestões de adubos comerciais</p>';
        }

        sugestaoAdubos.innerHTML = html;
    }

    save(event, talhaoId) {
        event.preventDefault();
        const id = document.getElementById('analiseId').value;
        const analise = {
            talhaoId: talhaoId,
            ph: parseFloat(document.getElementById('analisePh').value) || null,
            p: parseFloat(document.getElementById('analiseP').value) || null,
            k: parseFloat(document.getElementById('analiseK').value) || null,
            ca: parseFloat(document.getElementById('analiseCa').value) || null,
            mg: parseFloat(document.getElementById('analiseMg').value) || null,
            al: parseFloat(document.getElementById('analiseAl').value) || null,
            hal: parseFloat(document.getElementById('analiseHal').value) || null,
            ctc: parseFloat(document.getElementById('analiseCtc').value) || null,
            argila: parseFloat(document.getElementById('analiseArgila').value) || null,
            profundidade: parseInt(document.getElementById('analiseProfundidade').value) || 20,
            // Calagem
            v1: parseFloat(document.getElementById('analiseV1').value) || null,
            v2: parseFloat(document.getElementById('analiseV2').value) || 70,
            prnt: parseFloat(document.getElementById('analisePrnt').value) || 100,
            // Gessagem
            ca2040: parseFloat(document.getElementById('analiseCa2040').value) || null,
            // Cultura e manutenção
            culturaAlvo: document.getElementById('analiseCultura').value || null,
            produtividade: parseFloat(document.getElementById('analiseProdutividade').value) || null,
            unidadeProdutividade: document.getElementById('unidadeProdutividade')?.value || 'toneladas',
            extracaoN: parseFloat(document.getElementById('extracaoN')?.value) || null,
            extracaoP2O5: parseFloat(document.getElementById('extracaoP2O5')?.value) || null,
            extracaoK2O: parseFloat(document.getElementById('extracaoK2O')?.value) || null,
            observacoes: document.getElementById('analiseObservacoes').value || null
        };

        if (id) {
            db.updateAnalise(id, analise);
        } else {
            db.addAnalise(analise);
        }

        this.render();
    }
}

// Instância global
window.analise = new AnaliseUI();
