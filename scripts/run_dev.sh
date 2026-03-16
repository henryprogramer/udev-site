#!/usr/bin/env bash
# Script unico para preparar ambiente local e subir Django.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.venv"
RUN_DIR="$ROOT_DIR/.run"
LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$RUN_DIR/django.pid"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: comando '$1' nao encontrado."
    exit 1
  fi
}

is_running() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

port_in_use() {
  local port="$1"
  ss -ltn "sport = :$port" | tail -n +2 | grep -q .
}

wait_port_free() {
  local port="$1"
  local retries=35

  while (( retries > 0 )); do
    if ! port_in_use "$port"; then
      return 0
    fi
    sleep 0.2
    retries=$((retries - 1))
  done

  echo "Erro: porta $port ainda ocupada."
  ss -ltnp | grep ":$port" || true
  exit 1
}

stop_previous() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if is_running "$pid"; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$PID_FILE"
  fi

  pkill -f 'manage.py runserver 0.0.0.0:8000' >/dev/null 2>&1 || true
  pkill -f 'uvicorn app.main:app --host 0.0.0.0 --port 8000' >/dev/null 2>&1 || true
  if command -v fuser >/dev/null 2>&1; then
    fuser -k -n tcp 8000 >/dev/null 2>&1 || true
  fi
  wait_port_free 8000
}

echo "[1/5] Validando dependencias..."
require_cmd python3

if [[ ! -f "$ROOT_DIR/.env" ]]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "Arquivo .env criado a partir de .env.example"
fi

mkdir -p "$RUN_DIR" "$LOG_DIR" "$ROOT_DIR/data"

echo "[2/5] Criando/atualizando venv..."
python3 -m venv "$VENV_DIR"
if ! "$VENV_DIR/bin/python" -m pip --version >/dev/null 2>&1; then
  echo "Pip nao encontrado no venv. Tentando instalar..."
  if ! "$VENV_DIR/bin/python" -m ensurepip --upgrade >/dev/null 2>&1; then
    echo "Erro: pip/ensurepip indisponivel. Instale o pacote python3-venv da sua distro."
    exit 1
  fi
fi
"$VENV_DIR/bin/python" -m pip install --upgrade pip >/dev/null
"$VENV_DIR/bin/python" -m pip install -r "$ROOT_DIR/requirements.txt" >/dev/null

echo "[3/5] Encerrando execucoes antigas..."
stop_previous

echo "[4/5] Aplicando migrações e preparando conta gestora..."
(
  cd "$ROOT_DIR/django_app"
  "$VENV_DIR/bin/python" manage.py makemigrations core --noinput >/dev/null
  "$VENV_DIR/bin/python" manage.py migrate --noinput > "$LOG_DIR/django.log" 2>&1
  "$VENV_DIR/bin/python" manage.py bootstrap_manager >> "$LOG_DIR/django.log" 2>&1
)

echo "[5/5] Subindo servidor Django..."
(
  cd "$ROOT_DIR/django_app"
  nohup setsid "$VENV_DIR/bin/python" manage.py runserver 0.0.0.0:8000 --noreload </dev/null >> "$LOG_DIR/django.log" 2>&1 &
  echo $! > "$PID_FILE"
)

sleep 2

DJANGO_PID="$(cat "$PID_FILE")"
if ! is_running "$DJANGO_PID"; then
  echo "Django falhou ao iniciar. Veja: $LOG_DIR/django.log"
  exit 1
fi

MANAGER_EMAIL="${MANAGER_REGISTRATION_EMAIL:-}"
if [[ -z "$MANAGER_EMAIL" && -f "$ROOT_DIR/.env" ]]; then
  MANAGER_EMAIL="$(grep -E '^MANAGER_REGISTRATION_EMAIL=' "$ROOT_DIR/.env" | tail -n 1 | cut -d '=' -f 2-)"
fi
MANAGER_EMAIL="${MANAGER_EMAIL:-udev.oficial@gmail.com}"

echo ""
echo "Servico ativo:"
echo "- Site da startup Udev: http://localhost:8000"
echo "- Central de administracao do site: http://localhost:8000/gestao"
echo ""
echo "Log: $LOG_DIR/django.log"
echo "Para parar: bash scripts/stop_dev.sh"
