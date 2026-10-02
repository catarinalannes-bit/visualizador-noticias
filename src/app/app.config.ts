// Importa as configurações principais do Angular e a ferramenta (LOCALE_ID) que nos permite definir o idioma padrão.
import { ApplicationConfig, LOCALE_ID } from '@angular/core';

// Importa o provedor de rotas para gerir a navegação entre páginas.
import { provideRouter } from '@angular/router';

// Importa as rotas (caminhos) que definiu no ficheiro 'app.routes.ts'.
import { routes } from './app.routes';

// Importa as ferramentas para fazer requisições à internet (HTTP) e suportar intercetores clássicos (DI).
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Importa o seu intercetor de segurança (que injeta o token da AWS em cada requisição).
import { AuthInterceptor } from './core/interceptors/auth-interceptor';

// --- INÍCIO DA CONFIGURAÇÃO DE IDIOMA (PT-BR) ---
// Importa a função do Angular responsável por registar as regras de um novo idioma.
import { registerLocaleData } from '@angular/common';

// Importa os pacotes com as regras de tradução, meses e formatos específicos da língua portuguesa.
import localePt from '@angular/common/locales/pt';

// Executa o registo do idioma português no exato momento em que a aplicação arranca.
registerLocaleData(localePt);
// --- FIM DA CONFIGURAÇÃO DE IDIOMA ---

// Define e exporta a configuração global da nossa aplicação Standalone para ser usada pelo ficheiro 'main.ts'.
export const appConfig: ApplicationConfig = {
  // A lista de 'providers' fornece serviços, configurações e ferramentas globais a toda a aplicação.
  providers: [
    
    // 1. Habilita o sistema de navegação (URL).
    provideRouter(routes),
    
    // 2. Habilita o cliente HTTP da aplicação, ativando suporte aos intercetores de classe.
    provideHttpClient(withInterceptorsFromDi()),
    
    // 3. Regista o nosso AuthInterceptor como "guarda" global. 
    // O 'multi: true' significa que podemos ter vários intercetores a trabalhar em conjunto, se necessário.
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    
    // 4. NOVO: Informa o Angular que o idioma oficial ("Locale") do projeto é o Português do Brasil.
    // Graças a isto, o seu 'DatePipe' lá no HTML sabe como formatar a data automaticamente.
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};