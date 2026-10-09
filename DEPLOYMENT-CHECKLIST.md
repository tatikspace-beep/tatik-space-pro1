# Tatik.space - checklist Supabase, Vercel e servizi esterni

Questa checklist descrive il passaggio dall'ambiente di sviluppo alla produzione per le funzioni attualmente presenti nel progetto.

## 1. Prima di iniziare

- [ ] Usare un progetto Supabase dedicato alla produzione.
- [ ] Creare un progetto Vercel collegato al repository corretto.
- [ ] Non incollare mai nel repository, nelle issue o nella chat `DATABASE_URL`, chiavi Stripe, PayPal, Resend, SMTP, AI o AWS.
- [ ] Ruotare le chiavi eventualmente esposte in precedenza.
- [ ] Preparare un dominio pubblico stabile, per esempio `https://tatik.space`.
- [ ] Configurare prima l'ambiente Preview, testare, poi replicare le variabili in Production.

## 2. Supabase PostgreSQL

### Connessione

1. In Supabase aprire **Project Settings > Database > Connection string**.
2. Usare una connessione PostgreSQL compatibile con il runtime serverless.
3. Inserire la stringa completa in Vercel come `DATABASE_URL`.
4. Non usare una stringa locale o un database diverso per il deploy pubblico.

### Migrazioni

Prima di eseguire SQL, verificare le tabelle già presenti nel database. Per un progetto Supabase vuoto usare la baseline PostgreSQL `0000_initial_postgres.sql`, poi le migrazioni successive nell'ordine:

```text
0000_initial_postgres.sql
0003_create_banner_additions.sql
0004_pricing_model_v2.sql
0005_add_theme_preference.sql
0006_template_purchases.sql
0007_add_coupon_system.sql
0008_payment_foundation.sql
0009_paypal_subscriptions.sql
0010_developer_marketplace.sql
0011_marketplace_transfers.sql
0012_banner_monetization.sql
0013_school_program.sql
0014_marketplace_reviews_terms.sql
0015_sync_users_auth_columns.sql
0016_marketplace_automatic_screening.sql
0017_paypal_bonus_plan_revision.sql
```

I vecchi file `drizzle/0000_*.sql`, `drizzle/0001_*.sql` e `drizzle/0002_*.sql` sono migrazioni MySQL storiche e non vanno eseguiti su Supabase.

In Supabase **SQL Editor**:

1. Aprire ogni file nella sequenza indicata.
2. Eseguire il file.
3. Se una tabella o un indice esiste già, non ricrearlo manualmente: verificare lo stato prima di procedere.
4. Controllare in **Table Editor** almeno:
   - `users`;
   - `contactMessages`;
   - tabelle pagamenti e acquisti;
   - `marketplace_sellers`;
   - `marketplace_listings`;
   - `marketplace_listing_files`;
   - `marketplace_orders`;
   - `marketplace_transfers`;
   - `banner_campaigns`;
   - `banner_events`;
   - `banner_revenue`;
   - `school_programs`;
   - `school_invites`;
   - `school_members`;
   - `school_audit_events`.
5. Verificare che le colonne e gli indici siano presenti prima dei test applicativi.

Non usare `pnpm run db:push` contro la produzione finché `DATABASE_URL` non è stato controllato: il comando usa la connessione indicata dall'ambiente corrente e può modificare il database sbagliato.

### Controllo automatico e moderazione marketplace

- [ ] Applicare `0016_marketplace_automatic_screening.sql` prima di distribuire la nuova API.
- [ ] I nuovi file sono scansionati dal server prima della pubblicazione: segnali ad alto rischio bloccano l'invio, indicatori ambigui mettono il listing in revisione eccezionale, e gli altri passano alla pubblicazione automatica.
- [ ] I listing pubblicati prima di questa modifica sono marcati `legacy_unscanned`: non sono stati analizzati retroattivamente. L'amministratore deve verificarli e può sospendere quelli non conformi.
- [ ] Da `/marketplace/developer`, gli amministratori possono sospendere un listing già online; la sospensione lo rimuove dal catalogo e blocca l'accesso ai file. Un pagamento Stripe che si completa dopo la sospensione viene rimborsato dal webhook.
- [ ] Il controllo statico rileva alcuni pattern tecnici, ma non può attestare copyright, privacy, licenze o conformità legale, né garantire l'assenza di codice malevolo sconosciuto. Mantenere termini venditore, canale di segnalazione e procedura di risposta alle contestazioni.

### Backup

