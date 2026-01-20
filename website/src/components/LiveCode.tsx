import { useCallback, useEffect, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  useSandpack,
} from '@codesandbox/sandpack-react';

interface LiveCodeProps {
  code: string;
}

function ResetButton() {
  const { sandpack } = useSandpack();

  const handleReset = useCallback(() => sandpack.resetAllFiles(), [sandpack]);

  return (
    <button
      onClick={handleReset}
      className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      title="Reset code and re-run"
    >
      Reset
    </button>
  );
}

function RunButton() {
  const { sandpack } = useSandpack();

  const handleRun = () => {
    const { code } = sandpack.files['/index.js'];
    sandpack.updateFile('/index.js', code, true);
  };

  return (
    <button
      onClick={handleRun}
      className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      title="Run code"
    >
      Run
    </button>
  );
}

function Toolbar({ originalCode }: { originalCode: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
        Live Editor
      </span>
      <div className="flex items-center gap-2">
        <RunButton />
        <ResetButton originalCode={originalCode} />
      </div>
    </div>
  );
}

export function LiveCode({ code }: LiveCodeProps) {
  // Wrap user code to run immediately and output via console.log
  const wrappedCode = `import * as cheerio from 'cheerio';

${code}
`;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 not-prose">
      <SandpackProvider
        template="vanilla"
        theme="auto"
        files={{
          '/index.js': wrappedCode,
        }}
        customSetup={{
          dependencies: {
            cheerio: 'latest',
          },
        }}
      >
        <Toolbar originalCode={wrappedCode} />
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers style={{ height: '300px' }} />
          <SandpackConsole
            style={{ height: '300px' }}
            standalone
            showHeader
            showResetConsoleButton
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
