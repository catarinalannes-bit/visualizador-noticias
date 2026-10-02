import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Post } from '../../../../core/models/post';
import { CardComponent } from './card';

describe('CardComponent', () => {
  const DIA = 24 * 60 * 60 * 1000;
  let fixture: ComponentFixture<CardComponent>;

  const postBase: Post = {
    id: 1,
    titulo: 'Notícia de Teste',
    subtitulo: 'Subtítulo',
    corpo: '<p>Teste</p>',
    urlPost: 'https://site.radiomemory.com.br',
    autor: 'teste@radiomemory.com.br',
    status: 1,
    data: new Date().toISOString(),
    categoria: 'blog'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      // O card usa routerLink, que precisa do roteador.
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('post', postBase);
    fixture.detectChanges();
  });

  const card = () => fixture.nativeElement.querySelector('.news-card') as HTMLElement;

  it('mostra título e autor', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Notícia de Teste');
    expect(texto).toContain('teste@radiomemory.com.br');
  });

  it('marca como fixado quando data_fixo está no futuro', () => {
    fixture.componentRef.setInput('post', {
      ...postBase,
      data_fixo: new Date(Date.now() + DIA).toISOString()
    });
    fixture.detectChanges();
    expect(card().classList.contains('pinned')).toBe(true);
  });

  it('não marca como fixado quando data_fixo já passou', () => {
    fixture.componentRef.setInput('post', {
      ...postBase,
      data_fixo: new Date(Date.now() - DIA).toISOString()
    });
    fixture.detectChanges();
    expect(card().classList.contains('pinned')).toBe(false);
  });
});