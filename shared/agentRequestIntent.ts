const FILE_CREATION_REQUEST = /\b(?:create|build|generate|implement|write|develop|add|fix|update)\b|crea|costru|genera|implement|scriv|svilupp|aggiung|corregg|aggiorn/i;
const NO_IMPLEMENTATION_REQUEST = /\b(?:do not|don't|never)\s+(?:create|build|generate|implement|write|develop|add|fix|update)\b|(?:non|senza)\s+(?:creare|costruire|generare|implementare|scrivere|sviluppare|aggiungere|correggere|aggiornare)\b/i;
const INFORMATIONAL_AGENT_REQUEST = /^(?:please\s+)?(?:explain|what is|why|how does|describe|define|compare|summarize|translate|answer|tell me)\b|^(?:spiega|rispondi|dimmi|cos[’']?è|perché|come funziona|descrivi|definisci|confronta|riassumi|traduci)\b/i;

export function isAgentFileCreationRequest(task: string) {
  return FILE_CREATION_REQUEST.test(task);
}

export function isInformationalAgentRequest(task: string) {
  const requestsImplementation = isAgentFileCreationRequest(task) && !NO_IMPLEMENTATION_REQUEST.test(task);
  return INFORMATIONAL_AGENT_REQUEST.test(task.trim()) && !requestsImplementation;
}
