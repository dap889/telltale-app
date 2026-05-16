export const colors = {
  bg: '#0A0A0F',
  surface: '#13131A',
  surfaceElevated: '#1C1C26',
  border: '#2A2A38',
  primary: '#7C6FFF',
  primaryLight: '#A99EFF',
  primaryDark: '#5A4FCC',
  accent: '#FF6B9D',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  textPrimary: '#F0F0F8',
  textSecondary: '#8888AA',
  textMuted: '#555566',
  scoreExcellent: '#4ADE80',
  scoreGood: '#A3E635',
  scoreFair: '#FBBF24',
  scorePoor: '#F87171',
};

export function scoreColor(score: number): string {
  if (score >= 80) return colors.scoreExcellent;
  if (score >= 60) return colors.scoreGood;
  if (score >= 40) return colors.scoreFair;
  return colors.scorePoor;
}
