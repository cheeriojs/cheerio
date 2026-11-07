import type { AnyNode, Element } from 'domhandler';
import type { Cheerio } from '../cheerio.js';
import type { prop } from './attributes.js';

type ExtractDescriptorFn = (
  el: Element,
  key: string,
  // TODO: This could be typed with ExtractedMap
  obj: Record<string, unknown>,
) => unknown;

interface ExtractDescriptor {
  selector: string;
  value?: string | ExtractDescriptorFn | ExtractMap;
}

type ExtractValue = string | ExtractDescriptor | [string | ExtractDescriptor];

/** Descriptor map used by {@link extract}. */
export type ExtractMap = Record<string, ExtractValue>;

type ExtractedValue<V extends ExtractValue> = V extends [
  string | ExtractDescriptor,
]
  ? NonNullable<ExtractedValue<V[0]>>[]
  : V extends string
    ? string | undefined
    : V extends ExtractDescriptor
      ? V['value'] extends infer U
        ? U extends ExtractMap
          ? ExtractedMap<U> | undefined
          : U extends ExtractDescriptorFn
            ? ReturnType<U> | undefined
            : ReturnType<typeof prop> | undefined
        : never
      : never;

/** Result type computed from an {@link ExtractMap}. */
export type ExtractedMap<M extends ExtractMap> = {
  [key in keyof M]: ExtractedValue<M[key]>;
};

function getExtractDescr(
  descr: string | ExtractDescriptor,
): Required<ExtractDescriptor> {
  if (typeof descr === 'string') {
    return { selector: descr, value: 'textContent' };
  }

  return {
    selector: descr.selector,
    value: descr.value ?? 'textContent',
  };
}

/**
 * Extract multiple values from a document, and store them in an object.
 *
 * @param map - An object containing key-value pairs. The keys are the names of
 *   the properties to be created on the object, and the values are the
 *   selectors to be used to extract the values.
 * @returns An object containing the extracted values.
 */
export function extract<M extends ExtractMap, T extends AnyNode>(
  this: Cheerio<T>,
  map: M,
): ExtractedMap<M> {
  const ret: Record<string, unknown> = {};

  for (const key in map) {
    if (!Object.hasOwn(map, key)) continue;
    const descr = map[key];
    const isArray = Array.isArray(descr);

    const { selector, value } = getExtractDescr(isArray ? descr[0] : descr);

    const fn: ExtractDescriptorFn =
      typeof value === 'function'
        ? value
        : typeof value === 'string'
          ? (el: Element) => this._make(el).prop(value)
          : (el: Element) => this._make(el).extract(value);

    if (isArray) {
      const arr = this._findBySelector(selector, Number.POSITIVE_INFINITY)
        .toArray()
        .map((el) => fn(el, key, ret))
        .filter((value) => value != null);
      Object.defineProperty(ret, key, {
        value: arr,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      const $ = this._findBySelector(selector, 1);
      const val = $.length > 0 ? fn($[0], key, ret) : undefined;
      Object.defineProperty(ret, key, {
        value: val,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  }

  return ret as ExtractedMap<M>;
}
