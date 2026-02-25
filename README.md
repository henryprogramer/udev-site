# Udev Site Institucional

Site institucional estático da **UDEV - StartUP**, com duas áreas:

- **Público**: páginas para usuários/clientes (`/`, `/vendapro/`, `/downloads/`, `/contato/`)
- **Empresa**: painel de gestão (`/empresa/`) para editar informações, cadastrar produtos e banners

## Estrutura

```text
/
├── CNAME
├── index.html
├── empresa/
│   └── index.html
├── vendapro/
│   └── index.html
├── downloads/
│   └── index.html
├── contato/
│   └── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── links.js
│   │   ├── main.js
│   │   ├── public-site.js
│   │   └── empresa-admin.js
│   ├── data/
│   │   └── site-content.json
│   └── img/
└── README.md
```

## Dados reais padrão

O conteúdo inicial já está configurado com os contatos oficiais:

- Empresa: `udev.oficial@gmail.com`
- Instagram: `https://www.instagram.com/udev.oficial/`
- Desenvolvedor/CO-CEO: Pedro Henrique Santos Silva (`pedrohenrique.dev.contato@gmail.com`, `+55 (63) 98441-2348`)

Fonte dos dados públicos:

- `assets/data/site-content.json`

## Área da empresa (`/empresa/`)

No painel interno você pode:

- editar informações institucionais e contatos
- cadastrar/editar/remover banners
- cadastrar/editar/remover produtos
- exportar/importar JSON de conteúdo
- salvar rascunho local no navegador
- aplicar pré-visualização local com `?preview=1`
- conectar Google e sincronizar JSON no Drive
- enviar imagens para o Drive e usar as URLs públicas

## Google Drive API

Configuração central em:

- `assets/js/links.js`

Campos principais:

- `googleClientId`
- `googleDriveScope`
- `driveContentFileName`
- `publicContentDriveFileId` (opcional)

### Fluxo recomendado

1. Acesse `/empresa/`.
2. Clique em **Conectar Google**.
3. Cadastre banners/produtos e ajuste os dados institucionais.
4. Use **Salvar JSON no Drive** para sincronizar o conteúdo.
5. Use upload de imagem no painel para gerar URLs no formato Drive.

## Publicação no GitHub Pages

Configurado para:

- branch `main`
- pasta `/ (root)`

## Domínio

Arquivo `CNAME`:

```text
unidev.dev.br
```

## Observações de segurança

- Este projeto é estático e não possui backend.
- Não coloque `client_secret` no frontend.
- O arquivo `credentials.json` deve permanecer fora do site publicado.
- Downloads e artes devem permanecer em armazenamento externo (Google Drive).
