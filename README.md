# UDEV Site Institucional

Projeto com duas áreas:

- **Site público**: `/`, `/vendapro/`, `/downloads/`, `/contato/`
- **Área da empresa**: `/empresa/`

Layout atual:

- tema preto e branco
- logo oficial em `assets/img/logo-udev.png`

## Regras de dados públicos

- Não há dados fictícios padrão no cliente.
- O conteúdo só aparece quando `meta.published = true` e dados essenciais existem.
- Se não houver conteúdo publicado, a página pública fica **em branco**.

Fonte de conteúdo (ordem):

1. API (`apiBaseUrl`) quando configurada
2. Google Drive (`publicContentDriveFileId`) quando configurado
3. `assets/data/site-content.json`

## Área da empresa (`/empresa/`)

Organizada em abas:

1. Empresa
2. Suporte e contato
3. Serviços e vendas
4. Banners
5. Produtos
6. Publicação e Drive

Funcionalidades:

- cadastro/edição/remoção de serviços
- cadastro/edição/remoção de banners
- cadastro/edição/remoção de produtos
- validação de produto por **ID de arquivo do Google Drive** com dono `udev.oficial@gmail.com`
- upload de imagens para Drive
- salvar/carregar JSON no Drive
- salvar/carregar JSON na API
- preview local com `?preview=1`

## Configuração (`assets/js/links.js`)

- `apiBaseUrl`
- `publicContentUrl`
- `publicContentDriveFileId`
- `googleClientId`
- `googleDriveScope`
- `driveContentFileName`
- `companyDriveOwnerEmail`

## Backend SQLite opcional (API)

Foi incluído backend em `backend/`:

- `backend/server.py`
- `backend/schema.sql`

Rotas:

- `GET /health`
- `GET /api/content`
- `PUT /api/content`

Rodar localmente:

```bash
cd backend
python3 server.py
```

API base local:

```text
http://localhost:8787
```

## Observação sobre PostgreSQL

GitHub Pages não executa backend/DB. Para PostgreSQL real em produção, use API externa (Supabase/Render/Fly etc.) e configure `apiBaseUrl`.

## Segurança

- Não publique `credentials.json`/`client_secret` no frontend.
- `.gitignore` já ignora arquivos de credencial comuns.
