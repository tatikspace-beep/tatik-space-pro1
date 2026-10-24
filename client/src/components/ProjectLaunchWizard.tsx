import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, Database, Download, ExternalLink, Globe2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { prepareDeploymentArchive, type DeploymentFile } from '@/lib/projectDeployment';
import { trpc } from '@/lib/trpc';

const deploymentProviders = ['vercel', 'netlify'] as const;
const databaseProviders = ['supabase', 'neon'] as const;
type ProviderId = typeof deploymentProviders[number] | typeof databaseProviders[number];

interface ProjectLaunchWizardProps {
  files: DeploymentFile[];
  projectId: number | null;
  projectName: string;
  language: string;
}

const copy = {
  it: {
    button: 'Ambiente dev',
    title: 'Ambiente sviluppatori',
    description: 'Scegli il provider, collega il tuo account e avvia l’operazione solo dopo averne verificato i dettagli. Le risorse vengono create nel tuo account.',
    package: 'Prepara pacchetto ZIP',
    domainTitle: 'Dominio (facoltativo)',
    domainInfo: 'Cerca e acquista il dominio nel tuo account; poi collega i DNS al provider di hosting. L’acquisto può avere un costo.',
    domain: 'Cerca un dominio',
    files: 'file inclusi',
    migrations: 'migrazioni SQL incluse sotto supabase/migrations',
    build: 'Questo progetto richiede una build: carica la cartella generata (spesso dist), non il sorgente ZIP come sito statico.',
    static: 'Per un sito statico, verifica che index.html sia nella radice del pacchetto.',
    excluded: 'File non inclusi per proteggere credenziali o perché non supportati:',
    error: 'Pacchetto non preparato',
    ready: 'Il pacchetto è pronto. Puoi scaricarlo e caricarlo sul provider scelto.',
    supabaseInfo: 'Tatik crea il progetto database nel tuo account, ma non applica le migrazioni né configura automaticamente DATABASE_URL nell’app. Verifica i passaggi del provider prima di collegarlo.',
    cost: 'Scegli il piano gratuito quando disponibile. Dominio personalizzato e piani a pagamento sono opzionali e possono avere un costo.',
    deployProvider: 'Scegli dove pubblicare',
    databaseProvider: 'Scegli il database',
    selectProvider: 'Seleziona un provider',
    apiCredential: 'Token API del tuo account',
    credentialHint: 'Usa un token con i soli permessi necessari. Viene verificato e salvato cifrato sul server Tatik; non viene mostrato di nuovo.',
    connect: 'Collega account',
    disconnect: 'Scollega',
    connected: 'Account collegato',
    notConnected: 'Account non collegato',
    executionNotice: 'Deploy statico disponibile con Vercel e Netlify; creazione database disponibile con Neon e Supabase. Nessun codice di build viene eseguito: carica i file statici già compilati. Le migrazioni e le variabili dell’app vanno configurate nel provider.',
    deployNow: 'Pubblica ora',
    createDatabase: 'Crea database',
    databaseAlreadyExists: 'Database già collegato a questo progetto Tatik.',
    databaseName: 'Nome progetto/database',
    databaseRegion: 'Regione',
    organizationId: 'Slug organizzazione Supabase',
    databasePassword: 'Password database (min. 12 caratteri)',
    databasePasswordNotice: 'Conservala in un password manager prima di creare il database. Tatik la elimina dopo la creazione; se la perdi dovrai reimpostarla nel provider.',
    consent: 'Confermo di voler creare/pubblicare questa risorsa nell’account provider selezionato. Potrebbero applicarsi limiti o costi del provider.',
    confirmDeployment: 'Il deploy pubblicherà immediatamente un sito statico sul provider. Proseguire?',
    confirmDatabase: 'Verrà creato un nuovo database nel tuo account. La disponibilità gratuita e i limiti dipendono dal provider. Proseguire?',
    createSuccess: 'Database creato. Copia subito la stringa di connessione: Tatik non la salva.',
    deploySuccess: 'Deploy inviato. Apri il link per verificare lo stato.',
    setupGuideTitle: 'Guida per collegare il database all’app',
    setupGuideIntro: 'Il database e il deploy sono account separati. Per sicurezza Tatik non trasferisce né conserva DATABASE_URL: segui questi passaggi nella scheda del provider e poi torna qui.',
    databaseConnection: 'Apri il progetto database e recupera la stringa di connessione PostgreSQL. Usa la stringa di connessione fornita dal provider; non costruirla a mano.',
    neonConnection: 'Su Neon apri Connect e copia la connection string del database. Per un’app serverless usa la stringa pooled quando disponibile. Trattala come una password.',
    supabaseConnection: 'Su Supabase apri Connect, scegli il metodo URI e copia la stringa adatta al server dell’app. Se usi un pooler, scegli la modalità raccomandata dal provider per il tuo runtime. Sostituisci [YOUR-PASSWORD] solo nel campo segreto del provider di deploy.',
    connectionDocs: 'Guida ufficiale alla connessione',
    deployEnv: 'Nel progetto di deploy apri le variabili d’ambiente e crea DATABASE_URL. Incolla la stringa come valore segreto, senza virgolette o spazi prima/dopo.',
    vercelEnv: 'Apri Vercel, seleziona il progetto corretto e vai in Settings > Environment Variables. Il deploy diretto creato da Tatik ha target Production: la variabile deve includere Production per quel deploy. Per provare prima su Preview, crea un deploy Preview separato e seleziona il relativo ambiente.',
    netlifyEnv: 'Apri Netlify, seleziona il sito corretto e vai in Project configuration > Environment variables. Il deploy diretto Tatik usa il contesto del sito; configura la variabile per quel contesto. Aggiungi Deploy Preview solo se il sito usa anche quel contesto.',
    deployEnvDocs: 'Guida ufficiale alle variabili d’ambiente',
    migrationStep: 'Se il progetto contiene migrazioni SQL, applica esclusivamente quelle dell’app, nell’ordine documentato dal progetto. Verifica database e piano di ripristino prima di eseguire SQL; non incollare qui le migrazioni interne di Tatik.',
    supabaseSql: 'Apri SQL Editor del progetto',
    neonSql: 'Apri Neon SQL Editor',
    migrationDocs: 'Guida migrazioni e backup',
    redeployStep: 'Dopo aver salvato DATABASE_URL, avvia un nuovo deploy: le variabili sono lette durante il deploy e non aggiornano un deploy già in esecuzione.',
    vercelRedeploy: 'Vercel: Deployments > ultimo deploy > Redeploy. Il deploy statico inviato da Tatik è Production; per un test non pubblico usa un deploy Preview separato e la variabile Preview.',
    netlifyRedeploy: 'Netlify: Deploys > Trigger deploy. Verifica il contesto associato al deploy Tatik e usa un Deploy Preview separato per testare senza sostituire il sito Production.',
    smokeTest: 'Verifica l’app: deve avviarsi senza errore di connessione e le funzioni che leggono/scrivono nel database devono funzionare. Controlla i log del deploy, senza copiarli qui se contengono dati sensibili.',
    beginnerDetails: 'Perché servono questi passaggi',
    beginnerExplanation: 'Tatik può creare il database nel tuo account, ma non è autorizzato automaticamente a modificare il progetto Vercel/Netlify. DATABASE_URL contiene password e viene trasferita direttamente dal provider database al campo segreto del provider di deploy. La checklist resta valida anche se chiudi o riapri questa finestra.',
    advancedDetails: 'Dettagli per sviluppatori',
    advancedExplanation: 'Configura DATABASE_URL solo lato server (mai con prefisso VITE_ o in codice client), scegli il pooler/runtime compatibile con il driver PostgreSQL e usa Preview prima di Production. Applica migrazioni versionate con lo strumento e la sequenza previsti dal progetto. Ruota la password se viene esposta.',
    selectDeploy: 'Seleziona prima Vercel o Netlify nella sezione deploy per vedere i passaggi specifici.',
    copyConnection: 'Copia stringa Neon',
    copied: 'Stringa copiata. Incollala soltanto nel campo DATABASE_URL privato del provider di deploy.',
    copyError: 'Copia non riuscita. Usa il pulsante Connect nella dashboard del database e copia la stringa direttamente da lì.',
    stepDone: 'Completato',
    openLink: 'Apri guida',
    projectUrl: 'Apri il progetto database',
    noMigrationNotice: 'Salta questo passaggio se l’app non usa migrazioni SQL.',
    troubleshootingTitle: 'Problemi frequenti e come risolverli',
    troubleshooting: [
      'password authentication failed: recupera una nuova connection string generata dal provider e verifica che DATABASE_URL contenga la password corretta. Non modificare o codificare a mano la stringa.',
      'relation/table does not exist: mancano migrazioni dell’app o sono state eseguite fuori ordine. Controlla le migrazioni documentate e applicale solo dopo aver verificato database e backup.',
      'ENOTFOUND o host non trovato: controlla che la stringa appartenga proprio a questo progetto, senza placeholder, virgolette o spazi.',
      'timeout o connessioni rifiutate: verifica endpoint/pooler raccomandato per il runtime serverless, regione e restrizioni di rete del provider.',
      'La modifica non si vede: controlla l’ambiente assegnato alla variabile (Production/Preview) e avvia un nuovo deploy nello stesso contesto.',
    ],
  },
  en: {
    button: 'Dev workspace',
    title: 'Developer workspace',
    description: 'Choose a provider, connect your account, and start the operation only after reviewing its details. Resources are created in your account.',
    package: 'Prepare ZIP package',
    domainTitle: 'Domain (optional)',
    domainInfo: 'Search and purchase a domain in your own account, then connect its DNS to your hosting provider. Registration may cost money.',
    domain: 'Search for a domain',
    files: 'files included',
    migrations: 'SQL migrations included under supabase/migrations',
    build: 'This project needs a build: upload the generated output folder (often dist), not the source ZIP as a static site.',
    static: 'For a static site, make sure index.html is at the package root.',
    excluded: 'Files excluded to protect credentials or because they are unsupported:',
    error: 'Package not prepared',
    ready: 'The package is ready. Download it and upload it to your chosen provider.',
    supabaseInfo: 'Tatik creates the database project in your account, but does not apply migrations or automatically configure DATABASE_URL in your app. Review the provider steps before connecting it.',
    cost: 'Choose a free plan when available. Custom domains and paid plans are optional and may incur charges.',
    deployProvider: 'Choose where to deploy',
    databaseProvider: 'Choose a database',
    selectProvider: 'Select a provider',
    apiCredential: 'API token from your account',
    credentialHint: 'Use a token with only the required permissions. It is verified and stored encrypted on the Tatik server; it is not shown again.',
    connect: 'Connect account',
    disconnect: 'Disconnect',
    connected: 'Account connected',
    notConnected: 'Account not connected',
    executionNotice: 'Static deployment is available with Vercel and Netlify; database creation is available with Neon and Supabase. Build scripts are not executed: upload already-built static files. Configure migrations and app environment variables with your provider.',
    deployNow: 'Deploy now',
    createDatabase: 'Create database',
    databaseAlreadyExists: 'A database is already linked to this Tatik project.',
    databaseName: 'Project/database name',
    databaseRegion: 'Region',
    organizationId: 'Supabase organization slug',
    databasePassword: 'Database password (min. 12 characters)',
    databasePasswordNotice: 'Save it in a password manager before creating the database. Tatik clears it after creation; if lost, reset it with the provider.',
    consent: 'I confirm that I want to create/deploy this resource in the selected provider account. Provider limits or charges may apply.',
    confirmDeployment: 'This will immediately publish a static site to your provider. Continue?',
    confirmDatabase: 'A new database will be created in your account. Free availability and limits depend on the provider. Continue?',
    createSuccess: 'Database created. Copy the connection string now; Tatik does not store it.',
    deploySuccess: 'Deployment submitted. Open the link to check its status.',
    setupGuideTitle: 'Guide: connect the database to your app',
    setupGuideIntro: 'The database and deployment are separate accounts. For security, Tatik does not transfer or store DATABASE_URL. Follow these steps in the provider tabs, then return here.',
    databaseConnection: 'Open the database project and retrieve its PostgreSQL connection string. Use the provider-generated string; do not construct one manually.',
    neonConnection: 'In Neon, open Connect and copy the database connection string. For a serverless app, use the pooled string when available. Treat it as a password.',
    supabaseConnection: 'In Supabase, open Connect, choose URI, and copy a string suitable for the app server. If using a pooler, choose the mode recommended by the provider for your runtime. Replace [YOUR-PASSWORD] only in the deployment provider’s secret field.',
    connectionDocs: 'Official connection guide',
    deployEnv: 'In your deployment project, open environment variables and create DATABASE_URL. Paste the connection string as a secret value, without surrounding quotes or extra spaces.',
    vercelEnv: 'Open Vercel, select the correct project, then go to Settings > Environment Variables. The direct deployment created by Tatik targets Production, so the variable must include Production for that deployment. To test on Preview first, create a separate Preview deployment and select its environment.',
    netlifyEnv: 'Open Netlify, select the correct site, then go to Project configuration > Environment variables. The direct Tatik deployment uses the site context; configure the variable for that context. Add Deploy Preview only if the site also uses that context.',
    deployEnvDocs: 'Official environment variables guide',
    migrationStep: 'If the app has SQL migrations, apply only that app’s migrations in its documented order. Verify the database and recovery plan before running SQL; do not paste Tatik’s own migrations here.',
    supabaseSql: 'Open the project SQL Editor',
    neonSql: 'Open Neon SQL Editor',
    migrationDocs: 'Migration and backup guide',
    redeployStep: 'After saving DATABASE_URL, start a new deployment: environment variables are read at deploy time and do not update an existing deployment.',
    vercelRedeploy: 'Vercel: Deployments > latest deployment > Redeploy. The static deployment submitted by Tatik is Production; use a separate Preview deployment and Preview variable to test without publishing.',
    netlifyRedeploy: 'Netlify: Deploys > Trigger deploy. Verify the context used by the Tatik deployment and use a separate Deploy Preview to test without replacing the Production site.',
    smokeTest: 'Verify the app starts without database connection errors and database-backed read/write features work. Check deployment logs; do not paste logs here if they contain sensitive data.',
    beginnerDetails: 'Why these steps are required',
    beginnerExplanation: 'Tatik can create a database in your account, but it is not automatically authorized to edit your Vercel/Netlify project. DATABASE_URL contains a password and should be transferred directly from the database provider to the deployment provider’s secret field. The checklist remains useful if you close or reopen this dialog.',
    advancedDetails: 'Developer details',
    advancedExplanation: 'Configure DATABASE_URL server-side only (never with a VITE_ prefix or in client code), choose a pooler/runtime compatible with the PostgreSQL driver, and test on Preview before Production. Apply versioned migrations with the project’s intended tool and order. Rotate the password if exposed.',
    selectDeploy: 'Select Vercel or Netlify in the deploy section first to see provider-specific steps.',
    copyConnection: 'Copy Neon connection string',
    copied: 'Connection string copied. Paste it only into the deployment provider’s private DATABASE_URL field.',
    copyError: 'Copy failed. Open Connect in the database dashboard and copy the string directly from there.',
    stepDone: 'Done',
    openLink: 'Open guide',
    projectUrl: 'Open database project',
    noMigrationNotice: 'Skip this step if the app does not use SQL migrations.',
    troubleshootingTitle: 'Common problems and how to fix them',
    troubleshooting: [
      'password authentication failed: retrieve a fresh provider-generated connection string and verify DATABASE_URL contains the right password. Do not edit or encode the string by hand.',
      'relation/table does not exist: the app migrations are missing or out of order. Check the documented migration sequence and verify the target database and backup before applying them.',
      'ENOTFOUND or host not found: check that the URL belongs to this exact project and contains no placeholder, quotes, or spaces.',
      'timeout or refused connections: check the endpoint/pooler recommended for the serverless runtime, region, and provider network restrictions.',
      'The change is not visible: check the variable’s environment (Production/Preview) and start a new deployment in that same context.',
    ],
  },
} as const;

