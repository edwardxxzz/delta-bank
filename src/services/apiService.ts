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

export interface PixTransaction {
  id: number;
  tipo: string;
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

// ── Helper ──
export const centsToBRL = (cents: number): number => cents / 100;
export const brlToCents = (brl: number): number => Math.round(brl * 100);

export const formatBRL = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ── Safe fetch wrapper ──
async function safeFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
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
      mensagem: error.message === 'Network request failed'
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
  saldoInicial: number
): Promise<ApiResponse<Account>> => {
  return safeFetch<Account>(`${BASE_URL}/api/contas`, {
    method: 'POST',
    body: JSON.stringify({ nome, cpf, senha, saldo_inicial: saldoInicial }),
  });
};

export const loginAPI = async (
  cpf: string,
  senha: string
): Promise<ApiResponse<Account>> => {
  return safeFetch<Account>(`${BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({ cpf, senha }),
  });
};

export const getSaldo = async (cpf: string): Promise<ApiResponse<SaldoData>> => {
  return safeFetch<SaldoData>(`${BASE_URL}/api/saldo/${cpf}`);
};

export const getExtrato = async (cpf: string): Promise<ApiResponse<any>> => {
  return safeFetch<any>(`${BASE_URL}/api/extrato/${cpf}`);
};

export const makePix = async (
  cpfOrigem: string,
  cpfDestino: string,
  valor: number,
  senha: string
): Promise<ApiResponse<PixTransaction>> => {
  return safeFetch<PixTransaction>(`${BASE_URL}/api/pix`, {
    method: 'POST',
    body: JSON.stringify({
      cpf_origem: cpfOrigem,
      cpf_destino: cpfDestino,
      valor,
      senha,
    }),
  });
};

export const depositar = async (
  cpf: string,
  valor: number
): Promise<ApiResponse<{ novo_saldo: number }>> => {
  return safeFetch<{ novo_saldo: number }>(`${BASE_URL}/api/depositar`, {
    method: 'POST',
    body: JSON.stringify({ cpf, valor }),
  });
};

export const sacar = async (
  cpf: string,
  valor: number,
  senha: string
): Promise<ApiResponse<{ novo_saldo: number }>> => {
  return safeFetch<{ novo_saldo: number }>(`${BASE_URL}/api/sacar`, {
    method: 'POST',
    body: JSON.stringify({ cpf, valor, senha }),
  });
};

export interface ChavePix {
  id: number;
  tipo: string;
  valor: string;
  cpf_conta: string;
  criada_em: string;
}

export const getChavesPix = async (cpf: string): Promise<ApiResponse<ChavePix[]>> => {
  return safeFetch<ChavePix[]>(`${BASE_URL}/api/chaves-pix/${cpf}`);
};

export const registerChavePix = async (
  cpf: string,
  tipo: string,
  valor: string
): Promise<ApiResponse<ChavePix>> => {
  return safeFetch<ChavePix>(`${BASE_URL}/api/chaves-pix`, {
    method: 'POST',
    body: JSON.stringify({ cpf, tipo, valor }),
  });
};

// Validate if a CPF/account exists in Delta Bank (used for Pix key validation)
export const validatePixKey = async (cpf: string): Promise<ApiResponse<SaldoData>> => {
  return safeFetch<SaldoData>(`${BASE_URL}/api/saldo/${cpf}`);
};
