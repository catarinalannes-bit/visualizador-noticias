// Importa as configurações principais do Angular e a ferramenta (LOCALE_ID) que permite definir o idioma padrão.
import { ApplicationConfig, LOCALE_ID } from '@angular/core';

// Importa o provedor de rotas, que gerencia a navegação entre páginas,
// e a opção de rolagem automática ao trocar de página.
import { provideRouter, withInMemoryScrolling } from '@angular/router';

// Importa as rotas (caminhos) definidas no arquivo 'app.routes.ts'.
import { routes } from './app.routes';

// Importa as ferramentas para fazer requisições HTTP e dar suporte a interceptores de classe (DI).
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Importa o interceptor de segurança, que injeta o token da AWS em cada requisição.
import { AuthInterceptor } from './core/interceptors/auth-interceptor';

// --- INÍCIO DA CONFIGURAÇÃO DE IDIOMA (PT-BR) ---
// Importa a função do Angular responsável por registrar as regras de um novo idioma.
import { registerLocaleData } from '@angular/common';

// Importa as regras de formatação da língua portuguesa (meses, dias, formatos de data).
import localePt from '@angular/common/locales/pt';

// Registra o idioma português assim que a aplicação inicia.
registerLocaleData(localePt);
// --- FIM DA CONFIGURAÇÃO DE IDIOMA ---

// Define e exporta a configuração global da aplicação standalone, usada pelo arquivo 'main.ts'.
export const appConfig: ApplicationConfig = {
  // A lista de 'providers' fornece serviços, configurações e ferramentas globais a toda a aplicação.
  providers: [

    // 1. Habilita o sistema de navegação (URL).
    //    withInMemoryScrolling: ao trocar de página (por exemplo, ao clicar numa notícia
    //    do "Leia também"), a tela volta ao topo em vez de manter a rolagem anterior.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),

    // 2. Habilita o cliente HTTP da aplicação, com suporte aos interceptores de classe.
    provideHttpClient(withInterceptorsFromDi()),

    // 3. Registra o AuthInterceptor como "guarda" global das requisições.
    //    'multi: true' permite ter vários interceptores trabalhando em conjunto, se necessário.
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // 4. Define o idioma oficial (Locale) do projeto como português do Brasil.
    //    Com isso, o DatePipe dos templates formata as datas no padrão brasileiro.
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};