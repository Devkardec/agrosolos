// App Principal - Orquestrador
// Este arquivo inicializa a aplicação e gerencia eventos globais

// Função para mostrar tela de autenticação
function showAuthScreen() {
    const btnLogout = document.getElementById('btnLogout');
    const header = document.querySelector('header');
    
    if (btnLogout) btnLogout.classList.add('hidden');
    if (header) header.classList.add('hidden');
    
    // Ocultar todas as telas e mostrar auth
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    const authScreen = document.getElementById('screen-auth');
    if (authScreen) {
        authScreen.classList.remove('hidden');
        // Aguardar ui-auth.js estar pronto
        setTimeout(() => {
            if (window.authUI) {
                console.log('Renderizando tela de autenticação...');
                window.authUI.render();
            } else {
                console.warn('authUI não está disponível ainda, tentando novamente...');
                // Tentar novamente após mais tempo
                setTimeout(() => {
                    if (window.authUI) {
                        window.authUI.render();
                    } else {
                        console.error('authUI não foi carregado!');
                    }
                }, 500);
            }
        }, 100);
    } else {
        console.error('Elemento screen-auth não encontrado!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('AgroCultive PWA iniciado - Estrutura Reorganizada');
    
    // Mostrar tela de login por padrão (será atualizada quando auth verificar)
    showAuthScreen();
    
    // Configurar listener de autenticação
    window.onAuthStateChanged = (isAuthenticated, user) => {
        const btnLogout = document.getElementById('btnLogout');
        const header = document.querySelector('header');
        
        if (isAuthenticated) {
            // Usuário autenticado - mostrar app
            console.log('Usuário autenticado:', user.email);
            if (btnLogout) btnLogout.classList.remove('hidden');
            if (header) header.classList.remove('hidden');
            
            // Ocultar tela de auth e mostrar dashboard
            const authScreen = document.getElementById('screen-auth');
            if (authScreen) authScreen.classList.add('hidden');
            
            // Ocultar outras telas e mostrar dashboard
            document.querySelectorAll('.screen').forEach(screen => {
                if (screen.id !== 'screen-dashboard') {
                    screen.classList.add('hidden');
                }
            });
            
            // Inicializar dashboard
            if (window.dashboard) {
                const dashboardScreen = document.getElementById('screen-dashboard');
                if (dashboardScreen) {
                    dashboardScreen.classList.remove('hidden');
                    window.dashboard.render();
                }
            }
        } else {
            // Usuário não autenticado - mostrar login
            console.log('Usuário não autenticado - mostrando tela de login');
            showAuthScreen();
        }
    };
    
    // Aguardar auth estar pronto antes de verificar estado
    setTimeout(() => {
        if (window.auth) {
            // Auth já inicializou, verificar estado
            window.auth.checkAuthState();
        } else {
            // Tentar novamente
            const checkAuth = setInterval(() => {
                if (window.auth) {
                    clearInterval(checkAuth);
                    window.auth.checkAuthState();
                }
            }, 100);
            
            // Timeout de segurança - mostrar login após 2 segundos se auth não inicializar
            setTimeout(() => {
                if (!window.auth || !window.auth.isAuthenticated()) {
                    console.log('Auth não inicializado, mostrando tela de login');
                    showAuthScreen();
                }
            }, 2000);
        }
    }, 500);
    
    // Event listeners globais
    setupGlobalEventListeners();
});

function setupGlobalEventListeners() {
    // Event listener para conversão de produtividade (se necessário no futuro)
    document.addEventListener('input', (e) => {
        // Eventos específicos podem ser adicionados aqui
    });
    
    // Event listeners para recalcular quando mudar parâmetros
    document.addEventListener('change', (e) => {
        // Eventos específicos podem ser adicionados aqui
    });
}

// Função global para exportar PDF (mantida para compatibilidade)
function exportarPDF() {
    if (window.recomendacao && window.recomendacao.currentAnaliseId) {
        const recomendacoes = db.getRecomendacoes(window.recomendacao.currentAnaliseId);
        if (recomendacoes.length > 0) {
            window.recomendacao.gerarPDF(recomendacoes[0].id);
        } else {
            alert('Nenhuma recomendação encontrada para exportar.');
        }
    } else {
        alert('Por favor, abra uma recomendação primeiro.');
    }
}
