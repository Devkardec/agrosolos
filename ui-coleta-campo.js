// Módulo de UI - Coleta de Campo com GPS
// Interface para coletar amostras de solo no campo com GPS em tempo real
class ColetaCampoUI {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polyline = null;
        this.watchId = null;
        this.currentColeta = null;
        this.currentPosition = null;
        this.init();
    }

    init() {
        // Verificar se GPS está disponível
        if (!navigator.geolocation) {
            console.warn('Geolocation não está disponível neste navegador');
        }
    }

    // ========== ABRIR MODAL DE NOVA COLETA ==========
    showNovaColetaModal() {
        const clientes = db.getClientes();
        
        if (clientes.length === 0) {
            alert('Por favor, cadastre pelo menos um cliente antes de iniciar uma coleta.');
            if (window.crm) {
                window.crm.render();
            }
            return;
        }

        const html = `
            <div id="modalNovaColeta" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-map-marked-alt mr-2 text-green-600"></i>Nova Coleta de Solo
                        </h3>
                        <button onclick="coletaCampo.closeModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="formNovaColeta" onsubmit="coletaCampo.iniciarColeta(event)">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                            <select id="selectCliente" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                onchange="window.coletaCampo.onClienteChange()">
                                <option value="">Selecione o cliente</option>
                                ${clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Talhão *</label>
                            <select id="selectTalhao" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Primeiro selecione o cliente</option>
                            </select>
                        </div>
                        
                        <div class="flex space-x-4">
                            <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-play mr-2"></i>Iniciar Coleta
                            </button>
                            <button type="button" onclick="coletaCampo.closeModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    onClienteChange() {
        const clienteId = document.getElementById('selectCliente').value;
        const selectTalhao = document.getElementById('selectTalhao');
        
        selectTalhao.innerHTML = '<option value="">Selecione o talhão</option>';
        
        if (clienteId) {
            const talhoes = db.getTalhoes(clienteId);
            talhoes.forEach(talhao => {
                const option = document.createElement('option');
                option.value = talhao.id;
                option.textContent = `${talhao.nome} (${getCulturaData(talhao.culturaAlvo)?.nome || talhao.culturaAlvo})`;
                selectTalhao.appendChild(option);
            });
        }
    }

    closeModal() {
        const modal = document.getElementById('modalNovaColeta');
        if (modal) {
            modal.remove();
        }
    }

    // ========== INICIAR COLETA ==========
    iniciarColeta(event) {
        event.preventDefault();
        
        const clienteId = document.getElementById('selectCliente').value;
        const talhaoId = document.getElementById('selectTalhao').value;
        
        if (!clienteId || !talhaoId) {
            alert('Por favor, selecione o cliente e o talhão.');
            return;
        }

        this.closeModal();
        
        // Criar nova coleta
        const coleta = {
            clienteId: clienteId,
            talhaoId: talhaoId,
            subamostras: [],
            status: 'em_andamento',
            dataInicio: new Date().toISOString()
        };
        
        this.currentColeta = db.addColeta(coleta);
        
        // Renderizar tela de coleta
        this.renderColetaScreen();
    }

    // ========== RENDERIZAR TELA DE COLETA ==========
    renderColetaScreen() {
        const coleta = this.currentColeta;
        const cliente = db.getCliente(coleta.clienteId);
        const talhao = db.getTalhao(coleta.talhaoId);
        
        const html = `
            <div class="mb-6">
                <button onclick="coletaCampo.voltar()" class="text-gray-600 hover:text-gray-800 mb-4">
                    <i class="fas fa-arrow-left mr-2"></i>Voltar
                </button>
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-map-marked-alt mr-2 text-green-600"></i>Coleta de Solo em Andamento
                </h2>
                <p class="text-sm text-gray-600 mt-1">Cliente: ${cliente?.nome || 'N/A'} | Talhão: ${talhao?.nome || 'N/A'}</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-white/20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Subamostras</p>
                            <p class="text-2xl font-bold text-green-600" id="contadorSubamostras">${coleta.subamostras?.length || 0}</p>
                        </div>
                        <i class="fas fa-map-pin text-3xl text-green-600 opacity-50"></i>
                    </div>
                </div>
                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-white/20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Precisão GPS</p>
                            <p class="text-2xl font-bold" id="gpsPrecisao">--</p>
                        </div>
                        <i class="fas fa-satellite text-3xl text-blue-600 opacity-50"></i>
                    </div>
                </div>
                <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-white/20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Status GPS</p>
                            <p class="text-lg font-bold" id="gpsStatus">Iniciando...</p>
                        </div>
                        <i class="fas fa-circle text-2xl text-yellow-500" id="gpsStatusIcon"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mb-4">
                <div id="map" style="height: 400px; width: 100%; border-radius: 0.5rem;"></div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20">
                <div class="flex flex-col md:flex-row gap-4">
                    <button onclick="coletaCampo.marcarSubamostra()" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition text-lg font-semibold">
                        <i class="fas fa-map-pin mr-2"></i>Marcar Subamostra
                    </button>
                    <button onclick="coletaCampo.finalizarColeta()" 
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition text-lg font-semibold">
                        <i class="fas fa-check mr-2"></i>Finalizar Coleta
                    </button>
                    <button onclick="coletaCampo.gerarGuiaRemessa()" 
                        class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition text-lg font-semibold">
                        <i class="fas fa-file-pdf mr-2"></i>Guia de Remessa
                    </button>
                </div>
            </div>
            
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mt-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="text-sm font-semibold text-blue-800 mb-2">
                        <i class="fas fa-info-circle mr-2"></i>Próximo Passo
                    </h4>
                    <p class="text-sm text-blue-700 mb-3">Após enviar as amostras ao laboratório e receber os resultados, preencha a análise de solo:</p>
                    <button onclick="navigation.goToAnalise('${coleta.talhaoId}')" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-flask mr-2"></i>Preencher Análise de Solo
                    </button>
                </div>
            </div>

            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-white/20 mt-4">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-list mr-2 text-green-600"></i>Subamostras Coletadas
                </h3>
                <div id="listaSubamostras" class="space-y-2 max-h-64 overflow-y-auto">
                    ${this.renderListaSubamostras(coleta.subamostras || [])}
                </div>
            </div>
        `;

        const container = document.getElementById('screen-coleta-campo');
        if (container) {
            container.innerHTML = html;
        }

        // Inicializar mapa e GPS
        this.initMap();
        this.iniciarGPS();
    }

    // ========== INICIALIZAR MAPA ==========
    initMap() {
        // Inicializar mapa no centro do Brasil
        this.map = L.map('map').setView([-15.7975, -47.8919], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Limpar marcadores e polilinha anteriores
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];
        if (this.polyline) {
            this.map.removeLayer(this.polyline);
        }

        // Adicionar marcadores das subamostras existentes
        if (this.currentColeta && this.currentColeta.subamostras) {
            const pontos = [];
            this.currentColeta.subamostras.forEach((sub, index) => {
                const marker = L.marker([sub.latitude, sub.longitude])
                    .addTo(this.map)
                    .bindPopup(`Subamostra ${index + 1}<br>${new Date(sub.timestamp).toLocaleString('pt-BR')}`);
                this.markers.push(marker);
                pontos.push([sub.latitude, sub.longitude]);
            });

            if (pontos.length > 1) {
                this.polyline = L.polyline(pontos, { color: '#22c55e', weight: 3 }).addTo(this.map);
                this.map.fitBounds(this.polyline.getBounds());
            }
        }
    }

    // ========== INICIAR GPS ==========
    iniciarGPS() {
        if (!navigator.geolocation) {
            document.getElementById('gpsStatus').textContent = 'GPS não disponível';
            document.getElementById('gpsStatusIcon').classList.add('text-red-500');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = position;
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Atualizar UI
                document.getElementById('gpsPrecisao').textContent = `${accuracy.toFixed(1)} m`;
                document.getElementById('gpsStatus').textContent = 'Ativo';
                document.getElementById('gpsStatusIcon').classList.remove('text-yellow-500', 'text-red-500');
                document.getElementById('gpsStatusIcon').classList.add('text-green-500');

                // Atualizar mapa
                if (this.map) {
                    this.map.setView([lat, lon], this.map.getZoom());
                    
                    // Adicionar/atualizar marcador de posição atual
                    if (this.currentMarker) {
                        this.map.removeLayer(this.currentMarker);
                    }
                    this.currentMarker = L.marker([lat, lon], {
                        icon: L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41]
                        })
                    }).addTo(this.map).bindPopup('Sua posição atual');
                }
            },
            (error) => {
                console.error('Erro GPS:', error);
                document.getElementById('gpsStatus').textContent = 'Erro';
                document.getElementById('gpsStatusIcon').classList.remove('text-yellow-500', 'text-green-500');
                document.getElementById('gpsStatusIcon').classList.add('text-red-500');
            },
            options
        );
    }

    // ========== MARCAR SUBAMOSTRA ==========
    marcarSubamostra() {
        if (!this.currentPosition) {
            alert('Aguardando posição GPS... Por favor, aguarde alguns segundos.');
            return;
        }

        if (!this.currentColeta) {
            alert('Erro: Coleta não encontrada.');
            return;
        }

        const subamostra = {
            latitude: this.currentPosition.coords.latitude,
            longitude: this.currentPosition.coords.longitude,
            accuracy: this.currentPosition.coords.accuracy,
            timestamp: new Date().toISOString()
        };

        db.addSubamostra(this.currentColeta.id, subamostra);
        
        // Atualizar coleta atual
        this.currentColeta = db.getColeta(this.currentColeta.id);
        
        // Atualizar UI
        this.atualizarUI();
        
        // Adicionar marcador no mapa
        const marker = L.marker([subamostra.latitude, subamostra.longitude])
            .addTo(this.map)
            .bindPopup(`Subamostra ${this.currentColeta.subamostras.length}<br>${new Date(subamostra.timestamp).toLocaleString('pt-BR')}`);
        this.markers.push(marker);

        // Atualizar polilinha
        if (this.currentColeta.subamostras.length > 1) {
            const pontos = this.currentColeta.subamostras.map(s => [s.latitude, s.longitude]);
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }
            this.polyline = L.polyline(pontos, { color: '#22c55e', weight: 3 }).addTo(this.map);
        }

        // Feedback visual
        const btn = event.target.closest('button');
        if (btn) {
            btn.classList.add('animate-pulse');
            setTimeout(() => btn.classList.remove('animate-pulse'), 500);
        }
    }

    // ========== ATUALIZAR UI ==========
    atualizarUI() {
        if (!this.currentColeta) return;
        
        const coleta = db.getColeta(this.currentColeta.id);
        document.getElementById('contadorSubamostras').textContent = coleta.subamostras?.length || 0;
        
        const lista = document.getElementById('listaSubamostras');
        if (lista) {
            lista.innerHTML = this.renderListaSubamostras(coleta.subamostras || []);
        }
    }

    renderListaSubamostras(subamostras) {
        if (subamostras.length === 0) {
            return '<p class="text-gray-500 text-center py-4">Nenhuma subamostra coletada ainda</p>';
        }

        return subamostras.map((sub, index) => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                    <span class="font-semibold">Subamostra ${index + 1}</span>
                    <p class="text-xs text-gray-600">
                        Lat: ${sub.latitude.toFixed(6)}, Lng: ${sub.longitude.toFixed(6)}
                    </p>
                    <p class="text-xs text-gray-500">${new Date(sub.timestamp).toLocaleString('pt-BR')}</p>
                </div>
                <span class="text-xs text-gray-500">${sub.accuracy.toFixed(1)} m</span>
            </div>
        `).join('');
    }

    // ========== FINALIZAR COLETA ==========
    finalizarColeta() {
        if (!this.currentColeta) return;

        const coleta = db.getColeta(this.currentColeta.id);
        
        if (!coleta.subamostras || coleta.subamostras.length === 0) {
            if (!confirm('Nenhuma subamostra foi coletada. Deseja realmente finalizar?')) {
                return;
            }
        }

        // Parar GPS
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        // Atualizar status
        db.updateColeta(this.currentColeta.id, {
            status: 'finalizada',
            dataFim: new Date().toISOString()
        });

        alert(`Coleta finalizada com sucesso! ${coleta.subamostras?.length || 0} subamostra(s) coletada(s).`);
        
        // Voltar para tela principal
        this.voltar();
    }

    // ========== GERAR GUIA DE REMESSA ==========
    gerarGuiaRemessa() {
        if (!this.currentColeta) {
            alert('Nenhuma coleta em andamento.');
            return;
        }

        const coleta = db.getColeta(this.currentColeta.id);
        const cliente = db.getCliente(coleta.clienteId);
        const talhao = db.getTalhao(coleta.talhaoId);

        if (!coleta.subamostras || coleta.subamostras.length === 0) {
            alert('Não há subamostras coletadas para gerar o guia de remessa.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('GUIA DE REMESSA PARA LABORATÓRIO', 20, 20);
        doc.setFontSize(12);
        doc.text('AgroCultive Soluções Rurais', 20, 30);

        let y = 45;

        // Dados do Cliente
        doc.setFontSize(14);
        doc.text('DADOS DO CLIENTE', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Nome: ${cliente?.nome || 'N/A'}`, 20, y);
        y += 7;
        if (cliente?.documento) {
            doc.text(`CPF/CNPJ: ${cliente.documento}`, 20, y);
            y += 7;
        }
        if (cliente?.endereco) {
            doc.text(`Endereço: ${cliente.endereco}`, 20, y);
            y += 7;
        }
        if (cliente?.localidade) {
            doc.text(`Localidade: ${cliente.localidade}${cliente.estado ? ' - ' + cliente.estado : ''}`, 20, y);
            y += 7;
        }
        if (cliente?.contato) {
            doc.text(`Contato: ${cliente.contato}`, 20, y);
            y += 7;
        }
        y += 5;

        // Dados do Talhão
        doc.setFontSize(14);
        doc.text('IDENTIFICAÇÃO DO TALHÃO', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Talhão: ${talhao?.nome || 'N/A'}`, 20, y);
        y += 7;
        doc.text(`Cultura Alvo: ${getCulturaData(talhao?.culturaAlvo)?.nome || talhao?.culturaAlvo || 'N/A'}`, 20, y);
        y += 7;
        doc.text(`Data da Coleta: ${new Date(coleta.dataInicio).toLocaleDateString('pt-BR')}`, 20, y);
        y += 10;

        // Coordenadas GPS
        doc.setFontSize(14);
        doc.text('COORDENADAS GPS DOS PONTOS COLETADOS', 20, y);
        y += 10;
        doc.setFontSize(9);

        coleta.subamostras.forEach((sub, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(`Subamostra ${index + 1}:`, 20, y);
            y += 6;
            doc.text(`  Latitude: ${sub.latitude.toFixed(6)}`, 25, y);
            y += 6;
            doc.text(`  Longitude: ${sub.longitude.toFixed(6)}`, 25, y);
            y += 6;
            doc.text(`  Horário: ${new Date(sub.timestamp).toLocaleString('pt-BR')}`, 25, y);
            y += 6;
            doc.text(`  Precisão: ${sub.accuracy.toFixed(1)} metros`, 25, y);
            y += 8;
        });

        // Rodapé
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(8);
        doc.text(`Total de subamostras: ${coleta.subamostras.length}`, 20, y);
        y += 6;
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, y);

        // Salvar
        const nomeArquivo = `Guia_Remessa_${cliente?.nome?.replace(/\s+/g, '_') || 'Cliente'}_${talhao?.nome?.replace(/\s+/g, '_') || 'Talhao'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
    }

    // ========== VOLTAR ==========
    voltar() {
        // Parar GPS
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        // Limpar referências
        this.currentColeta = null;
        this.currentPosition = null;
        this.markers = [];
        this.polyline = null;
        this.map = null;

        // Voltar para tela principal
        if (window.navigation) {
            window.navigation.goToDashboard();
        } else if (window.crm) {
            window.crm.render();
        }
    }
}

// Instância global
window.coletaCampo = new ColetaCampoUI();

