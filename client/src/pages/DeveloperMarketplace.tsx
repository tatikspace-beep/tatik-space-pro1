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
import { useLanguage } from "@/contexts/LanguageContext";
import { developerMarketplaceCopy } from "@/lib/developerMarketplaceCopy";
import { developerListingLanguageGuidance } from "@/lib/developerListingLanguageGuidance";
import { officialSellerTermsLabels, sellerTermsTranslations } from "@/lib/sellerTermsLocalization";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

const MAX_LISTING_DESCRIPTION_LENGTH = 10_000;

function getLocalizedListingStatus(status: string, copy: typeof developerMarketplaceCopy.en) {
  const statusLabels: Record<string, string> = {
    pending: copy.statusPending,
    active: copy.statusActive,
    draft: copy.statusDraft,
    published: copy.statusPublished,
    in_review: copy.statusReview,
    rejected: copy.statusRejected,
    suspended: copy.statusSuspended,
    passed: copy.scanPassed,
    review: copy.scanReviewStatus,
    blocked: copy.scanBlockedStatus,
    legacy_unscanned: copy.scanLegacyStatus,
    not_scanned: copy.scanNotRun,
  };
  return statusLabels[status] ?? status;
}

function normalizeWebsiteUrl(value: string): string | undefined | null {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) return null;

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
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
  const { language } = useLanguage();
  const copy = developerMarketplaceCopy[language] ?? developerMarketplaceCopy.en;
  const languageGuidance = developerListingLanguageGuidance[language] ?? developerListingLanguageGuidance.en;
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
  const sellerTerms = termsQuery.data?.terms ?? [];
  const localizedSellerTerms = sellerTermsTranslations[language];
  const officialSellerTermsLabel = officialSellerTermsLabels[language] ?? officialSellerTermsLabels.en;
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
      toast.success(copy.profileSaved);
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
      toast.success(value.ready ? copy.payoutActive : copy.onboardingIncomplete);
      profileQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const createListing = trpc.marketplace.createListing.useMutation({
    onSuccess: (value) => {
      setCreatedListingId(value.id);
      utils.marketplace.listSellerListings.invalidate();
      toast.success(copy.draftCreated);
    },
    onError: (error) => toast.error(error.message),
  });
  const uploadFile = trpc.marketplace.uploadListingFile.useMutation({
    onSuccess: () => {
      toast.success(copy.privateSaved);
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
        toast.success(copy.scanPublished);
      } else if (value.status === "rejected") {
        toast.error(copy.scanBlocked);
      } else {
        toast.warning(copy.scanReview);
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
      toast.success(copy.reviewUpdated);
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
      toast.success(value.status === "suspended" ? copy.listingSuspended : copy.listingRestored);
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
        ? copy.rescanPassed
        : `${copy.rescanComplete} ${getLocalizedListingStatus(value.status, copy)}`);
    },
    onError: (error) => toast.error(error.message),
  });
  const executePayout = trpc.marketplace.executeSellerPayout.useMutation({
    onSuccess: () => {
      toast.success(copy.transferCreated);
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
      toast.success(copy.importedDraft);
    } catch (error) {
      console.error("Impossibile importare il progetto dall'editor", error);
      toast.error(copy.importedUnreadable);
    } finally {
      sessionStorage.removeItem("tatik_marketplace_seller_draft");
    }
  }, []);
  if (loading || !user) return <div className="min-h-screen p-8">{copy.loading}</div>;
  const saveProfile = () => {
    if (!termsAccepted) {
      toast.error(copy.acceptTermsRequired);
      return;
    }
    const websiteUrl = normalizeWebsiteUrl(profile.websiteUrl);
    if (websiteUrl === null) {
      toast.error(copy.invalidWebsite);
      return;
    }
    acceptTerms.mutate({
      ...profile,
      websiteUrl,
      accepted: true,
    });
  };
  const create = () => {
    const descriptionLength = listing.description.trim().length;
    if (descriptionLength < 20 || descriptionLength > MAX_LISTING_DESCRIPTION_LENGTH) {
      toast.error(copy.descriptionLengthError);
      return;
    }
    createListing.mutate({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      slug: listing.slug,
      priceCents: Math.round(Number(listing.price) * 100),
    });
  };
  const upload = async () => {
    if (!createdListingId) return;
    if (!file && !sourceContent.trim()) {
      toast.error(copy.codeRequired);
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error(copy.fileTooLarge);
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
      toast.error(error instanceof Error ? error.message : copy.fileReadFailed);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{copy.marketplaceName}</h1>
        <Link href="/marketplace"><Button variant="outline">{copy.backToMarketplace}</Button></Link>
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{copy.becomeSeller}</CardTitle>
            <CardDescription>{copy.commissionNote} {termsQuery.data?.commissionPercent ?? 15}%. {copy.payoutKyc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder={copy.publicName} value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
            <Textarea placeholder={copy.bio} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <Input placeholder={copy.website} value={profile.websiteUrl} onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })} />
            <p className="text-xs text-muted-foreground">{copy.websiteProtocol}</p>
            <div className="rounded border p-3 space-y-2">
              <p className="text-xs text-muted-foreground">{copy.termsAreItalian}</p>
              {termsQuery.isLoading && <p className="text-xs text-muted-foreground">{copy.loading}</p>}
              {termsQuery.isError && <p className="text-xs text-destructive">{termsQuery.error.message}</p>}
              {localizedSellerTerms ? (
                <>
                  <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
                    {localizedSellerTerms.map((term) => <li key={term}>{term}</li>)}
                  </ol>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">{officialSellerTermsLabel}</summary>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                      {sellerTerms.map((term) => <li key={term}>{term}</li>)}
                    </ol>
                  </details>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{sellerTerms.join(" ")}</p>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                <span>{copy.termsAccept} {termsQuery.data?.version ? `(v${termsQuery.data.version})` : ""}. {copy.termsResponsibility}</span>
              </label>
            </div>
            <Button onClick={saveProfile} disabled={acceptTerms.isPending || !termsAccepted}>{copy.acceptSave}</Button>
            {profileQuery.isError && <p className="text-sm text-destructive">{profileQuery.error.message}</p>}
            {seller?.termsAcceptedAt && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onboarding.mutate()} disabled={onboarding.isPending}>
                  {onboarding.isPending ? copy.onboardingOpening : copy.setupPayments}
                </Button>
                <Button variant="outline" onClick={() => refreshPayout.mutate()} disabled={refreshPayout.isPending}>
                  {copy.payoutStatus}
                </Button>
              </div>
            )}
            {seller && <Badge variant="secondary">{copy.sellerStatus}: {getLocalizedListingStatus(seller.status, copy)}</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{copy.newListing}</CardTitle><CardDescription>{copy.listingInstructions}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder={copy.title} value={listing.title} onChange={(e) => setListing({ ...listing, title: e.target.value, slug: slugify(e.target.value) })} />
            <Textarea
              placeholder={copy.description}
              value={listing.description}
              maxLength={MAX_LISTING_DESCRIPTION_LENGTH}
              onChange={(e) => setListing({ ...listing, description: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">{languageGuidance}</p>
            <p className="text-xs text-muted-foreground text-right">
              {listing.description.length.toLocaleString(language)}/{MAX_LISTING_DESCRIPTION_LENGTH.toLocaleString(language)} {copy.characters} ({copy.minCharacters})
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <Input placeholder={copy.category} value={listing.category} onChange={(e) => setListing({ ...listing, category: e.target.value })} />
              <Input placeholder={copy.slug} value={listing.slug} onChange={(e) => setListing({ ...listing, slug: slugify(e.target.value) })} />
              <Input type="number" aria-label={copy.price} min="1" step="0.01" value={listing.price} onChange={(e) => setListing({ ...listing, price: e.target.value })} />
            </div>
            <p className="text-sm text-muted-foreground">{copy.estimatedNet} €{(Number(listing.price) * 0.85 || 0).toFixed(2)} {copy.afterCommission}</p>
            <Button onClick={create} disabled={createListing.isPending || !seller?.termsAcceptedAt}>{copy.createDraft}</Button>
            {createdListingId && (
              <div className="border rounded p-3 space-y-3">
                <Input
                  placeholder={copy.fileName}
                  value={sourceFileName}
                  onChange={(event) => setSourceFileName(event.target.value)}
                />
                <Textarea
                  rows={12}
                  placeholder={copy.codePlaceholder}
                  value={sourceContent}
                  onChange={(event) => {
                    setFile(null);
                    setSourceContent(event.target.value);
                  }}
                  className="font-mono text-xs"
                />
                <div className="text-center text-xs text-muted-foreground">{copy.chooseFile}</div>
                <Input type="file" accept=".html,.htm,.css,.js,.mjs,.cjs,.jsx,.ts,.tsx,.json,.md,.txt,.xml,.svg,.py,.sql" onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setSourceContent("");
                }} />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={upload} disabled={uploadFile.isPending || (!file && !sourceContent.trim())}>{copy.savePrivateCode}</Button>
                  <Button onClick={() => submitReview.mutate({ listingId: createdListingId })} disabled={submitReview.isPending || uploadFile.isPending}>{copy.scanPublish}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{copy.myListings}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(listingsQuery.data || []).map((item) => (
              <div key={item.id} className="border-b py-3 space-y-1">
                <div className="flex justify-between gap-3"><span>{item.title}</span><Badge>{getLocalizedListingStatus(item.status, copy)}</Badge></div>
                <p className="text-xs text-muted-foreground">{copy.automaticScan} {getLocalizedListingStatus(item.scanStatus, copy)}</p>
                {item.rejectionReason && <p className="text-sm text-destructive">{item.rejectionReason}</p>}
              </div>
            ))}
            {listingsQuery.isLoading && <p className="text-sm text-muted-foreground">{copy.loading}</p>}
            {listingsQuery.isError && <p className="text-sm text-destructive">{listingsQuery.error.message}</p>}
            {!listingsQuery.isLoading && !listingsQuery.isError && !listingsQuery.data?.length && <p className="text-sm text-muted-foreground">{copy.noListings}</p>}
          </CardContent>
        </Card>

        {user.role === "admin" && <Card>
          <CardHeader><CardTitle>{copy.adminPublished}</CardTitle><CardDescription>{copy.moderationDescription}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {(moderationQuery.data || []).map(({ listing: item, sellerName }) => (
              <div key={item.id} className="rounded border p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-auto font-medium">{item.title} · {sellerName}</span>
                  <Badge variant={item.status === "suspended" ? "destructive" : "secondary"}>{getLocalizedListingStatus(item.status, copy)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{copy.scanOutcome} {getLocalizedListingStatus(item.scanStatus, copy)}</p>
                {item.moderationReason && <p className="text-sm text-destructive">{item.moderationReason}</p>}
                {(item.scanStatus === "legacy_unscanned" || item.scanStatus === "not_scanned") && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={rescanLegacyListing.isPending}
                    onClick={() => rescanLegacyListing.mutate({ listingId: item.id })}
                  >{copy.rescanLegacy}</Button>
                )}
                {item.status === "published" ? (
                  <div className="flex flex-wrap gap-2">
                    <Input
                      className="min-w-56 flex-1"
                      value={moderationReasons[item.id] || ""}
                      onChange={(event) => setModerationReasons((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder={copy.suspendReason}
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
                    >{copy.suspendAccess}</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" disabled={moderateListing.isPending} onClick={() => moderateListing.mutate({ listingId: item.id, action: "restore" })}>
                    {copy.restoreListing}
                  </Button>
                )}
              </div>
            ))}
            {moderationQuery.isLoading && <p className="text-sm text-muted-foreground">{copy.loading}</p>}
            {moderationQuery.isError && <p className="text-sm text-destructive">{moderationQuery.error.message}</p>}
            {!moderationQuery.isLoading && !moderationQuery.isError && !moderationQuery.data?.length && <p className="text-sm text-muted-foreground">{copy.noModerationListings}</p>}
          </CardContent>
        </Card>}

        {user.role === "admin" && <Card>
          <CardHeader><CardTitle>{copy.reviewQueue}</CardTitle><CardDescription>{copy.reviewQueueDescription}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {selectedReviewListingId !== null && (
              <div className="rounded border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{reviewContentQuery.data?.title || copy.codeLoading}</p>
                  <Button size="sm" variant="outline" onClick={() => setSelectedReviewListingId(null)}>{copy.closeCode}</Button>
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
                <p className="text-xs text-muted-foreground">{item.rejectionReason || copy.checkDetails}</p>
                {scanMessages(item.scanReport).map((message, index) => <p key={`${item.id}-${index}`} className="text-xs text-amber-700">{message}</p>)}
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedReviewListingId(item.id)}>{copy.inspectCode}</Button>
              <Button size="sm" onClick={() => review.mutate({ listingId: item.id, approved: true })}>{copy.approveAfterReview}</Button>
              <Button size="sm" variant="destructive" onClick={() => review.mutate({ listingId: item.id, approved: false, reason: "Non conforme dopo controllo amministrativo" })}>{copy.reject}</Button>
            </div>)}
            {queueQuery.isLoading && <p className="text-sm text-muted-foreground">{copy.loading}</p>}
            {queueQuery.isError && <p className="text-sm text-destructive">{queueQuery.error.message}</p>}
          </CardContent>
        </Card>}

        {user.role === "admin" && <Card>
          <CardHeader><CardTitle>{copy.payoutAvailable}</CardTitle><CardDescription>{copy.payoutDelay}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {(payoutCandidatesQuery.data || []).map((row) => (
              <div key={row.entry.id} className="flex flex-wrap gap-2 items-center border-b py-2">
                <span className="mr-auto">{row.seller.displayName} · €{(row.entry.amountCents / 100).toFixed(2)}</span>
                <Button size="sm" onClick={() => executePayout.mutate({ balanceEntryId: row.entry.id })} disabled={executePayout.isPending}>{copy.executeTransfer}</Button>
              </div>
            ))}
            {payoutCandidatesQuery.isLoading && <p className="text-sm text-muted-foreground">{copy.loading}</p>}
            {payoutCandidatesQuery.isError && <p className="text-sm text-destructive">{payoutCandidatesQuery.error.message}</p>}
            {!payoutCandidatesQuery.isLoading && !payoutCandidatesQuery.isError && !payoutCandidatesQuery.data?.length && <p className="text-sm text-muted-foreground">{copy.noPayouts}</p>}
          </CardContent>
        </Card>}

      </main>
    </div>
  );
}
