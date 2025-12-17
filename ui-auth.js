// Módulo de UI - Autenticação (Login e Cadastro)
class AuthUI {
    constructor() {
        this.isLoginMode = true; // true = login, false = cadastro
    }

    render() {
        const container = document.getElementById('screen-auth');
        if (!container) {
            console.error('Elemento screen-auth não encontrado!');
            return;
        }

        const html = `
            <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <!-- Logo e Título -->
                    <div class="text-center">
                        <img src="logosemfundo.png" alt="Logo AgroCultive" class="mx-auto h-24 w-auto mb-4">
                        <h2 class="text-3xl font-extrabold text-gray-900">
                            ${this.isLoginMode ? 'Entrar na sua conta' : 'Criar nova conta'}
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            ${this.isLoginMode 
                                ? 'Ou ' : 'Já tem uma conta? '}
                            <a href="#" onclick="authUI.toggleMode()" class="font-medium text-green-600 hover:text-green-500">
                                ${this.isLoginMode ? 'criar uma conta' : 'fazer login'}
                            </a>
                        </p>
                    </div>

                    <!-- Formulário -->
                    <form id="authForm" class="mt-8 space-y-6" onsubmit="authUI.handleSubmit(event)">
                        <div id="authError" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span id="authErrorText"></span>
                        </div>

                        <div class="rounded-md shadow-sm -space-y-px">
                            ${!this.isLoginMode ? `
                            <!-- Nome (apenas no cadastro) -->
                            <div>
                                <label for="authName" class="sr-only">Nome Completo</label>
                                <input id="authName" name="name" type="text" required 
                                    class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                                    placeholder="Nome Completo">
                            </div>
                            ` : ''}
                            
                            <!-- Email -->
                            <div>
                                <label for="authEmail" class="sr-only">Email</label>
                                <input id="authEmail" name="email" type="email" autocomplete="email" required 
                                    class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${!this.isLoginMode ? '' : 'rounded-t-md'} focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                                    placeholder="Email">
                            </div>
                            
                            <!-- Senha -->
                            <div>
                                <label for="authPassword" class="sr-only">Senha</label>
                                <input id="authPassword" name="password" type="password" autocomplete="current-password" required 
                                    class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                                    placeholder="Senha (mínimo 6 caracteres)">
                            </div>
                        </div>

                        ${this.isLoginMode ? `
                        <!-- Esqueci minha senha -->
                        <div class="flex items-center justify-end">
                            <div class="text-sm">
                                <a href="#" onclick="authUI.showResetPassword()" class="font-medium text-green-600 hover:text-green-500">
                                    Esqueci minha senha
                                </a>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Botão Submit -->
                        <div>
                            <button type="submit" 
                                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <i class="fas ${this.isLoginMode ? 'fa-sign-in-alt' : 'fa-user-plus'} text-green-500 group-hover:text-green-400"></i>
                                </span>
                                ${this.isLoginMode ? 'Entrar' : 'Cadastrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.classList.remove('hidden');
        
        // Ocultar outras telas
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id !== 'screen-auth') {
                screen.classList.add('hidden');
            }
        });
    }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.render();
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const errorDiv = document.getElementById('authError');
        const errorText = document.getElementById('authErrorText');
        errorDiv.classList.add('hidden');

        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = !this.isLoginMode ? document.getElementById('authName').value : null;

        // Validação básica
        if (!email || !password) {
            this.showError('Por favor, preencha todos os campos.');
            return;
        }

        if (password.length < 6) {
            this.showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Desabilitar botão durante processamento
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';

        try {
            let result;
            if (this.isLoginMode) {
                if (!window.auth) {
                    throw new Error('Módulo de autenticação não está disponível. Recarregue a página.');
                }
                result = await window.auth.signIn(email, password);
            } else {
                if (!window.auth) {
                    throw new Error('Módulo de autenticação não está disponível. Recarregue a página.');
                }
                result = await window.auth.signUp(email, password, name);
            }

            // Reabilitar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            if (result && result.success) {
                // Sucesso - o listener de auth vai redirecionar
                console.log('Autenticação bem-sucedida');
                // Não fazer nada aqui, o listener vai redirecionar
            } else {
                this.showError(result?.error || 'Erro ao autenticar. Tente novamente.');
            }
        } catch (error) {
            // Reabilitar botão em caso de erro
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            console.error('Erro na autenticação:', error);
            this.showError(error.message || 'Erro ao autenticar. Tente novamente.');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('authError');
        const errorText = document.getElementById('authErrorText');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    showResetPassword() {
        const email = prompt('Digite seu email para recuperar a senha:');
        if (email) {
            window.auth.resetPassword(email).then(result => {
                if (result.success) {
                    alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
                } else {
                    alert('Erro: ' + result.error);
                }
            });
        }
    }
}

// Instância global
const authUI = new AuthUI();
window.authUI = authUI;

// Tentar renderizar imediatamente se a tela de auth estiver visível
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const authScreen = document.getElementById('screen-auth');
            if (authScreen && !authScreen.classList.contains('hidden')) {
                console.log('Renderizando tela de auth no DOMContentLoaded...');
                authUI.render();
            }
        }, 100);
    });
} else {
    // DOM já carregado
    setTimeout(() => {
        const authScreen = document.getElementById('screen-auth');
        if (authScreen && !authScreen.classList.contains('hidden')) {
            console.log('Renderizando tela de auth (DOM já carregado)...');
            authUI.render();
        }
    }, 100);
}

