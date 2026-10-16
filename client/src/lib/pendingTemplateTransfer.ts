type PendingTemplateTransfer = {
  userId: string;
  name: string;
  code: string;
  fileName: string;
};

let pendingTransfer: PendingTemplateTransfer | null = null;

export function setPendingTemplateTransfer(
  userId: string | number,
  template: Omit<PendingTemplateTransfer, 'userId'>,
) {
  pendingTransfer = { ...template, userId: String(userId) };
}

export function takePendingTemplateTransfer(userId: string | number) {
  const transfer = pendingTransfer;
  pendingTransfer = null;
  return transfer?.userId === String(userId) ? transfer : null;
}

export function clearPendingTemplateTransfer() {
  pendingTransfer = null;
}
