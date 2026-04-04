# Tatik Space Pro

Un editor di codice online avanzato con funzionalità di collaborazione in tempo reale.

## 🚀 Deployment

### Vercel (Raccomandato)

1. **Prepara il repository:**
   ```bash
   # Assicurati che il codice sia committato
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy su Vercel:**
   - Vai su [vercel.com](https://vercel.com) e connetti il tuo repository GitHub
   - Seleziona il progetto e configura:
     - **Framework Preset:** Other
     - **Root Directory:** `./` (root)
     - **Build Command:** `pnpm run build:vercel`
     - **Output Directory:** `dist`
     - **Install Command:** `pnpm install`

3. **Variabili d'ambiente su Vercel:**
   Aggiungi queste variabili nelle impostazioni del progetto Vercel:
   ```
   NODE_ENV=production
   VITE_API_URL=https://your-app-name.vercel.app
   VITE_BASE_URL=https://your-app-name.vercel.app
   DATABASE_URL=your_postgresql_connection_string
   GITHUB_CLIENT_ID=your_github_oauth_id
   GITHUB_CLIENT_SECRET=your_github_oauth_secret
   GOOGLE_CLIENT_ID=your_google_oauth_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your_s3_bucket
   JWT_SECRET=your_random_jwt_secret
   SESSION_SECRET=your_random_session_secret
   ```

4. **Database:**
   - Usa un database PostgreSQL (Neon.tech, Supabase, o Railway)
   - Esegui le migrazioni: `pnpm run db:push`

### Render (Alternativa)

1. **Prepara il progetto:**
   ```bash
   # Installa dipendenze
   pnpm install

   # Costruisci il progetto
   pnpm run build
   ```

2. **Deploy su Render:**
   - Crea un nuovo **Web Service**
   - Connetti il tuo repository GitHub
   - Configura:
     - **Runtime:** Node
     - **Build Command:** `pnpm install --frozen-lockfile && pnpm run build`
     - **Start Command:** `pnpm run start:render`
   - Aggiungi le variabili d'ambiente come sopra

### Troubleshooting

**Problema:** "Funzionalità funzionano solo in localhost"
- **Soluzione:** Assicurati che `VITE_API_URL` punti al tuo dominio di produzione

**Problema:** "WebSocket non funzionano"
- **Soluzione:** Vercel non supporta WebSocket nativi. Considera di usare Server-Sent Events o polling per la collaborazione

**Problema:** "Build fallisce"
- **Soluzione:** Verifica che tutte le dipendenze siano installate e che il `NODE_OPTIONS` sia impostato correttamente

### Sviluppo Locale

```bash
# Installa dipendenze
pnpm install

# Avvia il server di sviluppo
pnpm run dev

# Oppure avvia solo il client
pnpm run dev:vite

# E il server separatamente
pnpm run dev:server
```

## 🔧 Configurazione

### Database

Il progetto usa PostgreSQL. Assicurati di avere una connessione valida nel `DATABASE_URL`.

### OAuth

Configura OAuth per GitHub e Google nelle variabili d'ambiente.

### Pagamenti

Integra Stripe per i pagamenti aggiungendo le chiavi API.

### File Storage

Usa AWS S3 per lo storage dei file.

## 📝 Funzionalità

- Editor di codice con syntax highlighting
- Anteprima live HTML/CSS/JS
- Collaborazione in tempo reale
- Gestione progetti
- Marketplace template
- Sistema di autenticazione
- Pagamenti integrati

## 🛠️ Tecnologie

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, tRPC
- **Database:** PostgreSQL con Drizzle ORM
- **Styling:** Tailwind CSS
- **Deployment:** Vercel/Render