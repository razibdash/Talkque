type Props = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

export function PromptEditor({ value, onChange, readOnly = false }: Props) {
  return (
    <div>
      <textarea
        className="focus-ring min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 disabled:opacity-80"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        aria-label="Agent system prompt"
      />
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>Markdown sections are supported.</span>
        <span>{value.length.toLocaleString()} characters</span>
      </div>
    </div>
  );
}
