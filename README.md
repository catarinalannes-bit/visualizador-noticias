# Visualizador de Notícias Radio Memory

Aplicação web em **Angular** que consome um endpoint autenticado na AWS e **lista, filtra, busca e exibe** posts (cards) com a identidade visual da Radio Memory. Desenvolvida como teste prático para a Radio Memory.

**Aplicação publicada:** [visualizador-noticias.vercel.app](https://visualizador-noticias.vercel.app)
**Repositório:** [github.com/catarinalannes-bit/visualizador-noticias](https://github.com/catarinalannes-bit/visualizador-noticias)

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
- Logo oficial, título e **barra de busca com seletor de categoria**, fixos no topo ao rolar a página.
- Por estar fora das rotas, a busca funciona em **qualquer página**: ao buscar estando no detalhe de um post, o usuário volta para a lista já filtrada.

**Banner de destaque (página inicial)**
- Foto da equipe com camada azul da marca, efeito **parallax** feito só com CSS, faixa diagonal laranja e a chamada "Acompanhe as novidades da maior rede de tecnologia em Radiologia Odontológica".
- Exibido apenas na listagem. Na página de uma notícia ficam só o cabeçalho e o rodapé, para o foco ficar na leitura.

**Listagem**
- Cards com imagem, categoria, título, subtítulo, autor e data em pt-BR (`dd/MM/yyyy HH:mm`).
- Cards sem imagem exibem um **ícone por categoria** (Blog, Treinamento, Marketing) sobre o azul da marca. Categorias novas, sem ícone definido, mostram a logo oficial.
- O autor aparece como nome ("Reis") e o **e-mail completo** surge ao passar o mouse.
- **Barra de resultados** com o total ("9 notícias" / "3 notícias encontradas") e botão **"Limpar filtros"**, exibido só quando há busca ou categoria ativa.
- Paginação visual com **"Carregar mais"** (de 6 em 6 cards), que volta à primeira página quando a busca ou a categoria muda.
- Cards **fixados (pin)** aparecem primeiro, com faixa laranja e o rótulo "Fixado".
- O card inteiro é clicável e acessível por teclado (foco visível), com zoom suave na imagem ao passar o mouse.

**Filtros e busca**
- Filtro por **categoria**, com as opções montadas dinamicamente a partir dos dados da API.
- **Busca** por título e subtítulo, sem diferenciar maiúsculas de minúsculas, combinável com a categoria.
- Filtros persistidos na **URL** (`?busca=...&categoria=...`): é possível recarregar a página ou compartilhar o link mantendo o resultado.

**Detalhe do post (`/post/:id`)**
- Corpo em HTML **sanitizado**, imagem de destaque, **vídeo do YouTube** em player responsivo (16:9), categoria, autor (e-mail completo), data e botão **"Ler no site original"** (nova aba).
- **Título da aba** com o nome da notícia ("Nome da notícia | Radio Memory").
- **Compartilhamento** por WhatsApp, LinkedIn e "Copiar link", com confirmação visual.
- Seção **"Leia também:"** com até 3 notícias da mesma categoria.
- O botão **"Voltar à Lista"** devolve os filtros que estavam ativos.

**Estados da interface**
- **Carregando:** 6 skeletons (shimmer) com a mesma proporção do card real.
- **Erro:** cartão com ícone, mensagem e botão **"Tentar novamente"**, que recarrega os dados sem F5.
- **Vazio:** cartão com ícone de busca e uma sugestão, quando o filtro não retorna nada (diferente do erro de rede).
- **No detalhe:** "Carregando notícia..." e "Notícia não encontrada" são estados distintos.

**Navegação e rodapé**
- Botão flutuante **"voltar ao topo"**, exibido depois de 600 px de rolagem.
- Rodapé institucional fiel ao site oficial: logo, horário de funcionamento, contato (telefone e e-mail clicáveis), redes sociais, selos **ANVISA** (com link para a consulta do registro do produto) e **LGPD**, e copyright com o ano calculado automaticamente.

## 2. Stack

| Tecnologia | Uso |
| --- | --- |
| Angular (versão mais recente, v22) | Componentes standalone, signals, `computed`, `linkedSignal`, `effect`, `toSignal` e controle de fluxo `@if` / `@for` / `@switch` |
| TypeScript | Tipagem estática (contrato `Post`) |
| RxJS | Requisição HTTP, `catchError`, `finalize` e eventos do roteador |
| SCSS | Estilização, com design tokens em variáveis CSS e placeholders SCSS |
| Vitest (via `ng test`) | Testes unitários |
| Node.js + npm | Ecossistema e gerenciador de pacotes |
| Prettier | Formatação automática (`.prettierrc`) |
| Vercel | Hospedagem e deploy contínuo a partir do GitHub |

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
git clone https://github.com/catarinalannes-bit/visualizador-noticias.git
cd visualizador-noticias
npm install
```

### Configuração do TOKEN e da URL
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

O `environment.development.ts` está no `.gitignore` e **nunca é versionado**. O `environment.ts` (versionado) contém apenas o placeholder. No `angular.json`, a configuração `development` troca um pelo outro (`fileReplacements`).

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
- `environment.development.ts` (valores reais) está no `.gitignore`; o arquivo de exemplo versionado mostra o formato esperado.
- No deploy, o token é cadastrado como **variável de ambiente** na Vercel e injetado apenas no momento do build (ver [Build e deploy](#9-build-e-deploy)).
- O token é anexado por um **`AuthInterceptor`**, em um único ponto, junto com `Content-Type` e `Accept`. Nenhum serviço manipula credenciais.
- O interceptor **só anexa o token a requisições cuja URL começa com a URL da API**. Se um dia houver chamadas a terceiros, o token não vaza.
- O interceptor é registrado em `app.config.ts` com `provideHttpClient(withInterceptorsFromDi())`.

**Verificar que o token não está no repositório nem no histórico:**
```bash
git grep -nE "eyJ[A-Za-z0-9_-]{20,}"                  # procura um JWT nos arquivos versionados
git log --all --oneline -G"eyJ[A-Za-z0-9_-]{20,}"     # procura um JWT em todo o histórico
```
Os dois comandos não retornam nada. (Todo JWT começa com `eyJ`; o padrão exige letras e números logo depois, por isso este próprio texto não é encontrado.)

> **Limitação consciente:** por ser uma aplicação apenas front-end (o edital não prevê backend), o token enviado nas requisições fica visível na aba *Network* do navegador e no JavaScript publicado. Isso é inerente a qualquer aplicação sem servidor intermediário. O que o projeto garante é que o token **não está versionado** e só é enviado à URL da API. Em produção, o ideal seria um proxy ou BFF que mantenha o token no servidor. O token do teste é público (consta no edital).

### HTML do corpo (XSS)
O campo `corpo` passa pelo **`SafeHtmlPipe`**, que usa `DomSanitizer.sanitize(SecurityContext.HTML)`. Foi descartado o `bypassSecurityTrustHtml`, pois ele desliga a proteção e permitiria `<script>` e `<img onerror>`.

Comportamento verificado em teste: `<script>` e `onerror` são removidos, e links `javascript:` são neutralizados pelo Angular (viram `unsafe:javascript:`).

### Vídeo
O **`SafeUrlPipe`** só aceita URLs que casem com `https://www.youtube.com/embed/...` ou `https://www.youtube-nocookie.com/embed/...`. Qualquer outro domínio, `http` ou `javascript:` é rejeitado. O pipe também trata valores nulos ou indefinidos.

### Links externos
"Ler no site original", o selo da ANVISA, os links das redes sociais e os botões de compartilhamento usam `target="_blank"` com `rel="noopener noreferrer"`: o `noopener` impede que a página de destino manipule a nossa aba (*tabnabbing*) e o `noreferrer` oculta o cabeçalho de referência. Os links de compartilhamento codificam título e endereço com `encodeURIComponent`.

## 5. Decisões técnicas

### Arquitetura em camadas
| Camada | Arquivo | Responsabilidade |
| --- | --- | --- |
| Contrato de dados | `core/models/post.ts` | Interface `Post` tipada (autocomplete e segurança contra campos inexistentes) |
| Rede | `core/services/amneses-api.ts` | Só encapsula a chamada `POST` com `{ acao: 'getTodosCards' }` |
| Autenticação | `core/interceptors/auth-interceptor.ts` | Anexa token e cabeçalhos |
| Estado e regras | `core/services/posts-store.ts` | Fonte única de verdade (signals + `computed`) |
| Transformação | `core/pipes/` | `SafeHtmlPipe`, `SafeUrlPipe` e `AuthorNamePipe` |
| Layout | `core/layout/` | Rodapé, banner e botão "voltar ao topo" (moldura comum a todas as páginas) |
| Apresentação | `features/posts/components/*` | Componentes que apenas leem a Store |

A regra de organização é: **`core` não conhece telas; `features` usa o `core`.**

### Store única com signals
Todo o estado (lista, filtros, loading, erro) e as regras de negócio (status, pin, ordenação, busca) ficam na `PostsStoreService`. Os componentes só leem o resultado pronto. A API é consultada **uma vez**, na inicialização: filtrar e buscar acontece em memória, sem nova requisição. O "Tentar novamente" refaz a chamada.

A Store também expõe:
- `hasActiveFilters` (`computed`) e `clearFilters()`, usados pelo botão "Limpar filtros";
- `getById(id)`, que procura na lista **completa** (não na filtrada), para o detalhe funcionar com qualquer filtro ativo;
- `getRelated(post, limite)`, que devolve as notícias da mesma categoria para o "Leia também".

### Componentes "smart" e "dumb"
- `CardComponent` (**dumb**): recebe um post por `@Input` e o desenha. Não conhece a API nem a Store. É reaproveitado na listagem e no "Leia também".
- `CardListComponent` (**smart**): conversa com a Store, controla a paginação, a barra de resultados e os estados (erro, loading, sucesso, vazio).
- `FilterBarComponent`: edita os filtros na Store e os sincroniza com a URL. Fica no cabeçalho, fora das rotas.
- `PostDetailComponent`: lê o post pelo `id` da rota, atualiza o título da aba e oferece compartilhamento e relacionadas.
- `SiteFooterComponent`, `HeroBannerComponent` e `BackToTopComponent`: componentes de layout em `core/layout`, todos `OnPush`.

### Pipes
- **`SafeHtmlPipe`** e **`SafeUrlPipe`**: segurança (ver [Segurança](#4-segurança)).
- **`AuthorNamePipe`** (`authorName`): transforma o e-mail do autor em nome legível (`reis@radiomemory.com.br` → `Reis`; `joao.silva@...` → `Joao Silva`). Trata valores vazios e textos que não são e-mail. É um pipe puro: só recalcula quando o valor muda.

### Roteamento
- Duas rotas: `/` (lista) e `/post/:id` (detalhe), com títulos de aba no formato "página | site".
- **Rota reativa:** o detalhe lê o `id` com `toSignal(route.paramMap)`, e não com `snapshot`. Ao navegar de uma notícia para outra pelo "Leia também", o Angular reaproveita o componente; o signal garante que a tela acompanhe a troca de URL.
- **Título dinâmico:** um `effect()` usa o serviço `Title` para exibir o nome da notícia na aba (ou "Notícia não encontrada").
- **Rolagem:** `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` faz cada navegação começar no topo da página.
- **Banner só na home:** o `AppComponent` deriva o signal `mostrarBanner` dos eventos `NavigationEnd` do `Router`. O valor inicial vem de `window.location.pathname`, para o banner não "piscar" ao abrir direto o link de uma notícia.
- O detalhe funciona com F5 direto na URL: mostra "Carregando" até a API responder.

### Filtros na URL (bônus do edital)
- **URL → Store:** ao abrir, recarregar ou voltar, a barra de filtros lê os `queryParams`. Quando um parâmetro some da URL, o filtro é limpo. As opções do seletor usam `[selected]`, para a categoria da URL aparecer marcada mesmo quando as opções chegam depois da API.
- **Store → URL:** a cada interação a URL é atualizada com `replaceUrl: true` (sem criar uma entrada de histórico por tecla digitada) e `queryParamsHandling: 'merge'` (preserva o outro filtro).
- Como a barra está no cabeçalho, o `navigate` relativo à raiz leva o usuário para a lista (`/`) mesmo quando ele busca dentro do detalhe.

### Desempenho
- `ChangeDetectionStrategy.OnPush` em todos os componentes (a tela atualiza por signals e `@Input`).
- `@for` com `track`, paginação visual com `slice` e requisição única à API.
- Imagens dos cards com `loading="lazy"`; a imagem principal do detalhe carrega imediatamente, por estar no topo da página.
- Ícones em **SVG inline**, sem imagens extras; efeitos visuais (parallax, vinheta, faixa) feitos só com CSS, sem bibliotecas.
- Pipes puros e `computed`: cálculos refeitos apenas quando os dados mudam.
- Fonte Inter carregada com `preconnect` e `display=swap`.
- Build de produção: cerca de **325 kB iniciais** (aproximadamente **87 kB transferidos**, comprimidos).

### Boas práticas Angular
Componentes standalone, injeção por `inject()`, controle de fluxo moderno (`@if`, `@for`, `@switch`, sem `*ngIf` obsoleto), escuta de eventos pelos metadados `host` (no lugar de `@HostListener`), `takeUntilDestroyed` nas assinaturas, `catchError` + `finalize` para os skeletons nunca ficarem presos, e código comentado em português explicando o porquê das decisões.

## 6. Interface e identidade visual

### Design system (design tokens)
Todas as cores, raios, sombras, foco e larguras ficam centralizados em variáveis CSS no `:root` do `styles.scss`, com nomes semânticos:

| Grupo | Exemplos |
| --- | --- |
| Marca | `--color-brand` (`#005a85`), `--color-brand-dark`, `--color-brand-accent`, `--color-orange` (`#d97706`) |
| Texto | `--color-text-strong`, `--color-text`, `--color-text-soft`, `--color-text-muted` |
| Superfícies e bordas | `--color-bg-page`, `--color-surface`, `--color-border` |
| Estados | `--color-error`, `--color-error-soft` |
| Formas e efeitos | `--radius-sm`, `--radius-md`, `--radius-pill`, `--shadow-card`, `--focus-ring` |
| Layout | `--layout-max-width` (`1280px`) |

Os componentes usam `var(--...)` em vez de valores soltos: mudar uma cor da marca é feito em um só lugar. Exceções, documentadas no código: tons exclusivos do skeleton (variáveis SCSS locais), camada escura do banner e foco claro sobre fundos azuis (o token de foco é escuro e não teria contraste ali).

### Tipografia e escala
- Fonte **Inter**, carregada pelo Google Fonts, garantindo a mesma tipografia em qualquer sistema.
- Botões e campos herdam a fonte do site (`font-family: inherit`), pois o navegador aplica a fonte do sistema a esses elementos por padrão.
- Escala base de **81,25%** (`html { font-size: 81.25% }`, 13 px): como os tamanhos estão em `rem`, fontes e espaçamentos ficam proporcionais. O valor em porcentagem respeita quem aumenta a fonte nas configurações do navegador.

### Cabeçalho
- Azul da marca com leve degradê, faixa escura na base e sombra, fixo no topo (`position: sticky`).
- Compacto, para ocupar pouca área durante a rolagem; campos de busca e categoria brancos, com lupa e foco azul-claro.

### Banner
- Componente `HeroBannerComponent`, fora do `.main-content` para ocupar toda a largura.
- Parallax com `background-attachment: fixed`, desligado em celulares e telas de toque (onde funciona mal) e para quem ativou "reduzir movimento".
- A foto, de baixa resolução, recebe uma camada azul-marinho, vinheta e `backdrop-filter` (leve desfoque, contraste e saturação). O filtro fica numa camada sobreposta, e não na imagem, para não quebrar o parallax.
- Faixa diagonal (`skewX`) e traço sob "BLOG" no laranja de destaque, o mesmo do pin dos fixados. O título é `<h2>`, mantendo um único `<h1>` na página.

### Cards e listagem
- Imagem com proporção fixa **16:9** (`aspect-ratio`), sem cortes excessivos e com todos os cards do mesmo tamanho.
- Faixa dos fixados feita com pseudo-elemento sobreposto, para não alterar a altura do card nem desalinhar a grade.
- Título limitado a 2 linhas e subtítulo a 3 (`line-clamp`), protegendo a grade contra textos longos vindos da API.
- Botões padronizados por placeholders SCSS (`%btn-base`, `%btn-primary`): azul da marca e, no hover, azul mais escuro com leve elevação.
- "Carregar mais" centralizado entre a grade e o rodapé.

### Detalhe
- Painel branco centralizado (largura máxima de 820 px), com categoria, título, subtítulo e metadados.
- Corpo do texto justificado em telas largas e alinhado à esquerda no celular.
- Rodapé da notícia com "Ler no site original" e os botões de compartilhamento em formato pílula; "Leia também" com a mesma grade da listagem.

### Rodapé (fiel ao site oficial)
- Logo, linha divisória e faixa central em grade de 3 colunas (`1fr auto 1fr`), com "Contato" exatamente no centro.
- Links de telefone e e-mail em laranja claro (`#ffbd6e`), tom ajustado para atingir o contraste mínimo **WCAG AA** sobre o azul.
- Selos dimensionados pela altura, mantendo a proporção; o selo da LGPD compensa a borda transparente da imagem com margem negativa.

### Responsividade
- Grade de cards com **3 colunas** acima de 900 px, **2** em tablets em pé (700 a 900 px) e **1** no celular.
- No cabeçalho, até 900 px, a busca desce para baixo da marca; no celular, a categoria fica embaixo da busca.
- No detalhe, e-mails e links longos quebram dentro do painel, em vez de estourar a borda.
- O rodapé empilha as seções em telas pequenas; a coluna usa `minmax(0, 1fr)` e os selos têm tamanhos próprios, eliminando a rolagem horizontal.

### Acessibilidade
- `lang="pt-BR"` no `index.html` e `LOCALE_ID` pt-BR para as datas.
- Card acessível por teclado, com foco visível em links, botões, campos e ícones.
- `role="alert"` no erro, `role="status"` no estado vazio, `role="search"` na barra de busca, `aria-label` nos campos, nas redes sociais, no selo da ANVISA e nos botões de compartilhamento.
- `aria-live` no contador de resultados e na confirmação de "Link copiado", com texto exclusivo para leitores de tela (`.sr-only`).
- `title` no player de vídeo e `aria-hidden` nos skeletons e ícones decorativos.
- Botão "voltar ao topo" com 48 px (área mínima de toque) e oculto com `visibility: hidden`, saindo também da navegação por teclado.
- Respeito a `prefers-reduced-motion`: skeleton parado, sem parallax, sem zoom nem elevação dos cards e rolagem ao topo sem animação.

## 7. Regras de negócio

| Regra | Implementação |
| --- | --- |
| Só `status === 1` | Filtro na entrada da Store: lista, categorias, detalhe e relacionadas nunca enxergam posts inativos |
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
- **Navegação:** abrir uma notícia, clicar em um card do "Leia também" e conferir que a notícia, o título da aba e a rolagem são atualizados.
- **Responsividade:** DevTools em modo dispositivo, em 375 px e 768 px. Para confirmar que nada ultrapassa a largura da tela, o comando abaixo, no Console, deve retornar `[]`:
  ```js
  [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
  ```

## 9. Build e deploy

### Build local
```bash
npm run build
```
Os arquivos estáticos são gerados em `dist/visualizador-noticias/browser/`. O build de produção usa o `environment.ts`, que só tem o placeholder do token.

**Budgets:** o limite de aviso de CSS por componente (`anyComponentStyle`) foi ajustado de 4 kB para 6 kB no `angular.json`, porque a página de detalhe concentra vários blocos (corpo, vídeo, compartilhamento e "Leia também"). O limite de erro continua em 8 kB.

### Deploy na Vercel
A aplicação está publicada em **[visualizador-noticias.vercel.app](https://visualizador-noticias.vercel.app)**. A Vercel é integrada ao repositório: cada `push` na branch `main` gera um novo deploy automaticamente.

**Injeção do token no build:**
1. No painel da Vercel, o token é cadastrado como variável de ambiente `API_TOKEN` (opcionalmente, `API_URL`).
2. O comando de build do projeto é `npm run build:vercel`, definido no `package.json`:
   ```json
   "build:vercel": "node scripts/set-env.cjs && ng build"
   ```
3. O script `scripts/set-env.cjs` gera o `environment.ts` a partir das variáveis de ambiente e, em seguida, o Angular faz o build.

O script **só executa dentro da Vercel** (variável `VERCEL`, definida automaticamente pela plataforma). Localmente, ele não altera nada, então o token real nunca é gravado num arquivo versionado. Se `API_TOKEN` não estiver definida, o build falha com uma mensagem clara, em vez de publicar um site sem dados. Nos logs do build, a linha `[set-env] environment.ts gerado a partir das variáveis de ambiente.` confirma a injeção.

**Rotas da SPA:** o `vercel.json` redireciona qualquer endereço que não seja um arquivo real para o `index.html`. Sem isso, abrir direto ou recarregar `/post/:id` daria erro 404 no servidor:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Para usar outro provedor, basta cadastrar `API_TOKEN`, adaptar a condição do script à variável de ambiente da plataforma e configurar o redirecionamento das rotas para o `index.html`.

## 10. Estrutura de pastas

```
visualizador-noticias/
├── public/                     imagens servidas como estão (logos, selos, banner, favicon)
├── scripts/
│   └── set-env.cjs             gera o environment.ts no build da Vercel
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/   auth-interceptor.ts
│   │   │   ├── layout/
│   │   │   │   ├── back-to-top/    botão "voltar ao topo"
│   │   │   │   ├── hero-banner/    banner da página inicial
│   │   │   │   └── site-footer/    rodapé institucional
│   │   │   ├── models/         post.ts
│   │   │   ├── pipes/          safe-html-pipe.ts, safe-url-pipe.ts, author-name-pipe.ts
│   │   │   └── services/       amneses-api.ts, posts-store.ts
│   │   ├── features/posts/components/
│   │   │   ├── card/
│   │   │   ├── card-list/
│   │   │   ├── filter-bar/     (exibida no cabeçalho)
│   │   │   └── post-detail/
│   │   ├── app.ts / app.html / app.scss   (cabeçalho, banner, conteúdo e rodapé)
│   │   ├── app.config.ts       roteador, HTTP, interceptor e idioma
│   │   └── app.routes.ts       rotas e títulos das abas
│   ├── environments/           environment.ts, environment.development.example.ts
│   ├── index.html              título, meta descrição, fonte Inter e favicon
│   └── styles.scss             design tokens e estilos globais
├── vercel.json                 redireciona as rotas da SPA para o index.html
└── angular.json, package.json, tsconfig*.json
```

## 11. Limitações conhecidas

- O token fica visível na aba *Network* e no JavaScript publicado (ver [Segurança](#4-segurança)).
- Durante os testes, a API respondeu normalmente mesmo com o token alterado. A validação do token é responsabilidade do servidor; a aplicação segue o contrato do edital e envia o cabeçalho `Authorization` em todas as requisições.
- A regra do pin compara com o relógio a cada recálculo. Se a data de um pin vencer com a página aberta, o card só sai do topo no próximo recálculo (ao filtrar ou recarregar).
- A foto do banner tem baixa resolução; o tratamento visual (camada escura, vinheta e desfoque) disfarça a perda de qualidade, mas uma imagem maior melhoraria o resultado.
- Não há backend nem login, conforme os não-requisitos do edital.
- O rodapé não inclui o gerenciador de cookies nem o chat do site oficial, pois a aplicação não usa cookies nem chat.
- A interface visual (cabeçalho, banner, rodapé e responsividade) foi validada manualmente, sem testes automatizados de tela.

## 12. Atendimento ao edital

| Critério (ordem de importância) | Como foi atendido |
| --- | --- |
| 1. Requisitos | Listagem com "carregar mais", filtros, busca, detalhe, pin, ordenação, datas pt-BR, `status === 1`, `urlPost` em nova aba e vídeo responsivo |
| 2. Segurança (token) | Token fora do repositório e do histórico, injetado por variável de ambiente no deploy, interceptor restrito à API, sanitização do `corpo` e validação da URL do vídeo |
| 3. UX/UI | Skeletons na proporção real, erro com "Tentar novamente", estado vazio, contador e "Limpar filtros", banner, placeholders por categoria, compartilhamento, "Leia também", "voltar ao topo", layout responsivo e identidade visual da marca |
| 4. Boas práticas Angular | Standalone, signals, Store única, interceptor, pipes, OnPush, controle de fluxo moderno, design tokens, componentes smart/dumb e código comentado |
| 5. Desempenho | OnPush, `track`, imagens lazy, ícones SVG inline, efeitos só com CSS, paginação visual e requisição única |
| Bônus e opcionais | Filtros na URL (querystring), categorias montadas a partir dos dados e **deploy publicado** na Vercel |