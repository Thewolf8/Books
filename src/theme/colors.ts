export interface ColorTheme {
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceHighlight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  readerBackground: string;
  readerText: string;
  highlightColors: string[];
  overlay: string;
  shadow: string;
}

export const lightColors: ColorTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  surfaceHighlight: '#eff6ff',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  secondary: '#ec4899',
  accent: '#06b6d4',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  divider: '#cbd5e1',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
  readerBackground: '#fafaf9',
  readerText: '#1c1917',
  highlightColors: ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'],
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkColors: ColorTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  surfaceHighlight: '#1e3a5f',
  primary: '#818cf8',
  primaryLight: '#a5b4fc',
  primaryDark: '#6366f1',
  secondary: '#f472b6',
  accent: '#22d3ee',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
  divider: '#475569',
  error: '#f87171',
  success: '#4ade80',
  warning: '#fbbf24',
  info: '#60a5fa',
  readerBackground: '#1c1917',
  readerText: '#fafaf9',
  highlightColors: ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'],
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const getColorsForTheme = (
  mode: 'light' | 'dark',
  customColors?: {pageBackground?: string; textColor?: string; highlightColor?: string} | null,
): ColorTheme => {
  const base = mode === 'dark' ? {...darkColors} : {...lightColors};

  if (customColors) {
    if (customColors.pageBackground) base.readerBackground = customColors.pageBackground;
    if (customColors.textColor) base.readerText = customColors.textColor;
    if (customColors.highlightColor) base.highlightColors = [customColors.highlightColor, ...base.highlightColors];
  }

  return base;
};
