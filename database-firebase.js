// Módulo de Gerenciamento de Dados - Firebase Firestore
// Mantém a mesma interface do database.js para compatibilidade

class DatabaseFirebase {
    constructor() {
        this.db = window.firebaseDb;
        if (!this.db) {
            throw new Error('Firebase não inicializado. Verifique firebase-config.js');
        }
    }

    // ========== OPERAÇÕES CRUD PARA CLIENTES ==========
    async getClientes() {
        try {
            const snapshot = await this.db.collection('clientes').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            return [];
        }
    }

    async getCliente(id) {
        try {
            const doc = await this.db.collection('clientes').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return null;
        }
    }

    async addCliente(cliente) {
        try {
            cliente.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await this.db.collection('clientes').add(cliente);
            return { id: docRef.id, ...cliente };
        } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            throw error;
        }
    }

    async updateCliente(id, updates) {
        try {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await this.db.collection('clientes').doc(id).update(updates);
            return await this.getCliente(id);
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    }

    async deleteCliente(id) {
        try {
            // Deletar talhões relacionados
            const talhoes = await this.getTalhoes(id);
            for (const talhao of talhoes) {
                await this.deleteTalhao(talhao.id);
            }
            // Deletar cliente
            await this.db.collection('clientes').doc(id).delete();
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            throw error;
        }
    }

    // ========== OPERAÇÕES CRUD PARA TALHÕES ==========
    async getTalhoes(clienteId = null) {
        try {
            let query = this.db.collection('talhoes');
            if (clienteId) {
                query = query.where('clienteId', '==', clienteId);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar talhões:', error);
            return [];
        }
    }

    async getTalhao(id) {
        try {
            const doc = await this.db.collection('talhoes').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar talhão:', error);
            return null;
        }
    }

    async addTalhao(talhao) {
        try {
            talhao.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await this.db.collection('talhoes').add(talhao);
            return { id: docRef.id, ...talhao };
        } catch (error) {
            console.error('Erro ao adicionar talhão:', error);
            throw error;
        }
    }

    async updateTalhao(id, updates) {
        try {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await this.db.collection('talhoes').doc(id).update(updates);
            return await this.getTalhao(id);
        } catch (error) {
            console.error('Erro ao atualizar talhão:', error);
            throw error;
        }
    }

    async deleteTalhao(id) {
        try {
            // Deletar coletas e análises relacionadas
            const coletas = await this.getColetas(id);
            for (const coleta of coletas) {
                await this.deleteColeta(coleta.id);
            }
            const analises = await this.getAnalises(id);
            for (const analise of analises) {
                await this.deleteAnalise(analise.id);
            }
            // Deletar talhão
            await this.db.collection('talhoes').doc(id).delete();
        } catch (error) {
            console.error('Erro ao deletar talhão:', error);
            throw error;
        }
    }

    // ========== OPERAÇÕES CRUD PARA COLETAS DE CAMPO ==========
    async getColetas(talhaoId = null) {
        try {
            let query = this.db.collection('coletas');
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
            console.error('Erro ao buscar coletas:', error);
            return [];
        }
    }

    async getColeta(id) {
        try {
            const doc = await this.db.collection('coletas').doc(id).get();
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
            console.error('Erro ao buscar coleta:', error);
            return null;
        }
    }

    async addColeta(coleta) {
        try {
            coleta.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            if (!coleta.subamostras) {
                coleta.subamostras = [];
            }
            const docRef = await this.db.collection('coletas').add(coleta);
            return { id: docRef.id, ...coleta };
        } catch (error) {
            console.error('Erro ao adicionar coleta:', error);
            throw error;
        }
    }

    async updateColeta(id, updates) {
        try {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await this.db.collection('coletas').doc(id).update(updates);
            return await this.getColeta(id);
        } catch (error) {
            console.error('Erro ao atualizar coleta:', error);
            throw error;
        }
    }

    async addSubamostra(coletaId, subamostra) {
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
            console.error('Erro ao adicionar subamostra:', error);
            throw error;
        }
    }

    async deleteColeta(id) {
        try {
            await this.db.collection('coletas').doc(id).delete();
        } catch (error) {
            console.error('Erro ao deletar coleta:', error);
            throw error;
        }
    }

    // ========== OPERAÇÕES CRUD PARA ANÁLISES DE SOLO ==========
    async getAnalises(talhaoId = null) {
        try {
            let query = this.db.collection('analises');
            if (talhaoId) {
                query = query.where('talhaoId', '==', talhaoId);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar análises:', error);
            return [];
        }
    }

    async getAnalise(id) {
        try {
            const doc = await this.db.collection('analises').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar análise:', error);
            return null;
        }
    }

    async addAnalise(analise) {
        try {
            analise.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await this.db.collection('analises').add(analise);
            return { id: docRef.id, ...analise };
        } catch (error) {
            console.error('Erro ao adicionar análise:', error);
            throw error;
        }
    }

    async updateAnalise(id, updates) {
        try {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await this.db.collection('analises').doc(id).update(updates);
            return await this.getAnalise(id);
        } catch (error) {
            console.error('Erro ao atualizar análise:', error);
            throw error;
        }
    }

    async deleteAnalise(id) {
        try {
            await this.db.collection('analises').doc(id).delete();
        } catch (error) {
            console.error('Erro ao deletar análise:', error);
            throw error;
        }
    }

    // ========== OPERAÇÕES CRUD PARA RECOMENDAÇÕES ==========
    async getRecomendacoes(analiseId = null) {
        try {
            let query = this.db.collection('recomendacoes');
            if (analiseId) {
                query = query.where('analiseId', '==', analiseId);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar recomendações:', error);
            return [];
        }
    }

    async addRecomendacao(recomendacao) {
        try {
            recomendacao.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await this.db.collection('recomendacoes').add(recomendacao);
            return { id: docRef.id, ...recomendacao };
        } catch (error) {
            console.error('Erro ao adicionar recomendação:', error);
            throw error;
        }
    }

    // ========== MÉTODOS AUXILIARES ==========
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Limpar todos os dados (útil para testes - use com cuidado!)
    async clear() {
        try {
            const collections = ['clientes', 'talhoes', 'coletas', 'analises', 'recomendacoes'];
            for (const collection of collections) {
                const snapshot = await this.db.collection(collection).get();
                const batch = this.db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            throw error;
        }
    }
}

