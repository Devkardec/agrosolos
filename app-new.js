// App Principal - Orquestrador
// Este arquivo inicializa a aplicação e gerencia eventos globais

document.addEventListener('DOMContentLoaded', () => {
    console.log('AgroCultive PWA iniciado');
    
    // Inicializar dashboard
    if (window.dashboard) {
        window.dashboard.render();
    }
    
    // Event listener para exportar PDF
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            if (window.recomendacao && window.recomendacao.currentAmostraId) {
                exportarPDF();
            } else {
                alert('Por favor, abra uma recomendação primeiro.');
            }
        });
    }
    
    // Event listener para conversão de produtividade
    document.addEventListener('input', (e) => {
        if (e.target.id === 'produtividadeSacas') {
            const sacas = parseFloat(e.target.value) || 0;
            const toneladas = sacas * 0.06;
            const convertido = document.getElementById('produtividadeConvertida');
            if (convertido) {
                convertido.textContent = `Toneladas: ${toneladas.toFixed(2)} ton/ha`;
            }
            // Recalcular manutenção se estiver na tela de recomendação
            if (window.recomendacao && window.recomendacao.currentAmostraId) {
                setTimeout(() => window.recomendacao.calcularManutencao(), 100);
            }
        }
    });
    
    // Event listeners para recalcular quando mudar parâmetros
    document.addEventListener('change', (e) => {
        if (window.recomendacao && window.recomendacao.currentAmostraId) {
            if (['v2', 'prnt', 'fonteP', 'fonteK', 'cultura'].includes(e.target.id)) {
                setTimeout(() => window.recomendacao.calcular(), 100);
            }
        }
    });
});

// Função para exportar PDF (mantida do código original)
function exportarPDF() {
    if (!window.dadosSolo) {
        alert('Por favor, calcule as recomendações primeiro.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Recomendação de Adubação e Calagem', 20, 20);
    doc.setFontSize(12);
    doc.text('AgroCultive Soluções Rurais', 20, 30);
    
    let y = 45;
    
    // Dados da análise
    doc.setFontSize(14);
    doc.text('Dados da Análise de Solo', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    const dados = window.dadosSolo;
    doc.text(`pH: ${dados.ph || 'N/A'}`, 20, y);
    doc.text(`P: ${dados.p || 'N/A'} mg/dm³`, 100, y);
    y += 7;
    doc.text(`K: ${dados.k || 'N/A'} cmolc/dm³`, 20, y);
    doc.text(`Ca: ${dados.ca || 'N/A'} cmolc/dm³`, 100, y);
    y += 7;
    doc.text(`Mg: ${dados.mg || 'N/A'} cmolc/dm³`, 20, y);
    doc.text(`Al: ${dados.al || 'N/A'} cmolc/dm³`, 100, y);
    y += 7;
    doc.text(`H+Al: ${dados.hal || 'N/A'} cmolc/dm³`, 20, y);
    doc.text(`CTC: ${dados.ctc || 'N/A'} cmolc/dm³`, 100, y);
    y += 7;
    doc.text(`% Argila: ${dados.argila || 'N/A'}`, 20, y);
    doc.text(`V%: ${dados.v1.toFixed(2)}`, 100, y);
    y += 15;
    
    // Calagem
    const v2 = parseFloat(document.getElementById('v2')?.value) || 70;
    const prnt = parseFloat(document.getElementById('prnt')?.value) || 100;
    const nc = calcularNC(dados.v1, v2, dados.ctc, prnt);
    
    doc.setFontSize(14);
    doc.text('Recomendação de Calagem', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Necessidade de Calcário: ${nc.toFixed(2)} t/ha`, 20, y);
    y += 10;
    
    // Gessagem
    const ng = calcularNG(dados.argila);
    doc.setFontSize(14);
    doc.text('Recomendação de Gessagem', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Necessidade de Gesso: ${ng.toFixed(2)} kg/ha`, 20, y);
    y += 10;
    
    // Rodapé
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
    
    // Salvar
    doc.save('recomendacao-agrocultive.pdf');
}

