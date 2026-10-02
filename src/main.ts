// Importa a API de bootstrapping para aplicações Angular baseadas no paradigma Standalone.
import { bootstrapApplication } from '@angular/platform-browser';

// Importa as configurações globais da aplicação (incluindo fornecedores, diretivas globais e rotas).
import { appConfig } from './app/app.config';

// Importa o componente raiz (root component) da aplicação.
import { AppComponent } from './app/app';

// Inicializa a aplicação injetando o componente raiz e as respetivas configurações de provedores.
bootstrapApplication(AppComponent, appConfig)

// Registo de exceções e tratamento de erros críticos de inicialização no fluxo de execução.
.catch((err) => console.error(err));