#!/usr/bin/env bash
set -euo pipefail
log="${1:?usage: classify-gradle-failure.sh LOG}"
test -f "$log"
if grep -Eqi 'Downloading .*gradle-8\.2\.1-all\.zip failed: timeout|SocketTimeoutException|Read timed out|Received status code (429|500|502|503|504) from server|Server returned HTTP response code: (429|500|502|503|504) for URL: https://github\.com/gradle/gradle-distributions/releases/download/v8\.2\.1/gradle-8\.2\.1-all\.zip' "$log"; then
  printf 'retryable\n'
  exit 0
fi
printf 'non-retryable\n'
exit 1
