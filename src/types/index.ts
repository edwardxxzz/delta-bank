export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryMedium: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  white: string;
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  textWhite: string;
  positive: string;
  negative: string;
  warning: string;
  border: string;
  inputBg: string;
  shadow: string;
  overlay: string;
  cardGradientStart: string;
  cardGradientEnd: string;
  // Action colors
  pix: string;
  pagar: string;
  depositar: string;
  sacar: string;
  transferir: string;
  emprestimo: string;
  // Action bg
  pixBg: string;
  pagarBg: string;
  depositarBg: string;
  sacarBg: string;
  transferirBg: string;
  emprestimoBg: string;
  // Action icon
  pixIcon: string;
  pagarIcon: string;
  depositarIcon: string;
  sacarIcon: string;
  transferirIcon: string;
  emprestimoIcon: string;
  // Card
  cardBlue: string;
  cardBlueLight: string;
  triangleGreen: string;
  // Invest
  investBlue: string;
  rendaFixa: string;
  acoes: string;
  tesouro: string;
  // Extra theme
  statusBarStyle: 'light-content' | 'dark-content';
  cardBg: string;
  sectionCardBg: string;
  menuIconBg: string;
  inputBorder: string;
  inputBgColor: string;
  switchTrackFalse: string;
  bloquearBtnBg: string;
  faturaBtnBg: string;
  faturaBtnBorder: string;
  faturaText: string;
  bottomNavBg: string;
  bottomNavBorder: string;
  errorBannerBg: string;
  errorBg: string;
  errorBorder: string;
  logoutBorder: string;
  menuDivider: string;
}

export const LightColors: ThemeColors = {
  primary: '#0A192F',
  primaryLight: '#1E3A8A',
  primaryMedium: '#162D50',
  accent: '#00A878',
  accentLight: '#00C49A',
  accentDark: '#008A63',
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceLight: '#F3F4F6',
  surfaceHover: '#E5E7EB',
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textAccent: '#00A878',
  textWhite: '#FFFFFF',
  positive: '#00A878',
  negative: '#E53935',
  warning: '#EF6C00',
  border: '#CBD5E0',
  inputBg: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardGradientStart: '#0A192F',
  cardGradientEnd: '#1E3A8A',
  pix: '#00A878',
  pagar: '#5C6BC0',
  depositar: '#EF6C00',
  sacar: '#E53935',
  transferir: '#7E57C2',
  emprestimo: '#C2185B',
  pixBg: '#E0F5EF',
  pagarBg: '#E8EAF6',
  depositarBg: '#FFF3E0',
  sacarBg: '#FFEBEE',
  transferirBg: '#EDE7F6',
  emprestimoBg: '#FCE4EC',
  pixIcon: '#00A878',
  pagarIcon: '#5C6BC0',
  depositarIcon: '#EF6C00',
  sacarIcon: '#E53935',
  transferirIcon: '#7E57C2',
  emprestimoIcon: '#C2185B',
  cardBlue: '#0A192F',
  cardBlueLight: '#1E3A8A',
  triangleGreen: '#00A878',
  investBlue: '#0A192F',
  rendaFixa: '#5C6BC0',
  acoes: '#EF6C00',
  tesouro: '#00A878',
  statusBarStyle: 'dark-content',
  cardBg: '#FFFFFF',
  sectionCardBg: '#FFFFFF',
  menuIconBg: '#E0F5EF',
  inputBorder: '#CBD5E0',
  inputBgColor: '#FFFFFF',
  switchTrackFalse: '#D1D5DB',
  bloquearBtnBg: '#FFEBEE',
  faturaBtnBg: '#FFFFFF',
  faturaBtnBorder: '#CBD5E0',
  faturaText: '#4A5568',
  bottomNavBg: '#FFFFFF',
  bottomNavBorder: '#CBD5E0',
  errorBannerBg: '#FFF3E0',
  errorBg: '#FFEBEE',
  errorBorder: '#E53935',
  logoutBorder: '#FFCDD2',
  menuDivider: '#E2E8F0',
};

export const DarkColors: ThemeColors = {
  primary: '#0A192F',
  primaryLight: '#1E3A8A',
  primaryMedium: '#162D50',
  accent: '#1DE9B6',
  accentLight: '#64FFDA',
  accentDark: '#00BFA5',
  white: '#FFFFFF',
  background: '#0A1628',
  surface: '#111D32',
  surfaceLight: '#162240',
  surfaceHover: '#1E2D4A',
  textPrimary: '#E8ECF1',
  textSecondary: '#8A9BB5',
  textMuted: '#5A6E87',
  textAccent: '#1DE9B6',
  textWhite: '#FFFFFF',
  positive: '#1DE9B6',
  negative: '#FF1744',
  warning: '#FF9100',
  border: '#1E2D4A',
  inputBg: '#162240',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  cardGradientStart: '#0D2137',
  cardGradientEnd: '#1A3A5C',
  pix: '#1DE9B6',
  pagar: '#7986CB',
  depositar: '#FFB74D',
  sacar: '#FF5252',
  transferir: '#B39DDB',
  emprestimo: '#F48FB1',
  pixBg: '#0D2E24',
  pagarBg: '#1A1D3A',
  depositarBg: '#2E2100',
  sacarBg: '#2E0D0D',
  transferirBg: '#1F1535',
  emprestimoBg: '#2E0D1F',
  pixIcon: '#1DE9B6',
  pagarIcon: '#7986CB',
  depositarIcon: '#FFB74D',
  sacarIcon: '#FF5252',
  transferirIcon: '#B39DDB',
  emprestimoIcon: '#F48FB1',
  cardBlue: '#0D2137',
  cardBlueLight: '#1A3A5C',
  triangleGreen: '#1DE9B6',
  investBlue: '#0D2137',
  rendaFixa: '#7986CB',
  acoes: '#FFB74D',
  tesouro: '#1DE9B6',
  statusBarStyle: 'light-content',
  cardBg: '#111D32',
  sectionCardBg: '#111D32',
  menuIconBg: '#0D2E24',
  inputBorder: '#1E2D4A',
  inputBgColor: '#162240',
  switchTrackFalse: '#2A3A52',
  bloquearBtnBg: '#2E0D0D',
  faturaBtnBg: '#111D32',
  faturaBtnBorder: '#1E2D4A',
  faturaText: '#8A9BB5',
  bottomNavBg: '#0A1628',
  bottomNavBorder: '#1E2D4A',
  errorBannerBg: '#2E2100',
  errorBg: '#3A1515',
  errorBorder: '#FF1744',
  logoutBorder: '#3A1515',
  menuDivider: '#1E2D4A',
};

// For backward compatibility, export Colors as LightColors
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
  giant: 34,
  balance: 32,
};

export const BorderRadii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};
