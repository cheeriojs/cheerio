import type { DomHandlerOptions } from 'domhandler';
import type { ParserOptions } from 'htmlparser2';

/** Options accepted by htmlparser2, the default parser for XML. */
export interface HTMLParser2Options extends DomHandlerOptions, ParserOptions {}
/** Options for parse5, the default parser for HTML. */
export interface Parse5Options {
  /** Disable scripting in parse5, so noscript tags would be parsed. */
  scriptingEnabled?: boolean;
  /** Enable location support for parse5. */
  sourceCodeLocationInfo?: boolean;
}

/** Internal options for Cheerio. */
export interface InternalOptions extends HTMLParser2Options, Parse5Options {
  _useHtmlParser2?: boolean;

  /** The base URI for the document. Used for the `href` and `src` props. */
  baseURI?: string | URL; // eslint-disable-line node/no-unsupported-features/node-builtins
}

/**
 * Options accepted by Cheerio.
 *
 * Please note that parser-specific options are _only recognized_ if the
 * relevant parser is used.
 */
export interface CheerioOptions extends HTMLParser2Options, Parse5Options {
  /** Recommended way of configuring htmlparser2 when wanting to parse XML. */
  xml?: HTMLParser2Options | boolean;

  /** The base URI for the document. Used for the `href` and `src` props. */
  baseURI?: string | URL; // eslint-disable-line node/no-unsupported-features/node-builtins
}

const defaultOpts: CheerioOptions = {
  xml: false,
  decodeEntities: true,
};

/** Cheerio default options. */
export default defaultOpts;

const xmlModeDefault: InternalOptions = {
  _useHtmlParser2: true,
  xmlMode: true,
};

export function flatten(
  options?: CheerioOptions | null
): InternalOptions | undefined {
  return options?.xml
    ? typeof options.xml === 'boolean'
      ? xmlModeDefault
      : { ...xmlModeDefault, ...options.xml }
    : options ?? undefined;
}
