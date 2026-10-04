import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

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

export function DeveloperTemplateListings() {
  const { user } = useAuth({ redirectOnUnauthenticated: false });
  const utils = trpc.useUtils();
  const listings = trpc.marketplace.listPublished.useQuery();
  const orders = trpc.marketplace.listMyOrders.useQuery(undefined, { enabled: !!user });
  const purchase = trpc.marketplace.createPurchase.useMutation({
    onSuccess: (result) => {
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else toast.error("Stripe non ha restituito il link di pagamento.");
    },
    onError: (error) => toast.error(error.message),
  });
  const submitReview = trpc.marketplace.submitReview.useMutation({
    onSuccess: async () => {
      toast.success("Recensione salvata. Grazie per il tuo feedback!");
      await Promise.all([orders.refetch(), listings.refetch()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const checkoutReturned = new URLSearchParams(window.location.search).get("purchase") === "success";
  const [refreshingOrderId, setRefreshingOrderId] = useState<number | null>(null);

  const downloadPurchasedTemplate = async (orderId: number, action: "copy" | "download" | "editor") => {
    setRefreshingOrderId(orderId);
    try {
      const purchased = await utils.marketplace.getPurchasedContent.fetch({ orderId });
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
        toast.success("Template scaricato.");
        return;
      }
      const mainFile = files.find((file) => /(^|\/)index\.html?$/i.test(file.path || file.name))
        || files.find((file) => /\.html?$/i.test(file.name))
        || files[0];
      if (!mainFile) throw new Error("Il prodotto acquistato non contiene codice.");
      await navigator.clipboard.writeText(files.length > 1 ? purchased.content : mainFile.content);
      toast.success(files.length > 1 ? "Manifest completo copiato; usa «Apri nell'editor» per caricare i file separati e lavorarci." : "Codice copiato.");
    } catch (error) {
      console.error("Errore accesso template acquistato", error);
      toast.error(error instanceof Error ? error.message : "Impossibile recuperare il template acquistato.");
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
            <p className="mr-auto">Pagamento completato? L'accesso si attiva appena Stripe conferma il pagamento.</p>
            <Button variant="outline" onClick={() => orders.refetch()} disabled={orders.isFetching}>Aggiorna acquisti</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template della community</CardTitle>
          <CardDescription>Prodotti pubblicati dagli sviluppatori. Il codice è disponibile soltanto dopo la conferma del pagamento. Tatik trattiene il 15% del prezzo; il venditore riceve il restante 85% prima delle commissioni applicate dal provider di pagamento.</CardDescription>
          <div><Button onClick={() => window.location.assign(user ? "/marketplace/developer" : "/login")}>Vendi il tuo template</Button></div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.data?.map(({ listing, sellerName, averageRating, reviewCount }) => {
            const owned = orderForListing(listing.id);
            return (
              <article key={listing.id} className="rounded-lg border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <span className="font-semibold shrink-0">€{(listing.priceCents / 100).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">{listing.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>di {sellerName}</span>
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(averageRating).toFixed(1)} ({reviewCount})</span>
                </div>
                {owned ? (
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => downloadPurchasedTemplate(owned.order.id, "copy")} disabled={refreshingOrderId === owned.order.id}>Copia codice</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPurchasedTemplate(owned.order.id, "editor")} disabled={refreshingOrderId === owned.order.id}>Apri nell'editor</Button>
                    <Button size="sm" variant="outline" className="col-span-2" onClick={() => downloadPurchasedTemplate(owned.order.id, "download")} disabled={refreshingOrderId === owned.order.id}>Scarica template</Button>
                  </div>
                ) : user ? (
                  <Button className="mt-auto" onClick={() => purchase.mutate({ listingId: listing.id })} disabled={purchase.isPending}>
                    {purchase.isPending ? "Apertura pagamento..." : "Acquista"}
                  </Button>
                ) : (
                  <Button className="mt-auto" onClick={() => window.location.assign("/login")}>Accedi per acquistare</Button>
                )}
              </article>
            );
          })}
          {!listings.isLoading && !listings.data?.length && (
            <p className="text-sm text-muted-foreground">Nessun template della community è ancora pubblicato.</p>
          )}
          {listings.isError && <p className="text-sm text-destructive">Impossibile caricare i template della community: {listings.error.message}</p>}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>I tuoi acquisti dalla community</CardTitle>
            <CardDescription>La copia e il download vengono autorizzati dal server solo per ordini pagati e non rimborsati.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.data?.map(({ order, listing, review }) => (
              <div key={order.id} className="rounded border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium mr-auto">{listing.title}</span>
                  <span className="text-sm text-muted-foreground">Stato: {order.status}</span>
                </div>
                {order.status === "pending" && <p className="text-sm text-muted-foreground">Pagamento in attesa della conferma del provider; il codice non è ancora accessibile.</p>}
                {order.status === "paid" && listing.status !== "published" && (
                  <p className="text-sm text-destructive">Accesso temporaneamente sospeso: il template è stato rimosso dal marketplace per una verifica amministrativa.</p>
                )}
                {order.status === "paid" && listing.status === "published" && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => downloadPurchasedTemplate(order.id, "copy")} disabled={refreshingOrderId === order.id}>Copia codice</Button>
                      <Button size="sm" variant="outline" onClick={() => downloadPurchasedTemplate(order.id, "editor")} disabled={refreshingOrderId === order.id}>Apri nell'editor</Button>
                      <Button size="sm" variant="outline" onClick={() => downloadPurchasedTemplate(order.id, "download")} disabled={refreshingOrderId === order.id}>Scarica</Button>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-sm font-medium">{review ? "Aggiorna la tua valutazione" : "Valuta il template (solo acquirenti)"}</p>
                      <div className="flex gap-1" aria-label="Valutazione da 1 a 5">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button key={rating} type="button" aria-label={`${rating} stelle`} onClick={() => setRatings((current) => ({ ...current, [order.id]: rating }))}>
                            <Star className={`h-5 w-5 ${((ratings[order.id] || review?.rating || 0) >= rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        rows={2}
                        maxLength={2000}
                        value={comments[order.id] ?? review?.comment ?? ""}
                        onChange={(event) => setComments((current) => ({ ...current, [order.id]: event.target.value }))}
                        placeholder="Commento facoltativo"
                      />
                      <Button size="sm" disabled={(!ratings[order.id] && !review) || submitReview.isPending} onClick={() => submitReview.mutate({
                        orderId: order.id,
                        rating: ratings[order.id] || review?.rating || 0,
                        comment: comments[order.id] ?? review?.comment ?? "",
                      })}>{review ? "Aggiorna valutazione" : "Invia valutazione"}</Button>
                    </div>
                  </>
                )}
                {order.status === "refunded" && <p className="text-sm text-destructive">Ordine rimborsato: l'accesso al codice è revocato.</p>}
              </div>
            ))}
            {!orders.isLoading && !orders.data?.length && <p className="text-sm text-muted-foreground">Non hai ancora acquisti dalla community.</p>}
            {orders.isError && <p className="text-sm text-destructive">Impossibile caricare gli acquisti: {orders.error.message}</p>}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
