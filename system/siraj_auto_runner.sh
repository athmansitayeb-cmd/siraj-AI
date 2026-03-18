#!/usr/bin/env bash
set -e
HOME_ROOT="${HOME}"
while true; do
  bash "$HOME_ROOT/siraj/system/siraj_diagnostic.sh" || true
  sleep 1800
done
