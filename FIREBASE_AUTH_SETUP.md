# Configuração de Autenticação Firebase

## Passo a Passo

### 1. Ativar Authentication no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Selecione seu projeto "agrosolos-8ecd0"
3. No menu lateral, clique em "Authentication"
4. Clique em "Get Started" (ou "Começar")
5. Na aba "Sign-in method", clique em "Email/Password"
6. Ative "Enable" (Habilitar)
7. Clique em "Save" (Salvar)

### 2. Configurar Regras de Segurança do Firestore

No Firestore, vá em "Regras" e configure:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função auxiliar para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função auxiliar para verificar se o usuário é o dono do documento
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Regras para clientes - apenas o dono pode ler/escrever
    match /clientes/{clienteId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Regras para talhões - apenas o dono pode ler/escrever
    match /talhoes/{talhaoId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Regras para coletas - apenas o dono pode ler/escrever
    match /coletas/{coletaId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Regras para análises - apenas o dono pode ler/escrever
    match /analises/{analiseId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Regras para recomendações - apenas o dono pode ler/escrever
    match /recomendacoes/{recomendacaoId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Testar Autenticação

1. Abra o aplicativo
2. Você verá a tela de login
3. Clique em "criar uma conta"
4. Preencha nome, email e senha
5. Clique em "Cadastrar"
6. Você será redirecionado para o dashboard

### 4. Funcionalidades Implementadas

✅ Cadastro de usuário com email e senha
✅ Login com email e senha
✅ Logout
✅ Recuperação de senha (esqueci minha senha)
✅ Proteção de rotas (só acessa logado)
✅ Dados vinculados ao usuário (cada usuário vê apenas seus dados)
✅ Persistência de sessão (permanece logado após fechar o navegador)

### 5. Estrutura de Dados no Firestore

Todos os documentos agora incluem o campo `userId`:

```
clientes/{id}
  - userId: "uid-do-usuario"
  - nome: "..."
  - email: "..."
  - ...

talhoes/{id}
  - userId: "uid-do-usuario"
  - clienteId: "..."
  - ...
```

### 6. Segurança

- Cada usuário só vê seus próprios dados
- As regras do Firestore garantem que ninguém possa acessar dados de outros usuários
- A autenticação é gerenciada pelo Firebase Auth

