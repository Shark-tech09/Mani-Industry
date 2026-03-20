# Mani Industries Website

## Files
- `index.html` — Main HTML structure
- `style.css` — All styles + 9 color themes
- `script.js` — Loading animations + all interactions
- `logo.png` — Place your logo image here (already uploaded)

## Setup
1. Place your `logo.png` in the same folder as index.html
2. Open `index.html` in a browser — the full animation plays automatically

## Loading Animation Phases
- **Phase 1**: Network nodes + glowing ring with % counter
- **Phase 2**: Logo appears with glow effect
- **Phase 3**: Generative blueprint structure drawn with glowing lines (random each visit: building, bridge, Eiffel tower, wind turbine, city skyline, pyramid, antenna)
- **Final**: Fade into website

## Firebase Setup (for Auth)
1. Go to https://console.firebase.google.com
2. Create a project → Enable Authentication (Email/Password)
3. Add your Firebase config in `script.js` where marked `// TODO: Integrate Firebase Auth`
4. Uncomment the Firebase SDK script tags in `index.html`

## Themes
9 built-in themes switchable from the navbar: Blue, Red, Orange, Yellow, Green, Purple, Pink, Brown, Dark Minimal

## Hosting
Upload all files to GitHub Pages or Netlify (no build step needed).
