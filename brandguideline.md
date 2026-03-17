This Brand Guideline is designed for Produs, codenaming the visual direction as "The Intelligence Aesthetic." This document distills the premium, high-contrast dark mode from your reference image into a repeatable design system.

🛸 Produs: Brand Identity & Design System
Version: 1.0
Concept: The Intelligence Dark Mode

1. Brand Mission & Persona
Produs is the "Single Source of Truth" for personal and professional productivity. The brand should feel like a high-performance cockpit—engineered, precise, and sophisticated.

Personality: Analytical, Elite, Minimalist, and Reliable.
The Voice: Professional but visionary. Concise, data-driven, and focused on "Peak Performance."
The Vibe: "From Noise to Knowledge."
2. The Color Arsenal
The palette is built for maximum legibility in low-light environments, using "Light Triggers" to guide the user's eye.

A. Primary Solids
Role	Color Name	Hex Code	Usage
Canvas	Deep Space	#000000	Global page background.
Surface	Obsidian	#121212	Bento-box cards, sidebars, and containers.
Primary Action	Electric Blue	#0066FF	Buttons, active icons, and progress bars.
Text (Hero)	Titanium White	#FFFFFF	Headings and primary labels.
Text (Body)	Muted Slate	#888888	Paragraphs, grid lines, and timestamps.
B. Functional Accents
Role	Color Name	Hex Code	Context
Alert/Spike	Signal Orange	#FF4D00	Critical habits, streaks, or negative metrics.
Growth/Flow	Neon Emerald	#00FF88	Completed goals and successful tracking.
Insight	Dark Amethyst	#A855F7	Deep Work metrics and community features.
3. Typography & Hierarchy
Use geometric sans-serif fonts to maintain a "Tech-Forward" feel. Inter or Satoshi are recommended.

Display Headings: H1/H2 should be 600 Weight (Semi-Bold) with -0.02em letter spacing. Use Sentence case (e.g., "Real-time user intelligence").
Body Copy: 14px–16px, 400 Weight. Use generous line-height (1.6) to provide "breathing room" against the black canvas.
Data Points: Monospace fonts (like JetBrains Mono) can be used for small numeric values or timestamps to emphasize the "calculated" nature of the app.
4. Visual Language: "The Grid System"
The core of the design is the Bento Box layout integrated with a technical grid.

The Background Grid
Apply a 1px geometric grid to the #000000 background at rgba(255, 255, 255, 0.05) opacity. This serves as the design's "Skeleton."

Container Styling
Border: 1px solid rgba(255, 255, 255, 0.1).
Radius: 12px to 16px.
Glassmorphism: Use backdrop-filter: blur(12px) for overlays, modals, and tooltips to create depth without blocking the data-grid below.
5. Micro-Animations & Motion
Entrance: Fade-in from bottom with a slight blur (Use framer-motion).
Hover States: Cards should lift slightly and increase their border-opacity from 0.1 to 0.3.
Interaction: Primary buttons should have a subtle "outer glow" that expands slightly when clicked.
🏁 LLM Prompt Template
If you are feeding this to another AI to generate code/designs, use this condensed prompt:

Prompt: "Design a premium productivity dashboard named 'Produs'. Use a pitch-black (#000000) background with a subtle gray grid overlay. Use a Bento Box layout with cards in #121212 and thin 1px borders (#FFFFFF1A). The primary accent color is Electric Blue (#0066FF) for actions, with Signal Orange and Success Green for metrics. Typography: Inter, semi-bold for headers, muted gray for body text. Add high-end data visualizations using Recharts and Lucide icons. The aesthetic must feel like a sophisticated, high-performance data center."