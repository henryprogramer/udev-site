#!/usr/bin/env bash
# Inicializa banco Django (migrate + preparação de conta gestora).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.venv"

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  python3 -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --upgrade pip >/dev/null
"$VENV_DIR/bin/pip" install -r "$ROOT_DIR/requirements.txt" >/dev/null

mkdir -p "$ROOT_DIR/data"

(
  cd "$ROOT_DIR/django_app"
  "$VENV_DIR/bin/python" manage.py makemigrations core --noinput >/dev/null
  "$VENV_DIR/bin/python" manage.py migrate --noinput
  "$VENV_DIR/bin/python" manage.py bootstrap_manager
)
