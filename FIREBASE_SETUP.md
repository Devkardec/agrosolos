# Configuração do Firebase para AgroCultive

## Passo a Passo

### 1. Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "agrocultive")
4. Siga as instruções para criar o projeto

### 2. Configurar Firestore Database

1. No console do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Selecione a localização (ex: southamerica-east1 para Brasil)
5. Clique em "Ativar"

### 3. Configurar Regras de Segurança (IMPORTANTE!)

No Firestore, vá em "Regras" e configure:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todas as coleções (apenas para desenvolvimento)
    // EM PRODUÇÃO, configure autenticação adequada!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO**: As regras acima permitem acesso total. Para produção, configure autenticação adequada!

### 4. Obter Credenciais

1. No console do Firebase, vá em "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus apps"
3. Clique no ícone `</>` (Web)
4. Registre o app com um nome (ex: "AgroCultive Web")
5. Copie as credenciais que aparecem

### 5. Configurar no Projeto

Abra o arquivo `firebase-config.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_AUTH_DOMAIN_AQUI",
    projectId: "SEU_PROJECT_ID_AQUI",
    storageBucket: "SEU_STORAGE_BUCKET_AQUI",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
    appId: "SEU_APP_ID_AQUI"
};
```

### 6. Estrutura das Coleções no Firestore

O Firebase criará automaticamente as seguintes coleções quando você começar a usar:

- `clientes` - Dados dos clientes
- `talhoes` - Talhões vinculados aos clientes
- `coletas` - Coletas de campo com GPS
- `analises` - Análises de solo
- `recomendacoes` - Recomendações técnicas finais

### 7. Testar

1. Abra o aplicativo no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Verifique se aparece: "Firebase inicializado com sucesso!"
4. Tente criar um cliente
5. Verifique no console do Firebase se o documento foi criado

### 8. Migração de Dados do LocalStorage

Se você já tem dados no LocalStorage e quer migrar para o Firebase:

1. Abra o Console do Navegador (F12)
2. Execute o seguinte código:

```javascript
// Exportar dados do LocalStorage
const dados = JSON.parse(localStorage.getItem('agrocultive_db'));
console.log('Dados para migrar:', dados);

// Depois, você pode criar um script de migração ou fazer manualmente
// através da interface do aplicativo
```

## Troubleshooting

### Firebase não inicializa
- Verifique se as credenciais estão corretas
- Verifique se o Firestore está ativado
- Verifique as regras de segurança do Firestore

### Erro de permissão
- Verifique as regras de segurança do Firestore
- Certifique-se de que as regras permitem leitura/escrita

### Dados não aparecem
- Verifique o console do navegador para erros
- Verifique o console do Firebase para ver se os dados foram salvos
- Certifique-se de que está usando a mesma conta do Firebase

