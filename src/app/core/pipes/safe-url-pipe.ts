// Importa as ferramentas base do Angular necessárias para criar um Pipe.
import { Pipe, PipeTransform } from '@angular/core';

// Importa o serviço de segurança nativo do Angular para autorizar URLs em recursos externos.
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true // Mantém a coerência com a arquitetura moderna (Standalone) do seu projeto.
})
export class SafeUrlPipe implements PipeTransform {

  // Injeta o DomSanitizer para podermos sinalizar ao Angular que o link do vídeo é seguro.
  constructor(private sanitizer: DomSanitizer) {}

  // A função transform recebe a URL e devolve um formato seguro ou null se for inválida.
  transform(url: string | undefined): SafeResourceUrl | null {
    // Validação estrita de segurança: só aceita URLs oficiais de embed do YouTube.
    // Qualquer outra URL ou valor vazio é rejeitado, protegendo o iframe contra fontes maliciosas.
    if (!url || !/^https:\/\/www\.youtube(-nocookie)?\.com\/embed\//.test(url)) {
      return null;
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}