// Módulo de UI - Mapeamento de Coleta
class MapeamentoUI {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polyline = null;
        this.talhaoId = null;
        this.amostraId = null;
        this.isColetando = false;
        this.numeroPonto = 0;
        this.init();
    }

    init() {
        // Event listeners serão adicionados no render
    }

    render(talhaoId, amostraId = null) {
        this.talhaoId = talhaoId;
        this.amostraId = amostraId;
        this.numeroPonto = 0;
        this.markers = [];
        
        const talhao = db.getTalhoes().find(t => t.id === talhaoId);
        const propriedade = talhao ? db.getPropriedades().find(p => p.id === talhao.propriedadeId) : null;
        const cliente = propriedade ? db.getClientes().find(c => c.id === propriedade.clienteId) : null;

        // Carregar pontos salvos se houver amostra
        let pontosSalvos = [];
        if (amostraId) {
            const coletas = db.getColetas(amostraId);
            if (coletas.length > 0) {
                pontosSalvos = coletas[0].pontos || [];
            }
        }

        const html = `
            <div class="mb-6">
                <button onclick="mapeamento.voltar()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-map-marked-alt mr-2 text-green-600"></i>Mapeamento de Coleta
                </h2>
                <p class="text-sm text-gray-600 mt-1">${talhao?.nome || 'Talhão'}</p>
            </div>

            <!-- Status e Controles -->
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 mb-4 border border-white/20">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div class="flex items-center space-x-4">
                        <div id="gpsStatus" class="flex items-center space-x-2">
                            <i class="fas fa-circle text-gray-400"></i>
                            <span class="text-sm text-gray-600">GPS: Aguardando...</span>
                        </div>
                        <div id="accuracyStatus" class="text-sm text-gray-600">
                            Precisão: -- m
                        </div>
                        <div id="pontosCount" class="text-sm font-semibold text-green-600">
                            Pontos: 0
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button id="btnIniciarColeta" onclick="mapeamento.iniciarColeta()" 
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-play mr-2"></i>Iniciar Caminhada de Coleta
                        </button>
                        <button id="btnMarcarPonto" onclick="mapeamento.marcarPonto()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition hidden" disabled>
                            <i class="fas fa-map-pin mr-2"></i>Marcar Ponto de Amostra
                        </button>
                        <button id="btnFinalizarColeta" onclick="mapeamento.finalizarColeta()" 
                            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition hidden">
                            <i class="fas fa-stop mr-2"></i>Finalizar Coleta
                        </button>
                    </div>
                </div>
                <div id="avisoPrecisao" class="mt-2 hidden"></div>
            </div>

            <!-- Mapa -->
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 mb-4 border border-white/20">
                <div id="map" style="height: 500px; width: 100%; border-radius: 8px;"></div>
            </div>

            <!-- Lista de Pontos e Exportação -->
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-white/20">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800">
                        <i class="fas fa-list mr-2 text-green-600"></i>Pontos Marcados
                    </h3>
                    <div class="flex space-x-2">
                        <button onclick="mapeamento.exportarCSV()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm">
                            <i class="fas fa-file-csv mr-2"></i>Exportar CSV
                        </button>
                        <button onclick="mapeamento.exportarKML()" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition text-sm">
                            <i class="fas fa-file-code mr-2"></i>Exportar KML
                        </button>
                    </div>
                </div>
                <div id="listaPontos" class="space-y-2 max-h-64 overflow-y-auto">
                    ${pontosSalvos.length > 0 ? this.renderListaPontos(pontosSalvos) : '<p class="text-gray-500 text-center py-4">Nenhum ponto marcado ainda</p>'}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-mapeamento');
        if (container) {
            container.innerHTML = html;
        }

        // Inicializar mapa após inserir HTML
        setTimeout(() => {
            this.initMap(pontosSalvos);
        }, 100);
    }

    initMap(pontosIniciais = []) {
        // Inicializar mapa Leaflet
        if (this.map) {
            this.map.remove();
        }

        // Coordenadas iniciais (centro do Brasil)
        const latInicial = pontosIniciais.length > 0 ? pontosIniciais[0].latitude : -15.7975;
        const lngInicial = pontosIniciais.length > 0 ? pontosIniciais[0].longitude : -47.8919;

        this.map = L.map('map').setView([latInicial, lngInicial], 16);

        // Adicionar tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Adicionar pontos iniciais se houver
        if (pontosIniciais.length > 0) {
            pontosIniciais.forEach((ponto, index) => {
                this.adicionarMarcador(ponto.latitude, ponto.longitude, ponto.numero || index + 1, ponto.accuracy);
            });
            this.atualizarLinha();
        }
    }

    iniciarColeta() {
        if (!gpsModule.isGPSAvailable()) {
            alert('GPS não disponível neste dispositivo. Verifique as permissões de localização.');
            return;
        }

        this.isColetando = true;
        this.numeroPonto = 0;
        this.markers = [];
        if (this.polyline) {
            this.map.removeLayer(this.polyline);
            this.polyline = null;
        }

        // Limpar pontos anteriores se não houver amostra
        if (!this.amostraId) {
            gpsModule.limparPontos();
        }

        // Iniciar rastreamento GPS
        gpsModule.startTracking((position, error) => {
            if (error) {
                this.atualizarStatusGPS('error', `Erro: ${error.message}`);
                return;
            }

            if (position) {
                this.atualizarStatusGPS('active', 'Ativo');
                this.atualizarPrecisao(position.accuracy);
                
                // Centralizar mapa na posição atual
                this.map.setView([position.latitude, position.longitude], 18);
            }
        });

        // Atualizar UI
        document.getElementById('btnIniciarColeta').classList.add('hidden');
        document.getElementById('btnMarcarPonto').classList.remove('hidden');
        document.getElementById('btnMarcarPonto').disabled = false;
        document.getElementById('btnFinalizarColeta').classList.remove('hidden');
    }

    marcarPonto() {
        if (!this.isColetando || !gpsModule.currentPosition) {
            alert('Aguarde o GPS obter uma posição válida.');
            return;
        }

        this.numeroPonto++;
        const ponto = gpsModule.marcarPonto(this.numeroPonto);
        
        if (ponto) {
            this.adicionarMarcador(ponto.latitude, ponto.longitude, ponto.numero, ponto.accuracy);
            this.atualizarLinha();
            this.atualizarListaPontos();
            this.atualizarContadorPontos();
        }
    }

    adicionarMarcador(lat, lng, numero, accuracy) {
        const marker = L.marker([lat, lng]).addTo(this.map);
        
        // Popup com informações do ponto
        const popup = `
            <div class="text-sm">
                <strong>Ponto ${numero}</strong><br>
                Lat: ${lat.toFixed(6)}<br>
                Lng: ${lng.toFixed(6)}<br>
                Precisão: ${accuracy.toFixed(1)} m
            </div>
        `;
        marker.bindPopup(popup);

        // Ícone personalizado com número
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: #16a34a; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${numero}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        marker.setIcon(icon);

        this.markers.push({ marker, lat, lng, numero, accuracy });
    }

    atualizarLinha() {
        if (this.markers.length < 2) return;

        // Remover linha anterior
        if (this.polyline) {
            this.map.removeLayer(this.polyline);
        }

        // Criar nova linha conectando os pontos
        const coordinates = this.markers.map(m => [m.lat, m.lng]);
        this.polyline = L.polyline(coordinates, {
            color: '#16a34a',
            weight: 3,
            opacity: 0.7
        }).addTo(this.map);

        // Ajustar zoom para mostrar todos os pontos
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers.map(m => m.marker));
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    atualizarStatusGPS(status, texto) {
        const statusEl = document.getElementById('gpsStatus');
        const icon = statusEl.querySelector('i');
        
        if (status === 'active') {
            icon.className = 'fas fa-circle text-green-500';
            icon.style.animation = 'pulse 2s infinite';
        } else if (status === 'error') {
            icon.className = 'fas fa-circle text-red-500';
        } else {
            icon.className = 'fas fa-circle text-gray-400';
        }
        
        statusEl.querySelector('span').textContent = `GPS: ${texto}`;
    }

    atualizarPrecisao(accuracy) {
        const accuracyEl = document.getElementById('accuracyStatus');
        accuracyEl.textContent = `Precisão: ${accuracy.toFixed(1)} m`;
        
        const avisoEl = document.getElementById('avisoPrecisao');
        
        if (accuracy > 10) {
            avisoEl.className = 'mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded';
            avisoEl.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>Atenção: Precisão do GPS está baixa (${accuracy.toFixed(1)} m). Aguarde alguns segundos para melhorar o sinal.`;
            avisoEl.classList.remove('hidden');
        } else if (accuracy > 5) {
            avisoEl.className = 'mt-2 p-2 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded';
            avisoEl.innerHTML = `<i class="fas fa-info-circle mr-2"></i>Precisão moderada (${accuracy.toFixed(1)} m). Sinal pode melhorar.`;
            avisoEl.classList.remove('hidden');
        } else {
            avisoEl.classList.add('hidden');
        }
    }

    atualizarContadorPontos() {
        const total = this.markers.length;
        document.getElementById('pontosCount').textContent = `Pontos: ${total}`;
    }

    atualizarListaPontos() {
        const listaEl = document.getElementById('listaPontos');
        const pontos = this.markers.map(m => ({
            numero: m.numero,
            latitude: m.lat,
            longitude: m.lng,
            accuracy: m.accuracy
        }));
        listaEl.innerHTML = this.renderListaPontos(pontos);
    }

    renderListaPontos(pontos) {
        if (pontos.length === 0) {
            return '<p class="text-gray-500 text-center py-4">Nenhum ponto marcado ainda</p>';
        }

        return pontos.map(ponto => `
            <div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">${ponto.numero}</span>
                            <span class="font-semibold text-gray-800">Ponto ${ponto.numero}</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">
                            Lat: ${ponto.latitude.toFixed(6)}, Lng: ${ponto.longitude.toFixed(6)}
                        </p>
                        <p class="text-xs text-gray-500">Precisão: ${ponto.accuracy.toFixed(1)} m</p>
                    </div>
                    <button onclick="mapeamento.removerPonto(${ponto.numero})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    removerPonto(numero) {
        if (confirm(`Deseja remover o Ponto ${numero}?`)) {
            const index = this.markers.findIndex(m => m.numero === numero);
            if (index !== -1) {
                this.map.removeLayer(this.markers[index].marker);
                this.markers.splice(index, 1);
                this.atualizarLinha();
                this.atualizarListaPontos();
                this.atualizarContadorPontos();
            }
        }
    }

    finalizarColeta() {
        if (this.markers.length === 0) {
            alert('Nenhum ponto foi marcado. Deseja cancelar a coleta?');
            return;
        }

        if (!confirm(`Finalizar coleta com ${this.markers.length} ponto(s) marcado(s)?`)) {
            return;
        }

        // Parar rastreamento GPS
        gpsModule.stopTracking();
        this.isColetando = false;

        // Preparar dados dos pontos
        const pontos = this.markers.map(m => ({
            numero: m.numero,
            latitude: m.lat,
            longitude: m.lng,
            accuracy: m.accuracy,
            timestamp: new Date().toISOString()
        }));

        // Salvar no banco de dados
        if (this.amostraId) {
            // Atualizar coleta existente ou criar nova
            const coletas = db.getColetas(this.amostraId);
            if (coletas.length > 0) {
                db.updateColeta(coletas[0].id, { pontos });
            } else {
                db.addColeta({
                    amostraId: this.amostraId,
                    talhaoId: this.talhaoId,
                    pontos: pontos,
                    finalizada: true
                });
            }
        } else {
            // Criar coleta temporária (será vinculada quando a amostra for criada)
            const coleta = db.addColeta({
                talhaoId: this.talhaoId,
                pontos: pontos,
                finalizada: true
            });
            // Armazenar ID temporariamente
            window.coletaTemporariaId = coleta.id;
        }

        // Atualizar UI
        document.getElementById('btnIniciarColeta').classList.remove('hidden');
        document.getElementById('btnMarcarPonto').classList.add('hidden');
        document.getElementById('btnFinalizarColeta').classList.add('hidden');
        this.atualizarStatusGPS('inactive', 'Finalizado');

        alert(`Coleta finalizada com sucesso! ${pontos.length} ponto(s) salvo(s).`);
    }

    exportarCSV() {
        if (this.markers.length === 0) {
            alert('Nenhum ponto para exportar.');
            return;
        }

        const pontos = this.markers.map(m => ({
            numero: m.numero,
            latitude: m.lat,
            longitude: m.lng,
            accuracy: m.accuracy
        }));

        let csv = 'Número,Latitude,Longitude,Precisão (m)\n';
        pontos.forEach(p => {
            csv += `${p.numero},${p.latitude},${p.longitude},${p.accuracy.toFixed(2)}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `coleta_talhao_${this.talhaoId}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    exportarKML() {
        if (this.markers.length === 0) {
            alert('Nenhum ponto para exportar.');
            return;
        }

        const pontos = this.markers.map(m => ({
            numero: m.numero,
            latitude: m.lat,
            longitude: m.lng,
            accuracy: m.accuracy
        }));

        let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>Coleta de Amostras - Talhão ${this.talhaoId}</name>
        <description>Pontos de coleta de amostras de solo</description>
`;

        // Adicionar pontos
        pontos.forEach(p => {
            kml += `        <Placemark>
            <name>Ponto ${p.numero}</name>
            <description>Precisão: ${p.accuracy.toFixed(1)} m</description>
            <Point>
                <coordinates>${p.longitude},${p.latitude},0</coordinates>
            </Point>
        </Placemark>
`;
        });

        // Adicionar linha (path)
        if (pontos.length > 1) {
            kml += `        <Placemark>
            <name>Trajeto de Coleta</name>
            <LineString>
                <tessellate>1</tessellate>
                <coordinates>
`;
            pontos.forEach(p => {
                kml += `                    ${p.longitude},${p.latitude},0\n`;
            });
            kml += `                </coordinates>
            </LineString>
        </Placemark>
`;
        }

        kml += `    </Document>
</kml>`;

        const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `coleta_talhao_${this.talhaoId}_${new Date().toISOString().split('T')[0]}.kml`;
        link.click();
    }

    voltar() {
        if (this.isColetando) {
            if (confirm('Há uma coleta em andamento. Deseja finalizar antes de sair?')) {
                this.finalizarColeta();
            } else {
                gpsModule.stopTracking();
                this.isColetando = false;
            }
        }
        
        if (this.amostraId) {
            const amostra = db.getAmostras().find(a => a.id === this.amostraId);
            if (amostra) {
                navigation.goToAmostra(amostra.talhaoId, this.amostraId);
            }
        } else {
            const talhao = db.getTalhoes().find(t => t.id === this.talhaoId);
            if (talhao) {
                navigation.goToTalhoes(talhao.propriedadeId);
            }
        }
    }

    // Obter mapa como imagem (para PDF)
    getMapImage() {
        return new Promise((resolve) => {
            if (!this.map || this.markers.length === 0) {
                resolve(null);
                return;
            }

            // Usar html2canvas ou similar para capturar o mapa
            // Por enquanto, retornar null e usar coordenadas no PDF
            resolve(null);
        });
    }
}

// Instância global
window.mapeamento = new MapeamentoUI();

// Adicionar rota de navegação
if (window.navigation) {
    const originalGoToAmostra = navigation.goToAmostra;
    navigation.goToMapeamento = function(talhaoId, amostraId) {
        navigation.showScreen('mapeamento');
        if (window.mapeamento) {
            window.mapeamento.render(talhaoId, amostraId);
        }
    };
}

