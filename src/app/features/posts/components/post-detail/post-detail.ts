import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Post } from '../../../../core/models/post';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html-pipe';
import { SafeUrlPipe } from '../../../../core/pipes/safe-url-pipe';
import { PostsStoreService } from '../../../../core/services/posts-store';

/**
 * Detalhe de uma publicação (rota /post/:id).
 *
 * DECISÕES DE SEGURANÇA
 *  - O 'corpo' vem da API como HTML: passa pelo SafeHtmlPipe, que usa sanitize()
 *    e remove <script> e atributos de evento (onerror etc.) antes de renderizar.
 *  - O 'videoUrl' passa pelo SafeUrlPipe, que só aceita embeds do YouTube.
 */
@Component({
  selector: 'app-post-detail',
  standalone: true,
  // NgIf e DatePipe: usados no template; RouterModule: links "Voltar" e rota;
  // SafeHtmlPipe e SafeUrlPipe: sanitização do corpo e do vídeo.
  imports: [NgIf, DatePipe, RouterModule, SafeHtmlPipe, SafeUrlPipe],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
  // OnPush: o post vem de um getter que lê signals da Store, então a tela
  // atualiza sozinha quando os dados chegam.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);

  // Público porque o template lê 'store.loading()' e os filtros do botão "Voltar".
  store = inject(PostsStoreService);

  /** Id do post, extraído da URL (ex.: /post/61). */
  idDaRota = 0;

  ngOnInit(): void {
    // Lê o parâmetro 'id' da rota e converte de texto para número.
    this.idDaRota = Number(this.route.snapshot.paramMap.get('id'));
  }

  /**
   * Post atual. Procura na lista COMPLETA da Store, e não na filtrada: o detalhe
   * não depende da busca ou da categoria ativas na listagem.
   * Retorna undefined enquanto os dados carregam ou se o id não existir.
   */
  get post(): Post | undefined {
    return this.store.getById(this.idDaRota);
  }
}