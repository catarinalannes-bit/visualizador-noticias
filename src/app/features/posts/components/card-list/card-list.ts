import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { SlicePipe } from '@angular/common';

import { CardComponent } from '../card/card';
import { PostsStoreService } from '../../../../core/services/posts-store';

/** Quantidade de cards mostrada de cada vez ("Carregar mais" soma este valor). */
const TAMANHO_PAGINA = 6;

/**
 * Listagem de posts: grade de cards.
 *
 * DECISÃO: a tela só reflete o estado da Store (carregando, erro, vazio ou lista)
 * e cuida apenas da paginação visual. Filtro, busca e ordenação ficam na Store;
 * a barra de busca e categoria fica no cabeçalho da aplicação.
 */
@Component({
  selector: 'app-card-list',
  standalone: true,
  // SlicePipe: recorta a lista no template conforme o 'limite'.
  imports: [SlicePipe, CardComponent],
  templateUrl: './card-list.html',
  styleUrl: './card-list.scss',
  // OnPush: o estado vem de signals (Store e 'limite'), que avisam o Angular sozinhos.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardListComponent {

  store = inject(PostsStoreService);

  /**
   * Quantos cards estão visíveis. É um linkedSignal: volta para a primeira página
   * automaticamente sempre que a busca ou a categoria muda, para o usuário não
   * ver uma lista "esticada" de uma consulta anterior.
   */
  limite = linkedSignal<[string, string], number>({
    source: () => [this.store.searchQuery(), this.store.selectedCategory()],
    computation: () => TAMANHO_PAGINA
  });

  /** Botão "Carregar mais": revela mais uma página de cards (paginação visual). */
  carregarMais(): void {
    this.limite.update((atual) => atual + TAMANHO_PAGINA);
  }

  /** Botão "Tentar novamente" do estado de erro: volta à primeira página e refaz a requisição. */
  tentarNovamente(): void {
    this.limite.set(TAMANHO_PAGINA);
    this.store.loadPosts();
  }
}