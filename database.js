// Módulo de Gerenciamento de Dados - Híbrido (Firebase + LocalStorage)
// Usa Firebase quando disponível, LocalStorage como fallback
// Estrutura reorganizada: Cliente -> Talhão (sem Propriedade)

class Database {
    constructor() {
        this.storageKey = 'agrocultive_db';
        this.useFirebase = false;
        this.firebaseDb = null;
        this.init();
    }

    async init() {
        // Verificar se Firebase está disponível
        if (window.firebaseDb && window.firebaseDb.collection) {
            try {
                this.firebaseDb = window.firebaseDb;
                this.useFirebase = true;
                console.log('Usando Firebase Firestore como banco de dados');
            } catch (error) {
                console.warn('Firebase disponível mas com erro, usando LocalStorage:', error);
                this.initLocalStorage();
            }
        } else {
            console.log('Firebase não disponível, usando LocalStorage');
            this.initLocalStorage();
        }
    }

    initLocalStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                clientes: [],
                talhoes: [],
                coletas: [],
                analises: [],
                recomendacoes: []
            };
            this.save(initialData);
        }
    }

    // ========== OPERAÇÕES CRUD PARA CLIENTES ==========
    getClientes() {
        if (this.useFirebase) {
            // Retornar Promise para Firebase
            return this.firebaseDb.collection('clientes').get()
                .then(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
                .catch(error => {
                    console.error('Erro ao buscar clientes no Firebase:', error);
                    return [];
                });
        }
        // Retornar valor síncrono para LocalStorage
        return this.load().clientes || [];
    }

    async getCliente(id) {
        if (this.useFirebase) {
            try {
                const doc = await this.firebaseDb.collection('clientes').doc(id).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error('Erro ao buscar cliente no Firebase:', error);
                return null;
            }
        }
        return this.getClientes().find(c => c.id === id);
    }

    async addCliente(cliente) {
        if (this.useFirebase) {
            try {
                cliente.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await this.firebaseDb.collection('clientes').add(cliente);
                return { id: docRef.id, ...cliente };
            } catch (error) {
                console.error('Erro ao adicionar cliente no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        cliente.id = this.generateId();
        cliente.createdAt = new Date().toISOString();
        data.clientes.push(cliente);
        this.save(data);
        return cliente;
    }

    async updateCliente(id, updates) {
        if (this.useFirebase) {
            try {
                updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await this.firebaseDb.collection('clientes').doc(id).update(updates);
                return await this.getCliente(id);
            } catch (error) {
                console.error('Erro ao atualizar cliente no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        const index = data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            data.clientes[index] = { ...data.clientes[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.clientes[index];
        }
        return null;
    }

    async deleteCliente(id) {
        if (this.useFirebase) {
            try {
                // Deletar talhões relacionados
                const talhoes = await this.getTalhoes(id);
                for (const talhao of talhoes) {
                    await this.deleteTalhao(talhao.id);
                }
                await this.firebaseDb.collection('clientes').doc(id).delete();
            } catch (error) {
                console.error('Erro ao deletar cliente no Firebase:', error);
                throw error;
            }
            return;
        }
        const data = this.load();
        data.clientes = data.clientes.filter(c => c.id !== id);
        data.talhoes = data.talhoes.filter(t => t.clienteId !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA TALHÕES ==========
    async getTalhoes(clienteId = null) {
        if (this.useFirebase) {
            try {
                let query = this.firebaseDb.collection('talhoes');
                if (clienteId) {
                    query = query.where('clienteId', '==', clienteId);
                }
                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Erro ao buscar talhões no Firebase:', error);
                return [];
            }
        }
        const talhoes = this.load().talhoes || [];
        if (clienteId) {
            return talhoes.filter(t => t.clienteId === clienteId);
        }
        return talhoes;
    }

    async getTalhao(id) {
        if (this.useFirebase) {
            try {
                const doc = await this.firebaseDb.collection('talhoes').doc(id).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error('Erro ao buscar talhão no Firebase:', error);
                return null;
            }
        }
        return this.getTalhoes().find(t => t.id === id);
    }

    async addTalhao(talhao) {
        if (this.useFirebase) {
            try {
                talhao.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await this.firebaseDb.collection('talhoes').add(talhao);
                return { id: docRef.id, ...talhao };
            } catch (error) {
                console.error('Erro ao adicionar talhão no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        talhao.id = this.generateId();
        talhao.createdAt = new Date().toISOString();
        data.talhoes.push(talhao);
        this.save(data);
        return talhao;
    }

    async updateTalhao(id, updates) {
        if (this.useFirebase) {
            try {
                updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await this.firebaseDb.collection('talhoes').doc(id).update(updates);
                return await this.getTalhao(id);
            } catch (error) {
                console.error('Erro ao atualizar talhão no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        const index = data.talhoes.findIndex(t => t.id === id);
        if (index !== -1) {
            data.talhoes[index] = { ...data.talhoes[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.talhoes[index];
        }
        return null;
    }

    async deleteTalhao(id) {
        if (this.useFirebase) {
            try {
                const coletas = await this.getColetas(id);
                for (const coleta of coletas) {
                    await this.deleteColeta(coleta.id);
                }
                const analises = await this.getAnalises(id);
                for (const analise of analises) {
                    await this.deleteAnalise(analise.id);
                }
                await this.firebaseDb.collection('talhoes').doc(id).delete();
            } catch (error) {
                console.error('Erro ao deletar talhão no Firebase:', error);
                throw error;
            }
            return;
        }
        const data = this.load();
        data.talhoes = data.talhoes.filter(t => t.id !== id);
        data.coletas = data.coletas.filter(c => c.talhaoId !== id);
        data.analises = data.analises.filter(a => a.talhaoId !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA COLETAS DE CAMPO ==========
    async getColetas(talhaoId = null) {
        if (this.useFirebase) {
            try {
                let query = this.firebaseDb.collection('coletas');
                if (talhaoId) {
                    query = query.where('talhaoId', '==', talhaoId);
                }
                const snapshot = await query.get();
                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { 
                        id: doc.id, 
                        ...data,
                        subamostras: data.subamostras || []
                    };
                });
            } catch (error) {
                console.error('Erro ao buscar coletas no Firebase:', error);
                return [];
            }
        }
        const coletas = this.load().coletas || [];
        if (talhaoId) {
            return coletas.filter(c => c.talhaoId === talhaoId);
        }
        return coletas;
    }

    async getColeta(id) {
        if (this.useFirebase) {
            try {
                const doc = await this.firebaseDb.collection('coletas').doc(id).get();
                if (doc.exists) {
                    const data = doc.data();
                    return { 
                        id: doc.id, 
                        ...data,
                        subamostras: data.subamostras || []
                    };
                }
                return null;
            } catch (error) {
                console.error('Erro ao buscar coleta no Firebase:', error);
                return null;
            }
        }
        return this.getColetas().find(c => c.id === id);
    }

    async addColeta(coleta) {
        if (this.useFirebase) {
            try {
                coleta.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                if (!coleta.subamostras) {
                    coleta.subamostras = [];
                }
                const docRef = await this.firebaseDb.collection('coletas').add(coleta);
                return { id: docRef.id, ...coleta };
            } catch (error) {
                console.error('Erro ao adicionar coleta no Firebase:', error);
                throw error;
            }
        }
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

    async updateColeta(id, updates) {
        if (this.useFirebase) {
            try {
                updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await this.firebaseDb.collection('coletas').doc(id).update(updates);
                return await this.getColeta(id);
            } catch (error) {
                console.error('Erro ao atualizar coleta no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        const index = data.coletas.findIndex(c => c.id === id);
        if (index !== -1) {
            data.coletas[index] = { ...data.coletas[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.coletas[index];
        }
        return null;
    }

    async addSubamostra(coletaId, subamostra) {
        if (this.useFirebase) {
            try {
                const coleta = await this.getColeta(coletaId);
                if (coleta) {
                    subamostra.id = this.generateId();
                    subamostra.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                    const subamostras = coleta.subamostras || [];
                    subamostras.push(subamostra);
                    await this.updateColeta(coletaId, { subamostras });
                    return subamostra;
                }
                return null;
            } catch (error) {
                console.error('Erro ao adicionar subamostra no Firebase:', error);
                throw error;
            }
        }
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

    async deleteColeta(id) {
        if (this.useFirebase) {
            try {
                await this.firebaseDb.collection('coletas').doc(id).delete();
            } catch (error) {
                console.error('Erro ao deletar coleta no Firebase:', error);
                throw error;
            }
            return;
        }
        const data = this.load();
        data.coletas = data.coletas.filter(c => c.id !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA ANÁLISES DE SOLO ==========
    async getAnalises(talhaoId = null) {
        if (this.useFirebase) {
            try {
                let query = this.firebaseDb.collection('analises');
                if (talhaoId) {
                    query = query.where('talhaoId', '==', talhaoId);
                }
                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Erro ao buscar análises no Firebase:', error);
                return [];
            }
        }
        const analises = this.load().analises || [];
        if (talhaoId) {
            return analises.filter(a => a.talhaoId === talhaoId);
        }
        return analises;
    }

    async getAnalise(id) {
        if (this.useFirebase) {
            try {
                const doc = await this.firebaseDb.collection('analises').doc(id).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error('Erro ao buscar análise no Firebase:', error);
                return null;
            }
        }
        return this.getAnalises().find(a => a.id === id);
    }

    async addAnalise(analise) {
        if (this.useFirebase) {
            try {
                analise.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await this.firebaseDb.collection('analises').add(analise);
                return { id: docRef.id, ...analise };
            } catch (error) {
                console.error('Erro ao adicionar análise no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        analise.id = this.generateId();
        analise.createdAt = new Date().toISOString();
        data.analises.push(analise);
        this.save(data);
        return analise;
    }

    async updateAnalise(id, updates) {
        if (this.useFirebase) {
            try {
                updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                await this.firebaseDb.collection('analises').doc(id).update(updates);
                return await this.getAnalise(id);
            } catch (error) {
                console.error('Erro ao atualizar análise no Firebase:', error);
                throw error;
            }
        }
        const data = this.load();
        const index = data.analises.findIndex(a => a.id === id);
        if (index !== -1) {
            data.analises[index] = { ...data.analises[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(data);
            return data.analises[index];
        }
        return null;
    }

    async deleteAnalise(id) {
        if (this.useFirebase) {
            try {
                await this.firebaseDb.collection('analises').doc(id).delete();
            } catch (error) {
                console.error('Erro ao deletar análise no Firebase:', error);
                throw error;
            }
            return;
        }
        const data = this.load();
        data.analises = data.analises.filter(a => a.id !== id);
        this.save(data);
    }

    // ========== OPERAÇÕES CRUD PARA RECOMENDAÇÕES ==========
    async getRecomendacoes(analiseId = null) {
        if (this.useFirebase) {
            try {
                let query = this.firebaseDb.collection('recomendacoes');
                if (analiseId) {
                    query = query.where('analiseId', '==', analiseId);
                }
                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Erro ao buscar recomendações no Firebase:', error);
                return [];
            }
        }
        const recomendacoes = this.load().recomendacoes || [];
        if (analiseId) {
            return recomendacoes.filter(r => r.analiseId === analiseId);
        }
        return recomendacoes;
    }

    async addRecomendacao(recomendacao) {
        if (this.useFirebase) {
            try {
                recomendacao.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await this.firebaseDb.collection('recomendacoes').add(recomendacao);
                return { id: docRef.id, ...recomendacao };
            } catch (error) {
                console.error('Erro ao adicionar recomendação no Firebase:', error);
                throw error;
            }
        }
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
    async clear() {
        if (this.useFirebase) {
            try {
                const collections = ['clientes', 'talhoes', 'coletas', 'analises', 'recomendacoes'];
                for (const collection of collections) {
                    const snapshot = await this.firebaseDb.collection(collection).get();
                    const batch = this.firebaseDb.batch();
                    snapshot.docs.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                }
            } catch (error) {
                console.error('Erro ao limpar dados no Firebase:', error);
                throw error;
            }
        } else {
            localStorage.removeItem(this.storageKey);
            this.initLocalStorage();
        }
    }
}

// Instância global do banco de dados
// Aguardar inicialização do Firebase antes de criar a instância
let db = null;

// Função para inicializar o banco de dados após o Firebase estar pronto
async function initDatabase() {
    // Aguardar um pouco para garantir que o Firebase foi carregado
    await new Promise(resolve => setTimeout(resolve, 100));
    db = new Database();
    window.db = db; // Tornar global para compatibilidade
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatabase);
} else {
    initDatabase();
}
