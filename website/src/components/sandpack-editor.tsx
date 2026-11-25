import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { useCallback } from 'react';

interface SandpackEditorProps {
  code: string;
  onClose: () => void;
}

/*
 * Sandpack's editor does not size itself to its content, so a fixed height
 * either clips the example or leaves a large empty gap. Derive the height from
 * the line count instead, with a ceiling so a long example still scrolls rather
 * than pushing the rest of the page away.
 */
const LINE_HEIGHT = 22;
const EDITOR_PADDING = 32;
const MAX_EDITOR_HEIGHT = 460;

function editorHeight(source: string): number {
  const lines = source.split('\n').length;
  return Math.min(lines * LINE_HEIGHT + EDITOR_PADDING, MAX_EDITOR_HEIGHT);
}

const toolbarButton =
  'px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors';

function RunButton() {
  const { sandpack } = useSandpack();

  const handleRun = useCallback(() => {
    const { code } = sandpack.files['/index.js'];
    sandpack.updateFile('/index.js', code, true);
  }, [sandpack]);

  return (
    <button type="button" onClick={handleRun} className={toolbarButton}>
      Run
    </button>
  );
}

function ResetButton() {
  const { sandpack } = useSandpack();

  const handleReset = useCallback(() => sandpack.resetAllFiles(), [sandpack]);

  return (
    <button type="button" onClick={handleReset} className={toolbarButton}>
      Reset
    </button>
  );
}

function Toolbar({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Live editor
      </span>
      <div className="flex items-center gap-2">
        <RunButton />
        <ResetButton />
        <button
          type="button"
          onClick={onClose}
          className={toolbarButton}
          aria-label="Close the editor and go back to the code sample"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function SandpackEditor({ code, onClose }: SandpackEditorProps) {
  // Keep the import visible so the sample stays copy-pasteable.
  const source = `import * as cheerio from 'cheerio';\n\n${code}`;

  /*
   * Forced dark rather than `auto`: the site's static code blocks are dark in
   * both colour schemes, so an auto-themed editor would flip the block from
   * dark to light the moment a reader opened it.
   */
  return (
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-slate-700">
      <SandpackProvider
        template="vanilla"
        theme="dark"
        files={{ '/index.js': source }}
        customSetup={{
          // Pinned to the version this site documents, not whatever is latest.
          dependencies: { cheerio: __CHEERIO_VERSION__ },
        }}
      >
        <Toolbar onClose={onClose} />
        <SandpackCodeEditor
          showLineNumbers
          style={{ height: `${editorHeight(source)}px` }}
        />
        <SandpackConsole
          style={{ height: '160px' }}
          standalone
          showHeader
          showResetConsoleButton
          showSyntaxError
        />
      </SandpackProvider>
    </div>
  );
}
