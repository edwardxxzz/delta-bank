// Delta Bank API Service - Go Backend Integration
const BASE_URL = 'https://delta-bank-backend-in-golang-production.up.railway.app';

interface ApiResponse<T = any> {
  sucesso: boolean;
  mensagem: string;
  dados?: T;
}

// ── Account Types ──
export interface Account {
  cpf: string;
  nome: string;
  saldo_centavos: number;
  limite_diario: number;
  criada_em: string;
  atualizada_em: string;
}

export interface SaldoData {
  Conta: Account;
  QtdChaves: number;
}

// Backend returns transacoes wrapped inside dados
export interface ExtratoData {
  transacoes: PixTransaction[];
  saldo_atual: number;
}

export interface PixTransaction {
  id: number;
  // Backend returns: TRANSACAO_PIX | DEPOSITO | SAQUE
  tipo: 'TRANSACAO_PIX' | 'DEPOSITO' | 'SAQUE';
  valor_centavos: number;
  cpf_remetente: string;
  cpf_destinatario: string;
  nome_remetente: string;
  nome_destinatario: string;
  data_hora: string;
}

export interface LocalUserData {
  cpf: string;
  nome: string;
  saldo_centavos: number;
  limite_diario: number;
}

export interface ChavePix {
  id: number;
  tipo: string;
  valor: string;
  cpf_conta: string;
  criada_em: string;
}

// ── Helpers ──
// Display: centavos → R$ float  (e.g. 5000 → 50.0)
export const centsToBRL = (cents: number): number => cents / 100;

// API input: R$ float → centavos  (e.g. 50.0 → 5000)
// NOTE: Only use this for local calculations/display.
// The backend API accepts "valor" as R$ float (e.g. 50.00), NOT centavos.
// Never pass the result of brlToCents() directly to makePix / depositar / sacar.
export const brlToCents = (brl: number): number => Math.round(brl * 100);

export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Safe fetch wrapper ──
async function safeFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let errorMsg = `Erro do servidor (${res.status})`;
      try {
        const parsed = JSON.parse(text);
        errorMsg = parsed.mensagem || parsed.error || errorMsg;
      } catch {}
      return { sucesso: false, mensagem: errorMsg };
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem:
        error.message === 'Network request failed'
          ? 'Sem conexão com o servidor. Verifique sua internet.'
          : `Erro de conexão: ${error.message || 'Desconhecido'}`,
    };
  }
}

// ── API Calls ──

export const createAccount = async (
  nome: string,
  cpf: string,
  senha: string,
  saldoInicial: number // R$ float, mínimo 10.0
): Promise<ApiResponse<Account>> =>
  safeFetch<Account>(`${BASE_URL}/api/contas`, {
    method: 'POST',
    body: JSON.stringify({ nome, cpf, senha, saldo_inicial: saldoInicial }),
  });

export const loginAPI = async (cpf: string, senha: string): Promise<ApiResponse<Account>> =>
  safeFetch<Account>(`${BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({ cpf, senha }),
  });

export const getSaldo = async (cpf: string): Promise<ApiResponse<SaldoData>> =>
  safeFetch<SaldoData>(`${BASE_URL}/api/saldo/${cpf}`);

export const getExtrato = async (cpf: string): Promise<ApiResponse<ExtratoData>> =>
  safeFetch<ExtratoData>(`${BASE_URL}/api/extrato/${cpf}`);

// valor: R$ float (e.g. 50.00 = R$50). Do NOT pass centavos.
export const makePix = async (
  cpfOrigem: string,
  cpfDestino: string,
  valor: number,
  senha: string
): Promise<ApiResponse<PixTransaction>> =>
  safeFetch<PixTransaction>(`${BASE_URL}/api/pix`, {
    method: 'POST',
    body: JSON.stringify({ cpf_origem: cpfOrigem, cpf_destino: cpfDestino, valor, senha }),
  });

// valor: R$ float. Min 0.01, Max 10000.00
export const depositar = async (
  cpf: string,
  valor: number
): Promise<ApiResponse<{ novo_saldo: number }>> =>
  safeFetch<{ novo_saldo: number }>(`${BASE_URL}/api/depositar`, {
    method: 'POST',
    body: JSON.stringify({ cpf, valor }),
  });

// valor: R$ float. Min 0.01, Max 2000.00, múltiplo de 10
export const sacar = async (
  cpf: string,
  valor: number,
  senha: string
): Promise<ApiResponse<{ novo_saldo: number }>> =>
  safeFetch<{ novo_saldo: number }>(`${BASE_URL}/api/sacar`, {
    method: 'POST',
    body: JSON.stringify({ cpf, valor, senha }),
  });

export const getChavesPix = async (cpf: string): Promise<ApiResponse<ChavePix[]>> =>
  safeFetch<ChavePix[]>(`${BASE_URL}/api/chaves-pix/${cpf}`);

// tipo: 'CPF' | 'Email' | 'Telefone' | 'Aleatoria'  (casing exato do backend)
export const registerChavePix = async (
  cpf: string,
  tipo: string,
  valor: string
): Promise<ApiResponse<ChavePix>> =>
  safeFetch<ChavePix>(`${BASE_URL}/api/chaves-pix`, {
    method: 'POST',
    body: JSON.stringify({ cpf, tipo, valor }),
  });

export const deleteChavePix = async (
  cpf: string,
  tipo: string,
  valor: string
): Promise<ApiResponse<void>> =>
  safeFetch<void>(`${BASE_URL}/api/chaves-pix`, {
    method: 'DELETE',
    body: JSON.stringify({ cpf, tipo, valor }),
  });

// Valida se um CPF tem conta no Delta Bank (usado no Pix)
export const validatePixKey = async (cpf: string): Promise<ApiResponse<SaldoData>> =>
  safeFetch<SaldoData>(`${BASE_URL}/api/saldo/${cpf}`);