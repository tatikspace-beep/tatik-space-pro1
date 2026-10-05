import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { commercialSeoCopy } from "@/lib/commercialSeoCopy";
import { schoolProgramCopy } from "@/lib/schoolProgramCopy";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SchoolProgram() {
  const { language } = useLanguage();
  const copy = schoolProgramCopy[language] ?? schoolProgramCopy.en;
  const marketingCopy = commercialSeoCopy[language] ?? commercialSeoCopy.en;
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
  const reportMutationError = (operation: string, error: unknown) => {
    console.error(`School program ${operation} failed`, error);
    toast.error(copy.operationFailed);
  };
  const register = trpc.schools.register.useMutation({
    onSuccess: async () => {
      toast.success(copy.requestSubmitted);
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => reportMutationError("registration", error),
  });
  const setStatus = trpc.schools.adminSetStatus.useMutation({
    onSuccess: async () => {
      await utils.schools.adminPending.invalidate();
      toast.success(copy.institutionUpdated);
    },
    onError: (error) => reportMutationError("status update", error),
  });
  const createInvite = trpc.schools.createInvite.useMutation({
    onSuccess: async () => {
      toast.success(copy.inviteCreated);
      setStudentEmail("");
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => reportMutationError("invitation creation", error),
  });
  const approveInvite = trpc.schools.approveInvite.useMutation({
    onSuccess: async (result) => {
      setApprovedInviteToken(result.token);
      toast.success(copy.inviteApproved);
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => reportMutationError("invitation approval", error),
  });
  const redeemInvite = trpc.schools.redeemInvite.useMutation({
    onSuccess: async () => {
      setInviteToken("");
      toast.success(copy.inviteRedeemed);
      await utils.schools.myMembership.invalidate();
    },
    onError: (error) => reportMutationError("invitation redemption", error),
  });
  const revokeMember = trpc.schools.revokeMember.useMutation({
    onSuccess: async () => {
      toast.success(copy.studentRevoked);
      await utils.schools.mySchool.invalidate();
    },
    onError: (error) => reportMutationError("student access revocation", error),
  });

  if (loading || !user) return null;
  const current = mySchool.data?.school;
  const activeMembership = myMembership.data;

  const statusLabel = (status: string) => {
    if (status === "pending") return copy.pending;
    if (status === "approved") return copy.approved;
    if (status === "rejected") return copy.rejected;
    if (status === "revoked") return copy.accessRevoked;
    if (status === "redeemed") return copy.redeemed;
    return status;
  };
  const formatDate = (value: Date | string) => new Intl.DateTimeFormat(language).format(new Date(value));
  const copyInviteToken = async () => {
    if (!approvedInviteToken) return;
    try {
      await navigator.clipboard.writeText(approvedInviteToken);
      toast.success(copy.tokenCopied);
    } catch (error) {
      console.error("School invitation token copy failed", error);
      toast.error(copy.copyFailed);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{marketingCopy.schoolsTitle.split(" |")[0]}</CardTitle>
          <CardDescription>
            <span className="block font-medium text-foreground mb-1">{marketingCopy.schoolsHeading}</span>
            {marketingCopy.schoolsIntro}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mySchool.isLoading && <p role="status">{copy.loadingData}</p>}
          {mySchool.error && <p role="alert" className="text-sm text-destructive">{copy.queryError}</p>}
          {!mySchool.isLoading && !mySchool.error && !current && (
            <>
              <Input
                aria-label={copy.institutionName}
                placeholder={copy.institutionName}
                value={school.institutionName}
                onChange={(event) => setSchool({ ...school, institutionName: event.target.value })}
              />
              <Input
                aria-label={copy.institutionEmail}
                type="email"
                placeholder={copy.institutionEmail}
                value={school.institutionEmail}
                onChange={(event) => setSchool({ ...school, institutionEmail: event.target.value })}
              />
              <div className="rounded border p-3 space-y-2">
                {terms.data
                  ? <>
                    <p className="text-sm">{terms.data.terms.join(" ")}</p>
                    <p className="text-xs text-muted-foreground">{copy.officialTermsNote}</p>
                  </>
                  : <p role="alert" className="text-sm text-destructive">
                    {terms.error ? copy.termsError : copy.loadingTerms}
                  </p>}
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    disabled={!terms.data}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                  <span>
                    {copy.acceptTerms}
                    {terms.data?.version ? ` (${terms.data.version})` : ""}
                  </span>
                </label>
              </div>
              <Button
                disabled={register.isPending || !termsAccepted || !terms.data || !school.institutionName.trim() || !school.institutionEmail.trim()}
                onClick={() => register.mutate({ ...school, acceptedTerms: true })}
              >
                {register.isPending ? copy.submitting : copy.registerInstitution}
              </Button>
            </>
          )}
          {current && (
            <p role="status">
              {copy.schoolStatus}: <strong>{statusLabel(current.status)}</strong>
              {current.accessEndsAt
                ? ` · ${copy.accessUntil} ${formatDate(current.accessEndsAt)}`
                : ""}
            </p>
          )}
          {myMembership.isLoading && <p role="status">{copy.loadingData}</p>}
          {myMembership.error && <p role="alert" className="text-sm text-destructive">{copy.queryError}</p>}
          {activeMembership && (
            <p role="status">
              {copy.activeStudentAccess} <strong>{activeMembership.school.institutionName}</strong>
              {` · ${copy.accessUntilStudent} ${formatDate(activeMembership.member.accessEndsAt)}.`}
            </p>
          )}
          {isStaff.error && <p role="alert" className="text-sm text-destructive">{copy.queryError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.redeemTitle}</CardTitle>
          <CardDescription>{copy.redeemDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            aria-label={copy.tokenLabel}
            placeholder={copy.tokenPlaceholder}
            value={inviteToken}
            maxLength={64}
            onChange={(event) => setInviteToken(event.target.value.trim())}
          />
          <Button
            disabled={redeemInvite.isPending || inviteToken.length !== 64}
            onClick={() => redeemInvite.mutate({ token: inviteToken })}
          >
            {redeemInvite.isPending ? copy.verifyingInvite : copy.redeemInvite}
          </Button>
        </CardContent>
      </Card>

      {current?.status === "approved" && (
        <Card>
          <CardHeader>
            <CardTitle>{copy.invitesTitle}</CardTitle>
            <CardDescription>{copy.invitesDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                aria-label={copy.studentEmail}
                placeholder={copy.studentEmail}
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
              />
              <Button
                disabled={createInvite.isPending || !studentEmail.trim()}
                onClick={() => createInvite.mutate({ studentEmail: studentEmail.trim() })}
              >
                {copy.createInvite}
              </Button>
            </div>
            {approvedInviteToken && (
              <div className="flex gap-2">
                <Input aria-label={copy.tokenLabel} readOnly value={approvedInviteToken} />
                <Button variant="outline" onClick={copyInviteToken}>{copy.copyToken}</Button>
              </div>
            )}
            {mySchool.error && <p role="alert" className="text-sm text-destructive">{copy.queryError}</p>}
            {(mySchool.data?.invites || []).map((invite) => (
              <div key={invite.id} className="flex items-center gap-2 border-b py-2 text-sm">
                <span className="mr-auto">{invite.studentEmail} · {statusLabel(invite.status)}</span>
                {invite.status === "pending" && (
                  <Button
                    size="sm"
                    disabled={approveInvite.isPending}
                    onClick={() => approveInvite.mutate({ inviteId: invite.id })}
                  >
                    {copy.approveGenerateToken}
                  </Button>
                )}
              </div>
            ))}
            {(mySchool.data?.members || []).map((member) => (
              <div key={member.member.id} className="flex items-center gap-2 border-b py-2 text-sm">
                <span className="mr-auto">
                  {member.email || member.name || copy.student} · {
                    member.member.revokedAt
                      ? copy.accessRevoked
                      : member.member.accessEndsAt <= new Date()
                        ? copy.accessExpired
                        : `${copy.accessUntilStudent} ${formatDate(member.member.accessEndsAt)}`
                  }
                </span>
                {!member.member.revokedAt && member.member.accessEndsAt > new Date() && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={revokeMember.isPending}
                    onClick={() => revokeMember.mutate({ memberId: member.member.id })}
                  >
                    {copy.revokeStudent}
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
            <CardTitle>{copy.staffTitle}</CardTitle>
            <CardDescription>{copy.staffDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.isLoading && <p role="status">{copy.loadingData}</p>}
            {pending.error && <p role="alert" className="text-sm text-destructive">{copy.queryError}</p>}
            {pending.data?.length === 0 && <p>{copy.staffEmpty}</p>}
            {(pending.data || []).map((item) => (
              <div key={item.id} className="flex items-center gap-2 border-b py-2">
                <span className="mr-auto">{item.institutionName} · {item.institutionEmail}</span>
                <Button
                  size="sm"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ schoolId: item.id, status: "approved" })}
                >
                  {copy.approve}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ schoolId: item.id, status: "rejected" })}
                >
                  {copy.reject}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
