This Brand Guideline is designed for Produs, codenaming the visual direction as "The Intelligence Aesthetic." This document distills the premium, high-contrast scrollytelling experience from the landing page into a repeatable design system.

🛸 Produs: Brand Identity & Design System
Version: 1.1 (Landing Page Sync)
Concept: The Intelligence Dark & High-Contrast Light

1. Brand Mission & Persona
Produs is the "Single Source of Truth" for personal and professional productivity. The brand should feel like a high-performance cockpit—engineered, precise, and sophisticated.

Personality: Analytical, Elite, Minimalist, and Reliable.
The Voice: Professional but visionary. Concise, data-driven, and focused on "Peak Performance."
The Vibe: "From Noise to Knowledge."

2. The Color Arsenal
The palette is built for maximum legibility, using "Light Triggers" to guide the user's eye across both dark and light environments.

A. Deep Space (Dark Mode)
Role | Color Name | Hex Code | Usage
--- | --- | --- | ---
Canvas | Deep Space | #000000 | Global page background.
Surface (Alt) | Neural Black | #050505 | Feature detail cards and HUD fragments.
Surface (Card) | Obsidian | #121212 | Bento-box cards and sidebars.
Border | Obsidian Stroke | rgba(255,255,255,0.1) | Subtle container definition.

B. High-Contrast Light Mode
Role | Color Name | Hex Code | Usage
--- | --- | --- | ---
Canvas | Pure Bone | #f8f8f8 | Global light page background.
Text | High-Contrast Black | #000000 | Headings and primary labels.
Border | Light Stroke | rgba(0,0,0,0.1) | Subtle definition on light surfaces.

C. Functional Accents
Role | Color Name | Hex Code | Context
--- | --- | --- | ---
Primary Action | Electric Blue | #0066FF | Buttons, active icons, and focus highlights.
Alert/Spike | Signal Orange | #FF4D00 | Critical metrics and urgent tasks.
Growth/Flow | Neon Emerald | #00FF88 | Completed goals and metrics.
Insight | Dark Amethyst | #A855F7 | Deep Work and high-level analytics.

3. Typography & Hierarchy
Use geometric sans-serif fonts to maintain a "Tech-Forward" feel. Inter is the primary choice.

Branding/Hero: Font-thin (100-200), uppercase, with extreme letter-spacing (0.5em to 1.5em) for a cinematic feel.
Display Headings: Semi-Bold (600) with -0.02em letter spacing. Use Sentence case for clarity.
Navigation/Metadata: 10px–12px, Uppercase, Tracking (0.3em to 0.8em).
Body Copy: 14px–16px, 400 Weight. Line-height 1.6 for readability.

4. Visual Language: "The HUD System"
The design evolves from simple boxes to "HUD Fragments" and AR-inspired layouts.

The Grid & Glow
- Apply a 1px geometric grid to the background at rgba(255, 255, 255, 0.05).
- Subtle "Glow Cursors" (bg-electric-blue/10 with 150px-600px blur) should track user movement.

Container Styling
- Border: 1px solid rgba(255, 255, 255, 0.1).
- Radius: 12px to 24px (rounded-3xl).
- Shadow: High-depth shadows shadow-[0_20px_50px_rgba(0,0,0,0.5)] for floating cards.
- AR Decoration: Add 1px L-shaped corner borders to containers for a "Scanned" data look.

5. Micro-Animations & Motion
Motion is a core part of the brand experience, not an afterthought.

- Scrollytelling: Use GSAP and ScrollTrigger for multi-layered parallax and narrative text reveals.
- Smooth Scroll: Lenis is used globally to ensure a premium, weighted scroll feel.
- Entrance: Fade-in from bottom with a slight blur (framer-motion).
- Hover States: Cards should lift slightly and increase border-opacity or outer glow.

🏁 LLM Prompt Template
"Design a premium productivity dashboard named 'Produs'. Support both a pitch-black (#000000) and high-contrast light (#f8f8f8) aesthetic. Use a Bento Box layout with interactive HUD fragments, 1px geometric grid overlays, and subtle Electric Blue (#0066FF) glows. Typography: Inter, featuring thin uppercase headers with wide tracking for a cinematic effect. Use high-depth 3D parallax effects and AR-style corner decorations (#FFFFFF1A). The aesthetic must feel like a sophisticated, high-performance command center."