var $ = require("../cheerio"),
    selectors = $.fn.filters;

selectors["root"] = function(){
  console.log('hi');
  return [$.root] || [];
};