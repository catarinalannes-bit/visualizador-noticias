import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Rodapé institucional, espelhando o do site da Radio Memory:
 * horário de funcionamento, contato, redes sociais e selos (ANVISA e LGPD).
 *
 * É um componente "burro" e estático: não depende da Store nem da API,
 * por isso OnPush (nunca precisa ser reavaliado depois da primeira renderização).
 */
@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  /** Ano do copyright sempre atualizado, sem precisar editar o código todo ano. */
  readonly anoAtual = new Date().getFullYear();
}