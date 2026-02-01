'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';

const DRAFT_KEY = 'kogaion_ide_draft';
const DEFAULT_HTML = '<h1>Hello</h1>\n<p>Edit HTML, CSS, JS and run.</p>';
const DEFAULT_CSS = 'body { font-family: system-ui; padding: 1rem; }\nh1 { color: #c9a227; }';
const DEFAULT_JS = '// console.log("Hello");';

function loadDraft(): { title: string; html: string; css: string; js: string } {
  if (typeof window === 'undefined') {
    return { title: 'Untitled', html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS };
  }
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const d = JSON.parse(raw) as { title?: string; html?: string; css?: string; js?: string };
      return {
        title: d.title ?? 'Untitled',
        html: d.html ?? DEFAULT_HTML,
        css: d.css ?? DEFAULT_CSS,
        js: d.js ?? DEFAULT_JS,
      };
    }
  } catch {
    // ignore
  }
  return { title: 'Untitled', html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS };
}

function saveDraft(title: string, html: string, css: string, js: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ title, html, css, js })
    );
  } catch {
    // ignore
  }
}

function buildPreviewDoc(html: string, css: string, js: string): string {
  const h = (html || '').trim() || '<div></div>';
  const c = (css || '').trim();
  const j = (js || '').trim();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${c}</style></head><body>${h}${j ? `<script>${j}</script>` : ''}</body></html>`;
}

export default function IdePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const d = loadDraft();
    setTitle(d.title);
    setHtml(d.html);
    setCss(d.css);
    setJs(d.js);
    setPreviewDoc(buildPreviewDoc(d.html, d.css, d.js));
  }, []);

  const updatePreview = useCallback(() => {
    setPreviewDoc(buildPreviewDoc(html, css, js));
  }, [html, css, js]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePreview();
      saveDraft(title, html, css, js);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, html, css, js, updatePreview]);

  const handleRun = () => {
    updatePreview();
  };

  const handleDeploy = async () => {
    const t = title.trim() || 'Untitled';
    const hasContent = [html, css, js].some((s) => (s || '').trim().length > 0);
    if (!hasContent) {
      setError('Add at least some HTML, CSS, or JS.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const body = {
        title: t,
        html: html.trim() || undefined,
        css: css.trim() || undefined,
        js: js.trim() || undefined,
        authorLabel: 'Anonymous',
      };
      if (projectId) {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, authorLabel: 'Anonymous' }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error || 'Update failed');
        }
        const data = await res.json();
        if (data.project?.id) {
          router.push(`/playground/projects/${data.project.id}`);
          return;
        }
      }
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Deploy failed');
      }
      const data = await res.json();
      const id = (data as { project?: { id?: string } }).project?.id;
      if (id) {
        setProjectId(id);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
        router.push(`/playground/projects/${id}`);
      } else {
        throw new Error('No project id returned');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deploy failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <div className="min-h-screen flex flex-col text-[var(--text-primary)]">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--tech-border-elevated)] bg-[var(--tech-surface)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/playground/projects"
              className="text-xs font-body text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors shrink-0"
            >
              ← Projects
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              className="bg-transparent border border-[var(--tech-border)] rounded px-2 py-1 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-w-0 max-w-[200px] focus:outline-none focus:ring-1 focus:ring-[var(--tech-accent)]"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={handleRun} className="text-xs">
              Run
            </Button>
            <Button
              variant="default"
              onClick={handleDeploy}
              disabled={saving}
              className="text-xs bg-[var(--tech-accent)]/20 border-[var(--tech-accent)]/30 text-[var(--tech-accent)] hover:bg-[var(--tech-accent)]/30"
            >
              {saving ? 'Deploying…' : 'Deploy'}
            </Button>
          </div>
        </div>
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm font-body">
            {error}
          </div>
        )}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="flex-1 flex flex-col md:flex-row border-b md:border-b-0 md:border-r border-[var(--tech-border-elevated)] min-h-[240px] md:min-h-0">
            <div className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-[var(--tech-border)]">
              <div className="px-2 py-1 text-xs font-mono text-[var(--text-muted)] border-b border-[var(--tech-border)] bg-[var(--tech-surface-elevated)]">
                HTML
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full min-h-[120px] p-2 font-mono text-sm text-[var(--text-primary)] bg-[var(--tech-bg)] border-0 resize-none focus:outline-none focus:ring-0"
                style={{ tabSize: 2 }}
              />
            </div>
            <div className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-[var(--tech-border)]">
              <div className="px-2 py-1 text-xs font-mono text-[var(--text-muted)] border-b border-[var(--tech-border)] bg-[var(--tech-surface-elevated)]">
                CSS
              </div>
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full min-h-[120px] p-2 font-mono text-sm text-[var(--text-primary)] bg-[var(--tech-bg)] border-0 resize-none focus:outline-none focus:ring-0"
                style={{ tabSize: 2 }}
              />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-2 py-1 text-xs font-mono text-[var(--text-muted)] border-b border-[var(--tech-border)] bg-[var(--tech-surface-elevated)]">
                JS
              </div>
              <textarea
                value={js}
                onChange={(e) => setJs(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full min-h-[120px] p-2 font-mono text-sm text-[var(--text-primary)] bg-[var(--tech-bg)] border-0 resize-none focus:outline-none focus:ring-0"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-[280px] md:min-h-0 bg-[var(--tech-surface-elevated)]">
            <div className="px-2 py-1 text-xs font-mono text-[var(--text-muted)] border-b border-[var(--tech-border)] bg-[var(--tech-surface)]">
              Preview
            </div>
            <div className="flex-1 min-h-0 bg-[var(--tech-bg)]">
              <iframe
                title="Preview"
                srcDoc={previewDoc}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
