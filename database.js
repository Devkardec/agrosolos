// Módulo de Gerenciamento de Dados - LocalStorage
// Estrutura reorganizada: Cliente -> Talhão (sem Propriedade)
class Database {
    constructor() {
        this.storageKey = 'agrocultive_db';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                clientes: [],
                talhoes: [],
                coletas: [], // Coletas de campo com GPS
                analises: [], // Análises de solo (após receber do laboratório)
                recomendacoes: [] // Recomendações finais
            };
            this.save(initialData);
        }
    }

    // ========== OPERAÇÕES CRUD PARA CLIENTES ==========
    getClientes() {
        return this.load().clientes || [];
    }

    getCliente(id) {
        return this.getClientes().find(c => c.id === id);
    }

    addCliente(cliente) {
        const data = this.load();
        cliente.id = this.generateId();
        cliente.createdAt = new Date().toISOString();
        data.clientes.push(cliente);
        this.save(data);
        return cliente;
    }

    updateCliente(id, updates) {
        const data = this.load();
        const index = data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            data.clientes[index] = { ...data.clientes[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.clientes[index];
        }
        return null;
    }

    deleteCliente(id) {
        const data = this.load();
        data.clientes = data.clientes.filter(c => c.id !== id);
        // Deletar talhões relacionados
        data.talhoes = data.talhoes.filter(t => t.clienteId !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA TALHÕES ==========
    getTalhoes(clienteId = null) {
        const talhoes = this.load().talhoes || [];
        if (clienteId) {
            return talhoes.filter(t => t.clienteId === clienteId);
        }
        return talhoes;
    }

    getTalhao(id) {
        return this.getTalhoes().find(t => t.id === id);
    }

    addTalhao(talhao) {
        const data = this.load();
        talhao.id = this.generateId();
        talhao.createdAt = new Date().toISOString();
        data.talhoes.push(talhao);
        this.save(data);
        return talhao;
    }

    updateTalhao(id, updates) {
        const data = this.load();
        const index = data.talhoes.findIndex(t => t.id === id);
        if (index !== -1) {
            data.talhoes[index] = { ...data.talhoes[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.talhoes[index];
        }
        return null;
    }

    deleteTalhao(id) {
        const data = this.load();
        data.talhoes = data.talhoes.filter(t => t.id !== id);
        // Deletar coletas e análises relacionadas
        data.coletas = data.coletas.filter(c => c.talhaoId !== id);
        data.analises = data.analises.filter(a => a.talhaoId !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA COLETAS DE CAMPO ==========
    getColetas(talhaoId = null) {
        const coletas = this.load().coletas || [];
        if (talhaoId) {
            return coletas.filter(c => c.talhaoId === talhaoId);
        }
        return coletas;
    }

    getColeta(id) {
        return this.getColetas().find(c => c.id === id);
    }

    addColeta(coleta) {
        const data = this.load();
        coleta.id = this.generateId();
        coleta.createdAt = new Date().toISOString();
        if (!coleta.subamostras) {
            coleta.subamostras = [];
        }
        data.coletas.push(coleta);
        this.save(data);
        return coleta;
    }

    updateColeta(id, updates) {
        const data = this.load();
        const index = data.coletas.findIndex(c => c.id === id);
        if (index !== -1) {
            data.coletas[index] = { ...data.coletas[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.coletas[index];
        }
        return null;
    }

    addSubamostra(coletaId, subamostra) {
        const coleta = this.getColeta(coletaId);
        if (coleta) {
            if (!coleta.subamostras) {
                coleta.subamostras = [];
            }
            subamostra.id = this.generateId();
            subamostra.timestamp = new Date().toISOString();
            coleta.subamostras.push(subamostra);
            this.updateColeta(coletaId, { subamostras: coleta.subamostras });
            return subamostra;
        }
        return null;
    }

    deleteColeta(id) {
        const data = this.load();
        data.coletas = data.coletas.filter(c => c.id !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA ANÁLISES DE SOLO ==========
    getAnalises(talhaoId = null) {
        const analises = this.load().analises || [];
        if (talhaoId) {
            return analises.filter(a => a.talhaoId === talhaoId);
        }
        return analises;
    }

    getAnalise(id) {
        return this.getAnalises().find(a => a.id === id);
    }

    addAnalise(analise) {
        const data = this.load();
        analise.id = this.generateId();
        analise.createdAt = new Date().toISOString();
        data.analises.push(analise);
        this.save(data);
        return analise;
    }

    updateAnalise(id, updates) {
        const data = this.load();
        const index = data.analises.findIndex(a => a.id === id);
        if (index !== -1) {
            data.analises[index] = { ...data.analises[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.analises[index];
        }
        return null;
    }

    deleteAnalise(id) {
        const data = this.load();
        data.analises = data.analises.filter(a => a.id !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA RECOMENDAÇÕES ==========
    getRecomendacoes(analiseId = null) {
        const recomendacoes = this.load().recomendacoes || [];
        if (analiseId) {
            return recomendacoes.filter(r => r.analiseId === analiseId);
        }
        return recomendacoes;
    }

    addRecomendacao(recomendacao) {
        const data = this.load();
        recomendacao.id = this.generateId();
        recomendacao.createdAt = new Date().toISOString();
        data.recomendacoes.push(recomendacao);
        this.save(data);
        return recomendacao;
    }

    // ========== MÉTODOS AUXILIARES ==========
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { 
                clientes: [], 
                talhoes: [], 
                coletas: [], 
                analises: [], 
                recomendacoes: [] 
            };
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return { 
                clientes: [], 
                talhoes: [], 
                coletas: [], 
                analises: [], 
                recomendacoes: [] 
            };
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Limpar todos os dados (útil para testes)
    clear() {
        localStorage.removeItem(this.storageKey);
        this.init();
    }
}

// Instância global do banco de dados
const db = new Database();
