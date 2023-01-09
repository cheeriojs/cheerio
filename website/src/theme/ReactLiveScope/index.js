import React from 'react';
import * as cheerio from '../../../../lib/index.js';

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  cheerio,
  show: (x) => React.render(JSON.stringify(x, null, 2)),
  ...React,
};
export default ReactLiveScope;
