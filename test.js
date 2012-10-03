if( !process.env.NODE_ENV ) process.env.NODE_ENV = 'test';
var path = require('path');
process.argv = [undefined, undefined, "test"]
require('jasmine-node/lib/jasmine-node/cli.js');