#!/usr/bin/env bash
set -e

function error {
  echo Cheerio "generate_history.sh" script: $1 >&2
  false
}

if [ "$VERSION" == "" ] ; then
  error 'VERSION environment variable unset.'
fi

if [ "$PREVIOUS_VERSION" == "" ] ; then
  error 'PREVIOUS_VERSION environment variable unset.'
fi

tmp="$(mktemp -t "$(basename "$0").XXXXXXXXXX")"

log="$(git --no-pager log --no-merges --pretty="format: * %s (%an)" $PREVIOUS_VERSION..)"

printf "
$VERSION / $(date +"%Y-%m-%d")
==================

$log
" >"$tmp"

cat History.md >>"$tmp"

mv "$tmp" History.md
