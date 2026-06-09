export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export type SupportedDialectCode = 'syl';

export type LanguageConfig = {
  code: string;
  dialect?: string | null;
  fallbackCode?: string;
};

const languageNames = new Map<string, string>(
  SUPPORTED_LANGUAGES.map((language) => [language.code, language.name]),
);

const sylhetiMarkers = [
  'আফনে',
  'আমরার',
  'তুমার',
  'কিতা',
  'কুনু',
  'অইছে',
  'অইবো',
  'নাইনে',
  'লাগি',
  'গেছইন',
  'আইছইন',
  'afne',
  'amrar',
  'kita',
  'kunu',
  'oise',
  'oibo',
  'nai ni',
  'lagi',
];

export function getLanguageName(code: string): string {
  return languageNames.get(code.toLowerCase()) ?? code.toUpperCase();
}

export function resolveLanguage(requested: string | null, config: LanguageConfig): string {
  const normalized = requested?.trim().toLowerCase();
  if (normalized && languageNames.has(normalized)) return normalized;
  if (languageNames.has(config.code.toLowerCase())) return config.code.toLowerCase();
  return config.fallbackCode?.toLowerCase() || 'en';
}

export function detectDialectFromText(
  text: string,
): SupportedDialectCode | null {
  const normalized = text.toLocaleLowerCase();
  const matches = sylhetiMarkers.reduce(
    (count, marker) => count + (normalized.includes(marker) ? 1 : 0),
    0,
  );

  return matches >= 1 ? 'syl' : null;
}

export function buildLanguageInstruction(config: LanguageConfig): string {
  const languageName = getLanguageName(config.code);

  if (config.code === 'bn' && config.dialect === 'syl') {
    return [
      'Speak in natural Sylheti Bengali when the caller uses Sylheti markers.',
      'Use familiar Sylheti vocabulary and cadence, while keeping wording broadly understandable.',
      'Do not claim to speak the separate Sylheti Nagri script unless the caller explicitly requests it.',
      'If dialect confidence is low, use standard conversational Bengali and mirror the caller gently.',
    ].join(' ');
  }

  return [
    `Use ${languageName} as the primary response language.`,
    'Match the caller’s language when they clearly switch languages.',
    'Preserve names, addresses, numbers, and technical terms accurately.',
    'If you cannot confidently understand the caller, ask one short clarifying question instead of guessing.',
  ].join(' ');
}
