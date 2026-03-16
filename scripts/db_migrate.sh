#!/usr/bin/env bash
# Alias para inicializacao/migracao de banco Django.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash "$ROOT_DIR/scripts/db_init.sh"
