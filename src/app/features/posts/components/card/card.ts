import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Post } from '../../../../core/models/post';

/**
 * Card de uma publicação na listagem.
 *
 * DECISÃO: componente de apresentação ("burro"). Ele só recebe o post e o desenha;
 * não conhece a Store nem faz requisições. Toda a regra de negócio (status, ordenação,
 * busca) fica na Store, e o card apenas exibe o resultado.
 */
@Component({
  selector: 'app-card',
  standalone: true,
    imports: [DatePipe, RouterModule],
  // RouterModule: habilita o routerLink que leva ao detalhe.
 
  templateUrl: './card.html',
  styleUrl: './card.scss',
  // OnPush: o card só é reavaliado quando o @Input 'post' muda, o que evita
  // trabalho desnecessário em listas longas.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {

  // 'required: true' faz o Angular acusar erro de compilação se alguém usar
  // <app-card> sem informar a notícia.
  @Input({ required: true }) post!: Post;

  /**
   * Regra de pin (edital): o post é fixado se 'data_fixo' existe e é >= agora
   * (horário do navegador). É a mesma regra usada na ordenação da Store, para o
   * destaque visual (borda e ícone) sempre coincidir com a posição na lista.
   * O cálculo é refeito toda vez que o card é renderizado.
   */
  get isPinned(): boolean {
    if (!this.post.data_fixo) return false;
    return new Date(this.post.data_fixo) >= new Date();
  }
}