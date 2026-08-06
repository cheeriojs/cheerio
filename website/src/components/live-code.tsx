import { lazy, type ReactNode, Suspense, useState } from 'react';

/*
 * Sandpack is ~600 kB and spins up its own iframe, bundler connection and npm
 * install per instance. A guide can hold a dozen examples, so it is only loaded
 * once a reader actually asks to edit one. Until then they get the ordinary
 * syntax-highlighted code block that the Markdown pipeline already produced.
 */
const SandpackEditor = lazy(() => import('./sandpack-editor'));

interface LiveCodeProps {
  /** The raw source, handed to the editor when it opens. */
  code: string;
  /** The highlighted code block, rendered by the Markdown pipeline. */
  children?: ReactNode;
}

function Loading() {
  return (
    <div className="not-prose my-4 flex h-48 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      Loading the editor…
    </div>
  );
}

export function LiveCode({ code, children }: LiveCodeProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <Suspense fallback={<Loading />}>
        <SandpackEditor code={code} onClose={() => setIsEditing(false)} />
      </Suspense>
    );
  }

  /*
   * The button stays visible rather than appearing on hover: a hover-only
   * affordance is undiscoverable and unreachable on touch devices.
   */
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="absolute right-3 top-3 rounded-md border border-slate-600 bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
      >
        Edit &amp; run
      </button>
    </div>
  );
}
