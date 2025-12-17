// Módulo de Navegação - Gerenciamento de telas e rotas
// Estrutura reorganizada: CRM -> Coleta de Campo -> Análise -> Recomendação
class Navigation {
    constructor() {
        this.currentScreen = 'dashboard';
        this.currentData = {
            clienteId: null,
            talhaoId: null,
            analiseId: null
        };
        this.init();
    }

    init() {
        this.hideAllScreens();
        this.showScreen('dashboard');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botão voltar ao dashboard
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav="dashboard"]')) {
                this.goToDashboard();
            }
            if (e.target.matches('[data-nav="crm"]')) {
                this.goToCRM();
            }
            if (e.target.matches('[data-nav="coleta"]')) {
                this.goToColeta();
            }
        });
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
    }

    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(`screen-${screenId}`);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
    }

    goToDashboard() {
        this.currentData = { clienteId: null, talhaoId: null, analiseId: null };
        this.showScreen('dashboard');
        if (window.dashboard) {
            window.dashboard.render();
        }
    }

    goToCRM() {
        this.showScreen('crm');
        if (window.crm) {
            window.crm.render();
        }
    }

    goToColeta() {
        this.showScreen('coleta-campo');
        if (window.coletaCampo) {
            window.coletaCampo.showNovaColetaModal();
        }
    }

    goToAnalise(talhaoId = null) {
        this.currentData.talhaoId = talhaoId;
        this.showScreen('analise');
        if (window.analise) {
            if (talhaoId) {
                window.analise.showForm(talhaoId);
            } else {
                window.analise.render();
            }
        }
    }

    goToRecomendacao(analiseId) {
        this.currentData.analiseId = analiseId;
        this.showScreen('recomendacao');
        if (window.recomendacao) {
            window.recomendacao.render(analiseId);
        }
    }

    getCurrentData() {
        return this.currentData;
    }

    setCurrentData(data) {
        this.currentData = { ...this.currentData, ...data };
    }
}

// Instância global de navegação
const navigation = new Navigation();
