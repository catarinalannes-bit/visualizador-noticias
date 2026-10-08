// Importa a ferramenta Component (blocos visuais) e o inject (injeção de dependências).
import { Component, inject } from '@angular/core';
// Router e NavigationEnd: permitem saber em qual página o usuário está.
// RouterOutlet: o "espaço reservado" onde o Angular injeta as páginas do sistema.
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
// Converte o fluxo de navegações do roteador em um signal.
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
// Rodapé institucional, barra de busca/filtro do cabeçalho, banner e botão "voltar ao topo".
import { SiteFooterComponent } from './core/layout/site-footer/site-footer';
import { FilterBarComponent } from './features/posts/components/filter-bar/filter-bar';
import { HeroBannerComponent } from './core/layout/hero-banner/hero-banner';
import { BackToTopComponent } from './core/layout/back-to-top/back-to-top';

// O @Component é um decorador que passa as configurações visuais para a classe abaixo.
@Component({
  // 'selector' é o nome da tag <app-root> usada no index.html para iniciar todo o site.
  selector: 'app-root',
  // 'standalone: true' moderniza o projeto, eliminando a necessidade de arquivos de módulo complexos.
  standalone: true,
  // 'imports' avisa ao Angular quais componentes o HTML deste componente usa.
  imports: [RouterOutlet, SiteFooterComponent, FilterBarComponent, HeroBannerComponent, BackToTopComponent],
  // 'templateUrl' aponta para o arquivo HTML exato que desenha este componente.
  templateUrl: './app.html',
  // 'styleUrl' aponta para o arquivo SCSS exato que estiliza este componente.
  styleUrl: './app.scss'
})
// Exporta a classe AppComponent para que o Angular possa inicializá-la.
export class AppComponent {
  // Uma variável simples com o nome do projeto.
  title = 'Visualizador de Notícias';

  private router = inject(Router);

  /**
   * true na listagem e false na página de uma notícia (/post/:id):
   * o banner de destaque só aparece na página inicial.
   */
  readonly mostrarBanner = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => !evento.urlAfterRedirects.startsWith('/post/'))
    ),
    { initialValue: !window.location.pathname.startsWith('/post/') }
  );
}