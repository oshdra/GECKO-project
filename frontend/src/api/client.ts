export interface SimulatorSummary {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  versions: number[];
  latest_version: number;
  last_modified: string;
}

export interface GeckoSpecAgent {
  name: string;
  attributes: string[];
  behaviors: string[];
}

export interface GeckoSpecEnvironment {
  type: string;
  physics: string;
  attributes: string[];
}

export interface GeckoSpecInteraction {
  trigger: string;
  effect: string;
}

export interface GeckoSpec {
  name: string;
  version: number;
  created: string;
  modified: string;
  language?: string;
  tags: string[];
  rendering_library?: string;
  agents: GeckoSpecAgent[];
  environment: GeckoSpecEnvironment;
  interactions: GeckoSpecInteraction[];
  exports?: string[];
}

export interface SimulatorDetailData {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  versions: number[];
  latest_version: number;
  last_modified: string;
  spec: GeckoSpec;
  narrative?: string;
}

export interface SettingsData {
  gemini_api_key?: string;
  default_language?: string;
}

export interface ConceptProposal {
  concept_name: string;
  domain: string;
  summary: string;
  rendering_library: string;
  agents: GeckoSpecAgent[];
  environment: GeckoSpecEnvironment;
  interactions: GeckoSpecInteraction[];
  visualization_plan: string;
  spec_draft_yaml: string;
}

export interface GenerateEvent {
  step: number;
  status: 'running' | 'done' | 'error';
  message?: string;
  proposal?: ConceptProposal;
  viz_plan?: Record<string, any>;
  physics_model?: Record<string, any>;
  simulator_id?: string;
  version?: number;
  error?: string;
}

const API_BASE = '/api';

export async function fetchSimulators(): Promise<SimulatorSummary[]> {
  const res = await fetch(`${API_BASE}/simulators`);
  if (!res.ok) {
    throw new Error(`Failed to fetch simulators: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSimulator(id: string): Promise<SimulatorDetailData> {
  const res = await fetch(`${API_BASE}/simulators/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch simulator ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSettings(): Promise<SettingsData> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.statusText}`);
  }
  return res.json();
}

export async function updateSettings(data: SettingsData): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update settings: ${res.statusText}`);
  }
  return res.json();
}

export function getSimulatorHtmlUrl(id: string, version: number): string {
  return `${API_BASE}/simulators/${encodeURIComponent(id)}/html/${version}`;
}

async function readSseStream(
  res: Response,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Readable stream not available on response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      const dataLine = block.split('\n').find((l) => l.startsWith('data: '));
      if (dataLine) {
        const jsonText = dataLine.replace(/^data:\s*/, '').trim();
        if (jsonText) {
          try {
            const ev: GenerateEvent = JSON.parse(jsonText);
            onEvent(ev);
          } catch (e) {
            console.warn('Failed to parse SSE JSON data:', jsonText);
          }
        }
      }
    }
  }
}

export async function generateProposalSse(
  concept: string,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ concept }),
  });

  if (!res.ok) {
    throw new Error(`Generation endpoint returned HTTP ${res.status}`);
  }

  await readSseStream(res, onEvent);
}

export async function generateFullSimulatorSse(
  proposal: ConceptProposal,
  concept: string,
  onEvent: (event: GenerateEvent) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/generate/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ proposal, concept }),
  });

  if (!res.ok) {
    throw new Error(`Execute endpoint returned HTTP ${res.status}`);
  }

  await readSseStream(res, onEvent);
}

