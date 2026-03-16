# Comandos de desenvolvimento para o scaffold

up:
	docker compose up --build

down:
	docker compose down

dev-up:
	bash scripts/run_dev.sh

dev-down:
	bash scripts/stop_dev.sh

db-init:
	bash scripts/db_init.sh

db-migrate:
	bash scripts/db_migrate.sh
