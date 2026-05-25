<p align="center">
  <img src="assets/icon.png" alt="Delta Bank Logo" width="120" height="120" />
</p>

<h1 align="center">Delta Bank</h1>

<p align="center">
  <strong>Aplicativo bancário digital completo</strong><br/>
  Construído com React Native, Expo e backend em Go
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Go_Backend-Railway-00ADD8?logo=go" alt="Go Backend" />
  <img src="https://img.shields.io/badge/License-All_Rights_Reserved-red" alt="License" />
</p>

---

## Sobre o Projeto

O **Delta Bank** é um aplicativo bancário digital que simula a experiência completa de um banco moderno. O projeto é composto por um frontend mobile desenvolvido em React Native com Expo e um backend RESTful em Go hospedado no Railway. A aplicação oferece desde autenticação segura com biometria até transações Pix em tempo real, gestão de cartões e investimentos, tudo com uma interface elegante que suporta temas claro e escuro.

---

## Funcionalidades

### Autenticação e Segurança
- **Login e registro** com CPF e senha, incluindo validação completa de dígitos verificadores do CPF
- **Autenticação biométrica** (impressão digital / Face ID) para login rápido e confirmação de transações
- **Ocultar/mostrar saldo** com um toque, mantendo a preferência salva localmente
- **Sessão persistente** via AsyncStorage, com restauração automática quando a biometria está ativada

### Home e Transações
- **Dashboard principal** com saldo em tempo real, variação mensal e últimas atividades
- **Envio de Pix** com detecção automática do tipo de chave (CPF, e-mail, telefone ou chave aleatória), validação do destinatário e fluxo em 3 etapas com barra de progresso
- **Confirmação de Pix** por senha ou biometria, com mensagens de erro contextualizadas (saldo insuficiente, limite diário, chave não encontrada etc.)
- **Depósito e saque** com validação de limites e atualização instantânea do saldo
- **Recebimento** via QR Code ou compartilhamento de chave Pix
- **Extrato completo** com histórico de todas as transações (Pix enviado/recebido, depósitos, saques)

### Gestão de Chaves Pix
- **Cadastro e exclusão** de chaves Pix (CPF, E-mail, Telefone, Aleatória)
- **Máscara de sensibilidade** para exibição parcial de dados (CPF: `***.***.***-XX`, e-mail: `f***@***.com` etc.)

### Cartões
- **Cartões de débito, crédito e virtual** com visualização realista (bandeira, chip, número mascarado)
- **Geração determinística** de número de cartão com dígito verificador Luhn, baseada no CPF do usuário
- **Barra de progresso** de limite de crédito com alerta visual quando acima de 80%
- **Bloqueio/desbloqueio** instantâneo de cartões
- **Toggle de visibilidade** para mostrar/ocultar número e dados do cartão

### Investimentos
- **Patrimônio total** com rendimento acumulado em card com gradiente
- **Categorias** de investimento: Renda Fixa (CDB, LCI, LCA), Tesouro Direto e Ações
- **Filtros** por tipo de investimento (todos, renda fixa, renda variável)
- **Detalhes** de cada ativo: emissor, vencimento, taxa de rendimento

### Configurações e Perfil
- **Tema claro/escuro** com alternância instantânea e persistência local
- **Configurações de biometria** com verificação de compatibilidade do dispositivo
- **Dados da conta** e informações do perfil
- **Menu de serviços** com acesso rápido a todas as funcionalidades

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Runtime** | Bun |
| **Framework** | React Native 0.81 + Expo 54 |
| **Linguagem** | TypeScript 5.9 (strict mode) |
| **Navegação** | React Navigation 7 (Stack + Bottom Tabs) |
| **Backend** | Go (REST API hospedada no Railway) |
| **Armazenamento local** | AsyncStorage |
| **Biometria** | expo-local-authentication |
| **Gradientes** | expo-linear-gradient |
| **Câmera/QR Code** | expo-camera |
| **Ícones** | @expo/vector-icons (Ionicons, MaterialCommunityIcons, Feather) |
| **Fontes** | @expo-google-fonts/inter |
| **Build** | EAS (Expo Application Services) |

---

## Arquitetura

O projeto segue uma arquitetura baseada em **Context API** para gerenciamento de estado global e **serviços desacoplados** para comunicação com o backend:

