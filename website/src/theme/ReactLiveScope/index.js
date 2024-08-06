import React from 'react';
import * as cheerio from '../../../../dist/browser/index.js';

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  cheerio,
  // @ts-expect-error - `render` is not part of the React types
  show: (x) => React.render(JSON.stringify(x, null, 2)),
  ...React,
};
export default ReactLiveScope;
