// Importa o tipo 'Routes' do núcleo de roteamento do Angular para garantir que escrevemos as rotas no formato correto.
import { Routes } from '@angular/router';

// Importa o componente da nossa listagem, percorrendo o caminho até a pasta correta.
import { CardListComponent } from './features/posts/components/card-list/card-list';

// Importa o componente de detalhe da notícia.
import { PostDetailComponent } from './features/posts/components/post-detail/post-detail';

// Exporta a constante 'routes' que contém a matriz (array) com todas as páginas do site.
export const routes: Routes = [
  {
    // 'path' vazio ('') significa a página inicial, a raiz do site (ex: localhost:4200/).
    path: '',
    component: CardListComponent,
    // Título da aba na listagem (mesmo formato "página | site" usado em todo o projeto).
    title: 'Notícias | Radio Memory'
  },
  {
    // Rota dinâmica que recebe o ID da notícia na URL (ex: localhost:4200/post/61).
    path: 'post/:id',
    component: PostDetailComponent,
    // Título provisório, exibido enquanto a notícia carrega.
    // Assim que os dados chegam, o PostDetailComponent troca pelo título da notícia.
    title: 'Notícia | Radio Memory'
  },
  {
    // Rota de segurança (fallback): se o usuário digitar um endereço que não existe, volta automaticamente ao início.
    path: '**',
    redirectTo: ''
  }
];