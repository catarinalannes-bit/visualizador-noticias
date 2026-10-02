import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url-pipe';

describe('SafeUrlPipe', () => {
  let pipe: SafeUrlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = new SafeUrlPipe(TestBed.inject(DomSanitizer));
  });

  it('aceita embed do YouTube', () => {
    expect(pipe.transform('https://www.youtube.com/embed/abc123')).not.toBeNull();
  });

  it('aceita embed do youtube-nocookie', () => {
    expect(pipe.transform('https://www.youtube-nocookie.com/embed/abc123')).not.toBeNull();
  });

  it('rejeita URL de outro domínio', () => {
    expect(pipe.transform('https://site-malicioso.com/embed/abc123')).toBeNull();
  });

  it('rejeita http sem TLS', () => {
    expect(pipe.transform('http://www.youtube.com/embed/abc123')).toBeNull();
  });

  it('rejeita javascript:', () => {
    expect(pipe.transform('javascript:alert(1)')).toBeNull();
  });

  it('rejeita valor vazio ou indefinido', () => {
    expect(pipe.transform(undefined)).toBeNull();
    expect(pipe.transform('')).toBeNull();
  });
});