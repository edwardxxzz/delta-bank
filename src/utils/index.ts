// Shared utility functions for Delta Bank

/**
 * Masks a sensitive key (CPF, phone, email, etc.) showing only partial info.
 * Used across Pix confirmation, deposit, and withdrawal screens.
 *
 * - CPF: ***.***.***-XX (last 2 digits visible)
 * - CNPJ: ***.***.***/****-XX (last 2 digits visible)
 * - Telefone: (**) *****-XX (last 2 digits visible)
 * - Email: f***@***.com (first letter + domain extension)
 * - Chave aleatória: abcd****wxyz (first 4 + last 4)
 */
export const maskSensitiveKey = (key: string, tipo: string): string => {
  if (!key) return '';

  const digits = key.replace(/\D/g, '');

  if (tipo === 'CPF' && digits.length >= 11) {
    const lastTwo = digits.slice(-2);
    return `***.***.***-${lastTwo}`;
  }

  if (tipo === 'CNPJ' && digits.length >= 14) {
    const lastTwo = digits.slice(-2);
    return `***.***.***/****-${lastTwo}`;
  }

  if (tipo === 'TELEFONE') {
    const clean = key.replace(/\D/g, '');
    if (clean.length >= 10) {
      const lastTwo = clean.slice(-2);
      return `(**) *****-${lastTwo}`;
    }
    if (key.length > 4) {
      return key.slice(0, 2) + '*'.repeat(key.length - 4) + key.slice(-2);
    }
  }

  if (tipo === 'EMAIL') {
    const atIdx = key.indexOf('@');
    if (atIdx > 0) {
      const first = key.charAt(0);
      const domain = key.slice(atIdx + 1);
      const dotIdx = domain.lastIndexOf('.');
      const ext = dotIdx >= 0 ? domain.slice(dotIdx) : '';
      return `${first}***@***${ext}`;
    }
  }

  // Chave aleatória ou outros: mostrar primeiros 4 e últimos 4
  if (key.length > 8) {
    return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
  }

  if (key.length > 2) {
    return '*'.repeat(key.length - 2) + key.slice(-2);
  }

  return key;
};

/**
 * App version string — single source of truth.
 */
export const APP_VERSION = 'Delta Bank v1.0.0';

/**
 * Bank details
 */
export const BANK_DETAILS = {
  name: 'Delta Bank',
  code: '000',
  agency: '0001',
  account: '88028-5',
};
