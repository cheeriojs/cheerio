var $ = require("../cheerio"),
    selectors = $.fn.filters;

selectors["root"] = function(){
    return [$.root] || [];
}
