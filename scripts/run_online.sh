#!/usr/bin/env bash
# Mantido por compatibilidade: agora apenas roda local (sem tunnel).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Modo online desativado por seguranca (sem tunnel externo)."
echo "Subindo stack Django local..."
echo ""

bash "$ROOT_DIR/scripts/run_dev.sh"

echo ""
echo "Acesso local: http://localhost:8000"
echo "Se precisar abrir em outro dispositivo da mesma rede, use o IP da sua maquina."
