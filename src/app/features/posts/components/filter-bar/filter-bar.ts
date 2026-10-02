import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PostsStoreService } from '../../../../core/services/posts-store';

/**
 * Barra de filtros (busca por texto e categoria), exibida no cabeçalho da aplicação.
 *
 * DECISÃO: os filtros vivem em dois lugares sincronizados.
 *  - Na Store (signals): a lista reage na hora, sem nova requisição.
 *  - Na URL (?busca=...&categoria=...): o link pode ser copiado e compartilhado,
 *    e o filtro sobrevive ao F5 e aos botões voltar/avançar do navegador.
 *
 * A URL é a fonte da verdade ao carregar a página; depois, cada interação
 * do usuário atualiza a Store e a URL juntas.
 *
 * Por ficar no cabeçalho (fora das rotas), funciona em qualquer página: buscar
 * estando no detalhe de um post leva o usuário de volta à lista já filtrada.
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
  // OnPush: o template só lê signals da Store e reage a eventos do próprio
  // componente, então não precisa ser verificado a cada ciclo de detecção.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent implements OnInit {
  readonly store = inject(PostsStoreService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  /** URL -> Store: roda ao abrir a página, no F5 e quando o usuário usa voltar/avançar. */
  ngOnInit(): void {
    this.route.queryParams
      // Encerra a assinatura sozinha quando o componente é destruído.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        // O '?? ""' limpa o filtro quando o parâmetro não existe na URL
        // (ex.: voltar do navegador para uma URL sem filtros).
        this.store.searchQuery.set(params['busca'] ?? '');
        this.store.selectedCategory.set(params['categoria'] ?? '');
      });
  }

  /** Store -> URL: chamado a cada tecla digitada na busca. */
  onSearch(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;

    // Atualiza a Store primeiro, para a lista reagir imediatamente.
    this.store.searchQuery.set(valor);
    // Texto vazio vira null para o Angular remover o parâmetro da URL.
    this.atualizarUrl({ busca: valor || null });
  }

  /** Store -> URL: chamado ao escolher uma categoria no seletor. */
  onCategoryChange(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;

    this.store.selectedCategory.set(valor);
    this.atualizarUrl({ categoria: valor || null });
  }

  /**
   * Atualiza apenas os parâmetros informados, sem recarregar a página.
   *  - 'merge': preserva os outros parâmetros (ex.: mudar a busca não apaga a categoria).
   *  - 'replaceUrl': troca a entrada atual do histórico em vez de criar uma nova
   *    a cada tecla; assim o botão voltar do navegador não precisa ser clicado
   *    uma vez por letra digitada.
   */
  private atualizarUrl(queryParams: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}