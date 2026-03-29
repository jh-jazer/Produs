# 🪐 Produs: Multi-Theme Design Architecture

This document defines the three primary visual directions for Produs. These themes allow the user to toggle their productivity environment based on their mental state: **Analytical**, **Focused**, or **Adventurous**.

---

## 🛰️ Theme 1: The Intelligence Aesthetic (System Core)
*Current Default — Seen in the Landing and Dashboard.*

### Concept
A high-performance command center. It feels like a terminal directly into your potential—engineered, data-heavy, and elite.

- **Backgrounds**: Pure pitch #000000 (Dark) or Pure Bone #f8f8f8 (Light).
- **Primary Color**: `Electric Blue` (#0066FF).
- **Typography**: `Outfit` (Thin uppercase, tracking 1.25em) and `JetBrains Mono`.
- **UI Logic**: HUD fragments, 1px geometric grid overlays, and AR-style corner decorations (`.ar-corners`).
- **Motion**: Weighted scroll (Lenis) and parallax HUD nodes.

---

## 🔳 Theme 2: The Minimalist Observer (The Zen Void)
*For absolute focus and cognitive decompression.*

### Concept
Stripping away every ounce of UI "noise." It relies on perfect typography, massive white space, and 1-bit or 2-bit color palettes.

- **Backgrounds**: Liquid White #FFFFFF or Soft Paper #F4F4F4.
- **Primary Color**: `Deep Charcoal` (#222222) or `Neutral Slate`.
- **Typography**: `Inter` (Medium weight) or `Comic Neue` (for a raw, draft-like feel).
- **UI Logic**: No borders (`border-0`), no shadows. Use subtle underlines or strike-throughs for status. Bento-box layouts are replaced by simple list-based vertical columns.
- **Motion**: Instant transitions. No blurs, no parallax. Focus is on clarity and speed.

---

## 🗡️ Theme 3: The Eternal Quest (Fantasy / RPG-HUD)
*Gamified productivity for the adventurous user.*

### Concept
Turning your habits and tasks into a legendary journal. It feels like a pause menu in a high-fantasy RPG or an ancient artifact.

- **Backgrounds**: Old Parchment (using SVG textures) or Deep Midnight Blue.
- **Primary Color**: `Signal Orange` (#FF4D00) and `Gold Accent`.
- **Typography**: `Kalam` (Handwritten notes) or `Bangers` (for achievement call-outs).
- **UI Logic**: Ornate borders (`border-double`), vintage scrollbars, and icon-heavy navigation. Level and XP displays are stylized with shields or sword symbols.
- **Motion**: "Page-turning" transitions and particle effects on task completion.

---

## 🛠️ Technical Implementation of Themes

### 🎛️ Theme Context & Tokens
The application manages these themes via a top-level `[data-theme]` attribute on the `<body>`.

```css
/* Example Token Overrides */
[data-theme="intelligence"] {
    --primary: #0066ff;
    --font-heading: "Outfit";
}

[data-theme="minimalist"] {
    --primary: #222222;
    --font-heading: "Inter";
}

[data-theme="fantasy"] {
    --primary: #ff4d00;
    --font-heading: "Kalam";
}
```

### 🎲 Component Adaptation
Developers should use the `theme-variant` utility to swap styles:
- **Button**: `intelligence` (Glow/Border) vs `fantasy` (Beveled/Texture).
- **Grid**: `intelligence` (HUD Grid) vs `minimalist` (None) vs `fantasy` (Noise/Grain).
