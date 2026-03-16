# Udev - Stack Python + Django

Projeto refatorado para stack única com Django (sem túnel externo).

## O que está implementado

- Landing page institucional em Django Templates
- Tema claro/escuro com alternância
- Logo por tema:
  - `logo_empresa_dark.png` no light mode
  - `logo_empresa.png` no dark mode
- Espaçamento ampliado entre seções + efeitos visuais/glitch de fundo
- Cadastro e login de clientes com banco SQLite
- Regras de senha no cadastro: 8+ caracteres, maiúscula, número e especial
- Botão de exibir/ocultar senha nos formulários de autenticação
- Área autenticada de conta (`/conta/`)
- Portal de gestão isolado (`/gestao/`) para equipe gestora
- Ativação da gestão por token enviado para e-mail (`/gestao/token/` e `/gestao/ativar/`)
- Gestão de produtos com arquivo protegido e chave de segurança
- Edição de seções do site com publicação controlada
- Django admin (`/admin/`) disponível para equipe autorizada

## Rodar local

```bash
bash scripts/stop_dev.sh
bash scripts/run_dev.sh
```

Acesse:
- App: http://localhost:8000
- Portal de gestão: http://localhost:8000/gestao
- Admin Django: http://localhost:8000/admin

## Fluxo da conta gestora

Definido no `.env`:
- E-mail autorizado: `udev.oficial@gmail.com`
- Solicite token em: `http://localhost:8000/gestao/token/`
- Defina a senha em: `http://localhost:8000/gestao/ativar/`
- Em ambiente local, o token fica em `logs/mail_outbox/` (backend de e-mail em arquivo).

## Banco

- SQLite local em `./data/udev_django.db`
- Migrações/seed:

```bash
bash scripts/db_init.sh
```

## Observação sobre run_online

`bash scripts/run_online.sh` foi mantido apenas por compatibilidade e agora chama execução local sem túnel externo.
