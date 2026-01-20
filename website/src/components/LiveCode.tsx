import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react';

interface LiveCodeProps {
  code: string;
}

export function LiveCode({ code }: LiveCodeProps) {
  // Create a wrapper that runs the cheerio code and displays results
  const wrappedCode = `import * as cheerio from 'cheerio';

function App() {
  // User code starts here
${code
  .split('\n')
  .map((line) => '  ' + line)
  .join('\n')}
  // User code ends here
}

export default App;
`;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 not-prose">
      <SandpackProvider
        template="react"
        theme="auto"
        files={{
          '/App.js': wrappedCode,
        }}
        customSetup={{
          dependencies: {
            cheerio: 'latest',
          },
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers style={{ height: '300px' }} />
          <SandpackPreview style={{ height: '300px' }} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
