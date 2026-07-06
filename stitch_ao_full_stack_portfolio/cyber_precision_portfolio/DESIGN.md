---
name: Cyber-Precision Portfolio
colors:
  surface: '#0e1416'
  surface-dim: '#0e1416'
  surface-bright: '#343a3c'
  surface-container-lowest: '#090f11'
  surface-container-low: '#171c1f'
  surface-container: '#1b2023'
  surface-container-high: '#252b2d'
  surface-container-highest: '#303638'
  on-surface: '#dee3e6'
  on-surface-variant: '#bcc9ce'
  inverse-surface: '#dee3e6'
  inverse-on-surface: '#2b3134'
  outline: '#869398'
  outline-variant: '#3d494d'
  surface-tint: '#4cd6fb'
  primary: '#4cd6fb'
  on-primary: '#003642'
  primary-container: '#00b4d8'
  on-primary-container: '#00414f'
  inverse-primary: '#00677d'
  secondary: '#a1cddd'
  on-secondary: '#003642'
  secondary-container: '#1e4c5a'
  on-secondary-container: '#90bccb'
  tertiary: '#ffb77d'
  on-tertiary: '#4d2600'
  tertiary-container: '#eb8f3b'
  on-tertiary-container: '#5d2f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b3ebff'
  primary-fixed-dim: '#4cd6fb'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#bdeafa'
  secondary-fixed-dim: '#a1cddd'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#1e4c5a'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#0e1416'
  on-background: '#dee3e6'
  surface-variant: '#303638'
typography:
  h1:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.2'
  h2:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.3'
  h3:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1200px
---

## Brand & Style
The design system is engineered for a high-performance software engineering and DevOps portfolio. It targets a technical audience—recruiters, engineering managers, and open-source collaborators—who value precision, efficiency, and modern tooling. 

The aesthetic is **Cyberpunk-lite**, a refined take on futuristic interfaces that prioritizes professional utility over neon clutter. It utilizes a **Glassmorphism** overlay strategy for modals and navigation to maintain depth, combined with **Minimalism** in layout to ensure the code and projects remain the focal point. The emotional response should be one of "controlled power": dark, focused, and technologically advanced.

## Colors
The palette is built on a "Pure Black" foundation to maximize contrast and visual punch on OLED displays. 

- **Primary (#00b4d8):** Used exclusively for high-priority actions, active navigation states, and data visualizations.
- **Surface Tiers:** Layering is achieved through `#0f1115` (base cards) and `#1a1c22` (interactive elements like inputs), providing a subtle sense of elevation without relying on heavy shadows.
- **Semantic Accents:** While cyan is the primary accent, use industry-standard colors for status: Green for "Deploying/Success," Yellow for "Warning," and Red for "Critical Error," always keeping these colors desaturated to fit the dark theme.

## Typography
This design system uses **Inter** exclusively to lean into a systematic, utilitarian aesthetic. 

- **Headlines:** Use tight letter spacing for H1 and H2 to create a dense, "engineered" look. 
- **Body Text:** Maintain a generous line height (1.6) to ensure readability against the high-contrast black background.
- **Mono Accents:** While the primary font is Inter, code blocks and technical metadata (like Git hashes or version numbers) should utilize a fallback monospaced font to reinforce the DevOps theme.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a strict 4px baseline rhythm. 

- **Desktop:** A 12-column grid with 24px gutters. Content is centered with a max-width of 1200px.
- **Mobile:** A 4-column grid with 16px margins. 
- **Sectioning:** Use large vertical padding (80px - 120px) between major portfolio sections (Experience, Projects, Tools) to allow the design to breathe and reduce visual cognitive load.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Glassmorphism**, rather than traditional fuzzy shadows.

- **Overlays:** Navigation bars and modals use a background blur (12px to 20px) with a semi-transparent hex of `#0f111580`. 
- **Borders:** Subtle `1px` borders in `#2a2d35` define the edges of surfaces. 
- **Glow Effects:** High-elevation elements (like hovered cards) utilize a "Cyan Glow"—a 0px offset, 15px blur shadow using `#00b4d840`.

## Shapes
The shape language is "Soft-Tech." 

- **Standard Elements:** Buttons and small components use an 8px (`0.5rem`) radius.
- **Containers:** Project cards and section containers use a 12px (`0.75rem`) radius. 
- **Interactive States:** When an element is focused or hovered, the shape remains static, but the border-color transitions to the Primary Cyan to indicate life.

## Components

### Buttons
- **Primary:** Solid Cyan (`#00b4d8`) background with Black text. On hover, apply a Cyan outer glow and scale the element by 1.02.
- **Secondary:** Transparent background with a 1px Cyan border and Cyan text. On hover, the background fills with Cyan and text turns Black.

### Cards
- **Project Cards:** Background `#0f1115` with a 1px border of `#2a2d35`. Upon hover, the border color changes to Cyan and a soft Cyan glow appears.
- **Inner Padding:** Use a consistent 24px padding for card content.

### Badges & Chips
- Use a `pill` shape (fully rounded). 
- **Tech Stack Chips:** Background `#1a1c22`, border `#2a2d35`, text `#aaaaaa`. Use Cyan text for "featured" or "expert" skills.

### Inputs
- Background `#1a1c22` with a subtle `#2a2d35` border. 
- **Focus State:** Border transitions to Cyan with a 2px outer ring of `#00b4d820`.

### Lists
- For technical logs or experience timelines, use a vertical Cyan line (2px width) as a connector between list items to visualize the "pipeline" or "flow" of a career.