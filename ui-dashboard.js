// Módulo de UI - Dashboard
// Tela principal com acesso rápido a todas as funcionalidades
class DashboardUI {
    constructor() {
        this.init();
    }

    init() {
        this.render();
    }

    async render() {
        // Aguardar db estar pronto
        if (!window.db) {
            console.warn('Database não está pronto ainda, aguardando...');
            setTimeout(() => this.render(), 200);
            return;
        }
        
        // Obter dados (pode retornar Promise ou valor direto)
        let clientes, talhoes, coletas, analises, recomendacoes;
        
        try {
            const clientesResult = window.db.getClientes();
            clientes = clientesResult instanceof Promise ? await clientesResult : clientesResult;
            
            const talhoesResult = window.db.getTalhoes();
            talhoes = talhoesResult instanceof Promise ? await talhoesResult : talhoesResult;
            
            const coletasResult = window.db.getColetas();
            coletas = coletasResult instanceof Promise ? await coletasResult : coletasResult;
            
            const analisesResult = window.db.getAnalises();
            analises = analisesResult instanceof Promise ? await analisesResult : analisesResult;
            
            const recomendacoesResult = window.db.getRecomendacoes();
            recomendacoes = recomendacoesResult instanceof Promise ? await recomendacoesResult : recomendacoesResult;
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            clientes = [];
            talhoes = [];
            coletas = [];
            analises = [];
            recomendacoes = [];
        }

        const html = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-chart-line mr-2 text-green-600"></i>Dashboard
                </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Clientes</p>
                            <p class="text-3xl font-bold">${clientes.length}</p>
                        </div>
                        <i class="fas fa-users text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Talhões</p>
                            <p class="text-3xl font-bold">${talhoes.length}</p>
                        </div>
                        <i class="fas fa-th-large text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm">Coletas</p>
                            <p class="text-3xl font-bold">${coletas.length}</p>
                        </div>
                        <i class="fas fa-map-marked-alt text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100 text-sm">Análises</p>
                            <p class="text-3xl font-bold">${analises.length}</p>
                        </div>
                        <i class="fas fa-flask text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-teal-100 text-sm">Relatórios</p>
                            <p class="text-3xl font-bold">${recomendacoes.length}</p>
                        </div>
                        <i class="fas fa-file-pdf text-4xl opacity-50"></i>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-users mr-2 text-green-600"></i>Gestão de Clientes
                    </h3>
                    <p class="text-sm text-gray-600 mb-4">Gerencie seus clientes e talhões cadastrados</p>
                    <button onclick="navigation.goToCRM()" class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-arrow-right mr-2"></i>Acessar CRM
                    </button>
                </div>

                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-map-marked-alt mr-2 text-green-600"></i>Coleta de Campo
                    </h3>
                    <p class="text-sm text-gray-600 mb-4">Inicie uma nova coleta de solo com GPS em tempo real</p>
                    <button onclick="navigation.goToColeta()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Nova Coleta de Solo
                    </button>
                </div>

                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-flask mr-2 text-green-600"></i>Análise de Solo
                    </h3>
                    <p class="text-sm text-gray-600 mb-4">Preencha os resultados da análise do laboratório</p>
                    <button onclick="navigation.goToAnalise()" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-edit mr-2"></i>Preencher Análise
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800">
                        <i class="fas fa-users mr-2 text-green-600"></i>Clientes Recentes
                    </h3>
                    <button onclick="navigation.goToCRM()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Novo Cliente
                    </button>
                </div>
                <div id="clientesList" class="space-y-4">
                    ${this.renderClientesList(clientes)}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-dashboard');
        if (container) {
            container.innerHTML = html;
        }
    }

    renderClientesList(clientes) {
        if (clientes.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 opacity-50"></i>
                    <p>Nenhum cliente cadastrado</p>
                    <button onclick="navigation.goToCRM()" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-plus mr-2"></i>Cadastrar Primeiro Cliente
                    </button>
                </div>
            `;
        }

        return clientes.slice(0, 5).map(cliente => {
            const talhoes = db.getTalhoes(cliente.id);
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-800">${cliente.nome}</h4>
                            ${cliente.localidade ? `<p class="text-sm text-gray-600">${cliente.localidade}${cliente.estado ? ' - ' + cliente.estado : ''}</p>` : ''}
                            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span><i class="fas fa-th-large mr-1"></i>${talhoes.length} Talhão(ões)</span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="navigation.goToCRM()" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Instância global
window.dashboard = new DashboardUI();
