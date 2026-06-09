export type ProviderConfig = {
  voiceProvider: 'livekit' | 'retell' | 'vapi' | 'bland' | 'custom';
  llmProvider: string;
  llmModel: string;
  embeddingProvider: string;
  embeddingModel: string;
  sttProvider: string;
  ttsProvider: string;
  temperature: number;
};

type Props = {
  value: ProviderConfig;
  onChange: (value: ProviderConfig) => void;
  readOnly?: boolean;
};

const selectClass =
  'focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:bg-slate-50';

export function ProviderConfigPanel({ value, onChange, readOnly = false }: Props) {
  function update<K extends keyof ProviderConfig>(key: K, next: ProviderConfig[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProviderField label="Voice orchestration">
        <select
          className={selectClass}
          value={value.voiceProvider}
          onChange={(event) => update('voiceProvider', event.target.value as ProviderConfig['voiceProvider'])}
          disabled={readOnly}
        >
          <option value="livekit">LiveKit</option>
          <option value="retell">Retell</option>
          <option value="vapi">Vapi</option>
          <option value="bland">Bland</option>
          <option value="custom">Custom</option>
        </select>
      </ProviderField>
      <ProviderField label="LLM provider">
        <select className={selectClass} value={value.llmProvider} onChange={(event) => update('llmProvider', event.target.value)} disabled={readOnly}>
          <option value="groq">Groq (default)</option>
          <option value="openai">OpenAI</option>
        </select>
      </ProviderField>
      <ProviderField label="LLM model">
        <input className={selectClass} value={value.llmModel} onChange={(event) => update('llmModel', event.target.value)} disabled={readOnly} />
      </ProviderField>
      <ProviderField label="Embeddings">
        <select className={selectClass} value={value.embeddingProvider} onChange={(event) => update('embeddingProvider', event.target.value)} disabled={readOnly}>
          <option value="openai">OpenAI (default)</option>
          <option value="cohere">Cohere</option>
        </select>
      </ProviderField>
      <ProviderField label="STT">
        <select className={selectClass} value={value.sttProvider} onChange={(event) => update('sttProvider', event.target.value)} disabled={readOnly}>
          <option value="deepgram">Deepgram</option>
          <option value="openai">OpenAI</option>
        </select>
      </ProviderField>
      <ProviderField label="TTS">
        <select className={selectClass} value={value.ttsProvider} onChange={(event) => update('ttsProvider', event.target.value)} disabled={readOnly}>
          <option value="elevenlabs">ElevenLabs</option>
          <option value="openai">OpenAI</option>
        </select>
      </ProviderField>
      <ProviderField label={`Temperature (${value.temperature.toFixed(1)})`}>
        <input
          className="w-full accent-emerald-700"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={value.temperature}
          onChange={(event) => update('temperature', Number(event.target.value))}
          disabled={readOnly}
        />
      </ProviderField>
    </div>
  );
}

function ProviderField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
