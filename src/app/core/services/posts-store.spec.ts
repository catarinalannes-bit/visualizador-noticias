import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Post } from '../models/post';
import { PostsStoreService } from './posts-store';

describe('PostsStoreService (casos de teste mínimos do edital)', () => {
  const DIA = 24 * 60 * 60 * 1000;

  /** Data ISO deslocada em relação a "agora" (positivo = futuro, negativo = passado). */
  const iso = (deslocamentoMs: number) => new Date(Date.now() + deslocamentoMs).toISOString();

  /** Cria um post de teste. Quanto MAIOR o id, mais ANTIGA a data de publicação. */
  const post = (id: number, extra: Partial<Post> = {}): Post => ({
    id,
    titulo: `Post ${id}`,
    subtitulo: '',
    corpo: '',
    urlPost: '',
    autor: 'teste@radiomemory.com.br',
    status: 1,
    data: iso(-id * DIA),
    categoria: 'blog',
    ...extra
  });

  /** Cria a Store e entrega a ela a resposta simulada da API (sem rede real). */
function criarStore(resposta: object): PostsStoreService {
  TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const store = TestBed.inject(PostsStoreService);
    TestBed.inject(HttpTestingController).expectOne(() => true).flush(resposta);
    return store;
  }

  const ids = (store: PostsStoreService) => store.filteredPosts().map((p) => p.id);

  it('Fixados: data_fixo no futuro vem primeiro; pin vencido deixa de fixar', () => {
    const store = criarStore([
      post(1),
      post(2, { data_fixo: iso(+DIA) }), // fixado
      post(3, { data_fixo: iso(-DIA) })  // pin vencido: volta à ordem normal (por data)
    ]);
    expect(ids(store)).toEqual([2, 1, 3]);
  });

  it('Fixados são ordenados por data_fixo decrescente', () => {
    const store = criarStore([
      post(1, { data_fixo: iso(+1 * DIA) }),
      post(2, { data_fixo: iso(+3 * DIA) }),
      post(3)
    ]);
    expect(ids(store)).toEqual([2, 1, 3]);
  });

  it('Ordenação: não fixados saem por data decrescente', () => {
    const store = criarStore([post(3), post(1), post(2)]);
    expect(ids(store)).toEqual([1, 2, 3]);
  });

  it('Só aparecem posts com status = 1', () => {
    const store = criarStore([post(1), post(2, { status: 0 })]);
    expect(ids(store)).toEqual([1]);
  });

  it('Filtro por categoria: "blog" retorna apenas categoria "blog"', () => {
    const store = criarStore([
      post(1, { categoria: 'blog' }),
      post(2, { categoria: 'treinamento' })
    ]);
    store.selectedCategory.set('blog');
    expect(ids(store)).toEqual([1]);
  });

  it('Busca: "JABRO" é case-insensitive e olha título e subtítulo', () => {
    const store = criarStore([
      post(1, { titulo: '24ª Jornada da JABRO' }),
      post(2, { subtitulo: 'evento da jabro' }),
      post(3)
    ]);
    store.searchQuery.set('JABRO');
    expect(ids(store)).toEqual([1, 2]);
    store.searchQuery.set('jabro');
    expect(ids(store)).toEqual([1, 2]);
  });

  it('Categorias do seletor vêm dos dados, sem repetição', () => {
    const store = criarStore([
      post(1, { categoria: 'blog' }),
      post(2, { categoria: 'blog' }),
      post(3, { categoria: 'treinamento' })
    ]);
    expect(store.categories()).toEqual(['blog', 'treinamento']);
  });

  it('getById encontra o post mesmo com filtro ativo', () => {
    const store = criarStore([post(1, { categoria: 'blog' }), post(2, { categoria: 'treinamento' })]);
    store.selectedCategory.set('blog');
    expect(store.getById(2)?.id).toBe(2);
  });

  it('Resposta que não é uma lista vira estado de erro (e não "sem resultados")', () => {
    const store = criarStore({ mensagem: 'inesperado' });
    expect(store.error()).not.toBeNull();
    expect(ids(store)).toEqual([]);
  });

  it('Falha de rede vira estado de erro e o carregamento termina', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const store = TestBed.inject(PostsStoreService);
    TestBed.inject(HttpTestingController)
      .expectOne(() => true)
      .flush('erro', { status: 500, statusText: 'Server Error' });

    expect(store.error()).not.toBeNull();
    expect(store.loading()).toBe(false);
  });
});