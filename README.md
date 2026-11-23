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

### Registrazione e accesso via e-mail

Il percorso pubblico usa link temporanei validi 10 minuti. Configura `RESEND_API_KEY` e `EMAIL_FROM` nell'ambiente server/Vercel per inviare le e-mail. `ENABLE_LEGACY_PASSWORD_AUTH` deve rimanere `false` (o assente) per mantenere nascosto il vecchio percorso password.

### Agente AI e collaborazione sui progetti

L'Agente AI affianca l'assistente esistente: pianifica la richiesta, la delega a specialisti e sintetizza una proposta. Non applica modifiche senza una conferma dell'utente. Durante l'accesso anticipato è disponibile agli amministratori, agli account sviluppatore autorizzati e ai membri espliciti del progetto; gli altri utenti vedono l'avviso di disponibilità Pro futura.

Il proprietario del progetto o un amministratore può aggiungere e rimuovere collaboratori dall'editor. I collaboratori accedono soltanto ai progetti a cui sono stati aggiunti. Prima del rilascio, applicare `drizzle/migrations/0019_project_members.sql` al database Production corretto; la migrazione crea la tabella e gli indici senza modificare i dati esistenti.

### Quote e report di Analytics

Gli account non staff hanno 3 analisi gratuite per mese UTC; le analisi tabellari gratuite accettano fino a 1.000 righe. Un abbonamento Pro attivo sblocca analisi più grandi e senza quota mensile. Amministratori e collaboratori hanno accesso illimitato e scaricano gratuitamente i report PDF; per gli altri utenti ogni report PDF è un acquisto singolo Stripe, €1,99 per impostazione predefinita. Il prezzo può essere impostato con `ANALYTICS_REPORT_PRICE_CENTS` (centesimi di euro, minimo 50). Per Checkout in Preview è obbligatoria una chiave Stripe `sk_test_`; le chiavi live vengono rifiutate.

La quota usa la tabella `analytics_monthly_usage`. La migrazione `drizzle/migrations/0020_analytics_monthly_usage.sql` crea soltanto la tabella e il relativo indice, senza modificare dati esistenti. In Preview applicarla solo dopo aver verificato che il database sia separato da Production. In Production applicarla solo dopo l'autorizzazione esplicita del rilascio e aver verificato che `0019_project_members` sia già presente; non usare `pnpm db:push` per questa migrazione.

La Function Python di Analytics include dipendenze geospaziali e supera il limite standard di 500 MB. Nel progetto Vercel Production `tatik-space-pro1` deve quindi essere impostata la variabile `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` per abilitare le Large Functions; non richiede un servizio aggiuntivo o un upgrade del piano. Restano valide le quote mensili Hobby, il cui superamento può sospendere i deployment.

### OAuth

Configura OAuth per GitHub e Google nelle variabili d'ambiente.

### Pagamenti

Integra Stripe per i pagamenti aggiungendo le chiavi API.

### Pubblicità AdSense

Lo script AdSense, il meta tag dell'account e `client/public/ads.txt` sono
necessari alla verifica e vanno mantenuti. I quattro spazi pubblicitari sono
nell'header dell'Editor, nella sidebar dell'Editor, nella sidebar del
Marketplace e sopra il footer. Per renderizzare un'unità servono il consenso
marketing e il relativo ID slot `VITE_GOOGLE_AD_SLOT_*`.

Configura gli ID solo dopo l'approvazione AdSense e la creazione delle unità
display. I ricavi possono dipendere dalle impressioni e dalle aste, ma non sono
garantiti per ogni visualizzazione; l'approvazione AdSense è separata dal
rilascio del codice.

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