// A palavra-chave 'export' permite que este modelo seja importado e usado em outras partes do sistema, como na Store e nos Cards.
// A palavra-chave 'interface' cria o "contrato" estrutural, definindo o formato exato que esperamos receber da API.
export interface Post {
  // 'id' é um identificador único numérico.
  id: number;
  
  // 'titulo' é o texto principal da notícia (obrigatório).
  titulo: string;
  
  // 'subtitulo' é a chamada secundária (obrigatório).
  subtitulo: string;
  
  // 'corpo' é o conteúdo completo da notícia, que virá em formato HTML e precisará ser sanitizado depois.
  corpo: string;
  
  // 'urlPost' é o link externo para a notícia completa no site da Radio Memory.
  urlPost: string;
  
  // A interrogação (?) significa que 'imgUrl' é opcional. Nem todo post tem imagem, e o TypeScript precisa saber disso para não gerar erros.
  imgUrl?: string;
  
  // 'autor' é o e-mail ou nome de quem escreveu.
  autor: string;
  
  // 'status' dita se o post está ativo. Pela regra de negócio, só renderizaremos os que tiverem status igual a 1.
  status: number;
  
  // 'data' é a data de publicação original em formato ISO (ex: 2025-02-03T16:56:40.000Z).
  data: string;
  
  // 'categoria' é a tag de classificação (ex: "blog").
  categoria: string;
  
  // 'videoUrl' é opcional (?). Se existir, indica que o post tem um vídeo do YouTube embutido.
  videoUrl?: string;


  // 'data_fixo' é opcional (?). Se existir e for uma data no futuro, o post será "pinado" (fixado) no topo da lista.
  data_fixo?: string;
}
