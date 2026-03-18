# EventChain Design Language: Ethereal & Glassmorphic

## Core Concept

The visual language for EventChain is designed to feel like an exclusive concierge service—elevating the Web3 ticketing experience from utilitarian to luxurious. It leans into a moody, high-end "Ethereal & Glassmorphic" aesthetic that focuses on atmosphere, depth, and refined typography.

## Theme & Tone

- **Tone**: Luxurious, refined, exclusive, atmospheric, and slightly mysterious.
- **Aesthetic**: Ethereal gradients, dark mode default, soft lighting, frosted glass (glassmorphism), high contrast typography.
- **Differentiation**: Moves away from the typical loud "crypto/tech" aesthetic. Instead of bright neon and harsh borders, it uses subtle glows, deep space colors, and delicate typography. It feels like an invitation to a private gala rather than a software dashboard.

## Color Palette

The palette is built around a very deep, almost black blue, with subtle ambient light.

- **Background**: `#070914` (Deep void blue/black)
- **Primary Text**: `#EBE7D8` (Soft, warm off-white/champagne)
- **Accent/Highlight**: `#F2E0AE` (Pale gold/champagne for primary actions and elegant touches)
- **Ambient Glows**:
  - Indigo: `#1A2552`
  - Deep Violet: `#3D294D`
  - Muted Bronze: `#755D30`
- **Glass/Surfaces**: `rgba(255, 255, 255, 0.03)` with `rgba(255, 255, 255, 0.1)` borders for glassmorphism.

## Typography

Typography is the cornerstone of this design, pairing a high-contrast serif with a clean, geometric sans-serif to bridge classical elegance with modern interfaces.

- **Display Font**: `Cormorant Garamond` (Used for massive headers, elegant italics, and key branding moments. Gives an editorial, luxury fashion feel).
- **Body Font**: `Outfit` (Used for UI elements, buttons, and paragraphs. Clean, readable, and modern).

## Motion & Interactions

- **Ambient**: Slow, large-scale pulse animations (10-15s duration) on background color orbs to create a living, breathing background.
- **Hover States**: Subtle translation (`translate-x-1`, `translate-y-1`), opacity increases on glass borders, and blooming glow effects (box-shadow).
- **Transitions**: Long, smooth transition durations (`duration-500` or `duration-1000`) to emphasize the luxurious pace.

## Composition & Spatial Rules

- **Negative Space**: Generous paddings and margins. Let the text breathe.
- **Glassmorphic Panels**: Used sparingly for critical interaction zones (like the Auth panel or specific cards) to draw focus without breaking the atmospheric background. Panels must include `backdrop-blur-xl` or `backdrop-blur-2xl`.
- **Text Styling**: Heavy use of tracking (letter-spacing) on uppercase UI text (`tracking-widest`, `uppercase`, `text-xs` or `text-sm`) to create a refined, structural look that contrasts with the flowing serif headers.