- [ ] Attivare il backup del progetto Supabase.
- [ ] Eseguire un backup prima delle migrazioni principali.
- [ ] Conservare il riferimento al backup e la data di applicazione delle migrazioni.
- [ ] Non rendere pubblici i bucket o le tabelle contenenti file marketplace.

## 3. Variabili Vercel

In **Vercel > Project > Settings > Environment Variables** configurare le variabili per **Preview** e **Production**. Le variabili server non devono avere prefisso `VITE_`.

### Obbligatorie

```text
NODE_ENV=production
DATABASE_URL=...
APP_URL=https://tatik.space
JWT_SECRET=...
SESSION_SECRET=...
ADMIN_EMAILS=tatik.space@gmail.com
COLLABORATOR_EMAILS=...
RESEND_API_KEY=...
EMAIL_FROM=Tatik.space <contatti@tatik.space>
CONTACT_EMAIL_RECIPIENTS=tatik.space@gmail.com
```

`JWT_SECRET` e `SESSION_SECRET` devono essere stringhe casuali lunghe e diverse tra loro.

### Accesso e OAuth

```text
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ENABLE_LEGACY_PASSWORD_AUTH=false
```

Registrare nel provider OAuth gli URL reali del dominio di produzione e di Preview, se usati. Non lasciare callback localhost nell'ambiente pubblico.

### Stripe Test/Production

Per il primo collaudo usare esclusivamente chiavi Test:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_FIRST_MONTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

Configurare in Stripe il webhook verso l'endpoint previsto dal progetto e sottoscrivere gli eventi di pagamento, rimborso, Connect account e transfer usati dal backend. Passare alle chiavi live solo dopo i test end-to-end e sostituire anche il webhook secret.

### PayPal

```text
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENV=sandbox
PAYPAL_PRO_PLAN_ID=P-...
```

Usare `sandbox` in Preview. Per Production creare credenziali e piano live separati, poi impostare `PAYPAL_ENV=production`.
Il bonus PayPal crea un piano con un solo ciclo scontato e il ciclo regolare successivo; PayPal richiede che l'utente approvi la revisione dell'abbonamento. Prima del rilascio, verificare in Sandbox:

- [ ] Al raggiungimento automatico del 100%, viene creato un bonus esatto di 2 €; massimo due bonus in una finestra mobile di 30 giorni.
- [ ] L'utente vede su PayPal il rinnovo ridotto; due bonus prima del rinnovo riducono il totale di 4 €.
- [ ] Dopo il ciclo scontato, il piano torna a 7,99 € e non mantiene lo sconto.
- [ ] Refresh, callback ripetute e richieste duplicate non creano bonus o revisioni duplicate.
- [ ] Applicare `0017_paypal_bonus_plan_revision.sql` al database prima di distribuire il server aggiornato.

Non passare a Production finché tutti i controlli Sandbox non sono superati.

### Email e contatti

```text
RESEND_API_KEY=re_...
EMAIL_FROM=Tatik.space <contatti@tatik.space>
CONTACT_EMAIL_RECIPIENTS=tatik.space@gmail.com
```

Prima del test verificare in Resend il dominio o l'indirizzo mittente. Se queste variabili mancano, il messaggio contatti viene comunque salvato nel database ma l'email non viene consegnata.

Le variabili SMTP sono necessarie solo se viene implementato e attivato un percorso SMTP; il modulo contatti attuale usa Resend.

### AI

```text
HF_API_KEY=...
GEMINI_API_KEY=...
```

Sono chiavi server-only. Non usare mai `VITE_HF_API_KEY` o `VITE_GEMINI_API_KEY`.

### Storage marketplace e file

Gli upload del marketplace usano il bucket S3 privato configurato lato server:

