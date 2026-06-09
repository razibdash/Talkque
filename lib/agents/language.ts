export type LanguageConfig = {
  code: string;
  dialect?: string;
  fallbackCode: string;
};

export function resolveLanguage(requested: string | null, config: LanguageConfig): string {
  return requested?.trim() || config.code || config.fallbackCode;
}
