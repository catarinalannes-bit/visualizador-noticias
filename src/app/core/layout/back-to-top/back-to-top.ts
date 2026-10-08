import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/** Distância rolada (em px) a partir da qual o botão aparece. */
const LIMITE_ROLAGEM = 600;

/**
 * Botão "voltar ao topo": aparece depois que o usuário rola a página
 * e o leva de volta ao topo, onde ficam a busca e o filtro de categorias.
 */
@Component({
  selector: 'app-back-to-top',
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Escuta a rolagem da janela direto nos metadados do componente
  // (forma recomendada atualmente, no lugar do @HostListener).
  host: {
    '(window:scroll)': 'aoRolar()'
  }
})
export class BackToTopComponent {

  /** true quando o botão deve aparecer na tela. */
  readonly visivel = signal(false);

  /** Mostra o botão só depois que o usuário passou do limite de rolagem. */
  aoRolar(): void {
    this.visivel.set(window.scrollY > LIMITE_ROLAGEM);
  }

  /**
   * Volta ao topo com rolagem suave. Quem ativou "reduzir movimento"
   * no sistema vai direto, sem a animação.
   */
  voltarAoTopo(): void {
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduzirMovimento ? 'auto' : 'smooth' });
  }
}