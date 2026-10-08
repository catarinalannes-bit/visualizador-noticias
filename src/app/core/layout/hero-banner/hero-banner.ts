import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Faixa de destaque abaixo do cabeçalho, inspirada no blog da Radio Memory. */
@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {}