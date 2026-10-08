import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

import { Post } from '../../../../core/models/post';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html-pipe';
import { SafeUrlPipe } from '../../../../core/pipes/safe-url-pipe';
import { PostsStoreService } from '../../../../core/services/posts-store';
import { CardComponent } from '../card/card';

/**
 * Detalhe de uma publicação (rota /post/:id).
 *
 * DECISÕES DE SEGURANÇA
 *  - O 'corpo' vem da API como HTML: passa pelo SafeHtmlPipe, que usa sanitize()
 *    e remove <script> e atributos de evento (onerror etc.) antes de renderizar.
 *  - O 'videoUrl' passa pelo SafeUrlPipe, que só aceita embeds do YouTube.
 *
 * ROTA REATIVA
 *  - O id é lido da rota como signal (e não só uma vez, via snapshot): ao clicar
 *    numa notícia do "Leia também", o Angular reaproveita este componente e só
 *    troca o parâmetro da URL; o signal garante que a tela acompanhe a troca.
 *
 * TÍTULO DA ABA
 *  - A rota define um título provisório ("Notícia | Radio Memory").
 *    Quando o post carrega, ele é trocado pelo título da notícia (serviço Title).
 */
@Component({
  selector: 'app-post-detail',
  standalone: true,
  // NgIf e DatePipe: usados no template; RouterModule: links "Voltar" e rota;
  // SafeHtmlPipe e SafeUrlPipe: sanitização do corpo e do vídeo;
  // CardComponent: reaproveitado nos cards do "Leia também".
  imports: [NgIf, DatePipe, RouterModule, SafeHtmlPipe, SafeUrlPipe, CardComponent],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
  // OnPush: o post vem de signals da Store e da rota, então a tela
  // atualiza sozinha quando os dados chegam ou a URL muda.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent {

  private route = inject(ActivatedRoute);

  // Serviço do Angular que altera o título exibido na aba do navegador.
  private title = inject(Title);

  // Público porque o template lê 'store.loading()' e os filtros do botão "Voltar".
  store = inject(PostsStoreService);

  /** Parâmetros da rota como signal: muda a cada navegação entre notícias. */
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });

  /** Id do post, extraído da URL (ex.: /post/61) e convertido para número. */
  readonly idDaRota = computed(() => Number(this.params().get('id')));

  /** Notícias da mesma categoria para o "Leia também" (até 3). */
  readonly relacionados = computed(() => {
    const post = this.post;
    return post ? this.store.getRelated(post) : [];
  });

  /** true por 2 segundos depois de copiar o link (mostra "Link copiado!"). */
  readonly linkCopiado = signal(false);

  constructor() {
    /**
     * Atualiza o título da aba conforme o estado do post.
     * Roda de novo sozinho quando os dados carregam ou o id da rota muda.
     */
    effect(() => {
      const post = this.post;

      if (post) {
        // Post encontrado: a aba mostra o nome da notícia.
        this.title.setTitle(`${post.titulo} | Radio Memory`);
      } else if (!this.store.loading()) {
        // Carregamento terminou e o id não existe.
        this.title.setTitle('Notícia não encontrada | Radio Memory');
      }
      // Enquanto carrega, mantém o título provisório definido na rota.
    });
  }

  /**
   * Post atual. Procura na lista COMPLETA da Store, e não na filtrada: o detalhe
   * não depende da busca ou da categoria ativas na listagem.
   * Retorna undefined enquanto os dados carregam ou se o id não existir.
   */
  get post(): Post | undefined {
    return this.store.getById(this.idDaRota());
  }

  // COMPARTILHAR
  // Compartilha o link da notícia no site oficial (urlPost); se não houver,
  // usa o endereço da página atual.

  private get urlCompartilhar(): string {
    return this.post?.urlPost || window.location.href;
  }

  /** Link do WhatsApp com o título e o endereço da notícia já preenchidos. */
  get linkWhatsapp(): string {
    const texto = `${this.post?.titulo ?? ''} ${this.urlCompartilhar}`;
    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  }

  /** Link de compartilhamento do LinkedIn. */
  get linkLinkedin(): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.urlCompartilhar)}`;
  }

  /** Copia o link para a área de transferência e mostra a confirmação por 2 segundos. */
  async copiarLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.urlCompartilhar);
      this.linkCopiado.set(true);
      setTimeout(() => this.linkCopiado.set(false), 2000);
    } catch {
      // Navegador sem permissão para a área de transferência: o botão
      // simplesmente não mostra a confirmação, sem quebrar a página.
    }
  }
}