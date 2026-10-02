import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/**
 * Interceptor de autenticação: ponto único onde o token e os cabeçalhos
 * exigidos pelo endpoint da Radio Memory são anexados.
 *
 * DECISÃO DE SEGURANÇA: o token só é enviado para a URL da nossa API
 * (environment.apiUrl). Qualquer outra requisição HTTP passa sem o token,
 * para que ele nunca vaze para um domínio de terceiros.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Requisição para outro destino: segue sem alteração (sem token).
    if (!request.url.startsWith(environment.apiUrl)) {
      return next.handle(request);
    }

    // Os pedidos HTTP do Angular são imutáveis, por isso usamos clone() para
    // criar uma cópia com os cabeçalhos exigidos pelo edital.
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${environment.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    return next.handle(authRequest);
  }
}