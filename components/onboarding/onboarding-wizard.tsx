'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  Check,
  Loader2,
  Network,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const steps = [
  { title: 'Organization', icon: Building2 },
  { title: 'First agent', icon: Bot },
  { title: 'Providers', icon: Network },
  { title: 'Knowledge', icon: BookOpen },
] as const;

const languages = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'Bengali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
] as const;

const fieldClass =
  'focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700';

type Faq = { question: string; answer: string };

type OnboardingState = {
  organizationName: string;
  organizationType: string;
  industry: string;
  countryCode: string;
  timezone: string;
  website: string;
  agentName: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  sylhetiDialect: boolean;
  greetingMessage: string;
  voiceProvider: 'livekit' | 'retell' | 'vapi' | 'custom';
  llmProvider: 'groq';
  embeddingProvider: 'openai';
  sttProvider: 'deepgram';
  ttsProvider: 'elevenlabs';
  uploadLater: boolean;
  faqs: Faq[];
};

const initialState: OnboardingState = {
  organizationName: '',
  organizationType: 'business',
  industry: '',
  countryCode: 'US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  website: '',
  agentName: 'Customer Support Agent',
  defaultLanguage: 'en',
  supportedLanguages: ['en'],
  sylhetiDialect: false,
  greetingMessage: 'Hello! Thank you for calling. How can I help you today?',
  voiceProvider: 'livekit',
  llmProvider: 'groq',
  embeddingProvider: 'openai',
  sttProvider: 'deepgram',
  ttsProvider: 'elevenlabs',
  uploadLater: true,
  faqs: Array.from({ length: 3 }, () => ({ question: '', answer: '' })),
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleLanguage(code: string) {
    setForm((current) => {
      const selected = current.supportedLanguages.includes(code);
      const supportedLanguages = selected
        ? current.supportedLanguages.filter((language) => language !== code)
        : [...current.supportedLanguages, code];

      if (!supportedLanguages.includes(current.defaultLanguage)) {
        supportedLanguages.push(current.defaultLanguage);
      }

      return { ...current, supportedLanguages };
    });
  }

  function updateFaq(index: number, key: keyof Faq, value: string) {
    setForm((current) => ({
      ...current,
      faqs: current.faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, [key]: value } : faq)),
    }));
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (form.organizationName.trim().length < 2) return 'Enter an organization name.';
      if (!form.industry.trim()) return 'Enter your industry.';
      if (!form.countryCode.trim()) return 'Choose a country.';
      if (!form.timezone.trim()) return 'Enter a timezone.';
      if (form.website && !/^https?:\/\/.+/i.test(form.website)) {
        return 'Website must start with http:// or https://.';
      }
    }

    if (step === 1) {
      if (form.agentName.trim().length < 2) return 'Enter a name for your first agent.';
      if (!form.supportedLanguages.length) return 'Choose at least one supported language.';
      if (form.greetingMessage.trim().length < 5) return 'Enter a greeting message.';
    }

    if (step === 3) {
      const incompleteFaq = form.faqs.some(
        (faq) => Boolean(faq.question.trim()) !== Boolean(faq.answer.trim()),
      );
      if (incompleteFaq) return 'Each FAQ needs both a question and an answer.';
    }

    return null;
  }

  function moveNext() {
    const validationError = validateCurrentStep();
    setError(validationError);
    if (!validationError) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function finishSetup(event: FormEvent) {
    event.preventDefault();
    const validationError = validateCurrentStep();
    setError(validationError);
    if (validationError) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        message?: string;
        organizationId?: string;
        agentId?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to finish setup.');
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to finish setup.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-sm text-slate-500">Step {step + 1} of {steps.length}</span>
        </div>

        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          {steps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => index < step && setStep(index)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-xs font-medium sm:flex-row sm:justify-center',
                index === step ? 'bg-sidebar text-white' : index < step ? 'bg-brand-50 text-brand-700' : 'text-slate-400',
              )}
            >
              {index < step ? <Check className="size-4" /> : <item.icon className="size-4" />}
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        <form className="mt-6" onSubmit={finishSetup}>
          <Card>
            {step === 0 ? (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Set up your organization</CardTitle>
                  <CardDescription>These details configure regional and operational defaults.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <Field label="Organization name">
                    <Input value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} placeholder="Acme Support" />
                  </Field>
                  <Field label="Organization type">
                    <select className={fieldClass} value={form.organizationType} onChange={(e) => update('organizationType', e.target.value)}>
                      <option value="business">Business</option>
                      <option value="agency">Agency</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </Field>
                  <Field label="Industry">
                    <Input value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="Healthcare, retail, logistics..." />
                  </Field>
                  <Field label="Country">
                    <select className={fieldClass} value={form.countryCode} onChange={(e) => update('countryCode', e.target.value)}>
                      <option value="US">United States</option>
                      <option value="BD">Bangladesh</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="IN">India</option>
                      <option value="AE">United Arab Emirates</option>
                    </select>
                  </Field>
                  <Field label="Timezone">
                    <Input value={form.timezone} onChange={(e) => update('timezone', e.target.value)} placeholder="Asia/Dhaka" />
                  </Field>
                  <Field label="Website (optional)">
                    <Input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://example.com" type="url" />
                  </Field>
                </CardContent>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Create your first voice agent</CardTitle>
                  <CardDescription>Choose the languages and greeting callers will hear first.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Field label="Agent name">
                    <Input value={form.agentName} onChange={(e) => update('agentName', e.target.value)} />
                  </Field>
                  <Field label="Default language">
                    <select
                      className={fieldClass}
                      value={form.defaultLanguage}
                      onChange={(e) => {
                        const code = e.target.value;
                        update('defaultLanguage', code);
                        if (!form.supportedLanguages.includes(code)) {
                          update('supportedLanguages', [...form.supportedLanguages, code]);
                        }
                      }}
                    >
                      {languages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Supported languages">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {languages.map((language) => (
                        <label key={language.code} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                          <input type="checkbox" checked={form.supportedLanguages.includes(language.code)} onChange={() => toggleLanguage(language.code)} />
                          {language.name}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <label className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
                    <input className="mt-1" type="checkbox" checked={form.sylhetiDialect} onChange={(e) => update('sylhetiDialect', e.target.checked)} />
                    <span><strong>Enable Sylheti dialect support</strong><br />Adds a dedicated Sylheti language configuration alongside Bengali.</span>
                  </label>
                  <Field label="Greeting message">
                    <textarea className={`${fieldClass} min-h-24 py-3`} value={form.greetingMessage} onChange={(e) => update('greetingMessage', e.target.value)} />
                  </Field>
                </CardContent>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Choose provider defaults</CardTitle>
                  <CardDescription>Only provider names and configuration references are stored. Secrets are added later through secure settings.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <Field label="Voice orchestration">
                    <select className={fieldClass} value={form.voiceProvider} onChange={(e) => update('voiceProvider', e.target.value as OnboardingState['voiceProvider'])}>
                      <option value="livekit">LiveKit</option>
                      <option value="retell">Retell</option>
                      <option value="vapi">Vapi</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Field>
                  <ProviderField label="LLM provider" value="Groq" />
                  <ProviderField label="Embedding provider" value="OpenAI" />
                  <ProviderField label="Speech-to-text" value="Deepgram" />
                  <ProviderField label="Text-to-speech" value="ElevenLabs" />
                </CardContent>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Add starter knowledge</CardTitle>
                  <CardDescription>Add up to three FAQs now or upload documents from the dashboard later.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                    <input type="checkbox" checked={form.uploadLater} onChange={(e) => update('uploadLater', e.target.checked)} />
                    Upload documents and websites later
                  </label>
                  {form.faqs.map((faq, index) => (
                    <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                      <Field label={`FAQ ${index + 1} question`}>
                        <Input value={faq.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} placeholder="What are your opening hours?" />
                      </Field>
                      <Field label="Answer">
                        <textarea className={`${fieldClass} min-h-20 py-2`} value={faq.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} placeholder="We are open Monday to Friday..." />
                      </Field>
                    </div>
                  ))}
                </CardContent>
              </>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:items-center">
              {error ? <p role="alert" className="text-sm text-red-600 sm:mr-auto">{error}</p> : <span className="sm:mr-auto" />}
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={() => { setError(null); setStep((current) => current - 1); }}>
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
              ) : null}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={moveNext}>
                  Continue <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
                  Finish setup
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm font-medium text-slate-700"><span>{label}</span>{children}</label>;
}

function ProviderField({ label, value }: { label: string; value: string }) {
  return <Field label={label}><div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">{value} <span className="ml-auto text-xs text-brand-700">Default</span></div></Field>;
}
