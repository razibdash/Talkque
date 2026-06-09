import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUPPORTED_LANGUAGES } from '@/lib/agents/language';

export type EditableLanguageConfig = {
  languageCode: string;
  dialectCode: string;
  firstMessage: string;
  voiceId: string;
  isDefault: boolean;
  isEnabled: boolean;
};

type Props = {
  value: EditableLanguageConfig[];
  onChange: (value: EditableLanguageConfig[]) => void;
};

const selectClass =
  'focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700';

export function LanguageConfigEditor({ value, onChange }: Props) {
  function update(index: number, patch: Partial<EditableLanguageConfig>) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function addLanguage() {
    const next = SUPPORTED_LANGUAGES.find(
      (language) => !value.some((item) => item.languageCode === language.code && !item.dialectCode),
    );
    if (!next) return;
    onChange([
      ...value,
      {
        languageCode: next.code,
        dialectCode: '',
        firstMessage: '',
        voiceId: '',
        isDefault: value.length === 0,
        isEnabled: true,
      },
    ]);
  }

  function makeDefault(index: number) {
    onChange(value.map((item, itemIndex) => ({ ...item, isDefault: itemIndex === index })));
  }

  return (
    <div className="space-y-3">
      {value.map((language, index) => (
        <div
          key={`${language.languageCode}-${language.dialectCode}-${index}`}
          className="grid gap-3 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1fr_1fr_2fr_auto]"
        >
          <select
            className={selectClass}
            value={language.languageCode}
            onChange={(event) => update(index, { languageCode: event.target.value, dialectCode: '' })}
            aria-label="Language"
          >
            {SUPPORTED_LANGUAGES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name} ({option.nativeName})
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={language.dialectCode}
            onChange={(event) => update(index, { dialectCode: event.target.value })}
            disabled={language.languageCode !== 'bn'}
            aria-label="Dialect"
          >
            <option value="">Standard</option>
            {language.languageCode === 'bn' ? <option value="syl">Sylheti launch wedge</option> : null}
          </select>
          <Input
            value={language.firstMessage}
            onChange={(event) => update(index, { firstMessage: event.target.value })}
            placeholder="Localized first message"
            aria-label="First message"
          />
          <div className="flex items-center justify-end gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="radio"
                name="default-language"
                checked={language.isDefault}
                onChange={() => makeDefault(index)}
              />
              Default
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              disabled={value.length === 1}
              aria-label="Remove language"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
        <Plus className="mr-2 size-4" />
        Add language
      </Button>
    </div>
  );
}
