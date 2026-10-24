# 🎓 JAIN HELPDESK — Campus Support & Facility Operations Portal

A complete, production-grade web application built with **React + Vite + Tailwind CSS + Supabase (PostgreSQL)** featuring the **"Liquid Glass"** visual aesthetic and an interactive **Murmuration Wordmark** formed by thousands of starlings converging into **"JAIN HELPDESK"**.

The application features a resilient **Single Data-Access Layer (`src/lib/db.js`)**: if Supabase credentials are not provided or offline, it **automatically falls back to localStorage** with 10 realistic campus seed requests so the interface never breaks.

---

## 🚀 Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Run unit test suite (21 passing tests)
npm test

# 3. Start local development server
npm run dev

# 4. Open in browser at:
# http://localhost:5173/
```

---

## 📁 shadcn Project Structure & `/components/ui` Path

### Default Path Conventions
In modern React + Tailwind codebases (and standard shadcn setups), the default paths are:
- Components folder: `@/components` or `src/components`
- Primitive UI components folder: `@/components/ui` or `src/components/ui`
- Styling tokens: `src/index.css`
- Path alias: `@/*` mapped to `./src/*` in `tsconfig.json` and `vite.config.js`.

### Why the `/components/ui` folder is crucial:
1. **Separation of Concerns**: Differentiates atomic design primitives (e.g. `murmuration-wordmark`, buttons, inputs, dialogs) from composite domain features (e.g. `RequestForm`, `TrackRequest`, `KanbanBoard`).
2. **shadcn CLI Compatibility**: The shadcn generator (`npx shadcn@latest add ...`) specifically targets `components/ui` by convention.
3. **Reusability & Portability**: UI components in `components/ui` are self-contained and can be copy-pasted across projects without tight coupling to application-specific state.

### How to Initialize shadcn in this project (if starting from scratch):
```bash
# 1. Initialize shadcn config
npx shadcn@latest init

# 2. Add Tailwind & TypeScript support (already configured)
npm install -D typescript @types/node @types/react @types/react-dom

# 3. Add components to @/components/ui
npx shadcn@latest add button card dialog
```

---

## 🦅 Murmuration Wordmark: "JAIN HELPDESK"

Located at [`src/components/ui/murmuration-wordmark.tsx`](src/components/ui/murmuration-wordmark.tsx) and [`src/components/ui/demo.tsx`](src/components/ui/demo.tsx):
- Simulates thousands of starlings across an organic dusk sky using curl-noise vector fields.
- Starlings converge, bird by bird, into the wordmark **"JAIN HELPDESK"**, hold, and scatter.
- The mouse pointer acts as a **hawk**, parting the flock realistically in real time.
- Integrated seamlessly atop the helpdesk interface with minimize/expand controls.

---

## 🎨 Visual Style: "Liquid Glass"

- **Dynamic Background**: Full-page gradient from lime green (`#a8d65c`) to olive green (`#6f9a2a`), with **6 morphing liquid blobs** with gradient fills (lime, teal `#2ec4b6`, royal blue `#3a4de0`) and mixed blurs, plus glossy light dots and streak lines.
- **Glass Window**: Main content resides in a floating frosted glass window (`backdrop-filter: blur(24px) saturate(140%)`, 1px subtle white border, and soft drop shadows).
- **Glass Cards**: Interactive cards that lift slightly on hover with enhanced glow.
- **Pill Buttons**: Frosted pill buttons with primary white action button.
- **Typography**: Large elegant serif title accents (**Playfair Display**) and clean readable sans (**Inter**).
- **Accessibility**: High-contrast status badges (never color alone), `A- / A / A+` text size scale toggle, and Dark Mode toggle.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Open your project at [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** ➔ **New Query**.
3. Copy and run the SQL migration script from [`supabase_schema.sql`](supabase_schema.sql) (or click the **"SQL Schema"** button in the app navbar).
4. Connect your Supabase instance either by:
   - Creating a `.env` file from `.env.example`:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     VITE_STAFF_PIN=1234
     ```
   - Or directly typing your credentials into the in-app **Supabase Setup Modal** by clicking the **"Local Demo DB"** pill in the navbar!

---

## 🌐 Deploy to Vercel

```bash
# 1. Install Vercel CLI (optional)
npm install -g vercel

# 2. Login and deploy
vercel

# 3. In the Vercel Project Dashboard:
# Add Environment Variables:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_STAFF_PIN (default: 1234)

# 4. Deploy production build:
vercel --prod
```
