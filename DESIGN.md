---
name: Luminous Procurement
colors:
  surface: '#fff7fe'
  surface-dim: '#e1d7e4'
  surface-bright: '#fff7fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf0fe'
  surface-container: '#f5eaf8'
  surface-container-high: '#efe5f2'
  surface-container-highest: '#e9dfec'
  on-surface: '#1f1a23'
  on-surface-variant: '#4c4353'
  inverse-surface: '#342e38'
  inverse-on-surface: '#f8edfb'
  outline: '#7e7385'
  outline-variant: '#cfc2d6'
  surface-tint: '#8131cd'
  primary: '#7e2eca'
  on-primary: '#ffffff'
  primary-container: '#994ce5'
  on-primary-container: '#fffbff'
  inverse-primary: '#dcb8ff'
  secondary: '#635b6e'
  on-secondary: '#ffffff'
  secondary-container: '#e9def5'
  on-secondary-container: '#696174'
  tertiary: '#5c5b63'
  on-tertiary: '#ffffff'
  tertiary-container: '#75737c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#dcb8ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6802b3'
  secondary-fixed: '#e9def5'
  secondary-fixed-dim: '#cdc2d9'
  on-secondary-fixed: '#1e1929'
  on-secondary-fixed-variant: '#4a4456'
  tertiary-fixed: '#e4e1eb'
  tertiary-fixed-dim: '#c8c5ce'
  on-tertiary-fixed: '#1b1b22'
  on-tertiary-fixed-variant: '#47464e'
  background: '#fff7fe'
  on-background: '#1f1a23'
  surface-variant: '#e9dfec'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 20px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
  section-gap: 40px
---

## Brand & Style

The design system is rooted in the "Clean Enterprise" movement, blending the efficiency of a B2B procurement platform with the polished, user-centric aesthetics of high-end Fintech. The goal is to reduce the cognitive load of complex supply chain management through a minimalist interface that feels spacious, trustworthy, and sophisticated.

The visual narrative centers on **clutter-free elegance**. By utilizing expansive white space and a "Mobile-First" priority, the interface transforms dense procurement data into digestible, actionable insights. The emotional response should be one of calm control—moving away from the industrial, grey-heavy legacy software toward a bright, optimistic, and premium digital workspace.

## Colors

The palette is intentionally restrained to maintain a "White-Label" premium feel while using color strategically for brand recognition and hierarchy.

- **Primary Purple (#b266ff):** Used for primary actions, progress indicators, and key brand moments. It represents innovation and modern enterprise.
- **Light Lavender Gradient:** A soft transition from `#b266ff` to `#d8b4fe` used for high-level cards, empty states, and featured headers to add depth without adding noise.
- **Typography:** Deep charcoal (`#111111`) ensures high legibility for headings, while a muted slate (`#777777`) is used for metadata and secondary information.
- **Surface Colors:** Pure white (`#ffffff`) is the foundation, using very light lavender tints (`#f9f5ff`) for background sectioning instead of traditional greys.

## Typography

This design system utilizes **Manrope** exclusively to maintain a modern, geometric, and highly legible aesthetic across all scales. 

Headings are set with bold weights and tight letter-spacing to create a "Fintech" impact, making titles feel like solid anchors on the page. Body text maintains a medium weight to ensure high readability against the white background. For data-heavy procurement tables or lists, `label-sm` is used in semi-bold to ensure information hierarchy remains clear even at small sizes.

## Layout & Spacing

The layout follows a **Mobile-First, fluid approach** centered on a "Safe Margin" philosophy.

- **Grid:** On mobile, we use a single-column layout with 20px horizontal margins. On larger screens, the content is capped at 1200px and centered.
- **Rhythm:** A strict 8px baseline grid is used. Elements are separated by "Spacious Breathers"—using 24px or 40px gaps between major sections to prevent the UI from feeling "crowded" like traditional ERP software.
- **Alignment:** All content follows a logical vertical stack. Horizontal scrolling is reserved only for "Quick Action" chips or data cards to maximize vertical real estate for procurement lists.

## Elevation & Depth

To maintain the "Minimalist" aesthetic, depth is created through **Ambient Shadows** and **Tonal Layering** rather than heavy borders.

- **Level 1 (Surface):** The main background is flat white.
- **Level 2 (Cards):** Use an extremely soft shadow (Y: 4px, Blur: 20px, Opacity: 4%, Color: #b266ff tinted) to make cards "float" gently.
- **Level 3 (Interactive):** Elements like active buttons or search bars use a slightly more pronounced shadow to indicate interactivity.
- **Glassmorphism:** Bottom navigation bars and top headers use a subtle backdrop blur (20px) with 80% opacity white to maintain context of the content scrolling beneath them.

## Shapes

The shape language is defined by **Pill-shaped components** and oversized radii. 

All primary buttons, input fields, and status badges must use a fully rounded (pill) style. Larger containers like "Purchase Order" cards or "Vendor Profiles" use `rounded-xl` (24px - 48px) to soften the interface. This organic, rounded approach differentiates the design system from the sharp, rigid boxes found in legacy enterprise software, making the app feel approachable and modern.

## Components

- **Buttons:** Primary buttons are pill-shaped, using the `#b266ff` background with white text. Secondary buttons use a light lavender tint (`#f3e8ff`) with purple text.
- **Input Fields:** Search bars and text inputs are pill-shaped with a light grey border (`#eeeeee`) that turns purple on focus. Labels are placed above the field in `label-sm`.
- **Status Chips:** Small pill-shaped badges for status (e.g., "Pending," "Approved"). Use high-transparency versions of semantic colors (e.g., light green for approved) with dark text.
- **Cards:** All-white background with a soft ambient shadow and `rounded-xl` corners. Information inside is stacked vertically with 12px spacing.
- **Lists:** Procurement items are separated by subtle 1px dividers or, preferably, grouped into individual floating cards to emphasize the "Fintech" list style.
- **Progress Bars:** Thin, pill-shaped tracks with the primary gradient to show budget exhaustion or shipping progress.