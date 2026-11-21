import { useState } from "react";
import { Users, Loader2, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

export function ProjectCollaborators({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const utils = trpc.useContext();
  const membersQuery = trpc.projects.members.useQuery(
    { projectId },
    { enabled: open },
  );
  const addMember = trpc.projects.addMember.useMutation({
    onSuccess: async () => {
      setEmail("");
      await Promise.all([utils.projects.members.invalidate({ projectId }), utils.projects.list.invalidate()]);
      toast.success("Collaboratore aggiunto al progetto.");
    },
    onError: error => toast.error(error.message),
  });
  const removeMember = trpc.projects.removeMember.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.projects.members.invalidate({ projectId }), utils.projects.list.invalidate()]);
      toast.success("Accesso del collaboratore rimosso.");
    },
    onError: error => toast.error(error.message),
  });

  return (
    <>
      <Button size="sm" variant="outline" className="gap-1 px-2 py-1" onClick={() => setOpen(true)}>
        <Users className="h-4 w-4" />
        Collaboratori
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collaboratori del progetto</DialogTitle>
            <DialogDescription>Gli account aggiunti potranno accedere ai file di questo progetto e usare l'Agente AI.</DialogDescription>
          </DialogHeader>
          <form
            className="flex gap-2"
            onSubmit={event => {
              event.preventDefault();
              if (email.trim()) addMember.mutate({ projectId, email: email.trim() });
            }}
          >
            <Input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="email@esempio.it" required />
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span className="sr-only">Aggiungi</span>
            </Button>
          </form>
          {membersQuery.isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : membersQuery.error ? (
            <p className="text-sm text-destructive">{membersQuery.error.message}</p>
          ) : (
            <ul className="max-h-60 space-y-2 overflow-auto">
              {(membersQuery.data || []).map(member => (
                <li key={member.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{member.name || member.email || `Utente ${member.userId}`}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Rimuovi ${member.email || "collaboratore"}`}
                    disabled={removeMember.isPending}
                    onClick={() => removeMember.mutate({ projectId, memberId: member.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {membersQuery.data?.length === 0 && <li className="text-sm text-muted-foreground">Nessun collaboratore aggiunto.</li>}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
