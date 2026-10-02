// Importa o decorador Injectable para definir que esta classe é um serviço do Angular.
import { Injectable } from '@angular/core';
// Importa o HttpClient, a ferramenta oficial do Angular para fazer requisições à internet (HTTP).
import { HttpClient } from '@angular/common/http';
// Importa o Observable do RxJS para lidar com dados assíncronos (dados que demoram tempo a chegar do servidor).
import { Observable } from 'rxjs';
// Importa a interface Post que criámos, garantindo que os dados recebidos têm o formato correto.
import { Post } from '../models/post';
// Importa o ficheiro de ambiente de segurança, onde a URL da AWS não fica exposta diretamente no código.
import { environment } from '../../../environments/environment';

// O decorador Injectable com 'providedIn: root' torna este serviço disponível globalmente em toda a aplicação.
@Injectable({
  providedIn: 'root'
})
export class AmnesesApiService {
  
  // Puxa a URL base da API (AWS) diretamente do "cofre" de segurança (environment).
  private apiUrl = environment.apiUrl;

  // O construtor é executado ao criar a classe e injeta a ferramenta HttpClient na variável privada 'http'.
  constructor(private http: HttpClient) {}

  // O método 'getTodosCards' devolve um fluxo (Observable) que o TypeScript sabe conter um array de objetos do tipo 'Post' (<Post[]>).
  getTodosCards(): Observable<Post[]> {
    
    // Cria o payload (corpo da requisição) em formato JSON, exatamente como exigido no documento do teste.
    const body = { acao: 'getTodosCards' };
    
    // Executa a chamada POST para a URL da AWS. O <Post[]> avisa o compilador do formato exato da resposta, resolvendo o erro 'unknown'.
    return this.http.post<Post[]>(this.apiUrl, body);
  }
}