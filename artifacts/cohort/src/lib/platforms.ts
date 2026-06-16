export const PLATFORM_LABELS: Record<string, string> = {
  "openai-assistants": "OpenAI Assistants",
  "zendesk-ai": "Zendesk AI",
  "salesforce-agentforce": "Salesforce Agentforce",
  "github-copilot": "GitHub Copilot",
};

export function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform;
}

export const PLATFORM_AREA: Record<string, string> = {
  "openai-assistants": "Atendimento",
  "zendesk-ai": "Suporte",
  "salesforce-agentforce": "Comercial",
  "github-copilot": "Engenharia",
};

export function platformArea(platform: string): string {
  return PLATFORM_AREA[platform] ?? "Outros";
}
