fs = require "fs"

parser = require "../src/parser"
utils = require "../src/utils"

testdata = __dirname + "/testdata"

basic = fs.readFileSync "#{testdata}/basic.html", "utf8"

dom = parser.parse basic


console.log utils.print dom, 'children'