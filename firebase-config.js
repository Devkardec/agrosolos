// Configuração do Firebase
// Credenciais do projeto agrosolos

const firebaseConfig = {
    apiKey: "AIzaSyD4LwyqGNC1J6kVndL8YaRQvlCCbrH4IqQ",
    authDomain: "agrosolos-8ecd0.firebaseapp.com",
    projectId: "agrosolos-8ecd0",
    storageBucket: "agrosolos-8ecd0.firebasestorage.app",
    messagingSenderId: "443970160508",
    appId: "1:443970160508:web:7a3e6cafb83a5a2c0b06f9"
};

// Inicializar Firebase (usando compat mode)
let firebaseApp = null;
let firebaseDbInstance = null;
let firebaseAuthInstance = null;

// Função para inicializar após o Firebase estar carregado
function initFirebase() {
    try {
        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseDbInstance = firebase.firestore();
            firebaseAuthInstance = firebase.auth();
            console.log('Firebase inicializado com sucesso!');
            window.firebaseApp = firebaseApp;
            window.firebaseDb = firebaseDbInstance;
            window.firebaseAuth = firebaseAuthInstance;
        } else {
            console.warn('Firebase SDK não carregado ainda, aguardando...');
            // Tentar novamente após um delay
            setTimeout(initFirebase, 500);
        }
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        console.warn('Usando LocalStorage como fallback');
    }
}

// Inicializar quando o Firebase SDK estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFirebase, 100);
    });
} else {
    setTimeout(initFirebase, 100);
}

