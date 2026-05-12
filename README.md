# Delta Bank 🏦

Um aplicativo bancário digital completo construído com **React Native + Expo** e **Firebase**.

## 📱 Tecnologias

- **Runtime**: Bun
- **Framework**: React Native + Expo
- **Linguagem**: TypeScript
- **Navegação**: React Navigation
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Ícones**: Lucide React Native
- **Gradientes**: Expo Linear Gradient

## 🚀 Funcionalidades

- ✅ Autenticação (Email/Senha + Google)
- ✅ Dashboard com saldo e variações
- ✅ Transações (Pix, Pagar, Transferir, Empréstimos)
- ✅ Gestão de cartões (crédito, débito, virtual)
- ✅ Investimentos (CDB, LCI, LCA, Tesouro, FII, Ações)
- ✅ Perfil e configurações
- ✅ Recuperação de senha
- ✅ Dados em tempo real com Firestore

## 🛠️ Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/edwardxxzz/delta-bank.git
cd delta-bank
```

### 2. Instale as dependências
```bash
bun install
```

### 3. Configure o Firebase
Edite o arquivo `src/services/firebase.ts` com suas credenciais:
```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};
```

### 4. Execute o app
```bash
bun start
```

## 📂 Estrutura do Projeto

```
delta-bank/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── BalanceCard.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   ├── QuickActions.tsx
│   │   └── TransactionList.tsx
│   ├── contexts/         # Contextos React
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navegação
│   │   └── AppNavigator.tsx
│   ├── pages/            # Telas do app
│   │   ├── LoginPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── CardsPage.tsx
│   │   ├── InvestPage.tsx
│   │   ├── MorePage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/         # Serviços Firebase
│   │   ├── firebase.ts
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── cardService.ts
│   │   └── investmentService.ts
│   ├── types/            # Constantes e tipos
│   │   └── index.ts
│   └── utils/            # Utilitários
├── App.tsx               # Entry point
├── app.json              # Configuração Expo
├── bun.lock              # Lockfile Bun
├── package.json
└── tsconfig.json
```

## 🎨 Design System

- **Cores**: Navy Blue (#1A237E) + Teal (#00C9A7)
- **Tipografia**: Inter (via @expo-google-fonts)
- **Componentes**: Cards com gradiente, Bottom Navigation, Quick Actions

## 📄 Licença

Este projeto é de uso pessoal. Todos os direitos reservados.
