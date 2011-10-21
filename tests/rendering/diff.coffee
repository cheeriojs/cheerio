dmpmod = require 'diff_match_patch'
fs = require "fs"

diff = exports.diff = (a, b, file) ->
  dmp = new dmpmod.diff_match_patch();
  diff = dmp.diff_main a, b
  
  html = dmp.diff_prettyHtml diff

  fs.writeFileSync file, html
  return diff

module.exports = exports