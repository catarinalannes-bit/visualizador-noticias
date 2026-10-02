import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html-pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = new SafeHtmlPipe(TestBed.inject(DomSanitizer));
  });

  it('mantém a formatação segura', () => {
    expect(pipe.transform('<p>Olá <strong>mundo</strong></p>')).toContain('<strong>mundo</strong>');
  });

  it('remove <script> (o script nunca executa)', () => {
    const resultado = pipe.transform('<p>ok</p><script>alert(1)</script>') ?? '';
    expect(resultado).toContain('<p>ok</p>');
    expect(resultado).not.toContain('<script');
  });

  it('remove atributos de evento como onerror', () => {
    const resultado = pipe.transform('<img src="x" onerror="alert(1)">') ?? '';
    expect(resultado).not.toContain('onerror');
  });

   it('neutraliza links javascript: (o Angular prefixa com "unsafe:")', () => {
    const resultado = pipe.transform('<a href="javascript:alert(1)">clique</a>') ?? '';
    // O link não é removido: o protocolo vira "unsafe:" e o navegador não o executa.
    expect(resultado).toContain('href="unsafe:javascript:');
    expect(resultado).not.toContain('href="javascript:');
  });
});