---
name: Aureate Enterprise
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1b22'
  on-tertiary-container: '#83838c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e3e1ec'
  tertiary-fixed-dim: '#c6c5cf'
  on-tertiary-fixed: '#1a1b22'
  on-tertiary-fixed-variant: '#46464e'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style
The design system is engineered for a high-stakes e-procurement environment where luxury meets institutional reliability. The target audience includes C-suite executives, high-value vendors, and procurement directors who expect an interface that mirrors the prestige of multi-million dollar contracts. 

The aesthetic is **Luxury Minimalist**, blending the precision of high-end fintech with the spatial confidence of an editorial magazine. The emotional response should be one of "calm authority"—removing the friction of complex bidding processes through generous whitespace, premium materiality, and a focused, high-contrast visual hierarchy.

## Colors
This design system utilizes a "Prestige Palette" to differentiate between administrative tasks and high-value actions.

*   **Primary (#1A1A1A):** Used for structural elements, primary buttons, and critical text. It provides the "anchor" for the interface.
*   **Accent (#D4AF37):** A rich metallic gold reserved exclusively for active states, call-to-actions, and premium status indicators. It must be used sparingly to maintain its impact.
*   **Neutral (#71717A):** A soft slate used for secondary labels and metadata to ensure the interface doesn't feel aggressive.
*   **Surface (#FAF9F6):** The warm cream base reduces eye strain compared to pure white and evokes the feeling of premium stationery.

## Typography
The typography system relies on **Inter** for its systematic clarity and modern architectural feel. 

Hierarchy is established through weight and tracking rather than drastic size changes. Headings utilize tighter tracking for a refined, custom-type look, while smaller labels use wide tracking (letter-spacing) and uppercase transformations to evoke luxury branding. All body text maintains a comfortable line-height to ensure legibility during dense contract reviews.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first procurement. 

*   **Margins:** A generous 24px side margin is mandatory to maintain the "luxury" sense of space and prevent the UI from feeling cramped on device edges.
*   **Vertical Rhythm:** Content is grouped into logical "stacks." Use 40px (stack-lg) to separate major sections (e.g., Tender Details vs. Bid History) and 24px (stack-md) for elements within a section.
*   **Touch Targets:** All interactive elements must maintain a minimum height of 48px, padded internally to align with the 8px base grid.

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a sense of physical importance.

*   **Level 0 (Base):** The #FAF9F6 cream background.
*   **Level 1 (Cards):** Pure white (#FFFFFF) surfaces with a very soft, high-dispersion shadow (Y: 4, Blur: 20, Opacity: 4% Black). These appear "rested" on the surface.
*   **Level 2 (Active/Floating):** Elements like the floating navigation bar or active modals use a slightly deeper shadow and an ultra-thin 0.5px border (#1A1A1A at 5% opacity) to define edges against the warm background.
*   **High-Contrast Tier:** Critical "Premium" sections use a Deep Black (#1A1A1A) background with no shadow, relying on pure contrast to command attention.

## Shapes
The shape language is defined by significant corner rounding to soften the "corporate" edge of procurement. 

Standard containers and cards use a **16px (rounded-lg)** radius. Main action buttons and primary tender cards should lean into the **24px (rounded-xl)** radius to emphasize the modern, approachable luxury feel. Small interactive components like checkboxes or tags utilize a **4px (soft)** radius to maintain a professional, sharp secondary hierarchy.

## Components

### Buttons
*   **Primary:** Solid Deep Black (#1A1A1A) with White text. High-rounded corners (24px).
*   **Secondary/Accent:** Solid Gold (#D4AF37) with Deep Black text for the most critical "Submit Bid" actions.
*   **Ghost:** Transparent background with a 1px Slate (#71717A) border for less urgent actions.

### Cards
Cards are the primary vessel for information. Use white backgrounds for standard tenders and the Deep Black (#1A1A1A) background for "Featured" or "Urgent" bids. All cards feature 16px - 24px padding.

### Navigation
A **Floating Bottom Bar** is utilized. It should have a blur effect (backdrop-filter) and sit 16px away from the bottom and side edges. Icons are minimalist line-art; the active state is indicated by a Gold (#D4AF37) dot or icon tint.

### Forms & Inputs
Inputs use a white background with a subtle 1px border (#E5E5E5). On focus, the border transitions to Deep Black (#1A1A1A) with a very slight gold glow (2px outer spread). Labels are always in `label-caps` style above the field.

### Badges (Status Indicators)
Badges avoid bright "traffic light" colors in favor of sophisticated tonal variations:
*   **Open:** Soft Gold background / Deep Brown text.
*   **Bidding:** Soft Slate background / Deep Black text.
*   **Closed:** Very light cream background / Slate text.
*   **Finished:** Deep Black background / Gold text (Premium finish).