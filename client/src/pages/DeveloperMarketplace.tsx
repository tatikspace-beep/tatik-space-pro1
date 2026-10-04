import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

function scanMessages(scanReport: string | null) {
  if (!scanReport) return [];
  try {
    const parsed: unknown = JSON.parse(scanReport);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((finding): string[] =>
      finding && typeof finding === "object" && "message" in finding && typeof finding.message === "string"
        ? [finding.message]
        : [],
    );
  } catch {
    return [];
  }
}

export default function DeveloperMarketplace() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [profile, setProfile] = useState({ displayName: "", bio: "", websiteUrl: "" });
  const [listing, setListing] = useState({ title: "", description: "", category: "web", price: "9.99", slug: "" });
  const [file, setFile] = useState<File | null>(null);
  const [sourceContent, setSourceContent] = useState("");
  const [sourceFileName, setSourceFileName] = useState("index.html");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<number | null>(null);
  const [selectedReviewListingId, setSelectedReviewListingId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const profileQuery = trpc.marketplace.getSellerProfile.useQuery(undefined, { enabled: !!user });
  const listingsQuery = trpc.marketplace.listSellerListings.useQuery(undefined, { enabled: !!user });
  const queueQuery = trpc.marketplace.reviewQueue.useQuery(undefined, { enabled: user?.role === "admin" });
  const reviewContentQuery = trpc.marketplace.getReviewContent.useQuery(
    { listingId: selectedReviewListingId || 1 },
    { enabled: user?.role === "admin" && selectedReviewListingId !== null },
  );
  const moderationQuery = trpc.marketplace.moderationListings.useQuery(undefined, { enabled: user?.role === "admin" });
  const [moderationReasons, setModerationReasons] = useState<Record<number, string>>({});
  const payoutCandidatesQuery = trpc.marketplace.listPayoutCandidates.useQuery(undefined, { enabled: user?.role === "admin" });
  const termsQuery = trpc.marketplace.sellerTerms.useQuery();
  const seller = profileQuery.data;
  useEffect(() => {
    if (seller && !profileInitialized) {
      setProfile({
        displayName: seller.displayName,
        bio: seller.bio || "",
        websiteUrl: seller.websiteUrl || "",
      });
      setProfileInitialized(true);
    }
    if (seller?.termsVersion && seller.termsVersion === termsQuery.data?.version) {
      setTermsAccepted(true);
    }
  }, [seller, profileInitialized, termsQuery.data?.version]);
  const acceptTerms = trpc.marketplace.acceptSellerTerms.useMutation({
    onSuccess: () => {
      toast.success("Profilo venditore salvato");
      profileQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const onboarding = trpc.marketplace.createSellerOnboardingLink.useMutation({
    onSuccess: (value) => window.location.assign(value.url),
    onError: (error) => toast.error(error.message),
  });
  const refreshPayout = trpc.marketplace.refreshSellerPayoutStatus.useMutation({
    onSuccess: (value) => {
      toast.success(value.ready ? "Payout Stripe Connect attivo" : "Onboarding ancora da completare");
      profileQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const createListing = trpc.marketplace.createListing.useMutation({
    onSuccess: (value) => {
      setCreatedListingId(value.id);
      utils.marketplace.listSellerListings.invalidate();
      toast.success("Listing creato in bozza");
    },
    onError: (error) => toast.error(error.message),
  });
  const uploadFile = trpc.marketplace.uploadListingFile.useMutation({
    onSuccess: () => {
      toast.success("Codice salvato nello storage privato");
      utils.marketplace.listSellerListings.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const submitReview = trpc.marketplace.submitForReview.useMutation({
    onSuccess: async (value) => {
      await Promise.all([
        utils.marketplace.listSellerListings.invalidate(),
        utils.marketplace.listPublished.invalidate(),
        utils.marketplace.reviewQueue.invalidate(),
        utils.marketplace.moderationListings.invalidate(),
      ]);
      if (value.status === "published") {
        toast.success("Controlli automatici superati: template pubblicato.");
      } else if (value.status === "rejected") {
        toast.error("Il controllo ha bloccato il template. Correggi gli elementi segnalati prima di riprovare.");
      } else {
        toast.warning("Template trattenuto per un controllo aggiuntivo; non è ancora in vendita.");
      }
    },
    onError: (error) => toast.error(error.message),
  });
  const review = trpc.marketplace.reviewListing.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.marketplace.reviewQueue.invalidate(),
        utils.marketplace.listPublished.invalidate(),
        utils.marketplace.listSellerListings.invalidate(),
        utils.marketplace.moderationListings.invalidate(),
      ]);
      setSelectedReviewListingId(null);
      toast.success("Revisione aggiornata");
    },
    onError: (error) => toast.error(error.message),
  });
  const moderateListing = trpc.marketplace.moderateListing.useMutation({
    onSuccess: async (value) => {
      await Promise.all([
        utils.marketplace.moderationListings.invalidate(),
        utils.marketplace.listPublished.invalidate(),
        utils.marketplace.listMyOrders.invalidate(),
      ]);
      toast.success(value.status === "suspended" ? "Template rimosso dal marketplace." : "Template ripubblicato.");
    },
    onError: (error) => toast.error(error.message),
  });
  const rescanLegacyListing = trpc.marketplace.rescanLegacyListing.useMutation({
    onSuccess: async (value) => {
      await Promise.all([
        utils.marketplace.moderationListings.invalidate(),
        utils.marketplace.reviewQueue.invalidate(),
        utils.marketplace.listPublished.invalidate(),
      ]);
      toast.success(value.status === "published"
        ? "Controllo superato: listing pubblicato."
        : `Scansione completata: stato ${value.status}.`);
    },
    onError: (error) => toast.error(error.message),
  });
  const executePayout = trpc.marketplace.executeSellerPayout.useMutation({
    onSuccess: () => {
      toast.success("Transfer creato; in attesa della conferma Stripe");
      payoutCandidatesQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  useEffect(() => {
    const draft = sessionStorage.getItem("tatik_marketplace_seller_draft");
    if (!draft) return;
    try {
      const imported = JSON.parse(draft) as { title?: string; fileName?: string; content?: string; files?: unknown[] };
      const content = Array.isArray(imported.files)
        ? JSON.stringify({ format: "tatik-project-v1", files: imported.files }, null, 2)
        : imported.content;
      if (imported.title) setListing((current) => ({ ...current, title: imported.title!, slug: slugify(imported.title!) }));
      if (Array.isArray(imported.files)) setSourceFileName("project.json");
      else if (imported.fileName) setSourceFileName(imported.fileName);
      if (content) setSourceContent(content);
      toast.success("Contenuto importato dall'editor: completa i dettagli e crea la bozza.");
    } catch (error) {
      console.error("Impossibile importare il progetto dall'editor", error);
      toast.error("Il progetto preparato dall'editor non è leggibile.");
    } finally {
      sessionStorage.removeItem("tatik_marketplace_seller_draft");
    }
  }, []);
  if (loading || !user) return <div className="min-h-screen p-8">Caricamento...</div>;
  if (loading || !user) return <div className="min-h-screen p-8">Caricamento...</div>;
  const saveProfile = () => {
    if (!termsAccepted) {
      toast.error("Devi confermare di aver letto e accettato i termini venditore.");
      return;
    }
    acceptTerms.mutate({
      ...profile,
      websiteUrl: profile.websiteUrl.trim() || undefined,
      accepted: true,
    });
  };
  const create = () => createListing.mutate({
    title: listing.title,
    description: listing.description,
    category: listing.category,
    slug: listing.slug,
    priceCents: Math.round(Number(listing.price) * 100),
  });
  const upload = async () => {
    if (!createdListingId) return;
    if (!file && !sourceContent.trim()) {
      toast.error("Incolla il codice o seleziona un file di codice.");
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Il file supera il limite di 2 MB");
      return;
    }
    try {
      const content = file ? await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(reader.error ?? new Error("Lettura del file non riuscita."));
        reader.readAsText(file);
      }) : sourceContent;
      const fileName = file?.name || sourceFileName;
      const contentType = file?.type || (fileName.endsWith(".html") ? "text/html" : fileName.endsWith(".json") ? "application/json" : "text/plain");
      uploadFile.mutate({ listingId: createdListingId, fileName, contentType, content });
    } catch (error) {
      console.error("Impossibile leggere il codice selezionato", error);
      toast.error(error instanceof Error ? error.message : "Impossibile leggere il file selezionato.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Marketplace sviluppatori</h1>
        <Link href="/marketplace"><Button variant="outline">Marketplace template</Button></Link>
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Diventa venditore</CardTitle>
            <CardDescription>Commissione Tatik: {termsQuery.data?.commissionPercent ?? 15}%. I payout richiedono verifica KYC.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nome pubblico" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
            <Textarea placeholder="Descrizione del profilo" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <Input placeholder="Sito web (facoltativo)" value={profile.websiteUrl} onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })} />
            <div className="rounded border p-3 space-y-2">
              <p className="text-xs text-muted-foreground">{termsQuery.data?.terms.join(" ")}</p>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                <span>Ho letto e accetto i termini venditore {termsQuery.data?.version ? `(versione ${termsQuery.data.version})` : ""}. Confermo di essere responsabile del prodotto, dei diritti e degli obblighi verso gli acquirenti.</span>
              </label>
            </div>
            <Button onClick={saveProfile} disabled={acceptTerms.isPending || !termsAccepted}>Accetta termini e salva profilo</Button>
            {seller?.termsAcceptedAt && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onboarding.mutate()} disabled={onboarding.isPending}>
                  {onboarding.isPending ? "Apertura onboarding..." : "Configura pagamenti e KYC"}
                </Button>
                <Button variant="outline" onClick={() => refreshPayout.mutate()} disabled={refreshPayout.isPending}>
                  Verifica stato payout
                </Button>
              </div>
            )}
            {seller && <Badge variant="secondary">Stato: {seller.status}</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Nuovo listing</CardTitle><CardDescription>Incolla il codice oppure trasferisci il file aperto nell'editor. Ogni invio viene controllato automaticamente: i file senza segnali sospetti sono pubblicati subito, quelli dubbi sono trattenuti e quelli pericolosi bloccati. I controlli non certificano la conformità legale.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Titolo" value={listing.title} onChange={(e) => setListing({ ...listing, title: e.target.value, slug: slugify(e.target.value) })} />
            <Textarea placeholder="Descrizione (minimo 20 caratteri)" onChange={(e) => setListing({ ...listing, description: e.target.value })} />
            <div className="grid md:grid-cols-3 gap-3">
              <Input placeholder="Categoria" value={listing.category} onChange={(e) => setListing({ ...listing, category: e.target.value })} />
              <Input placeholder="Slug URL" value={listing.slug} onChange={(e) => setListing({ ...listing, slug: slugify(e.target.value) })} />
              <Input type="number" min="1" step="0.01" value={listing.price} onChange={(e) => setListing({ ...listing, price: e.target.value })} />
            </div>
            <p className="text-sm text-muted-foreground">Netto stimato: €{(Number(listing.price) * 0.85 || 0).toFixed(2)} dopo commissione 15%.</p>
            <Button onClick={create} disabled={createListing.isPending || !seller?.termsAcceptedAt}>Crea bozza</Button>
            {createdListingId && (
              <div className="border rounded p-3 space-y-3">
                <Input
                  placeholder="Nome file (es. index.html)"
                  value={sourceFileName}
                  onChange={(event) => setSourceFileName(event.target.value)}
                />
                <Textarea
                  rows={12}
                  placeholder="Incolla qui il codice del template. Limite 2 MB."
                  value={sourceContent}
                  onChange={(event) => {
                    setFile(null);
                    setSourceContent(event.target.value);
                  }}
                  className="font-mono text-xs"
                />
                <div className="text-center text-xs text-muted-foreground">oppure scegli un file di codice testuale (max 2 MB)</div>
                <Input type="file" accept=".html,.htm,.css,.js,.mjs,.cjs,.jsx,.ts,.tsx,.json,.md,.txt,.xml,.svg,.py,.sql" onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setSourceContent("");
                }} />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={upload} disabled={uploadFile.isPending || (!file && !sourceContent.trim())}>Salva codice privato</Button>
                  <Button onClick={() => submitReview.mutate({ listingId: createdListingId })} disabled={submitReview.isPending || uploadFile.isPending}>Controlla e pubblica</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>I miei listing</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(listingsQuery.data || []).map((item) => (
              <div key={item.id} className="border-b py-3 space-y-1">
                <div className="flex justify-between gap-3"><span>{item.title}</span><Badge>{item.status}</Badge></div>
                <p className="text-xs text-muted-foreground">Controllo automatico: {item.scanStatus}</p>
                {item.rejectionReason && <p className="text-sm text-destructive">{item.rejectionReason}</p>}
              </div>
            ))}
            {!listingsQuery.data?.length && <p className="text-sm text-muted-foreground">Nessun listing creato.</p>}
          </CardContent>
        </Card>

        {user.role === "admin" && <Card>
          <CardHeader><CardTitle>Moderazione listing pubblicati</CardTitle><CardDescription>Sospendi subito la vendita e l'accesso al codice se ricevi una segnalazione o trovi contenuti non conformi. Puoi ripristinare un listing dopo averlo verificato.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {(moderationQuery.data || []).map(({ listing: item, sellerName }) => (
              <div key={item.id} className="rounded border p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-auto font-medium">{item.title} · {sellerName}</span>
                  <Badge variant={item.status === "suspended" ? "destructive" : "secondary"}>{item.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Esito scansione: {item.scanStatus}</p>
                {item.moderationReason && <p className="text-sm text-destructive">{item.moderationReason}</p>}
                {(item.scanStatus === "legacy_unscanned" || item.scanStatus === "not_scanned") && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={rescanLegacyListing.isPending}
                    onClick={() => rescanLegacyListing.mutate({ listingId: item.id })}
                  >Scansiona template legacy</Button>
                )}
                {item.status === "published" ? (
                  <div className="flex flex-wrap gap-2">
                    <Input
                      className="min-w-56 flex-1"
                      value={moderationReasons[item.id] || ""}
                      onChange={(event) => setModerationReasons((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder="Motivo della sospensione"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={!moderationReasons[item.id]?.trim() || moderateListing.isPending}
                      onClick={() => moderateListing.mutate({
                        listingId: item.id,
                        action: "suspend",
                        reason: moderationReasons[item.id].trim(),
                      })}
                    >Sospendi vendita e accesso</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" disabled={moderateListing.isPending} onClick={() => moderateListing.mutate({ listingId: item.id, action: "restore" })}>
                    Ripristina listing
                  </Button>
                )}
              </div>
            ))}
            {!moderationQuery.data?.length && <p className="text-sm text-muted-foreground">Nessun listing pubblicato o sospeso.</p>}
          </CardContent>
        </Card>}

        {user.role === "admin" && <Card>
          <CardHeader><CardTitle>Controlli automatici in revisione</CardTitle><CardDescription>Vengono elencati solo i casi sospetti che il sistema non ha potuto approvare automaticamente.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {selectedReviewListingId !== null && (
              <div className="rounded border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{reviewContentQuery.data?.title || "Caricamento codice..."}</p>
                  <Button size="sm" variant="outline" onClick={() => setSelectedReviewListingId(null)}>Chiudi codice</Button>
                </div>
                {reviewContentQuery.isError && <p className="text-sm text-destructive">{reviewContentQuery.error.message}</p>}
                {reviewContentQuery.data && (
                  <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">{reviewContentQuery.data.content}</pre>
                )}
              </div>
            )}
            {(queueQuery.data || []).map((item) => <div key={item.id} className="flex flex-wrap gap-2 items-center border-b py-2">
              <div className="mr-auto min-w-56">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.rejectionReason || "Controllo automatico da verificare"}</p>
                {scanMessages(item.scanReport).map((message, index) => <p key={`${item.id}-${index}`} className="text-xs text-amber-700">{message}</p>)}
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedReviewListingId(item.id)}>Esamina codice</Button>
              <Button size="sm" onClick={() => review.mutate({ listingId: item.id, approved: true })}>Approva dopo verifica</Button>
              <Button size="sm" variant="destructive" onClick={() => review.mutate({ listingId: item.id, approved: false, reason: "Non conforme dopo controllo amministrativo" })}>Rifiuta</Button>
            </div>)}
          </CardContent>
        </Card>}

        {user.role === "admin" && <Card>
          <CardHeader><CardTitle>Payout disponibili</CardTitle><CardDescription>Il transfer viene creato solo dopo 14 giorni e KYC attivo.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {(payoutCandidatesQuery.data || []).map((row) => (
              <div key={row.entry.id} className="flex flex-wrap gap-2 items-center border-b py-2">
                <span className="mr-auto">{row.seller.displayName} · €{(row.entry.amountCents / 100).toFixed(2)}</span>
                <Button size="sm" onClick={() => executePayout.mutate({ balanceEntryId: row.entry.id })} disabled={executePayout.isPending}>Esegui transfer</Button>
              </div>
            ))}
            {!payoutCandidatesQuery.data?.length && <p className="text-sm text-muted-foreground">Nessun payout disponibile.</p>}
          </CardContent>
        </Card>}

      </main>
    </div>
  );
}
