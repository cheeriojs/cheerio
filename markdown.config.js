/* Config for markdown-magic */
module.exports = {
  transforms: {
    /* Match <!-- AUTO-GENERATED-CONTENT:START (CONTRIBUTORS) --> */
    CONTRIBUTORS: require("markdown-magic-github-contributors")
  }
};
