import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function SchoolProgram() {
  const { user, loading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: `${getLoginUrl()}?next=${encodeURIComponent("/schools")}`,
  });
  const [school, setSchool] = useState({ institutionName: "", institutionEmail: "" });
  const [studentEmail, setStudentEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [approvedInviteToken, setApprovedInviteToken] = useState("");
  const utils = trpc.useUtils();
  const terms = trpc.schools.terms.useQuery();
  const isStaff = trpc.schools.isStaff.useQuery(undefined, { enabled: Boolean(user) });
  const mySchool = trpc.schools.mySchool.useQuery(undefined, { enabled: Boolean(user) });
  const myMembership = trpc.schools.myMembership.useQuery(undefined, { enabled: Boolean(user) });
  const pending = trpc.schools.adminPending.useQuery(undefined, { enabled: isStaff.data === true });
  const register = trpc.schools.register.useMutation({
    onSuccess: async () => {
      toast.success("Richiesta inviata allo staff Tatik");
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const setStatus = trpc.schools.adminSetStatus.useMutation({
    onSuccess: async () => {
      await utils.schools.adminPending.invalidate();
      toast.success("Stato dell'istituto aggiornato");
    },
    onError: (error) => toast.error(error.message),
  });
  const createInvite = trpc.schools.createInvite.useMutation({
    onSuccess: async () => {
      toast.success("Invito creato. Lo staff Tatik deve approvarlo prima che sia riscattabile.");
      setStudentEmail("");
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const approveInvite = trpc.schools.approveInvite.useMutation({
    onSuccess: async (result) => {
      setApprovedInviteToken(result.token);
      toast.success("Invito approvato. Copia il token qui sotto e invialo allo studente.");
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const redeemInvite = trpc.schools.redeemInvite.useMutation({
    onSuccess: async () => {
      setInviteToken("");
      toast.success("Invito riscattato: l'accesso scuola è attivo.");
      await utils.schools.myMembership.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const revokeMember = trpc.schools.revokeMember.useMutation({
    onSuccess: async () => {
      toast.success("Accesso dello studente revocato");
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  if (loading || !user) return null;
  const current = mySchool.data?.school;
  const activeMembership = myMembership.data;
  const isRegistering = register.isPending;

  const copyInviteToken = async () => {
    if (!approvedInviteToken) return;
    try {
      await navigator.clipboard.writeText(approvedInviteToken);
      toast.success("Token copiato negli appunti");
    } catch {
      toast.error("Copia non riuscita. Seleziona e copia il token manualmente.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Programma scuole</CardTitle>
          <CardDescription>
            Accesso una tantum di un mese, massimo 30 studenti. La registrazione dell'istituto deve essere approvata da Tatik.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!current ? (
            <>
              <Input
                placeholder="Nome istituto"
                value={school.institutionName}
                onChange={(event) => setSchool({ ...school, institutionName: event.target.value })}
              />
              <Input
                type="email"
                placeholder="Email istituzionale"
                value={school.institutionEmail}
                onChange={(event) => setSchool({ ...school, institutionEmail: event.target.value })}
              />
              <div className="rounded border p-3 space-y-2">
                {terms.data
                  ? <p className="text-sm">{terms.data.terms.join(" ")}</p>
                  : <p role="alert" className="text-sm text-destructive">
                    {terms.error ? `Impossibile caricare i termini: ${terms.error.message}` : "Caricamento termini..."}
                  </p>}
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                  <span>
                    Ho letto e accetto i termini del programma scuole
                    {terms.data?.version ? ` (versione ${terms.data.version})` : ""}.
                  </span>
                </label>
              </div>
              <Button
                disabled={isRegistering || !termsAccepted || !terms.data}
                onClick={() => register.mutate({ ...school, acceptedTerms: true })}
              >
                {isRegistering ? "Invio richiesta..." : "Registra istituto e accetta i termini"}
              </Button>
            </>
          ) : (
            <p>
              Stato istituto: <strong>{current.status}</strong>
              {current.accessEndsAt
                ? ` · accesso fino al ${new Date(current.accessEndsAt).toLocaleDateString()}`
                : ""}
            </p>
          )}
          {activeMembership && (
            <p role="status">
              Accesso studente attivo presso <strong>{activeMembership.school.institutionName}</strong>
              {` fino al ${new Date(activeMembership.member.accessEndsAt).toLocaleDateString()}.`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riscatta un invito</CardTitle>
          <CardDescription>
            Accedi con l'indirizzo email a cui è stato inviato l'invito, quindi inserisci il token approvato dall'istituto.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            aria-label="Token invito scuola"
            placeholder="Token invito"
            value={inviteToken}
            maxLength={64}
            onChange={(event) => setInviteToken(event.target.value.trim())}
          />
          <Button
            disabled={redeemInvite.isPending || inviteToken.length !== 64}
            onClick={() => redeemInvite.mutate({ token: inviteToken })}
          >
            {redeemInvite.isPending ? "Verifica invito..." : "Riscatta invito"}
          </Button>
        </CardContent>
      </Card>

      {current?.status === "approved" && (
        <Card>
          <CardHeader>
            <CardTitle>Inviti studenti</CardTitle>
            <CardDescription>
              Crea un invito per l'email dello studente. Dopo la tua approvazione, condividi il token: è monouso e valido per 7 giorni.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email studente"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
              />
              <Button
                disabled={createInvite.isPending || !studentEmail.trim()}
                onClick={() => createInvite.mutate({ studentEmail: studentEmail.trim() })}
              >
                Crea invito
              </Button>
            </div>
            {approvedInviteToken && (
              <div className="flex gap-2">
                <Input aria-label="Token invito approvato" readOnly value={approvedInviteToken} />
                <Button variant="outline" onClick={copyInviteToken}>Copia token</Button>
              </div>
            )}
            {(mySchool.data?.invites || []).map((invite) => (
              <div key={invite.id} className="flex items-center gap-2 border-b py-2 text-sm">
                <span className="mr-auto">{invite.studentEmail} · {invite.status}</span>
                {invite.status === "pending" && (
                  <Button
                    size="sm"
                    disabled={approveInvite.isPending}
                    onClick={() => approveInvite.mutate({ inviteId: invite.id })}
                  >
                    Approva e genera token
                  </Button>
                )}
              </div>
            ))}
            {(mySchool.data?.members || []).map((member) => (
              <div key={member.member.id} className="flex items-center gap-2 border-b py-2 text-sm">
                <span className="mr-auto">
                  {member.email || member.name || "Studente"} · {
                    member.member.revokedAt
                      ? "accesso revocato"
                      : member.member.accessEndsAt <= new Date()
                        ? "accesso scaduto"
                        : `accesso fino al ${new Date(member.member.accessEndsAt).toLocaleDateString()}`
                  }
                </span>
                {!member.member.revokedAt && member.member.accessEndsAt > new Date() && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={revokeMember.isPending}
                    onClick={() => revokeMember.mutate({ memberId: member.member.id })}
                  >
                    Revoca
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isStaff.data && (
        <Card>
          <CardHeader>
            <CardTitle>Approvazioni staff</CardTitle>
            <CardDescription>Admin e collaboratori approvano o rifiutano le registrazioni degli istituti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(pending.data || []).map((item) => (
              <div key={item.id} className="flex items-center gap-2 border-b py-2">
                <span className="mr-auto">{item.institutionName} · {item.institutionEmail}</span>
                <Button
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ schoolId: item.id, status: "approved" })}
                >
                  Approva
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ schoolId: item.id, status: "rejected" })}
                >
                  Rifiuta
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
