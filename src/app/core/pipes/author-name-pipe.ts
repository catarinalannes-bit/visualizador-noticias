import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforma o e-mail do autor em um nome legível para exibição.
 *   "reis@radiomemory.com.br"       → "Reis"
 *   "joao.silva@radiomemory.com.br" → "Joao Silva"
 * Se o valor não for um e-mail, devolve o texto como veio.
 *
 * Pipe puro: só é recalculado quando o valor de entrada muda.
 */
@Pipe({ name: 'authorName' })
export class AuthorNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const texto = value.trim();

    // Não é e-mail: já é um nome, exibe como está.
    if (!texto.includes('@')) {
      return texto;
    }

    // Pega a parte antes do @ e separa por ponto, hífen ou underline.
    const usuario = texto.split('@')[0];

    return usuario
      .split(/[._-]+/)
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
      .join(' ');
  }
}