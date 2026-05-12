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

// ── API Calls ──

export const createAccount = async (
  nome: string,
  cpf: string,
  senha: string,
  saldoInicial: number
): Promise<ApiResponse<Account>> => {
  const res = await fetch(`${BASE_URL}/api/contas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, cpf, senha, saldo_inicial: saldoInicial }),
  });
  return res.json();
};

export const loginAPI = async (
  cpf: string,
  senha: string
): Promise<ApiResponse<Account>> => {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, senha }),
  });
  return res.json();
};

export const getSaldo = async (cpf: string): Promise<ApiResponse<SaldoData>> => {
  const res = await fetch(`${BASE_URL}/api/saldo/${cpf}`);
  return res.json();
};

export const getExtrato = async (cpf: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${BASE_URL}/api/extrato/${cpf}`);
  return res.json();
};

export const makePix = async (
  cpfOrigem: string,
  cpfDestino: string,
  valor: number,
  senha: string
): Promise<ApiResponse<PixTransaction>> => {
  const res = await fetch(`${BASE_URL}/api/pix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cpf_origem: cpfOrigem,
      cpf_destino: cpfDestino,
      valor,
      senha,
    }),
  });
  return res.json();
};

export const depositar = async (
  cpf: string,
  valor: number
): Promise<ApiResponse<{ novo_saldo: number }>> => {
  const res = await fetch(`${BASE_URL}/api/depositar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, valor }),
  });
  return res.json();
};

export const sacar = async (
  cpf: string,
  valor: number,
  senha: string
): Promise<ApiResponse<{ novo_saldo: number }>> => {
  const res = await fetch(`${BASE_URL}/api/sacar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, valor, senha }),
  });
  return res.json();
};

export const getChavesPix = async (cpf: string): Promise<ApiResponse<any>> => {
  const res = await fetch(`${BASE_URL}/api/chaves-pix/${cpf}`);
  return res.json();
};