```
App.tsx (Entry Point)
├── ThemeProvider          → Tema claro/escuro
├── AuthProvider           → Autenticação e sessão
├── BiometricProvider      → Biometria do dispositivo
└── VisibilityProvider     → Visibilidade do saldo
    └── AppNavigator
        ├── LoginPage      (se não autenticado)
        └── AppStack       (se autenticado)
            ├── MainTabs (Bottom Tabs)
            │   ├── HomePage
            │   ├── CardsPage
            │   ├── InvestPage
            │   └── MorePage
            └── Stack Screens
                ├── ProfilePage
                ├── ExtratoPage
                ├── DepositarPage
                ├── SacarPage
                ├── PagarPage
                ├── ReceberPage
                ├── QRCodePage
                ├── TransferirPage
                ├── DeltaContactsPage
                ├── ChavesPixPage
                ├── PixEnviadoPage
                ├── ContaPage
                └── ConfigPage
```

---

## Estrutura do Projeto

```
delta-bank/
├── assets/                          # Ícones e imagens do app
│   ├── icon.png                     # Ícone principal
│   ├── adaptive-icon.png            # Ícone adaptativo (Android)
│   ├── splash-icon.png              # Tela de splash
│   └── favicon.png                  # Favicon web
├── src/
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── BottomNav.tsx            # Barra de navegação inferior com botão central
│   │   └── ActionMenu.tsx           # Modal de ações rápidas (Pix, Pagar, Depositar, Receber)
│   ├── contexts/                    # Contextos React (estado global)
│   │   ├── AuthContext.tsx           # Autenticação, login, registro, sessão
│   │   ├── ThemeContext.tsx          # Tema claro/escuro com persistência
│   │   ├── BiometricContext.tsx      # Biometria (verificação, ativação, autenticação)
│   │   └── VisibilityContext.tsx     # Visibilidade do saldo
│   ├── navigation/                  # Navegação
│   │   └── AppNavigator.tsx         # Stack + Tab Navigator principal
│   ├── pages/                       # Telas do aplicativo
│   │   ├── LoginPage.tsx            # Login e cadastro com validação de CPF
│   │   ├── HomePage.tsx             # Dashboard com saldo e atividades
│   │   ├── CardsPage.tsx            # Gestão de cartões (débito, crédito, virtual)
│   │   ├── InvestPage.tsx           # Investimentos e patrimônio
│   │   ├── MorePage.tsx             # Menu de serviços
│   │   ├── ProfilePage.tsx          # Perfil do usuário
│   │   ├── ExtratoPage.tsx          # Extrato completo
│   │   ├── DepositarPage.tsx        # Depósito em conta
│   │   ├── SacarPage.tsx            # Saque da conta
│   │   ├── PagarPage.tsx            # Pagamento via Pix
│   │   ├── ReceberPage.tsx          # Recebimento via QR Code
│   │   ├── QRCodePage.tsx           # Geração de QR Code
│   │   ├── TransferirPage.tsx       # Envio de Pix (3 etapas)
│   │   ├── DeltaContactsPage.tsx    # Contatos Delta Bank
│   │   ├── ChavesPixPage.tsx        # Gerenciamento de chaves Pix
│   │   ├── PixEnviadoPage.tsx       # Confirmação de Pix enviado
│   │   ├── ContaPage.tsx            # Dados da conta
│   │   └── ConfigPage.tsx           # Configurações do app
│   ├── services/                    # Serviços e APIs
│   │   └── apiService.ts            # Cliente HTTP para o backend Go
│   ├── types/                       # Tipos, constantes e design tokens
│   │   └── index.ts                 # ThemeColors, Spacing, FontSizes, BorderRadii
│   └── utils/                       # Funções utilitárias
│       ├── index.ts                 # maskSensitiveKey, APP_VERSION, BANK_DETAILS
│       └── pixKey.ts                # detectPixKeyType, pixKeyTypeLabel
├── App.tsx                          # Componente raiz com providers
├── index.ts                         # Ponto de entrada (registerRootComponent)
├── app.json                         # Configuração Expo
├── eas.json                         # Configuração EAS Build
├── tsconfig.json                    # Configuração TypeScript (strict)
├── package.json                     # Dependências e scripts
└── bun.lock                         # Lockfile Bun
```

---

## API Backend

O backend é uma API RESTful escrita em **Go**, hospedada no Railway. O frontend se comunica exclusivamente através do `apiService.ts`, que implementa um wrapper `safeFetch` com tratamento de erros de rede e respostas padronizadas.

### Endpoints Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/contas` | Criar nova conta |
| `POST` | `/api/login` | Autenticar usuário |
| `GET` | `/api/saldo/{cpf}` | Consultar saldo e dados da conta |
| `GET` | `/api/extrato/{cpf}` | Listar transações |
| `POST` | `/api/pix` | Enviar Pix |
| `POST` | `/api/depositar` | Realizar depósito |
| `POST` | `/api/sacar` | Realizar saque |
| `GET` | `/api/chaves-pix/{cpf}` | Listar chaves Pix |
| `POST` | `/api/chaves-pix` | Cadastrar chave Pix |
| `DELETE` | `/api/chaves-pix` | Remover chave Pix |

