---
name: Landing dark vs app light theme split
description: Why the marketing landing is bold/dark while the authenticated app stays light "Neutro Notion"
---

# Two-surface visual strategy

The public landing (`artifacts/cohort/src/pages/landing.tsx`) is a **bold, cinematic
DARK** surface (Veltrix-inspired: near-black `#0a0a0b`, animated aurora glows, massive
Inter 800/900 headline + Instrument Serif italic accent word, warm coral accent
`#e8744a`). The **authenticated app stays light** ("Neutro Notion": warm paper,
monochrome + sage). They are intentionally different worlds.

**Why:** The user found the all-restrained "Neutro Notion" identity "pouco marcante /
muito comedido" and pointed at Veltrix (veltrix.framer.ai) for impact. Earlier they had
rejected a *dark-amber* proposal — but Veltrix itself is dark+warm, so the rejection was
about that specific execution, not dark-on-the-landing forever. Resolution: impact where
it sells (landing), calm where they work (product).

**How to apply:**
- Keep the landing's dark colors **self-contained** in the component — do NOT toggle the
  global `.dark` class or change the app's light default; that would darken the whole app.
- The accent color used is coral `#e8744a` (declared as `ACCENT` const in landing.tsx),
  not the rejected amber and not the app's sage.
- Fonts: Instrument Serif (italic display accent) + Inter 800/900 are loaded via the
  Google Fonts link in `index.html`; `.font-display-serif` and the `aurora-*` keyframes
  live in `index.css`.
