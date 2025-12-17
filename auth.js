// Módulo de Autenticação - Firebase Auth
class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Aguardar Firebase estar pronto
        const checkAuth = setInterval(() => {
            if (window.firebaseAuth) {
                clearInterval(checkAuth);
                this.setupAuthListeners();
                this.checkAuthState();
            }
        }, 100);
    }

    setupAuthListeners() {
        // Escutar mudanças no estado de autenticação
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                };
                console.log('Usuário autenticado:', this.currentUser.email);
                this.onAuthStateChange(true);
            } else {
                this.currentUser = null;
                console.log('Usuário não autenticado');
                this.onAuthStateChange(false);
            }
        });
    }

    checkAuthState() {
        const user = window.firebaseAuth.currentUser;
        if (user) {
            this.currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            };
            this.onAuthStateChange(true);
        } else {
            this.onAuthStateChange(false);
        }
    }

    onAuthStateChange(isAuthenticated) {
        // Chamar callback global se existir
        if (window.onAuthStateChanged) {
            window.onAuthStateChanged(isAuthenticated, this.currentUser);
        }
    }

    // ========== CADASTRO ==========
    async signUp(email, password, displayName = null) {
        try {
            if (!window.firebaseAuth) {
                throw new Error('Firebase Auth não está inicializado. Verifique se o Authentication está ativado no Firebase Console.');
            }
            
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Atualizar nome do usuário se fornecido
            if (displayName) {
                try {
                    await user.updateProfile({
                        displayName: displayName
                    });
                } catch (profileError) {
                    console.warn('Erro ao atualizar perfil:', profileError);
                    // Não bloquear o cadastro por causa disso
                }
            }

            // Criar documento do usuário no Firestore (opcional, não bloquear se falhar)
            if (window.firebaseDb) {
                try {
                    await window.firebaseDb.collection('users').doc(user.uid).set({
                        email: email,
                        displayName: displayName || email.split('@')[0],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (firestoreError) {
                    console.warn('Erro ao criar documento do usuário no Firestore:', firestoreError);
                    // Não bloquear o cadastro por causa disso
                }
            }

            return { success: true, user: user };
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error.code) || error.message || 'Erro ao criar conta. Tente novamente.'
            };
        }
    }

    // ========== LOGIN ==========
    async signIn(email, password) {
        try {
            if (!window.firebaseAuth) {
                throw new Error('Firebase Auth não está inicializado. Verifique se o Authentication está ativado no Firebase Console.');
            }
            
            const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Atualizar último login no Firestore (opcional, não bloquear se falhar)
            if (window.firebaseDb) {
                try {
                    await window.firebaseDb.collection('users').doc(user.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (firestoreError) {
                    console.warn('Erro ao atualizar último login:', firestoreError);
                    // Não bloquear o login por causa disso
                }
            }

            return { success: true, user: user };
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error.code) || error.message || 'Erro ao fazer login. Tente novamente.'
            };
        }
    }

    // ========== LOGOUT ==========
    async signOut() {
        try {
            await window.firebaseAuth.signOut();
            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== RESET DE SENHA ==========
    async resetPassword(email) {
        try {
            await window.firebaseAuth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar email de recuperação:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error.code) 
            };
        }
    }

    // ========== VERIFICAR SE ESTÁ AUTENTICADO ==========
    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // ========== MENSAGENS DE ERRO EM PORTUGUÊS ==========
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este email já está cadastrado.',
            'auth/invalid-email': 'Email inválido.',
            'auth/operation-not-allowed': 'Operação não permitida.',
            'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
            'auth/user-disabled': 'Esta conta foi desabilitada.',
            'auth/user-not-found': 'Usuário não encontrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/invalid-credential': 'Email ou senha incorretos.',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
        };
        return errorMessages[errorCode] || 'Erro ao autenticar. Tente novamente.';
    }
}

// Instância global de autenticação
const auth = new Auth();
window.auth = auth;

