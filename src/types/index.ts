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
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceLight: '#F3F4F6',
  surfaceHover: '#E5E7EB',
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textAccent: '#10B981',
  textWhite: '#FFFFFF',
  positive: '#10B981',
  negative: '#EF4444',
  warning: '#F97316',
  border: '#CBD5E0',
  inputBg: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardGradientStart: '#0A192F',
  cardGradientEnd: '#1E3A8A',
  pix: '#10B981',
  pagar: '#6366F1',
  depositar: '#F97316',
  sacar: '#EF4444',
  transferir: '#8B5CF6',
  emprestimo: '#EC4899',
  pixBg: '#ECFDF5',
  pagarBg: '#EEF2FF',
  depositarBg: '#FFF7ED',
  sacarBg: '#FEF2F2',
  transferirBg: '#F5F3FF',
  emprestimoBg: '#FDF2F8',
  pixIcon: '#10B981',
  pagarIcon: '#6366F1',
  depositarIcon: '#F97316',
  sacarIcon: '#EF4444',
  transferirIcon: '#8B5CF6',
  emprestimoIcon: '#EC4899',
  cardBlue: '#0A192F',
  cardBlueLight: '#1E3A8A',
  triangleGreen: '#10B981',
  investBlue: '#0A192F',
  rendaFixa: '#6366F1',
  acoes: '#F97316',
  tesouro: '#10B981',
  statusBarStyle: 'dark-content',
  cardBg: '#FFFFFF',
  sectionCardBg: '#FFFFFF',
  menuIconBg: '#ECFDF5',
  inputBorder: '#CBD5E0',
  inputBgColor: '#FFFFFF',
  switchTrackFalse: '#D1D5DB',
  bloquearBtnBg: '#FEF2F2',
  faturaBtnBg: '#FFFFFF',
  faturaBtnBorder: '#CBD5E0',
  faturaText: '#4A5568',
  bottomNavBg: '#FFFFFF',
  bottomNavBorder: '#CBD5E0',
  errorBannerBg: '#FFF7ED',
  errorBg: '#FEF2F2',
  errorBorder: '#EF4444',
  logoutBorder: '#FEE2E2',
  menuDivider: '#E2E8F0',
};

export const DarkColors: ThemeColors = {
  primary: '#0A192F',
  primaryLight: '#1E3A8A',
  primaryMedium: '#162D50',
  accent: '#00E676',
  accentLight: '#69F0AE',
  accentDark: '#00C853',
  white: '#FFFFFF',
  background: '#0A1628',
  surface: '#111D32',
  surfaceLight: '#162240',
  surfaceHover: '#1E2D4A',
  textPrimary: '#E8ECF1',
  textSecondary: '#8A9BB5',
  textMuted: '#5A6E87',
  textAccent: '#00E676',
  textWhite: '#FFFFFF',
  positive: '#00E676',
  negative: '#FF5252',
  warning: '#FFB74D',
  border: '#1E2D4A',
  inputBg: '#162240',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  cardGradientStart: '#0D2137',
  cardGradientEnd: '#1A3A5C',
  pix: '#00E676',
  pagar: '#7C83FF',
  depositar: '#FFB74D',
  sacar: '#FF5252',
  transferir: '#A78BFA',
  emprestimo: '#F472B6',
  pixBg: '#0D2A1A',
  pagarBg: '#151A3A',
  depositarBg: '#2A1F0D',
  sacarBg: '#2A0D0D',
  transferirBg: '#1F1535',
  emprestimoBg: '#2A0D1F',
  pixIcon: '#00E676',
  pagarIcon: '#7C83FF',
  depositarIcon: '#FFB74D',
  sacarIcon: '#FF5252',
  transferirIcon: '#A78BFA',
  emprestimoIcon: '#F472B6',
  cardBlue: '#0D2137',
  cardBlueLight: '#1A3A5C',
  triangleGreen: '#00E676',
  investBlue: '#0D2137',
  rendaFixa: '#7C83FF',
  acoes: '#FFB74D',
  tesouro: '#00E676',
  statusBarStyle: 'light-content',
  cardBg: '#111D32',
  sectionCardBg: '#111D32',
  menuIconBg: '#0D2A1A',
  inputBorder: '#1E2D4A',
  inputBgColor: '#162240',
  switchTrackFalse: '#2A3A52',
  bloquearBtnBg: '#2A0D0D',
  faturaBtnBg: '#111D32',
  faturaBtnBorder: '#1E2D4A',
  faturaText: '#8A9BB5',
  bottomNavBg: '#0A1628',
  bottomNavBorder: '#1E2D4A',
  errorBannerBg: '#2A1F0D',
  errorBg: '#3A1515',
  errorBorder: '#FF5252',
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
