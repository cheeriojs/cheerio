import React from 'react';
import * as cheerio from '../../../../dist/browser/index.js';

// Add react-live imports you need here
const ReactLiveScope = {
  cheerio,
  React,
  ...React,
};

export default ReactLiveScope;
