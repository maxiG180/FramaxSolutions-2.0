// src/app/brand-kit/data/types.ts
export type DesignSystem = {
  name: string;
  colors: {
    [key: string]: string;
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  spacing: number[];
  buttons: {
    variants: string[];
  };
  badges: {
    variants: string[];
  };
};