```text
AWS_REGION=eu-north-1
AWS_S3_BUCKET=tatik-space-pro-uploads
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Il bucket deve avere **Block all public access** attivo. L'app non imposta ACL pubbliche; i link di download sono firmati e scadono dopo 15 minuti. Le credenziali devono essere server-only e limitate al bucket necessario.
`FORGE_API_URL` e `FORGE_API_KEY` restano separati e sono usati dai servizi AI, non dallo storage dei file. Non usare variabili `VITE_` per credenziali server.


### Google e consenso

```text
VITE_GOOGLE_ANALYTICS_ID=G-...
VITE_GOOGLE_ADS_ID=AW-...
VITE_GOOGLE_ADSENSE_CLIENT=ca-pub-...
```

Questi identificativi sono pubblici, ma gli script vengono caricati dal client solo secondo il consenso previsto. Configurare proprietà Google, domini autorizzati e conversioni separatamente.

## 4. Deploy Vercel

1. Importare il repository in Vercel.
2. Impostare il framework secondo il repository.
3. Verificare:
   - Build command: `pnpm run build:vercel`;
   - Output directory: `dist`;
   - Install command: `pnpm install`;
   - Node.js compatibile con `package.json`.
4. Salvare le variabili d'ambiente.
5. Eseguire un deploy Preview.
6. Controllare i log di build e Runtime Logs.
7. Un deploy Preview riuscito non autorizza da solo la pubblicazione Production. Prima di portare modifiche su `main`, ottenere la conferma esplicita dell'utente e chiarire che il deploy Vercel collegato a `main` aggiorna il sito pubblico.
8. Il deploy Production avviene tramite l'integrazione Git di Vercel dopo il push sul branch `main`; verificare che il repository collegato e il branch Production siano quelli previsti, che il progetto sia `tatik-space-pro1` nel team scope `tatikspace-beeps-projects` e che il dominio Production sia `https://tatik.space` (con `https://www.tatik.space` come alias, se configurato). Gli URL Vercel Preview sono secondari e non sostituiscono il dominio principale.
9. Configurare il dominio `tatik.space` e verificare HTTPS.

Non eseguire migrazioni sul database Production come effetto implicito di un deploy. Verificare prima schema, migrazioni richieste e backup, e ottenere l'autorizzazione esplicita per la modifica del database.

Il file `vercel.json` gestisce già il rewrite di `/api/trpc` e il fallback SPA. Non aggiungere un secondo rewrite tRPC senza verificarne l'effetto.

## 5. Test dopo il deploy

### Autenticazione

- [ ] Registrazione tramite email.
- [ ] Link di accesso valido entro 10 minuti.
- [ ] Token scaduto rifiutato.
- [ ] Logout.
- [ ] OAuth Google/GitHub, se attivato.
- [ ] `tatik.space@gmail.com` riconosciuto come admin.
- [ ] Una email in `COLLABORATOR_EMAILS` riconosciuta come collaboratore.
- [ ] Staff con accesso Pro senza abbonamento.

### Contatti

- [ ] Inviare un messaggio valido.
- [ ] Verificare la riga in `contactMessages`.
- [ ] Verificare email Resend e `reply-to`.
- [ ] Provare configurazione Resend errata e verificare che il messaggio resti salvato senza falso successo email.

### Pagamenti

- [ ] Prova Stripe Test.
- [ ] Webhook ricevuto e registrato.
- [ ] Rinnovo e cancellazione.
- [ ] Rimborso.
- [ ] Prova PayPal Sandbox, se configurato.

### Marketplace

- [ ] Profilo venditore e accettazione termini.
- [ ] Upload di file valido entro 10 MB.
- [ ] Rifiuto di file oltre 10 MB o listing non autorizzato.
- [ ] Invio alla revisione.
- [ ] Approvazione da admin/collaboratore.
- [ ] Acquisto Test.
- [ ] Commissione del 15%.
- [ ] Saldo e periodo anti-frode.
- [ ] Onboarding Stripe Connect e KYC.
- [ ] Transfer Test e webhook `transfer.paid`/`transfer.failed`.
- [ ] Rimborso o contestazione.

### Banner e analytics

- [ ] Creazione campagna da staff.
- [ ] Campagna attiva e scaduta.
- [ ] Impression e click con consenso marketing.
- [ ] Nessun tracking marketing con consenso negato.
- [ ] Import ricavi e report.
- [ ] Google Analytics/Ads/AdSense in ambiente autorizzato.

### Scuole

- [ ] Registrazione istituto in stato pending.
- [ ] Approvazione admin/collaboratore.
- [ ] Durata di un mese.
- [ ] Creazione e approvazione invito dalla scuola.
- [ ] Token valido, associato all'email, monouso e con scadenza.
- [ ] Limite massimo di 30 studenti.
- [ ] Revoca membro.
- [ ] Audit degli eventi.

## 6. Prima dell'uso pubblico

- [ ] Applicare e verificare tutte le migrazioni.
- [ ] Configurare email automatica per gli inviti scuola: la UI attuale mostra ancora il token per il test.
- [ ] Verificare legalmente Privacy Policy, Cookie Policy e Termini.
- [ ] Approvare AdSense prima di aspettarsi ricavi pubblicitari.
- [ ] Configurare Stripe Connect e KYC per payout reali.
- [ ] Verificare retention, backup e accessi Supabase.
- [ ] Rimuovere ogni account o chiave di test non necessario.
- [ ] Eseguire un test completo da un browser anonimo e da un account staff.
- [ ] Conservare un registro della versione deployata e delle migrazioni applicate.
