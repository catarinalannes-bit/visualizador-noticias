// Importa as ferramentas base do Angular para criar um "Pipe" (um transformador ou filtro de dados).
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';

// Importa o serviço de segurança nativo do Angular para lidar com ameaças de injeção de código HTML.
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// O decorador @Pipe avisa ao Angular que a classe abaixo funcionará como um filtro de texto diretamente no HTML.
@Pipe({
  // 'name' é o apelido que usaremos no HTML. Exemplo prático: <div [innerHTML]="post.corpo | safeHtml"></div>
  name: 'safeHtml',
  // 'standalone: true' significa que este pipe é independente e não precisa de ser declarado em módulos globais pesados.
  standalone: true
})
// A classe é exportada e implementa a interface PipeTransform, o que nos obriga a criar a função principal 'transform'.
export class SafeHtmlPipe implements PipeTransform {
  
  // O construtor é o primeiro código a ser executado ao instanciar o pipe. Ele "injeta" a ferramenta DomSanitizer na classe.
  constructor(private sanitizer: DomSanitizer) {}

  // A função 'transform' recebe o HTML original recebido da API (em formato string) e devolve um HTML limpo e blindado contra ataques XSS.
  transform(html: string): string | null {
    // Decisão de Segurança (Critério do Edital - "Script nunca executa"):
    // Em vez de usar 'bypassSecurityTrustHtml' (que desligaria a segurança e permitiria scripts maliciosos ou <img onerror>),
    // utilizamos o 'sanitize' com o contexto SecurityContext.HTML. Isso garante que tags perigosas são ativamente filtradas e neutralizadas,
    // mantendo apenas a formatação segura.
    return this.sanitizer.sanitize(SecurityContext.HTML, html);
  }
}