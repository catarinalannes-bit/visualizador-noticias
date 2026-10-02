import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { Post } from '../models/post';
import { AmnesesApiService } from './amneses-api';

/**
 * PostsStoreService: fonte única de verdade dos posts.
 *
 * DECISÃO DE ARQUITETURA
 * Todo o estado (lista bruta, filtros, loading, erro) e toda a regra de negócio
 * (status, pin, ordenação, busca) ficam aqui, com Signals + computed.
 * Os componentes apenas LEEM o resultado já pronto: nenhuma lógica de filtro ou
 * ordenação fica espalhada pelos templates, e a API é consumida uma única vez
 * (filtrar ou buscar nunca dispara nova requisição).
 */
@Injectable({
  providedIn: 'root'
})
export class PostsStoreService {

  private api = inject(AmnesesApiService);

  // ---------------------------------------------------------------------------
  // ESTADO PRIVADO
  // Só a Store escreve nestes sinais; os componentes recebem versões somente leitura.
  // ---------------------------------------------------------------------------

  /** Lista bruta (já com status === 1) vinda da AWS. */
  private readonly _posts = signal<Post[]>([]);
  /** true enquanto a requisição está em andamento (aciona os skeletons). */
  private readonly _loading = signal<boolean>(false);
  /** Mensagem de falha de rede/token; null quando está tudo certo. */
  private readonly _error = signal<string | null>(null);

  // ---------------------------------------------------------------------------
  // ESTADO PÚBLICO
  // ---------------------------------------------------------------------------

  /** Filtros editados pela FilterBar (e espelhados na URL). */
  readonly selectedCategory = signal<string>('');
  readonly searchQuery = signal<string>('');

  /** Somente leitura: impede que um componente altere loading/erro por engano. */
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    // Carrega os dados uma única vez, quando a aplicação sobe.
    this.loadPosts();
  }

  /**
   * Busca os posts na API (autenticada pelo AuthInterceptor).
   * Também é usado pelo botão "Tentar novamente" do estado de erro.
   */
  loadPosts(): void {
    // Liga o estado de carregamento (aciona os skeletons) e limpa erros anteriores.
    this._loading.set(true);
    this._error.set(null);

    this.api.getTodosCards().pipe(
      tap({
        next: (data) => {
          // Defesa: se a API devolver algo que não seja uma lista, mostramos o
          // estado de ERRO (e não uma lista vazia, que pareceria "sem resultados").
          if (!Array.isArray(data)) {
            this._error.set('Resposta inesperada do servidor. Tente novamente.');
            return;
          }

          // REGRA DE NEGÓCIO (edital): renderizar apenas posts com status === 1.
          // O filtro é feito aqui, na entrada, para que nenhum outro ponto da
          // aplicação (lista, categorias, detalhe) enxergue posts inativos.
          const activePosts = data.filter((post: Post) => post.status === 1);

                    // DEMONSTRAÇÃO DO PIN 
          // A base real não tem nenhum post com data_fixo no futuro. Para demonstrar
          // a regra, remova as barras "//" das linhas abaixo:
          //   - o 1º post passa a ter pin no futuro: sobe para o topo, com borda laranja;
          //   - o 2º post passa a ter pin vencido: NÃO é fixado, fica na posição normal.
          // Depois da demonstração, volte a comentar este bloco.
          // -----------------------------------------------------------------
          // if (activePosts.length > 0) {
          //   activePosts[0].data_fixo = '2030-12-31T12:00:00.000Z'; // futuro: fixado
          // }
          // if (activePosts.length > 1) {
          //   activePosts[1].data_fixo = '2020-01-01T12:00:00.000Z'; // passado: pin vencido
          // }
          // -----------------------------------------------------------------

          this._posts.set(activePosts);
        },
        error: () => {
          // Mensagem amigável: detalhes técnicos não interessam ao usuário final.
          this._error.set('Falha ao carregar as publicações. Tente novamente.');
        }
      }),
      // O erro já foi tratado no tap (mensagem para o usuário); devolvemos EMPTY
      // para ele não virar "erro não tratado" no console.
      catchError(() => EMPTY),
      // Roda em sucesso OU erro: garante que os skeletons nunca fiquem "presos".
      finalize(() => this._loading.set(false))
    // Sem o subscribe, o HTTP do Angular não dispara a requisição.
    ).subscribe();
  }

  /**
   * Regra de pin (edital): o post é fixado se data_fixo EXISTE e é >= agora,
   * usando o fuso horário do navegador.
   */
  private estaFixado(post: Post, agora: Date): boolean {
    return post.data_fixo ? new Date(post.data_fixo) >= agora : false;
  }

  /**
   * Lista final exibida na tela: filtrada, buscada e ordenada.
   *
   * O computed recalcula sozinho sempre que muda a lista, a categoria ou a busca.
   * Nota sobre o pin: "agora" é lido a cada recálculo. Se o relógio passar da
   * data_fixo sem nenhum outro estado mudar, o post só sai do topo no próximo
   * recálculo (por exemplo, ao filtrar ou recarregar). Para o escopo do teste
   * isso basta; em produção poderíamos alimentar um sinal de relógio por minuto.
   */
  readonly filteredPosts = computed(() => {
    const posts = this._posts();
    const category = this.selectedCategory().toLowerCase();
    const query = this.searchQuery().toLowerCase().trim();
    const agora = new Date();

    return posts
      // PASSO 1: filtros. O .filter() cria um array NOVO, então o .sort() do
      // passo 2 não altera o estado original (_posts).
      .filter((post) => {
        const matchesCategory = category ? post.categoria?.toLowerCase() === category : true;
        // Busca case-insensitive em título E subtítulo (edital).
        const matchesSearch = query
          ? post.titulo?.toLowerCase().includes(query) || post.subtitulo?.toLowerCase().includes(query)
          : true;

        return matchesCategory && matchesSearch;
      })
      // PASSO 2: ordenação definida uma única vez (edital):
      //   1) fixados primeiro, por data_fixo decrescente;
      //   2) depois os não fixados, por data de publicação decrescente.
      .sort((a, b) => {
        const aFixado = this.estaFixado(a, agora);
        const bFixado = this.estaFixado(b, agora);

        // Fixado sempre vem antes de não fixado.
        if (aFixado && !bFixado) return -1;
        if (!aFixado && bFixado) return 1;

        // Ambos fixados: o pin que vai mais longe no futuro aparece primeiro.
        if (aFixado && bFixado) {
          return new Date(b.data_fixo!).getTime() - new Date(a.data_fixo!).getTime();
        }

        // Nenhum fixado: o mais recente primeiro.
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
  });

  /**
   * Categorias únicas montadas a partir dos próprios dados (bônus do edital):
   * nenhum nome de categoria fica escrito à mão no código. O Set elimina repetidas.
   */
  readonly categories = computed(() => {
    const cats = this._posts()
      .map((p) => p.categoria)
      .filter((c): c is string => !!c);
    return Array.from(new Set(cats));
  });

  /**
   * Busca um post pelo id na lista COMPLETA (sem os filtros de busca/categoria).
   * O detalhe usa isto para não depender do filtro ativo na listagem.
   */
  getById(id: number): Post | undefined {
    return this._posts().find((p) => p.id === id);
  }
}