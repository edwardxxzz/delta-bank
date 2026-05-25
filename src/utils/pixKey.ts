export type PixKeyType = 'cpf' | 'email' | 'telefone' | 'aleatoria';

export const detectPixKeyType = (value: string): PixKeyType => {
  const key = value.trim();
  const digits = key.replace(/\D/g, '');

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
    return 'email';
  }

  if (digits.length === 11) {
    return 'cpf';
  }

  if (/^\+?\d[\d\s()-]{9,}$/.test(key) && digits.length >= 10 && digits.length <= 13) {
    return 'telefone';
  }

  return 'aleatoria';
};

export const pixKeyTypeLabel = (type: PixKeyType): string => {
  switch (type) {
    case 'cpf':
      return 'CPF';
    case 'email':
      return 'E-mail';
    case 'telefone':
      return 'Telefone';
    case 'aleatoria':
      return 'Chave aleatoria';
  }
};