function defaultDatabaseProjectName(projectName: string) {
  return projectName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'tatik-project';
}

export function ProjectLaunchWizard({ files, projectId, projectName, language }: ProjectLaunchWizardProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof prepareDeploymentArchive> | null>(null);
  const [selectedDeployProvider, setSelectedDeployProvider] = useState<typeof deploymentProviders[number] | ''>('');
  const [selectedDatabaseProvider, setSelectedDatabaseProvider] = useState<typeof databaseProviders[number] | ''>('');
  const text = language.toLowerCase().startsWith('it') ? copy.it : copy.en;

  const setDeployProvider = (provider: typeof deploymentProviders[number] | '') => {
    setSelectedDeployProvider(provider);
  };

  const setDatabaseProvider = (provider: typeof databaseProviders[number] | '') => {
    setSelectedDatabaseProvider(provider);
  };

  const handlePrepare = () => {
    const prepared = prepareDeploymentArchive(files, projectName);
    setResult(prepared);
    if (!prepared.blob) return;

    const url = URL.createObjectURL(prepared.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${projectName.trim().replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'tatik-project'}-deployment.zip`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="flex-shrink-0 gap-1 px-2"
        onClick={() => setOpen(true)}
      >
        <Rocket className="h-4 w-4" />
        {text.button}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{text.title}</DialogTitle>
            <DialogDescription>{text.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <Rocket className="h-4 w-4" />
                {text.deployProvider}
              </h3>
              <select
                className="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedDeployProvider}
                onChange={event => setDeployProvider(event.target.value as typeof selectedDeployProvider)}
                aria-label={text.deployProvider}
              >
                <option value="">{text.selectProvider}</option>
                <option value="vercel">Vercel</option>
                <option value="netlify">Netlify</option>
              </select>
              <p className="mb-3 text-sm text-muted-foreground">
                {result?.buildRequired ? text.build : text.static}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handlePrepare} disabled={!files.length}>
                  <Download className="mr-2 h-4 w-4" />
                  {text.package}
                </Button>
              </div>
            </section>

            <section className="rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <Database className="h-4 w-4" />
                {text.databaseProvider}
              </h3>
              <select
                className="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedDatabaseProvider}
                onChange={event => setDatabaseProvider(event.target.value as typeof selectedDatabaseProvider)}
                aria-label={text.databaseProvider}
              >
                <option value="">{text.selectProvider}</option>
                <option value="supabase">Supabase</option>
                <option value="neon">Neon</option>
              </select>
              <p className="mb-3 text-sm text-muted-foreground">{text.supabaseInfo}</p>
            </section>

            <section className="rounded-lg border p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <Globe2 className="h-4 w-4" />
                {text.domainTitle}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">{text.domainInfo}</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://www.namecheap.com/domains/registration/" target="_blank" rel="noopener noreferrer">
                  {text.domain}
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </section>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ProviderCredentialPanel
              provider={selectedDeployProvider}
              text={text}
              enabled={open}
              files={files}
              projectId={projectId}
              projectName={projectName}
            />
            <ProviderCredentialPanel
              provider={selectedDatabaseProvider}
              deploymentProvider={selectedDeployProvider}
              text={text}
              enabled={open}
              projectId={projectId}
              projectName={projectName}
            />
          </div>

          <p className="text-sm text-amber-700 dark:text-amber-300">{text.executionNotice}</p>
          <p className="text-xs text-muted-foreground">{text.cost}</p>
          {result && (
            <div aria-live="polite" className="space-y-2 rounded-md bg-muted p-3 text-sm">
              {result.error ? (
                <p className="flex items-start gap-2 text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {text.error}: {result.error}
                </p>
              ) : (
                <>
                  <p>{text.ready} ({result.fileCount} {text.files})</p>
                  {result.sqlMigrationCount > 0 && (
                    <p>{result.sqlMigrationCount} {text.migrations}</p>
                  )}
                  {result.buildRequired && <p>{text.build}</p>}
                </>
              )}
              {result.excludedPaths.length > 0 && (
                <div className="text-amber-700 dark:text-amber-300">
                  <p className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {text.excluded}
                  </p>
                  <ul className="mt-1 list-inside list-disc break-all">
                    {result.excludedPaths.map(path => <li key={path}>{path}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProviderCredentialPanel({
  provider,
  deploymentProvider,
  text,
  enabled,
  files,
  projectId,
  projectName,
}: {
  provider: ProviderId | '';
  deploymentProvider?: typeof deploymentProviders[number] | '';
  text: typeof copy.it | typeof copy.en;
  enabled: boolean;
  files?: DeploymentFile[];
  projectId: number | null;
  projectName: string;
}) {
  const [credential, setCredential] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [databaseProjectName, setDatabaseProjectName] = useState(() => defaultDatabaseProjectName(projectName));
  const [region, setRegion] = useState(provider === 'supabase' ? 'eu-central-1' : 'aws-eu-central-1');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [databasePassword, setDatabasePassword] = useState('');
  const [databaseResult, setDatabaseResult] = useState<{
    provider: string;
    projectId: string;
    projectName?: string;
    connectionUri?: string;
    dashboardUrl?: string | null;
    alreadyExists?: boolean;
  } | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<{ url?: string; state?: string } | null>(null);
  const [completedGuideSteps, setCompletedGuideSteps] = useState<number[]>([]);
  const [copyNotice, setCopyNotice] = useState<'copied' | 'error' | null>(null);
  const utils = trpc.useUtils();
  const connectionsQuery = trpc.providerConnections.list.useQuery(undefined, { enabled: enabled && Boolean(provider) });
  const connection = connectionsQuery.data?.find(item => item.provider === provider);
  const connectMutation = trpc.providerConnections.connect.useMutation({
    onSuccess: () => {
      setCredential('');
      void utils.providerConnections.list.invalidate();
    },
  });
  const disconnectMutation = trpc.providerConnections.disconnect.useMutation({
    onSuccess: () => {
      setDatabaseResult(null);
      void utils.providerConnections.list.invalidate();
    },
  });
  const createDatabaseMutation = trpc.providerConnections.createDatabase.useMutation({
    onSuccess: result => {
      setDatabasePassword('');
      setDatabaseResult(result);
      setConfirmed(false);
      setCompletedGuideSteps([]);
      setCopyNotice(null);
    },
  });
  const deployMutation = trpc.providerConnections.deployStatic.useMutation({
    onSuccess: result => {
      setDeploymentResult(result);
      setConfirmed(false);
    },
  });
  useEffect(() => {
    setCredential('');
    setDatabasePassword('');
    setConfirmed(false);
    setDatabaseResult(null);
    setDeploymentResult(null);
    setCompletedGuideSteps([]);
    setCopyNotice(null);
    setRegion(provider === 'supabase' ? 'eu-central-1' : 'aws-eu-central-1');
  }, [provider]);
  useEffect(() => {
    if (enabled) return;
    setCredential('');
    setDatabasePassword('');
    setConfirmed(false);
  }, [enabled]);
  useEffect(() => {
    setDatabaseProjectName(defaultDatabaseProjectName(projectName));
    setDatabaseResult(null);
    setDeploymentResult(null);
    setCompletedGuideSteps([]);
    setCopyNotice(null);
    setConfirmed(false);
  }, [projectId, projectName]);
  if (!provider) return null;
  const databaseProvider = provider === 'supabase' || provider === 'neon';
  const canCreateDatabase = provider === 'neon'
    || (provider === 'supabase' && organizationSlug.trim().length >= 3 && databasePassword.length >= 12);
  const busy = connectMutation.isPending || disconnectMutation.isPending
    || createDatabaseMutation.isPending || deployMutation.isPending;
  const setupSteps = provider === 'supabase' || provider === 'neon'
    ? [
      {
        title: text.databaseConnection,
        href: databaseResult?.dashboardUrl ?? undefined,
        hrefLabel: text.projectUrl,
        docsHref: provider === 'supabase'
          ? 'https://supabase.com/docs/guides/database/connecting-to-postgres'
          : 'https://neon.tech/docs/connect/connect-from-anywhere',
        details: provider === 'supabase' ? text.supabaseConnection : text.neonConnection,
      },
      {
        title: text.deployEnv,
        href: deploymentProvider === 'vercel'
          ? 'https://vercel.com/dashboard'
          : deploymentProvider === 'netlify'
            ? 'https://app.netlify.com/'
            : undefined,
        hrefLabel: deploymentProvider ? `${deploymentProvider} dashboard` : undefined,
        docsHref: deploymentProvider === 'vercel'
          ? 'https://vercel.com/docs/environment-variables'
          : deploymentProvider === 'netlify'
            ? 'https://docs.netlify.com/build/environment-variables/get-started/'
            : undefined,
        details: deploymentProvider === 'vercel'
          ? text.vercelEnv
          : deploymentProvider === 'netlify'
            ? text.netlifyEnv
            : text.selectDeploy,
      },
      {
        title: text.migrationStep,
        href: provider === 'supabase'
          ? `https://supabase.com/dashboard/project/${encodeURIComponent(databaseResult?.projectId ?? '')}/sql`
          : databaseResult?.dashboardUrl ?? undefined,
        hrefLabel: provider === 'supabase' ? text.supabaseSql : text.neonSql,
        docsHref: provider === 'supabase'
          ? 'https://supabase.com/docs/guides/deployment/database-migrations'
          : 'https://neon.tech/docs/guides/migrations',
        details: text.noMigrationNotice,
      },
      {
        title: text.redeployStep,
        href: deploymentProvider === 'vercel'
          ? 'https://vercel.com/dashboard'
          : deploymentProvider === 'netlify'
            ? 'https://app.netlify.com/'
            : undefined,
        hrefLabel: deploymentProvider ? `${deploymentProvider} dashboard` : undefined,
        details: deploymentProvider === 'vercel'
          ? text.vercelRedeploy
          : deploymentProvider === 'netlify'
            ? text.netlifyRedeploy
            : text.selectDeploy,
      },
      { title: text.smokeTest },
    ]
    : [];
  const toggleGuideStep = (index: number, done: boolean) => {
    setCompletedGuideSteps(current => done
      ? [...new Set([...current, index])]
      : current.filter(step => step !== index));
  };
  const copyConnectionUri = async () => {
    if (!databaseResult?.connectionUri) return;
    try {
      await navigator.clipboard.writeText(databaseResult.connectionUri);
      setCopyNotice('copied');
    } catch {
      setCopyNotice('error');
    }
  };
  const encodeContent = (content: string) => {
    const dataUrl = content.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/i);
    if (dataUrl?.[2]) return dataUrl[3];
    const decoded = dataUrl ? decodeURIComponent(dataUrl[3]) : content;
    const bytes = new TextEncoder().encode(decoded);
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  };
  const createDatabase = () => {
    if (!projectId || !confirmed || !canCreateDatabase || !window.confirm(text.confirmDatabase)) return;
    if (provider !== 'supabase' && provider !== 'neon') return;
    createDatabaseMutation.mutate({
      provider,
      projectId,
      projectName: databaseProjectName,
      region,
      ...(provider === 'supabase' ? { organizationSlug, databasePassword } : {}),
      confirmed: true,
    });
  };
  const deploy = () => {
    if (provider !== 'vercel' && provider !== 'netlify') return;
    if (!projectId || !confirmed || !files?.length || !window.confirm(text.confirmDeployment)) return;
    const deployFiles = files
      .filter((file): file is DeploymentFile & { content: string } => typeof file.content === 'string')
      .map(file => ({ path: file.path || file.name || '', content: encodeContent(file.content) }));
    deployMutation.mutate({
      provider,
      projectId,
      projectName,
      files: deployFiles,
      confirmed: true,
    });
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">
        {connection ? text.connected : text.notConnected} — {provider}
      </p>
      {connection ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => disconnectMutation.mutate({ provider })}
        >
          {text.disconnect}
        </Button>
      ) : (
        <>
          <label className="block space-y-2 text-sm">
            <span>{text.apiCredential}</span>
            <Input
              type="password"
              autoComplete="new-password"
              value={credential}
              maxLength={8192}
              onChange={event => setCredential(event.target.value)}
            />
          </label>
          <p className="text-xs text-muted-foreground">{text.credentialHint}</p>
          <Button
            size="sm"
            disabled={credential.trim().length < 16 || busy}
            onClick={() => connectMutation.mutate({ provider, credential })}
          >
            {text.connect}
          </Button>
        </>
      )}
      {connection && databaseProvider && (
        <div className="space-y-3 border-t pt-3">
          <label className="block space-y-1 text-sm">
            <span>{text.databaseName}</span>
            <Input value={databaseProjectName} maxLength={60} onChange={event => setDatabaseProjectName(event.target.value)} />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{text.databaseRegion}</span>
            <select
              className="w-full rounded-md border bg-background px-3 py-2"
              value={region}
              onChange={event => setRegion(event.target.value)}
            >
              {provider === 'neon' ? (
                <>
                  <option value="aws-eu-central-1">AWS Frankfurt</option>
                  <option value="aws-us-east-2">AWS Ohio</option>
                  <option value="aws-us-west-2">AWS Oregon</option>
                </>
              ) : (
                <>
                  <option value="eu-central-1">Frankfurt</option>
                  <option value="eu-west-1">Ireland</option>
                  <option value="us-east-1">N. Virginia</option>
                </>
              )}
            </select>
          </label>
          {provider === 'supabase' && (
            <>
              <label className="block space-y-1 text-sm">
                <span>{text.organizationId}</span>
                <Input value={organizationSlug} maxLength={128} onChange={event => setOrganizationSlug(event.target.value)} />
              </label>
              <label className="block space-y-1 text-sm">
                <span>{text.databasePassword}</span>
                <Input type="password" autoComplete="new-password" value={databasePassword} maxLength={128} onChange={event => setDatabasePassword(event.target.value)} />
                <span className="block text-xs text-muted-foreground">{text.databasePasswordNotice}</span>
              </label>
            </>
          )}
          <label className="flex items-start gap-2 text-xs">
            <Checkbox checked={confirmed} onCheckedChange={value => setConfirmed(value === true)} />
            <span>{text.consent}</span>
          </label>
          <Button size="sm" disabled={!projectId || !confirmed || !canCreateDatabase || busy} onClick={createDatabase}>
            {text.createDatabase}
          </Button>
          {databaseResult && (
            <div className="space-y-3 rounded bg-muted p-3 text-xs">
              <p className="font-medium">{databaseResult.alreadyExists ? text.databaseAlreadyExists : text.createSuccess}</p>
              {databaseResult.connectionUri && (
                <>
                  <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all select-all">{databaseResult.connectionUri}</pre>
                  <Button size="sm" variant="outline" onClick={copyConnectionUri}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    {text.copyConnection}
                  </Button>
                  {copyNotice && (
                    <p role={copyNotice === 'error' ? 'alert' : 'status'} className={copyNotice === 'error' ? 'text-destructive' : 'text-green-700 dark:text-green-300'}>
                      {copyNotice === 'copied' ? text.copied : text.copyError}
                    </p>
                  )}
                </>
              )}
              <section className="space-y-3 border-t pt-3">
                <div>
                  <h4 className="font-semibold">{text.setupGuideTitle}</h4>
                  <p className="mt-1 text-muted-foreground">{text.setupGuideIntro}</p>
                </div>
                <ol className="space-y-3">
                  {setupSteps.map((step, index) => {
                    const done = completedGuideSteps.includes(index);
                    return (
                      <li key={step.title} className="rounded border bg-background p-3">
                        <label className="flex items-start gap-2 font-medium">
                          <Checkbox checked={done} onCheckedChange={value => toggleGuideStep(index, value === true)} />
                          <span className="flex items-center gap-1">
                            {done && <Check aria-hidden="true" className="h-3.5 w-3.5 text-green-600" />}
                            {index + 1}. {step.title}
                          </span>
                        </label>
                        {step.details && <p className="mt-2 text-muted-foreground">{step.details}</p>}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {step.href && step.hrefLabel && (
                            <a className="inline-flex items-center underline" href={step.href} target="_blank" rel="noopener noreferrer">
                              {step.hrefLabel}<ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                          {step.docsHref && (
                            <a className="inline-flex items-center underline" href={step.docsHref} target="_blank" rel="noopener noreferrer">
                              {index === 1 ? text.deployEnvDocs : index === 2 ? text.migrationDocs : text.connectionDocs}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <details className="rounded border p-3">
                  <summary className="cursor-pointer font-medium">{text.beginnerDetails}</summary>
                  <p className="mt-2 text-muted-foreground">{text.beginnerExplanation}</p>
                </details>
                <details className="rounded border p-3">
                  <summary className="cursor-pointer font-medium">{text.advancedDetails}</summary>
                  <p className="mt-2 text-muted-foreground">{text.advancedExplanation}</p>
                </details>
                <details className="rounded border p-3">
                  <summary className="cursor-pointer font-medium">{text.troubleshootingTitle}</summary>
                  <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                    {text.troubleshooting.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </details>
              </section>
            </div>
          )}
          {createDatabaseMutation.error && <p role="alert" className="text-sm text-destructive">{createDatabaseMutation.error.message}</p>}
        </div>
      )}
      {connection && !databaseProvider && (
        <div className="space-y-3 border-t pt-3">
          <label className="flex items-start gap-2 text-xs">
            <Checkbox checked={confirmed} onCheckedChange={value => setConfirmed(value === true)} />
            <span>{text.consent}</span>
          </label>
          <Button size="sm" disabled={!projectId || !confirmed || !files?.length || busy} onClick={deploy}>
            {text.deployNow}
          </Button>
          {deploymentResult && (
            <div className="space-y-1 text-xs">
              <p>{deploymentResult.state || text.deploySuccess}</p>
              {deploymentResult.url && (
                <a className="break-all underline" href={deploymentResult.url} target="_blank" rel="noopener noreferrer">
                  {deploymentResult.url}
                </a>
              )}
            </div>
          )}
          {deployMutation.error && <p role="alert" className="text-sm text-destructive">{deployMutation.error.message}</p>}
        </div>
      )}
      {connectMutation.error && (
        <p role="alert" className="text-sm text-destructive">{connectMutation.error.message}</p>
      )}
      {disconnectMutation.error && (
        <p role="alert" className="text-sm text-destructive">{disconnectMutation.error.message}</p>
      )}
      {connectionsQuery.error && (
        <p role="alert" className="text-sm text-destructive">{connectionsQuery.error.message}</p>
      )}
    </section>
  );
}
