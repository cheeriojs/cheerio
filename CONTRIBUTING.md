# Contributing to Cheerio

Thanks for your interest in contributing to the project! Here's a rundown of
how we'd like to work with you:

1. File an issue on GitHub describing the contribution you'd like to make. This
   will help us to get you started on the right foot.
2. Create a single commit that addresses the issue:
    1. Follow the project's code style (see below)
    2. Add enough unit tests to "prove" that your patch is correct
    3. Update the project documentation as needed (see below)
    4. Describe your approach with as much detail as necessary in the git
       commit message
3. Open a pull request, and reference the initial issue in the pull request
   message.

# Documentation

Any API change should be reflected in the project's README.md file. Reuse
[jQuery's documentation](http://api.jquery.com) wherever possible, but take
care to note aspects that make Cheerio distinct.

# Code Style

This section is by no means complete. For undocumented stylistic choices,
please try to maintain consistency with the code base.

- Single quotes: `'`
- Whitespace
  - Two-space "soft" tabs
  - Once space following control flow statements (`if (condition) {` rather
    than `if(condition) {`)
  - Remove trailing spaces
  - [End each file with a newline
    character.](https://github.com/editorconfig/editorconfig/wiki/Newline-at-End-of-File-Support)
- Terminate every statement with a semicolon
