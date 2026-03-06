// src/app/brand-kit/data/currentSystem.ts
import { DesignSystem } from './types';

export const currentSystem: DesignSystem = {
  name: 'Current System',
  colors: {
    primary: '#2563eb',
    secondary: '#ec4899',
    accent: '#8b5cf6',
    background: '#0a0a0a',
    foreground: '#ededed',
    'primary-foreground': '#ffffff',
    'secondary-foreground': '#ffffff',
    'accent-foreground': '#ffffff',
  },
  fonts: {
    display: 'var(--font-display)',
    body: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96],
  buttons: {
    variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
  },
  badges: {
    variants: ['blue', 'green', 'red', 'gray'],
  },
};
