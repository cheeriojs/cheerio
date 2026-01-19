import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react';

interface LiveCodeProps {
  code: string;
  noInline?: boolean;
}

export function LiveCode({ code, noInline = false }: LiveCodeProps) {
  // Wrap the code to work with Cheerio in the browser
  const wrappedCode = noInline
    ? code
    : `
import * as cheerio from 'cheerio';

function App() {
  ${code}
}

export default App;
`;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
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
        options={{
          showNavigator: false,
          showTabs: false,
          editorHeight: 300,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers />
          <SandpackPreview />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
