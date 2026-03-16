#!/usr/bin/env bash
# Para servidor Django iniciado por scripts/run_dev.sh.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"
PID_FILE="$RUN_DIR/django.pid"

stop_by_pid_file() {
  if [[ ! -f "$PID_FILE" ]]; then
    echo "Django: sem PID salvo."
    return
  fi

  local pid
  pid="$(cat "$PID_FILE")"

  if kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
    echo "Django: processo $pid encerrado."
  else
    echo "Django: processo $pid ja nao estava ativo."
  fi

  rm -f "$PID_FILE"
}

stop_by_pid_file

# Fallback para processos sem PID salvo.
pkill -f 'manage.py runserver 0.0.0.0:8000' >/dev/null 2>&1 || true
pkill -f 'uvicorn app.main:app --host 0.0.0.0 --port 8000' >/dev/null 2>&1 || true

if command -v fuser >/dev/null 2>&1; then
  fuser -k -n tcp 8000 >/dev/null 2>&1 || true
fi
