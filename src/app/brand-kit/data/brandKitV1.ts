// src/app/brand-kit/data/brandKitV1.ts
import { DesignSystem } from './types';

export const brandKitV1: DesignSystem = {
  name: 'Brand Kit v1.0',
  colors: {
    accent: '#2563eb',
    'accent-hover': '#1d4ed8',
    'accent-light': '#3b82f6',
    'accent-bg': 'rgba(37, 99, 235, 0.08)',
    red: '#ff5c38',
    'red-bg': 'rgba(255, 92, 56, 0.08)',
    bg: '#0d0d0d',
    surface: '#161616',
    surface2: '#1c1c1c',
    border: '#222222',
    border2: '#2e2e2e',
    text: '#e8e8e8',
    text2: '#a0a0a0',
    muted: '#555555',
  },
  fonts: {
    display: 'Bebas Neue',
    body: 'DM Sans',
    mono: 'DM Mono',
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96],
  buttons: {
    variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
  },
  badges: {
    variants: ['blue', 'green', 'red', 'gray'],
  },
};
