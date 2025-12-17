// App Principal - Orquestrador
// Este arquivo inicializa a aplicação e gerencia eventos globais

document.addEventListener('DOMContentLoaded', () => {
    console.log('AgroCultive PWA iniciado - Estrutura Reorganizada');
    
    // Inicializar dashboard
    if (window.dashboard) {
        window.dashboard.render();
    }
    
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