> **Base URL:** `https://delta-bank-backend-in-golang-production.up.railway.app`

---

## Design System

O Delta Bank possui um design system completo e consistente, definido em `src/types/index.ts`:

### Paleta de Cores

| Elemento | Light Mode | Dark Mode |
|----------|-----------|-----------|
| **Primary** | `#0A192F` (Navy) | `#0A192F` (Navy) |
| **Accent** | `#00A878` (Teal) | `#1DE9B6` (Mint) |
| **Background** | `#FFFFFF` | `#0A1628` |
| **Surface** | `#F9FAFB` | `#111D32` |
| **Text Primary** | `#1A1A2E` | `#E8ECF1` |
| **Positive** | `#00A878` | `#1DE9B6` |
| **Negative** | `#E53935` | `#FF1744` |

### Tipografia

- **Fonte principal:** Inter (via @expo-google-fonts)
- **Escala de tamanhos:** 10px (xs) a 34px (giant), com 32px para saldo

### Identidade Visual

- **Símbolo:** Triângulo (Delta) usado como logo, ícone do botão central e elemento decorativo nos cards
- **Cards com gradiente** navy-to-blue com triângulo decorativo translúcido
- **Cores semânticas** para cada ação: Pix (teal), Pagar (indigo), Depositar (orange), Sacar (red), Transferir (purple)

---

## Primeiros Passos

### Pré-requisitos

- [Bun](https://bun.sh/) (recomendado) ou Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Emulador Android/iOS ou o app [Expo Go](https://expo.dev/go) no celular

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/edwardxxzz/delta-bank.git
cd delta-bank

# 2. Instale as dependências
bun install

# 3. Inicie o servidor de desenvolvimento
bun start
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `bun start` | Inicia o Expo dev server |
| `bun run android` | Inicia no emulador/dispositivo Android |
| `bun run ios` | Inicia no simulador/dispositivo iOS |
| `bun run web` | Inicia no navegador (web) |

### Build para Produção

O projeto utiliza o **EAS (Expo Application Services)** para builds na nuvem:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Build de preview
eas build --profile preview --platform android

# Build de produção
eas build --profile production --platform android
```

---

## Detalhes Técnicos

### Tratamento de Erros

O `apiService.ts` implementa um wrapper `safeFetch` que:
- Converte erros HTTP em mensagens amigáveis em português
- Detecta falhas de rede (`Network request failed` → "Sem conexão com o servidor")
- Padroniza todas as respostas no formato `{ sucesso, mensagem, dados }`
- As páginas tratam erros de forma contextual (senha incorreta, saldo insuficiente, limite diário etc.)

### Validação de CPF

A validação de CPF no `LoginPage` implementa o algoritmo completo de verificação dos dois dígitos verificadores, rejeitando sequências de dígitos repetidos e garantindo conformidade com as regras da Receita Federal.

### Autenticação Biométrica

O `BiometricContext` gerencia todo o ciclo de biometria:
- Verifica compatibilidade de hardware (`hasHardwareAsync`)
- Verifica se há biometria cadastrada (`isEnrolledAsync`)
- Implementa delay de 200ms antes da autenticação para contornar bug de `app_cancel` no Android
- Previne chamadas simultâneas com `authenticatingRef`
- Permite ativação apenas após confirmação biométrica do próprio usuário

### Formatação Monetária

- O backend opera com valores em **centavos** (`saldo_centavos`, `valor_centavos`)
- O frontend converte para BRL via `centsToBRL()` para exibição
- As chamadas à API enviam valores em **reais** (float), conforme esperado pelo backend
- Formatação localizada com `toLocaleString('pt-BR')` para exibição em Real brasileiro

---

## Telas do Aplicativo

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação com CPF/senha, cadastro e login biométrico |
| **Home** | Saldo, ações rápidas, últimas transações com pull-to-refresh |
| **Cartões** | Visualização de cartões com gradiente, limite e bloqueio |
| **Investimentos** | Patrimônio, rendimento e carteira de investimentos |
| **Enviar Pix** | Fluxo de 3 etapas: chave → valor → confirmação |
| **Depositar** | Adicionar saldo à conta |
| **Sacar** | Retirar saldo com validação de senha |
| **Extrato** | Histórico completo de transações |
| **Chaves Pix** | Gerenciamento de chaves Pix cadastradas |
| **Configurações** | Tema, biometria, privacidade e suporte |

---

## Licença

Este projeto é de uso pessoal. Todos os direitos reservados.
