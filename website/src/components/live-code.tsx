import { Component, lazy, type ReactNode, Suspense, useState } from 'react';

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
    <div className="my-4 flex h-48 items-center justify-center rounded-lg border border-slate-700 text-sm text-slate-400">
      Loading the editor…
    </div>
  );
}

/*
 * The editor is a separate chunk from a third-party bundler, so it can fail to
 * load — a flaky network or a content blocker is enough. Without this, the
 * rejection unmounts the island and the reader loses the code sample they could
 * already see. Fall back to the static block instead.
 */
class EditorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  static getDerivedStateFromError() {
    return { failed: true };
  }

  state = { failed: false };

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function LiveCode({ code, children }: LiveCodeProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditorBoundary onError={() => setIsEditing(false)}>
        <Suspense fallback={<Loading />}>
          <SandpackEditor code={code} onClose={() => setIsEditing(false)} />
        </Suspense>
      </EditorBoundary>
    );
  }

  /*
   * The bar sits above the code rather than floating over it, so it can never
   * cover a long line, and it survives the block scrolling horizontally. It
   * also mirrors the editor's own toolbar, so opening one is a swap rather than
   * a jump. The button stays visible rather than appearing on hover: a
   * hover-only affordance is undiscoverable and unreachable on touch devices.
   */
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Example
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
        >
          Edit &amp; run
        </button>
      </div>
      {/* The block keeps `.prose pre`'s colours; drop its margin and radius so
          it reads as one unit with the bar above it. */}
      <div className="[&_pre]:my-0 [&_pre]:rounded-none">{children}</div>
    </div>
  );
}
