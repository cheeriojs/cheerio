/**
 * TypeDoc plugin to convert functions that are children of classes or
 * interfaces to methods.
 *
 * They are functionally equivalent, and presenting them this way makes it
 * easier to consume the docs (as categories won't be split).
 */

/* eslint-disable jsdoc/no-types */
const td = require('typedoc');

/** @param {td.Application} app - The app. */
exports.load = function (app) {
  app.converter.on(td.Converter.EVENT_CREATE_DECLARATION, updateFnsToMethods);
};

/**
 * @param {td.Context} context - The context.
 * @param {td.DeclarationReflection} reflection - The reflection.
 */
function updateFnsToMethods(context, reflection) {
  if (
    reflection.kindOf(td.ReflectionKind.Function) &&
    reflection.parent?.kindOf(td.ReflectionKind.ClassOrInterface)
  ) {
    // Unset the `Function` flag, set the `Method` flag.
    reflection.kind ^= td.ReflectionKind.Function;
    reflection.kind |= td.ReflectionKind.Method;
  }
}
