# Udev Site Institucional

Site institucional estático da Udev, preparado para hospedagem no GitHub Pages.

## Estrutura

```text
/
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
├── vendapro/
│   └── index.html
├── downloads/
│   └── index.html
├── contato/
│   └── index.html
└── README.md
```

## Como alterar links externos

Todos os links externos ficam centralizados em:

- `assets/js/links.js`

Edite somente os valores de URL nas chaves existentes:

- `vendaproDownload`
- `vendaproOnline`
- `downloadVendaproDesktop`
- `downloadVendaproAndroid`
- `downloadImplementationGuide`
- `whatsapp`
- `email`

Exemplo:

```js
vendaproDownload: "https://drive.google.com/file/d/SEU_ARQUIVO/view"
```

## Publicar no GitHub Pages

1. Faça push da branch `main` para o GitHub.
2. No repositório, abra `Settings` > `Pages`.
3. Em `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
4. Salve as configurações.
5. Aguarde a publicação e acesse a URL gerada pelo GitHub Pages.

Formato esperado da URL:

- `https://SEU_USUARIO.github.io/udev-site/`

## Conectar domínio próprio

Quando quiser usar `unidev.dev.br` ou `udev.dev.br`:

1. Em `Settings` > `Pages`, informe o domínio no campo `Custom domain`.
2. No provedor DNS, configure:
   - `CNAME` para subdomínio (ex.: `www` -> `SEU_USUARIO.github.io`), ou
   - `A/ALIAS` para domínio raiz conforme IPs oficiais do GitHub Pages.
3. Crie/atualize o arquivo `CNAME` na raiz do projeto com o domínio final.
4. Aguarde propagação DNS e habilite `Enforce HTTPS` quando disponível.

## Observação importante

Este repositório não armazena arquivos grandes. Downloads devem ser distribuídos por links externos (Google Drive, CDN ou servidor dedicado).
