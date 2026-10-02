# Visualizador de Notícias Radio Memory

Aplicação web em **Angular** que consome um endpoint autenticado na AWS e **lista, filtra, busca e exibe** posts (cards) com boa apresentação visual. Desenvolvida como teste prático para a Radio Memory.

## Sumário

1. [Funcionalidades](#1-funcionalidades)
2. [Stack](#2-stack)
3. [Como rodar](#3-como-rodar)
4. [Segurança](#4-segurança)
5. [Decisões técnicas](#5-decisões-técnicas)
6. [Interface e identidade visual](#6-interface-e-identidade-visual)
7. [Regras de negócio](#7-regras-de-negócio)
8. [Testes](#8-testes)
9. [Build e deploy](#9-build-e-deploy)
10. [Estrutura de pastas](#10-estrutura-de-pastas)
11. [Limitações conhecidas](#11-limitações-conhecidas)
12. [Atendimento ao edital](#12-atendimento-ao-edital)

---

## 1. Funcionalidades

**Cabeçalho**
- Logo oficial, título e **barra de busca com seletor de categoria no canto superior direito**, sempre visível (o cabeçalho fica fixo no topo ao rolar a página).
- Por estar fora das rotas, a busca funciona em **qualquer página**: ao buscar estando no detalhe de um post, o usuário volta para a lista já filtrada.

**Listagem**
- Cards com imagem (ou a **logo da marca** sobre fundo suave quando o post não tem imagem), categoria, título, subtítulo, autor e data em pt-BR (`dd/MM/yyyy HH:mm`).
- Paginação visual com botão **"Carregar mais"** (de 6 em 6 cards), que volta à primeira página quando a busca ou a categoria muda.
- Cards **fixados (pin)** aparecem primeiro, com borda de destaque laranja e o rótulo "Fixado".
- O card inteiro é clicável e acessível por teclado (foco visível).

**Filtros e busca**
- Filtro por **categoria**, com as categorias montadas dinamicamente a partir dos dados da API.
- **Busca** por título e subtítulo, sem diferenciar maiúsculas de minúsculas, combinável com a categoria.
- Os filtros ficam na **URL** (`?busca=...&categoria=...`): dá para recarregar a página ou compartilhar o link mantendo o resultado. O seletor de categoria também reflete a URL após o F5.

**Detalhe do post (`/post/:id`)**
- Corpo em HTML **sanitizado** (texto justificado em telas largas), imagem de destaque, **vídeo do YouTube** em player responsivo (16:9), categoria, autor, data e botão **"Ler no site original"** (abre em nova aba).
- O botão **"Voltar à Lista"** devolve os filtros que estavam ativos.

**Estados da interface**
- **Carregando:** 6 skeletons (shimmer) com a mesma estrutura do card real.
- **Erro:** cartão com ícone, mensagem e botão **"Tentar novamente"**, que recarrega os dados sem F5.
- **Vazio:** cartão com ícone de busca e uma sugestão, quando o filtro não retorna nada (diferente do erro de rede).
- **No detalhe:** "Carregando notícia..." e "Notícia não encontrada" são estados distintos.

**Rodapé institucional**
- Reproduz o rodapé do site da Radio Memory: logo, horário de funcionamento, contato (telefone e e-mail clicáveis), redes sociais (Instagram, Facebook, LinkedIn e YouTube), selos ANVISA e LGPD e o copyright com o ano calculado automaticamente.

## 2. Stack

| Tecnologia | Uso |
| --- | --- |
| Angular (versão mais recente, v22) | Framework: componentes standalone, signals, `computed`, `linkedSignal`, fluxo de controle `@if` / `@for` |
| TypeScript | Tipagem estática (contrato `Post`) |
| RxJS | Requisição HTTP, `catchError`, `finalize` |
| SCSS | Estilização |
| Vitest (via `ng test`) | Testes unitários |
| Node.js + npm | Ecossistema e gerenciador de pacotes |
| Prettier | Formatação automática (`.prettierrc`) |

O edital exige Angular 15 ou superior.

## 3. Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org) (versão LTS mais recente) e npm.
- Angular CLI: `npm install -g @angular/cli`

> **Windows:** o PowerShell bloqueia a execução de scripts por padrão e o comando `ng` pode falhar. Se isso acontecer, execute uma vez:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Instalação
```bash
npm install
```

### Configuração do TOKEN e da URL (variáveis de ambiente)
1. Em `src/environments/`, copie `environment.development.example.ts` para `environment.development.ts`.
2. Abra `environment.development.ts` e preencha:
   - `apiUrl`: URL base da API (fornecida no edital);
   - `token`: token JWT de teste (fornecido no edital).

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'URL_BASE_DA_API',
  token: 'SEU_TOKEN_AQUI',
};
```

O arquivo `environment.development.ts` está no `.gitignore` e **nunca é versionado**. O `environment.ts` (versionado) contém apenas o placeholder.

### Executar
```bash
ng serve
```
Acesse `http://localhost:4200`.

### Como o projeto foi criado
```bash
ng new visualizador-noticias --routing --style=scss
ng generate environments
```

## 4. Segurança

### Token fora do repositório
- `environment.ts` (versionado) tem só o placeholder `SEU_TOKEN_AQUI`.
- `environment.development.ts` (valores reais) está no `.gitignore`; o exemplo versionado mostra o formato esperado.
- O token é anexado por um **`AuthInterceptor`**, em um único ponto, junto com `Content-Type` e `Accept`. Nenhum serviço manipula credenciais.
- O interceptor **só anexa o token a requisições cuja URL começa com a URL da nossa API**. Se um dia houver chamadas a terceiros, o token não vaza.
- O interceptor é registrado em `app.config.ts` com `provideHttpClient(withInterceptorsFromDi())`.

**Verificar que o token não está no repositório ou no histórico:**
```bash
git grep -nE "eyJ[A-Za-z0-9_-]{20,}"                  # procura um JWT nos arquivos versionados
git log --all --oneline -G"eyJ[A-Za-z0-9_-]{20,}"     # procura um JWT no histórico
```
Os dois comandos não devem retornar nada. (Todo JWT começa com `eyJ`; o padrão exige letras e números logo depois, por isso este próprio texto não é encontrado.)

> **Limitação consciente:** por ser uma aplicação apenas front-end (o edital não prevê backend), o token enviado nas requisições continua visível na aba *Network* do navegador. Isso é inerente a qualquer aplicação sem servidor intermediário. Em produção, o ideal seria um proxy ou BFF que mantenha o token no servidor. O token do teste é público (consta no edital).

### HTML do corpo (XSS)
O campo `corpo` passa pelo **`SafeHtmlPipe`**, que usa `DomSanitizer.sanitize(SecurityContext.HTML)`. Foi descartado o `bypassSecurityTrustHtml`, pois ele desliga a proteção e permitiria `<script>` e `<img onerror>`.

Comportamento verificado em teste: `<script>` e `onerror` são removidos, e links `javascript:` são neutralizados pelo Angular (viram `unsafe:javascript:`).

### Vídeo
O **`SafeUrlPipe`** só aceita URLs que casem com `https://www.youtube.com/embed/...` ou `https://www.youtube-nocookie.com/embed/...`. Qualquer outro domínio, `http` ou `javascript:` é rejeitado. O pipe também trata valores nulos ou indefinidos.

### Links externos
"Ler no site original" e os links das redes sociais do rodapé usam `target="_blank"` com `rel="noopener noreferrer"`: o `noopener` impede que a página de destino manipule a nossa aba (tabnabbing) e o `noreferrer` oculta o cabeçalho de referência.

## 5. Decisões técnicas

### Arquitetura em camadas
| Camada | Arquivo | Responsabilidade |
| --- | --- | --- |
| Contrato de dados | `core/models/post.ts` | Interface `Post` tipada (autocomplete e segurança contra campos inexistentes) |
| Rede | `core/services/amneses-api.ts` | Só encapsula a chamada `POST` com `{ acao: 'getTodosCards' }` |
| Autenticação | `core/interceptors/auth-interceptor.ts` | Anexa token e cabeçalhos |
| Estado e regras | `core/services/posts-store.ts` | Fonte única de verdade (signals + `computed`) |
| Layout | `core/layout/site-footer` | Rodapé institucional, estático |
| Apresentação | `features/posts/components/*` | Componentes que apenas leem a Store |

### Store única com signals
Todo o estado (lista, filtros, loading, erro) e as regras de negócio (status, pin, ordenação, busca) ficam na `PostsStoreService`. Os componentes só leem o resultado pronto. A API é consultada **uma vez**, na inicialização: filtrar e buscar acontece em memória, sem nova requisição. O "Tentar novamente" refaz a chamada.

### Componentes "smart" e "dumb"
- `CardComponent` (**dumb**): recebe um post por `@Input` e o desenha. Não conhece a API nem a Store.
- `CardListComponent` (**smart**): conversa com a Store, controla a paginação e os estados (erro, loading, sucesso, vazio).
- `FilterBarComponent`: edita os filtros na Store e os sincroniza com a URL. Fica no cabeçalho, fora das rotas.
- `PostDetailComponent`: lê o post pelo `id` da rota.
- `SiteFooterComponent`: estático, sem dependências (`OnPush`).

### Roteamento
Duas rotas: `/` (lista) e `/post/:id` (detalhe). O detalhe lê o post por `getById(id)`, na lista **completa** (não na filtrada). Assim ele abre mesmo com filtro ativo e funciona com F5 direto na URL, pois mostra "Carregando" até a API responder.

### Filtros na URL (bônus do edital)
- **URL → Store:** ao abrir, recarregar ou voltar, a barra de filtros lê os `queryParams`. Quando um parâmetro some da URL, o filtro é limpo. As opções do seletor usam `[selected]`, para a categoria da URL aparecer marcada mesmo quando as opções chegam depois da API.
- **Store → URL:** a cada interação a URL é atualizada com `replaceUrl: true` (sem criar uma entrada de histórico por tecla digitada) e `queryParamsHandling: 'merge'` (preserva o outro filtro).
- Como a barra está no cabeçalho, o `navigate` relativo à raiz leva o usuário para a lista (`/`) mesmo quando ele busca dentro do detalhe.

### Performance
- `ChangeDetectionStrategy.OnPush` nos componentes (a tela atualiza por signals e `@Input`).
- `@for` com `track`, imagens com `loading="lazy"` (cards e selos do rodapé) e paginação visual com `slice`.
- Ícones das redes sociais, da busca e dos estados em **SVG inline**, sem imagens extras.
- O limite do "Carregar mais" usa `linkedSignal` e volta para a 1ª página quando a busca ou a categoria muda.
- Build de produção enxuto: cerca de 300 kB iniciais (aproximadamente 82 kB transferidos, comprimidos).

### Boas práticas Angular
Componentes standalone, injeção por `inject()`, `takeUntilDestroyed` nas assinaturas, `catchError` + `finalize` para os skeletons nunca ficarem presos, e código comentado em português explicando o porquê das decisões.

## 6. Interface e identidade visual

### Marca
- Azul institucional `#005a85` no cabeçalho e no rodapé, com a logo oficial (desenhada para fundo azul).
- Cabeçalho mais alto e encorpado: leve degradê, faixa escura na base e sombra, fixo no topo (`position: sticky`).
- Campo de busca e seletor de categoria brancos, com ícone de lupa e foco visível, sem painel branco ao redor.

### Cards e detalhe
- Cards sem imagem mostram a logo da marca sobre um fundo azul-claro suave, para não competir com o cabeçalho.
- Categoria em badge, título com link clicável no card inteiro e rodapé do card com autor e data.
- Detalhe reestilizado: painel branco centralizado (largura máxima de 820 px), cabeçalho com categoria, título, subtítulo e metadados, botões na cor da marca e corpo do texto **justificado** em telas largas (alinhado à esquerda no celular, onde justificar abre espaços grandes entre as palavras).

### Responsividade
- A grade de cards usa `minmax(min(100%, 300px), 1fr)`: 3 colunas em telas largas, menos colunas em telas menores e **sem rolagem horizontal** em telas muito estreitas.
- No cabeçalho, em telas menores (até 900 px), a busca desce para baixo da marca e ocupa toda a largura; no celular, o seletor de categoria fica embaixo da busca.
- No detalhe, e-mails e links longos quebram dentro do painel, em vez de estourar a borda.
- O rodapé empilha as seções, centralizadas, em telas pequenas, como no site oficial.

### Estados com acabamento
- Erro com cartão destacado em vermelho suave (ícone, título, mensagem e botão "Tentar novamente" na cor da marca).
- Vazio com cartão neutro (ícone de lupa e sugestão de ação).
- Botão "Carregar Mais" azul da marca, que inverte para branco ao passar o mouse.

### Rodapé (fiel ao site oficial)
- Logo centralizada, linha divisória, três áreas (Funcionamento, Contato com redes sociais e selos ANVISA e LGPD) e copyright com o ano calculado automaticamente.
- Telefone com `tel:` e e-mail com `mailto:`; as redes sociais apontam para os perfis oficiais da Radio Memory.
- Os links de contato têm azul um pouco mais claro que o do site, para manter contraste legível sobre o fundo azul.

### Acessibilidade
- `lang="pt-BR"` no `index.html` e `LOCALE_ID` pt-BR para as datas.
- Card acessível por teclado, com foco visível em links, botões, campos e ícones.
- `role="alert"` no erro, `role="status"` no estado vazio, `role="search"` na barra de busca, `aria-label` nos campos e nas redes sociais, `aria-hidden` nos skeletons e ícones decorativos.
- Respeito a `prefers-reduced-motion` (os skeletons ficam parados para quem pediu menos movimento).

## 7. Regras de negócio

| Regra | Implementação |
| --- | --- |
| Só `status === 1` | Filtro na entrada da Store: lista, categorias e detalhe nunca enxergam posts inativos |
| Pin | Post fixado se `data_fixo` **existe** e é **>= agora** (fuso do navegador) |
| Ordenação (definida uma única vez) | 1) fixados por `data_fixo` desc; 2) não fixados por `data` desc |
| Busca | Case-insensitive em `titulo` e `subtitulo` |
| Datas | `dd/MM/yyyy HH:mm`, em pt-BR |

## 8. Testes

```bash
ng test
```

São **10 arquivos e 31 testes**; nenhum chama a API real. Cobrem os casos mínimos do edital:

- **Fixados:** `data_fixo` futuro vai ao topo; com data vencida deixa de ser fixado.
- **Ordenação:** fixados por `data_fixo` desc; não fixados por `data` desc.
- **Filtro** por categoria `blog` e **busca** "JABRO" (qualquer caixa) em título e subtítulo.
- Apenas `status === 1`; categorias dinâmicas; `getById` com filtro ativo.
- Resposta fora do formato ou falha de rede vira estado de erro e encerra o carregamento.
- **Pipes:** `SafeHtmlPipe` (remove script e `onerror`) e `SafeUrlPipe` (aceita só embed do YouTube).
- **Componentes:** classe de fixado no card e 6 skeletons durante o carregamento.

Os avisos `WARNING: sanitizing HTML stripped some content` que aparecem no terminal durante os testes são esperados: é o próprio Angular informando que removeu o conteúdo perigoso, o que confirma que a sanitização está funcionando.

### Validação manual
- **Pin:** em `posts-store.ts` há um bloco comentado ("Demonstração do pin"). Descomentando-o, o 1º post ganha pin futuro e o 2º, pin vencido. Como a API real não tem fixados, isso permite ver a regra ao vivo.
- **Erro:** DevTools → Network → *Offline* e F5. Aparece o cartão com "Tentar novamente"; ao voltar a internet, o botão recarrega a lista sem F5.
- **Vazio:** digite um termo inexistente (por exemplo, `zzzz`) na busca.
- **Skeletons:** DevTools → Network → *Slow 3G* e F5.
- **XSS:** um post de teste com `<script>alert(1)</script>` e `<img src=x onerror=alert(1)>` no corpo não executa nada.
- **Responsividade:** DevTools em modo dispositivo, reduzindo a largura até o celular.

## 9. Build e deploy

```bash
ng build
```

Os arquivos estáticos são gerados em `dist/visualizador-noticias/`, na subpasta `browser/`.

- O build de produção usa `environment.ts`, que só tem o **placeholder** do token. Em uma versão publicada, o token deve ser injetado **no momento do build** (por exemplo, substituindo o placeholder em um pipeline de CI com um segredo), nunca commitado.
- Por ser uma SPA, o servidor precisa redirecionar qualquer rota para `index.html`, para que `/post/:id` funcione ao recarregar a página.
- **Deploy:** não publicado (item opcional do edital).

## 10. Estrutura de pastas

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/   auth-interceptor.ts
│   │   ├── layout/
│   │   │   └── site-footer/    site-footer.ts / .html / .scss
│   │   ├── models/         post.ts
│   │   ├── pipes/          safe-html-pipe.ts, safe-url-pipe.ts
│   │   └── services/       amneses-api.ts, posts-store.ts
│   ├── features/posts/components/
│   │   ├── card/
│   │   ├── card-list/
│   │   ├── filter-bar/     (exibida no cabeçalho)
│   │   └── post-detail/
│   ├── app.ts / app.html / app.scss   (cabeçalho, conteúdo e rodapé)
│   ├── app.config.ts
│   └── app.routes.ts
└── environments/           environment.ts, environment.development.example.ts
public/                     logo-idoc.png, selo-anvisa.png, selo-lgpd.png, favicon.ico
```

## 11. Limitações conhecidas

- O token fica visível na aba *Network* do navegador (ver [Segurança](#4-segurança)).
- A regra do pin compara com o relógio a cada recálculo. Se a data de um pin vencer com a página aberta, o card só sai do topo no próximo recálculo (ao filtrar ou recarregar).
- Não há backend nem login, conforme os não-requisitos do edital.
- O rodapé não inclui o gerenciador de cookies nem o chat do site oficial, pois a aplicação não usa cookies nem chat.
- A interface visual (cabeçalho, rodapé e responsividade) foi validada manualmente, sem testes automatizados de tela.

## 12. Atendimento ao edital

| Critério (ordem de importância) | Como foi atendido |
| --- | --- |
| 1. Requisitos | Listagem com "carregar mais", filtros, busca, detalhe, pin, ordenação, datas pt-BR, `status === 1`, `urlPost` em nova aba e vídeo responsivo |
| 2. Segurança (token) | Token fora do repositório, interceptor restrito à API, sanitização do `corpo` e validação da URL do vídeo |
| 3. UX/UI | Skeletons, erro com "Tentar novamente", estado vazio, busca no cabeçalho, layout responsivo, rodapé institucional e identidade visual da marca |
| 4. Boas práticas Angular | Standalone, signals, Store única, interceptor, OnPush, componentes smart/dumb e código comentado |
| 5. Desempenho | OnPush, `track`, imagens lazy, ícones SVG inline, paginação visual e requisição única |
| Bônus | Filtros na URL (querystring) e categorias montadas a partir dos dados |