---
name: Agri-National Design System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414846'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717976'
  outline-variant: '#c1c8c5'
  surface-tint: '#45645e'
  primary: '#02241f'
  on-primary: '#ffffff'
  primary-container: '#1a3a34'
  on-primary-container: '#83a49c'
  inverse-primary: '#abcec5'
  secondary: '#2c694e'
  on-secondary: '#ffffff'
  secondary-container: '#aeeecb'
  on-secondary-container: '#316e52'
  tertiary: '#0d2315'
  on-tertiary: '#ffffff'
  tertiary-container: '#23392a'
  on-tertiary-container: '#8aa38f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7eae1'
  primary-fixed-dim: '#abcec5'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#2d4d46'
  secondary-fixed: '#b1f0ce'
  secondary-fixed-dim: '#95d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0e5138'
  tertiary-fixed: '#cee9d3'
  tertiary-fixed-dim: '#b3cdb7'
  on-tertiary-fixed: '#092012'
  on-tertiary-fixed-variant: '#354c3b'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is anchored in the intersection of institutional authority and modern technological efficiency. It bridges the gap between high-level ministerial oversight and the grounded, tactical needs of farmers and transporters. 

The style is **Corporate Modern** with a lean toward minimalism to ensure clarity in complex marketplace data. It utilizes generous whitespace to convey a premium, "uncluttered" feel while maintaining a strict logical structure that suggests reliability. Every element is designed to evoke a sense of growth, stability, and nationwide connectivity, ensuring that a first-time buyer feels invited while a seasoned agricultural officer feels in command of an official platform.

## Colors
The palette is rooted in the natural lifecycle of agriculture. 
- **Deep Forest Green (#1A3A34)**: Used for primary navigation, headers, and authoritative elements to establish the "Ministerial" presence.
- **Vibrant Emerald (#2D6A4F)**: The core action color. It represents growth and productivity, used for buttons, active states, and success indicators.
- **Soft Mint (#D8F3DC)**: A secondary accent used for subtle backgrounds, tag highlights, and secondary UI containers to prevent visual fatigue.
- **Crisp White (#FFFFFF)**: The primary canvas color to maintain a clean, high-contrast environment for data readability.

Functional colors for alerts and statuses should be slightly desaturated to remain harmonious with the organic green tones of the system.

## Typography
This design system utilizes a dual-font strategy. **Public Sans** is used for headlines to provide a stable, institutional, and accessible "government-standard" feel. It is highly legible at large scales and carries a sense of official weight.

For body copy, data tables, and interface labels, **Inter** is used for its superior readability on screens and neutral, systematic character. This ensures that dense marketplace information—such as pricing, weights, and logistics tracking—is consumed without friction. 
- Use **h1** through **h3** for page titles and section headers.
- Use **body-md** for general content.
- Use **label-caps** for small metadata, table headers, and category tags.

## Layout & Spacing
The system follows a **Fixed Grid** approach for desktop views to maintain a controlled, professional presentation, transitioning to a fluid layout for mobile users in the field. 

A 12-column grid is standard, with a 24px gutter to provide ample breathing room between content modules. The spacing rhythm is based on a 4px/8px scale. 
- **Margins**: 24px for mobile/tablet; centered 1280px max-width for desktop.
- **Vertical Spacing**: Use `xl` (48px) to separate major sections and `md` (16px) for internal component spacing.
- **Data Density**: In marketplace tables, use a "Comfortable" density with 12px vertical padding on rows to ensure clarity for farmers using mobile devices outdoors.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layers** rather than heavy gradients. This keeps the interface feeling "modern-tech" rather than "legacy-web."

- **Level 0 (Flat)**: The main background (#FFFFFF).
- **Level 1 (Subtle)**: Used for cards and secondary sections. A very soft, diffused shadow (0px 4px 20px rgba(26, 58, 52, 0.05)) provides a gentle lift.
- **Level 2 (Active)**: Used for hover states on cards and dropdown menus. The shadow becomes slightly more defined (0px 8px 30px rgba(26, 58, 52, 0.08)).
- **Level 3 (Overlay)**: Used for modals and ministerial alerts. High diffusion to ensure focus remains on the foreground element.

Avoid using shadows on buttons; use color shifts (Primary to Secondary green) to indicate interaction.

## Shapes
The shape language is defined by **Rounded (0.5rem)** corners. This softens the "government" feel, making the platform more approachable and modern for the everyday farmer or buyer.

- **Standard Components**: Buttons, Input fields, and Small Cards use 0.5rem (8px).
- **Large Containers**: Marketplace feature cards and dashboard panels use `rounded-lg` (16px).
- **Utility Elements**: Search bars and status badges use `rounded-xl` (24px) or full pill-shaping to distinguish them from primary structural content.

## Components
- **Buttons**: Primary buttons are solid Deep Forest Green or Emerald Green with white text and 8px corners. Secondary buttons use a Soft Mint background with Deep Forest Green text.
- **Input Fields**: Crisp white backgrounds with a 1px border in a lightened Deep Forest Green (approx 20% opacity). Labels are always visible above the field in **label-caps**.
- **Cards**: Use white backgrounds with Level 1 elevation and 16px corner radius. Borderless design is preferred to keep the UI clean.
- **Chips/Badges**: Small, pill-shaped elements using the Soft Mint background for categories (e.g., "Grains", "Livestock") and Emerald for statuses (e.g., "Verified").
- **Data Visualization**: Graphs and charts should use the green palette. Avoid red unless indicating a critical deficit or price drop. Use "Emerald Green" for growth trends and "Deep Forest Green" for baseline data.
- **Iconography**: High-quality, thin-to-medium weight line icons (e.g., Phosphor or Lucide). Icons should be monochromatic using the Deep Forest Green to maintain the "Official" aesthetic.
- **Additional Suggestion - "Verification Shield"**: A custom component for "Ministerial Verified" sellers, using an Emerald Green shield icon and Soft Mint background to build instant trust.