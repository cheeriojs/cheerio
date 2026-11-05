import { type AnyNode, type Element, isTag } from 'domhandler';
import type { Cheerio } from '../cheerio.js';

/*
 * https://github.com/jquery/jquery/blob/2.1.3/src/manipulation/var/rcheckableType.js
 * https://github.com/jquery/jquery/blob/2.1.3/src/serialize.js
 */
const submittableSelector = 'input,select,textarea,keygen';
const submittableTagNames = new Set(['input', 'select', 'textarea', 'keygen']);
const r20 = /%20/g;
const rCRLF = /\r?\n/g;

function isSubmittable(node: AnyNode): node is Element {
  return isTag(node) && submittableTagNames.has(node.name);
}

function collectNodes(root: AnyNode, out: AnyNode[]): void {
  out.push(root);
  if ('children' in root) {
    for (const child of root.children) {
      collectNodes(child, out);
    }
  }
}

function rootOf(node: AnyNode): AnyNode {
  let current = node;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}

/**
 * Resolve the form owner of a submittable element.
 *
 * An explicit `form` attribute wins and never falls back to the ancestor form: if the ID does
 * not match the first element with that ID, or that element is not a form, the control has no
 * owner. Without a `form` attribute, the nearest ancestor form is the owner.
 *
 * @param node - submittable element
 * @param firstElementById - map of IDs to their first element in the document
 */
function formOwner(
  node: Element,
  firstElementById: Map<string, AnyNode>,
): AnyNode | null {
  const formId = node.attribs['form'];
  if (formId !== undefined) {
    const target = firstElementById.get(formId);
    return target !== undefined && isTag(target) && target.name === 'form'
      ? target
      : null;
  }

  let { parent } = node;
  while (parent) {
    if (isTag(parent) && parent.name === 'form') {
      return parent;
    }
    ({ parent } = parent);
  }
  return null;
}

/**
 * Collect all submittable elements owned by a form, in document order.
 *
 * This includes descendants and controls elsewhere in the document that point at the form with
 * the `form` attribute, and excludes descendants whose `form` attribute associates them with
 * another form (or with nothing).
 *
 * @param form - form element
 */
function formControls(form: Element): AnyNode[] {
  const nodes: AnyNode[] = [];
  collectNodes(rootOf(form), nodes);

  const firstElementById = new Map<string, AnyNode>();
  for (const node of nodes) {
    if (!isTag(node)) {
      continue;
    }
    const { id } = node.attribs;
    if (id !== undefined && !firstElementById.has(id)) {
      firstElementById.set(id, node);
    }
  }

  return nodes.filter(
    (node): node is Element =>
      isSubmittable(node) && formOwner(node, firstElementById) === form,
  );
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
  // Resolve all form elements from either forms or collections of form elements
  return this.map((_, elem) => {
    const $elem = this._make(elem);
    if (isTag(elem) && elem.name === 'form') {
      return formControls(elem);
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
