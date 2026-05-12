# FitAI — AI-Powered Fitness Coach

AI-generated workout and meal plans from a body photo and your goals.
Week-by-week progression, progress photo comparisons, weight check-ins, and plan recalibration.

---

## Quick deploy (10 minutes)

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org)
- [Git](https://git-scm.com)
- A free [Vercel account](https://vercel.com)
- An [Anthropic API key](https://console.anthropic.com)

### 2. Install dependencies
```bash
npm install
```

### 3. Run locally
```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

npm run dev
# Open http://localhost:5173
```

### 4. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts — link to your Vercel account)
vercel

# Add your API key as an environment variable
vercel env add ANTHROPIC_API_KEY
# Paste your key when prompted, select all environments

# Deploy to production
vercel --prod
```

You'll get a live URL like `https://fitai-yourname.vercel.app` that anyone can open.

---

## Make it installable on phones (PWA)

The app already includes a full PWA setup. Once deployed:

**iPhone / iPad**
1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add" — the FitAI icon appears on the home screen

**Android**
1. Open the app URL in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install"

It will launch full-screen, no browser chrome, just like a native app.

---

## App Store / Google Play (optional)

To publish on the official app stores, wrap the web app with [Capacitor](https://capacitorjs.com):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init FitAI com.yourname.fitai
npm run build
npx cap add ios      # requires Xcode on Mac
npx cap add android  # requires Android Studio
npx cap sync
npx cap open ios     # opens Xcode — archive and submit to App Store
npx cap open android # opens Android Studio — build APK/AAB and submit to Play
```

**Accounts needed:**
- Apple Developer Program — $99/year → https://developer.apple.com
- Google Play Developer — $25 one-time → https://play.google.com/console

---

## Project structure

```
fitai/
├── api/
│   └── chat.js          ← Vercel serverless function (API key proxy)
├── public/
│   └── icons/           ← PWA icons (SVG + PNG)
├── src/
│   ├── App.jsx          ← Main app component
│   ├── main.jsx         ← React entry point
│   └── index.css        ← Global styles + animations
├── index.html           ← HTML shell with PWA meta tags
├── vite.config.js       ← Vite + PWA plugin config
├── vercel.json          ← Vercel routing
└── .env.example         ← Environment variable template
```

## Security note

The API key lives only in Vercel's environment variables and is never sent to the browser.
All AI calls go through `/api/chat` on the server side.
Never commit `.env.local` — it's in `.gitignore`.
