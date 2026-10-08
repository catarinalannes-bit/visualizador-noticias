/**
 * Gera o src/environments/environment.ts no build da Vercel, a partir das
 * variáveis de ambiente cadastradas no painel (o token nunca fica no repositório).
 *
 * Segurança: só roda dentro da Vercel (variável VERCEL definida). Localmente
 * não faz nada, para o token real nunca ser gravado num arquivo versionado.
 */
const fs = require('fs');
const path = require('path');

if (!process.env.VERCEL) {
  console.log('[set-env] Fora da Vercel: environment.ts não foi alterado.');
  process.exit(0);
}

const token = process.env.API_TOKEN;
const apiUrl = process.env.API_URL || 'https://6fx8kzbiw3.execute-api.us-east-2.amazonaws.com/prod';

if (!token) {
  console.error('[set-env] Variável API_TOKEN não definida no painel da Vercel.');
  process.exit(1);
}

const conteudo = `export const environment = {
  production: true,
  apiUrl: ${JSON.stringify(apiUrl)},
  token: ${JSON.stringify(token)}
};
`;

const destino = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
fs.writeFileSync(destino, conteudo);
console.log('[set-env] environment.ts gerado a partir das variáveis de ambiente.');