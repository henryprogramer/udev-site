# Udev Site Institucional

Site institucional estático oficial da Udev, publicado no GitHub Pages.

- Repositório: `udev-site`
- Stack: HTML + CSS + JavaScript puro (sem backend)
- Domínio customizado configurado: `unidev.dev.br`

## Estrutura

```text
/
├── CNAME
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

Edite somente os valores das URLs, mantendo as chaves:

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

## Publicação no GitHub Pages

Este projeto está configurado para publicar com:

- Branch: `main`
- Pasta: `/ (root)`

Se precisar reconfigurar:

1. Acesse `Settings` > `Pages` no GitHub.
2. Em `Build and deployment`, selecione:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
3. Salve e aguarde o build.

## Domínio próprio: unidev.dev.br

O domínio está definido no arquivo raiz `CNAME`:

```text
unidev.dev.br
```

No provedor DNS do domínio `dev.br`, o registro recomendado é:

- Tipo: `CNAME`
- Host/Nome: `unidev`
- Valor/Destino: `henryprogramer.github.io`

Após propagação DNS:

1. Verifique `Settings` > `Pages` no GitHub.
2. Ative `Enforce HTTPS` quando disponível.

## Observação importante

Este repositório **não** armazena arquivos grandes. Downloads devem sempre apontar para links externos (Google Drive, CDN ou outro servidor dedicado).
