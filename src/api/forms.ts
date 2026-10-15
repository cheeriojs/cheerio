import {
  type AnyNode,
  type Element,
  hasChildren,
  isDocument,
  isTag,
} from 'domhandler';
import type { Cheerio } from '../cheerio.js';

/*
 * https://github.com/jquery/jquery/blob/2.1.3/src/manipulation/var/rcheckableType.js
 * https://github.com/jquery/jquery/blob/2.1.3/src/serialize.js
 */
const submittableSelector = 'input,select,textarea,keygen';
const r20 = /%20/g;
const rCRLF = /\r?\n/g;

/**
 * Group controls by their owner with one traversal of the current HTML tree.
 *
 * @private
 * @param root - Root of the forms' current tree.
 * @returns Controls in tree order, grouped by form.
 */
function getFormControls(root: AnyNode): Map<Element, Element[]> {
  const connected = isDocument(root);
  const firstById = new Map<string, Element>();
  const controls: [Element, Element | undefined][] = [];
  const pending: [AnyNode, Element | undefined][] = [[root, undefined]];

  while (pending.length > 0) {
    const [node, ancestor] = pending.pop()!;
    let owner = ancestor;
    if (isTag(node)) {
      const { id } = node.attribs;
      if (id && !firstById.has(id)) firstById.set(id, node);
      if (node.name === 'form') owner = node;
      else if (['input', 'select', 'textarea', 'keygen'].includes(node.name)) {
        controls.push([node, owner]);
      }
    }
    if (hasChildren(node)) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        pending.push([node.children[i], owner]);
      }
    }
  }

  const byOwner = new Map<Element, Element[]>();
  for (const [control, ancestor] of controls) {
    const { form: formId } = control.attribs;
    const owner =
      connected && formId !== undefined ? firstById.get(formId) : ancestor;
    if (owner?.name === 'form') {
      const owned = byOwner.get(owner);
      if (owned) owned.push(control);
      else byOwner.set(owner, [control]);
    }
  }
  return byOwner;
}

/**
 * Encode a set of form elements as a string for submission.
 *
 * @category Forms
 * @example
 *
 * ```js
 * $('<form><input name="foo" value="bar" /></form>').serialize();
 * //=> 'foo=bar'
 * ```
 *
 * @returns The serialized form.
 * @see {@link https://api.jquery.com/serialize/}
 */
export function serialize<T extends AnyNode>(this: Cheerio<T>): string {
  // Convert form elements into name/value objects
  const arr = this.serializeArray();

  // Serialize each element into a key/value string
  const retArr = arr.map(
    (data) =>
      `${encodeURIComponent(data.name)}=${encodeURIComponent(data.value)}`,
  );

  // Return the resulting serialization
  return retArr.join('&').replace(r20, '+');
}

/**
 * Encode a set of form elements as an array of names and values.
 * When a form is selected, controls in its document can be associated with it
 * using the `form` attribute instead of being descendants of the form.
 *
 * @category Forms
 * @example
 *
 * ```js
 * $('<form><input name="foo" value="bar" /></form>').serializeArray();
 * //=> [ { name: 'foo', value: 'bar' } ]
 * ```
 *
 * @returns The serialized form.
 * @see {@link https://api.jquery.com/serializeArray/}
 */
export function serializeArray<T extends AnyNode>(
  this: Cheerio<T>,
): {
  name: string;
  value: string;
}[] {
  // Cache only within this call so later DOM mutations are reflected.
  const controlsByRoot = new Map<AnyNode, Map<Element, Element[]>>();

  // Resolve all form elements from either forms or collections of form elements
  return this.map((_, elem) => {
    const $elem = this._make(elem);
    if (isTag(elem) && elem.name === 'form') {
      if (this.options.xmlMode) {
        return $elem.find(submittableSelector).toArray();
      }
      let root: AnyNode = elem;
      while (root.parent) root = root.parent;
      let controls = controlsByRoot.get(root);
      if (!controls) {
        controls = getFormControls(root);
        controlsByRoot.set(root, controls);
      }
      return controls.get(elem) ?? [];
    }
    return $elem.filter(submittableSelector).toArray();
  })
    .filter(
      // Verify elements have a name (`attr.name`) and are not disabled (`:enabled`)
      '[name!=""]:enabled' +
        // And cannot be clicked (`[type=submit]`) or are used in `x-www-form-urlencoded` (`[type=file]`)
        ':not(:submit, :button, :image, :reset, :file)' +
        // And are either checked/don't have a checkable state
        ':matches([checked], :not(:checkbox, :radio))',
      // Convert each of the elements to its value(s)
    )
    .map<
      AnyNode,
      {
        name: string;
        value: string;
      }
    >((_, elem) => {
      const $elem = this._make(elem);
      const name = $elem.attr('name');
      if (!name) return [];
      // If there is no value set (e.g. `undefined`, `null`), then default value to empty
      const value = $elem.val() ?? '';

      // If we have an array of values (e.g. `<select multiple>`), return an array of key/value pairs
      if (Array.isArray(value)) {
        return value.map((val) =>
          /*
           * We trim replace any line endings (e.g. `\r` or `\r\n` with `\r\n`) to guarantee consistency across platforms
           * These can occur inside of `<textarea>'s`
           */
          ({ name, value: val.replace(rCRLF, '\r\n') }),
        );
      }
      // Otherwise (e.g. `<input type="text">`, return only one key/value pair
      return { name, value: value.replace(rCRLF, '\r\n') };
    })
    .toArray();
}
