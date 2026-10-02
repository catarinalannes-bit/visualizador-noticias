// Importa a ferramenta Component, que permite criar blocos visuais no Angular.
import { Component } from '@angular/core';
// Importa o RouterOutlet, o "espaço reservado" onde o Angular vai injetar as páginas do sistema.
import { RouterOutlet } from '@angular/router';
// Rodapé institucional e barra de busca/filtro do cabeçalho.
import { SiteFooterComponent } from './core/layout/site-footer/site-footer';
import { FilterBarComponent } from './features/posts/components/filter-bar/filter-bar';

// O @Component é um decorador que passa as configurações visuais para a classe abaixo.
@Component({
  // 'selector' é o nome da tag <app-root> usada no index.html para iniciar todo o site.
  selector: 'app-root',
  // 'standalone: true' moderniza o projeto, eliminando a necessidade de arquivos de módulo complexos.
  standalone: true,
  // 'imports' avisa ao Angular que o HTML deste componente usará roteamento, rodapé e filtros.
  imports: [RouterOutlet, SiteFooterComponent, FilterBarComponent],
  // 'templateUrl' aponta para o arquivo HTML exato que desenha este componente.
  templateUrl: './app.html',
  // 'styleUrl' aponta para o arquivo SCSS exato que estiliza este componente.
  styleUrl: './app.scss'
})
// Exporta a classe AppComponent para que o Angular possa inicializá-la.
export class AppComponent {
  // Uma variável simples com o nome do projeto.
  title = 'Visualizador de Notícias';
}