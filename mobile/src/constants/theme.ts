/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// DocConnect design tokens — from "Developer Handsoff.pdf" (July 2026).
// Primary teal is for interactive elements only (buttons, links, active tabs) — never body text.
export const Palette = {
  primaryDark: '#027878', // headings, accents, logo
  primary: '#02B6B6', // buttons, CTA, active states, links
  primaryLight: '#F1FAFA', // subtle backgrounds, card hover

  textPrimary: '#29292B', // body text, headings
  textSecondary: '#7F7F80', // subtitles, placeholders, timestamps
  border: '#EEEEEF', // dividers, input borders
  backgroundLight: '#F8F8F9', // page backgrounds, cards
  white: '#FFFFFF', // card backgrounds, overlays

  surfaceWarm: '#F0F0E8', // card background variant
  surfaceCream: '#F5F5F0', // content card fills
} as const;

export const FontFamily = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const;

// Type scale — spread into a StyleSheet entry, e.g. `title: { ...Typography.h3 }`.
export const Typography = {
  h1: { fontFamily: FontFamily.bold, fontSize: 24 }, // page titles
  h2: { fontFamily: FontFamily.bold, fontSize: 20 }, // section headings, modal titles
  h3: { fontFamily: FontFamily.bold, fontSize: 16 }, // card titles, list item names
  b1: { fontFamily: FontFamily.medium, fontSize: 16 }, // primary body text
  b2: { fontFamily: FontFamily.regular, fontSize: 14 }, // secondary text, metadata
  cta: { fontFamily: FontFamily.bold, fontSize: 16 }, // button labels
} as const;
