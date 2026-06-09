'use client';

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'txt']);

type UploadSuccess = {
  document?: { id: string; status: string };
  chunkCount?: number;
};

function validateFile(file: File) {
  const extension = file.name.toLowerCase().split('.').pop() ?? '';
  if (!ALLOWED_EXTENSIONS.has(extension)) return 'Choose a PDF, DOCX, or TXT file.';
  if (!file.size) return 'The selected file is empty.';
  if (file.size > MAX_FILE_BYTES) return 'The selected file is larger than 10 MB.';
  return null;
}

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<UploadSuccess | null>(null);

  function chooseFile(nextFile?: File) {
    if (!nextFile) return;
    const validationError = validateFile(nextFile);
    setError(validationError ?? '');
    setFile(validationError ? null : nextFile);
    setSuccess(null);
    setProgress(0);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  function upload() {
    if (!file || uploading) return;

    setUploading(true);
    setError('');
    setProgress(1);
    const formData = new FormData();
    formData.append('file', file);
    if (language.trim()) formData.append('language', language.trim());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/kb/upload');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.min(85, Math.round((event.loaded / event.total) * 85)));
      }
    };
    xhr.upload.onload = () => setProgress(90);
    xhr.onload = () => {
      let payload: UploadSuccess & { message?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText || '{}') as UploadSuccess & { message?: string };
      } catch {
        payload = { message: 'The server returned an invalid upload response.' };
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        setError(payload.message ?? 'Upload failed.');
        setUploading(false);
        return;
      }
      setProgress(100);
      setSuccess(payload);
      setUploading(false);
    };
    xhr.onerror = () => {
      setError('The upload could not reach the server.');
      setUploading(false);
    };
    xhr.send(formData);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-11 text-emerald-600" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Knowledge is ready</h2>
        <p className="mt-2 text-sm text-slate-600">
          {file?.name} was ingested into {success.chunkCount ?? 0} searchable chunks.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/knowledge-base"
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            View knowledge base
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setSuccess(null);
              setProgress(0);
            }}
          >
            Upload another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
          dragging ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50/60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={onInputChange}
          className="hidden"
        />
        <UploadCloud className="mx-auto size-10 text-brand-600" />
        <h2 className="mt-4 font-semibold text-slate-900">Drop your document here</h2>
        <p className="mt-1 text-sm text-slate-500">PDF, DOCX, or TXT up to 10 MB</p>
        <Button type="button" variant="outline" className="mt-5" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <FileText className="size-5 text-brand-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          {!uploading ? (
            <button
              type="button"
              aria-label="Remove file"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setFile(null)}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div>
        <label htmlFor="document-language" className="mb-2 block text-sm font-medium text-slate-700">
          Document language <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <Input
          id="document-language"
          value={language}
          disabled={uploading}
          onChange={(event) => setLanguage(event.target.value)}
          placeholder="en, es, bn-BD"
        />
      </div>

      {uploading ? (
        <div>
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>{progress < 90 ? 'Uploading document' : 'Extracting, chunking, and embedding'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="button" className="w-full" disabled={!file || uploading} onClick={upload}>
        {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UploadCloud className="mr-2 size-4" />}
        {uploading ? 'Processing...' : 'Upload and ingest'}
      </Button>
    </div>
  );
}
