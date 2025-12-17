// Módulo de Geolocalização - Implementação Completa
class GPSModule {
    constructor() {
        this.isAvailable = 'geolocation' in navigator;
        this.currentPosition = null;
        this.watchId = null;
        this.isTracking = false;
        this.pontos = [];
        this.currentAccuracy = null;
    }

    // Verificar se o GPS está disponível
    isGPSAvailable() {
        return this.isAvailable;
    }

    // Obter posição atual
    getCurrentPosition() {
        if (!this.isAvailable) {
            return Promise.reject(new Error('Geolocalização não disponível neste dispositivo'));
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude || null,
                        heading: position.coords.heading || null,
                        speed: position.coords.speed || null,
                        timestamp: new Date().toISOString()
                    };
                    this.currentAccuracy = position.coords.accuracy;
                    resolve(this.currentPosition);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    // Iniciar rastreamento contínuo
    startTracking(callback) {
        if (!this.isAvailable) {
            return Promise.reject(new Error('Geolocalização não disponível'));
        }

        if (this.isTracking) {
            this.stopTracking();
        }

        this.isTracking = true;
        this.pontos = [];

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude || null,
                    heading: position.coords.heading || null,
                    speed: position.coords.speed || null,
                    timestamp: new Date().toISOString()
                };
                this.currentAccuracy = position.coords.accuracy;
                
                if (callback) {
                    callback(this.currentPosition);
                }
            },
            (error) => {
                console.error('Erro no GPS:', error);
                if (callback) {
                    callback(null, error);
                }
            },
            options
        );

        return Promise.resolve();
    }

    // Parar rastreamento
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
    }

    // Marcar ponto de amostra
    marcarPonto(numeroPonto) {
        if (!this.currentPosition) {
            return null;
        }

        const ponto = {
            numero: numeroPonto,
            latitude: this.currentPosition.latitude,
            longitude: this.currentPosition.longitude,
            accuracy: this.currentPosition.accuracy,
            timestamp: new Date().toISOString()
        };

        this.pontos.push(ponto);
        return ponto;
    }

    // Obter todos os pontos marcados
    getPontos() {
        return this.pontos;
    }

    // Limpar pontos
    limparPontos() {
        this.pontos = [];
    }

    // Obter precisão atual
    getAccuracy() {
        return this.currentAccuracy;
    }

    // Verificar se a precisão é boa (menor que 10 metros)
    isAccuracyGood() {
        return this.currentAccuracy !== null && this.currentAccuracy <= 10;
    }

    // Obter status do GPS
    getStatus() {
        return {
            isAvailable: this.isAvailable,
            isTracking: this.isTracking,
            currentPosition: this.currentPosition,
            accuracy: this.currentAccuracy,
            pontosCount: this.pontos.length,
            isAccuracyGood: this.isAccuracyGood()
        };
    }
}

// Instância global do módulo GPS
const gpsModule = new GPSModule();
