const LOCAL_EDIT_REQUEST = /\b(?:align(?:ment)?|center(?:ing)?|spacing|position(?:ing)?|resize|restyle|reposition|tweak|font(?:\s+size)?|color|colour|small change|minor change)\b|alline\w*|centr\w*|spaziatur\w*|posizion\w*|ridimension\w*|ritocc\w*|caratter\w*|font|color\w*|colore\w*|piccol[oaie]\s+modific\w*|modific\w*\s+(?:piccol[oaie]|minim\w*)/i;
const BROAD_EDIT_REQUEST = /\b(?:whole|entire|redesign|rebuild|rewrite|from scratch|start over|all pages)\b|tutta\s+la\s+pagina|pagina\s+intera|da\s+zero|rifai\s+(?:tutto|la pagina)|riprogett\w*|ricostru\w*|riscriv\w*/i;

export function isLocalizedAgentEditRequest(task: string) {
  return LOCAL_EDIT_REQUEST.test(task) && !BROAD_EDIT_REQUEST.test(task);
}

export const LOCALIZED_AGENT_EDIT_GUIDANCE = [
  "This is a localized edit to an existing project.",
  "Modify only the specific existing section/component and the minimum necessary styles or files.",
  "Preserve the complete content, structure, and behavior of every unrelated section and page.",
  "Never replace an existing page with only the requested section or rebuild the page unless explicitly asked.",
  "Return the complete existing file with the requested local change applied; do not omit unrelated content.",
].join(" ");
