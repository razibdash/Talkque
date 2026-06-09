'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { KnowledgeSearchResult } from '@/types/knowledge-base';

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [languageCode, setLanguageCode] = useState('');
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    setSearching(true);
    setError('');

    try {
      const response = await fetch('/api/kb/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          languageCode: languageCode.trim() || null,
          limit: 5,
          threshold: 0.5,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        results?: KnowledgeSearchResult[];
      };

      if (!response.ok) throw new Error(payload.message ?? 'Search failed.');
      setResults(payload.results ?? []);
      setHasSearched(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Search failed.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask a question your callers might ask..."
          minLength={2}
          required
        />
        <Input
          value={languageCode}
          onChange={(event) => setLanguageCode(event.target.value)}
          placeholder="Language"
          aria-label="Preferred result language"
        />
        <Button type="submit" disabled={searching || query.trim().length < 2}>
          {searching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
          Search
        </Button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {results.map((result) => (
          <div key={result.chunkId} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-500">
                {result.translated ? 'Translated result' : 'Source chunk'}
                {result.languageCode ? ` / ${result.languageCode.toUpperCase()}` : ''}
              </span>
              <span className="rounded-full bg-white px-2 py-1 font-semibold text-brand-700">
                {(result.similarity * 100).toFixed(1)}% match
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-700">{result.content}</p>
          </div>
        ))}
        {hasSearched && !results.length ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No chunks cleared the similarity threshold.
          </p>
        ) : null}
      </div>
    </div>
  );
}
