import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { communityMarketplaceCopy } from "@/lib/communityMarketplaceCopy";

type ProjectFile = { name: string; path?: string; content: string };

function getEditorFiles(content: string, fileName: string): ProjectFile[] {
  try {
    const parsed = JSON.parse(content) as { format?: string; files?: ProjectFile[] };
    if (parsed.format === "tatik-project-v1" && Array.isArray(parsed.files) &&
      parsed.files.every((file) => typeof file.name === "string" && typeof file.content === "string")) {
      return parsed.files;
    }
  } catch {
    // A single source file is not a project manifest.
  }
  return [{ name: fileName, path: fileName, content }];
}

type TemplateAction = "copy" | "download" | "editor";

export function DeveloperTemplateListings() {
  const { language } = useLanguage();
  const copy = communityMarketplaceCopy[language] ?? communityMarketplaceCopy.en;
  const { user } = useAuth({ redirectOnUnauthenticated: false });
  const utils = trpc.useUtils();
  const listings = trpc.marketplace.listPublished.useQuery(undefined, { retry: false });
  useEffect(() => {
    if (listings.isError) {
      console.error("Errore caricamento template community", listings.error);
    }
  }, [listings.error, listings.isError]);
  const orders = trpc.marketplace.listMyOrders.useQuery(undefined, { enabled: !!user });
  const purchase = trpc.marketplace.createPurchase.useMutation({
    onSuccess: (result) => {
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else toast.error(copy.stripeMissingUrl);
    },
    onError: (error) => toast.error(error.message),
  });
  const moderateListing = trpc.marketplace.moderateListing.useMutation({
    onSuccess: async () => {
      toast.success(copy.removedForReview);
      await listings.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const handleListingsRetry = async () => {
    try {
      await listings.refetch();
    } catch (error) {
      console.error("Errore caricamento template community", error);
      toast.error(copy.retryError);
    }
  };
  const submitReview = trpc.marketplace.submitReview.useMutation({
    onSuccess: async () => {
      toast.success(copy.reviewSaved);
      await Promise.all([orders.refetch(), listings.refetch()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const checkoutReturned = new URLSearchParams(window.location.search).get("purchase") === "success";
  const [refreshingOrderId, setRefreshingOrderId] = useState<number | null>(null);

  const deliverTemplate = async (
    purchased: { title: string; content: string; fileName: string },
    action: TemplateAction,
  ) => {
    const files = getEditorFiles(purchased.content, purchased.fileName);
    if (action === "editor") {
      localStorage.setItem("tatik_purchased_marketplace_template", JSON.stringify({
        title: purchased.title,
        files,
      }));
      window.location.assign("/editor");
      return;
    }
    if (action === "download") {
      const blob = new Blob([purchased.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = files.length > 1 ? `${purchased.title}.json` : purchased.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(copy.downloadSuccess);
      return;
    }
    const mainFile = files.find((file) => /(^|\/)index\.html?$/i.test(file.path || file.name))
      || files.find((file) => /\.html?$/i.test(file.name))
      || files[0];
    if (!mainFile) throw new Error(copy.codeUnavailable);
    await navigator.clipboard.writeText(files.length > 1 ? purchased.content : mainFile.content);
    toast.success(files.length > 1 ? copy.manifestCopied : copy.codeCopied);
  };

  const downloadPurchasedTemplate = async (orderId: number, action: TemplateAction) => {
    setRefreshingOrderId(orderId);
    try {
      const purchased = await utils.marketplace.getPurchasedContent.fetch({ orderId });
      await deliverTemplate(purchased, action);
    } catch (error) {
      console.error("Errore accesso template acquistato", error);
      toast.error(copy.productError);
    } finally {
      setRefreshingOrderId(null);
    }
  };

  const downloadOwnListing = async (listingId: number, action: TemplateAction) => {
    setRefreshingOrderId(listingId);
    try {
      const owned = await utils.marketplace.getOwnedListingContent.fetch({ listingId });
      await deliverTemplate(owned, action);
    } catch (error) {
      console.error("Errore accesso proprio template", error);
      toast.error(copy.ownProductError);
    } finally {
      setRefreshingOrderId(null);
    }
  };

  const paidOrders = orders.data?.filter(({ order }) => order.status === "paid" || order.status === "refunded") ?? [];
  const orderForListing = (listingId: number) => paidOrders.find(({ order }) => order.listingId === listingId && order.status === "paid");

  return (
    <section className="max-w-7xl mx-auto px-4 pb-8 space-y-6">
      {checkoutReturned && (
        <Card className="border-primary">
          <CardContent className="pt-6 flex flex-wrap items-center gap-3">
            <p className="mr-auto">{copy.checkoutNotice}</p>
            <Button variant="outline" onClick={() => orders.refetch()} disabled={orders.isFetching}>{copy.refreshPurchases}</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
          <div><Button onClick={() => window.location.assign(user ? "/marketplace/developer" : "/login")}>{copy.sellTemplate}</Button></div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.data?.map(({ listing, sellerName, averageRating, reviewCount, isOwner, canModerate }) => {
            const owned = orderForListing(listing.id);
            return (
              <article key={listing.id} className="rounded-lg border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <span className="font-semibold shrink-0">€{(listing.priceCents / 100).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">{listing.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{copy.seller} {sellerName}</span>
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(averageRating).toFixed(1)} ({reviewCount})</span>
                </div>
                {owned || isOwner ? (
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => owned
                      ? downloadPurchasedTemplate(owned.order.id, "copy")
                      : downloadOwnListing(listing.id, "copy")} disabled={refreshingOrderId === (owned?.order.id ?? listing.id)}>{copy.copyCode}</Button>
                    <Button size="sm" variant="outline" onClick={() => owned
                      ? downloadPurchasedTemplate(owned.order.id, "editor")
                      : downloadOwnListing(listing.id, "editor")} disabled={refreshingOrderId === (owned?.order.id ?? listing.id)}>{copy.openEditor}</Button>
                    <Button size="sm" variant="outline" className="col-span-2" onClick={() => owned
                      ? downloadPurchasedTemplate(owned.order.id, "download")
                      : downloadOwnListing(listing.id, "download")} disabled={refreshingOrderId === (owned?.order.id ?? listing.id)}>{copy.downloadTemplate}</Button>
                  </div>
                ) : user ? (
                  <Button className="mt-auto" onClick={() => purchase.mutate({ listingId: listing.id })} disabled={purchase.isPending}>
                    {purchase.isPending ? copy.openingPayment : copy.buy}
                  </Button>
                ) : (
                  <Button className="mt-auto" onClick={() => window.location.assign("/login")}>{copy.loginToBuy}</Button>
                )}
                {canModerate && !isOwner && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={moderateListing.isPending}
                    onClick={() => {
                      const reason = window.prompt(copy.moderationPrompt);
                      if (reason?.trim()) {
                        moderateListing.mutate({ listingId: listing.id, action: "suspend", reason: reason.trim() });
                      }
                    }}
                  >
                    {copy.removeListing}
                  </Button>
                )}
              </article>
            );
          })}
          {!listings.isLoading && !listings.isError && !listings.data?.length && (
            <p className="text-sm text-muted-foreground">{copy.noListings}</p>
          )}
          {listings.isError && (
            <div className="col-span-full flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="mr-auto text-sm text-destructive">{copy.loadError}</p>
              <Button size="sm" variant="outline" onClick={handleListingsRetry} disabled={listings.isFetching}>
                {listings.isFetching ? copy.updating : copy.retry}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>{copy.purchasesTitle}</CardTitle>
            <CardDescription>{copy.purchasesDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.data?.map(({ order, listing, review }) => (
              <div key={order.id} className="rounded border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium mr-auto">{listing.title}</span>
                  <span className="text-sm text-muted-foreground">{copy.orderStatus}: {order.status === "pending" ? copy.statusPending : order.status === "paid" ? copy.statusPaid : copy.statusRefunded}</span>
                </div>
                {order.status === "pending" && <p className="text-sm text-muted-foreground">{copy.paymentPending}</p>}
                {order.status === "paid" && listing.status !== "published" && (
                  <p className="text-sm text-destructive">{copy.suspendedAccess}</p>
                )}
                {order.status === "paid" && listing.status === "published" && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => downloadPurchasedTemplate(order.id, "copy")} disabled={refreshingOrderId === order.id}>{copy.copyCode}</Button>
                      <Button size="sm" variant="outline" onClick={() => downloadPurchasedTemplate(order.id, "editor")} disabled={refreshingOrderId === order.id}>{copy.openEditor}</Button>
                      <Button size="sm" variant="outline" onClick={() => downloadPurchasedTemplate(order.id, "download")} disabled={refreshingOrderId === order.id}>{copy.downloadTemplate}</Button>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-sm font-medium">{review ? copy.updateRating : copy.rateTemplate}</p>
                      <div className="flex gap-1" aria-label={copy.ratingLabel}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button key={rating} type="button" aria-label={`${rating} ${copy.stars}`} onClick={() => setRatings((current) => ({ ...current, [order.id]: rating }))}>
                            <Star className={`h-5 w-5 ${((ratings[order.id] || review?.rating || 0) >= rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        rows={2}
                        maxLength={2000}
                        value={comments[order.id] ?? review?.comment ?? ""}
                        onChange={(event) => setComments((current) => ({ ...current, [order.id]: event.target.value }))}
                        placeholder={copy.optionalComment}
                      />
                      <Button size="sm" disabled={(!ratings[order.id] && !review) || submitReview.isPending} onClick={() => submitReview.mutate({
                        orderId: order.id,
                        rating: ratings[order.id] || review?.rating || 0,
                        comment: comments[order.id] ?? review?.comment ?? "",
                      })}>{review ? copy.updateRating : copy.submitRating}</Button>
                    </div>
                  </>
                )}
                {order.status === "refunded" && <p className="text-sm text-destructive">{copy.refunded}</p>}
              </div>
            ))}
            {orders.isLoading && <p className="text-sm text-muted-foreground">{copy.loadingOrders}</p>}
            {!orders.isLoading && !orders.data?.length && <p className="text-sm text-muted-foreground">{copy.noPurchases}</p>}
            {orders.isError && <p className="text-sm text-destructive">{copy.errorLoadingOrders}</p>}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
