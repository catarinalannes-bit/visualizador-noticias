import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { PostDetailComponent } from './post-detail';
import { PostsStoreService } from '../../../../core/services/posts-store';

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailComponent],
      providers: [
        // Rota simulada (/post/61). O componente lê o id como signal
        // (toSignal sobre o paramMap), então a simulação precisa do
        // paramMap como observable, além do snapshot usado como valor inicial.
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '61' })),
            snapshot: { paramMap: convertToParamMap({ id: '61' }) }
          }
        },
        // Store simulada, sem posts carregados: cobre tudo o que o componente
        // e o template leem (post, relacionadas, carregamento e filtros do "Voltar").
        {
          provide: PostsStoreService,
          useValue: {
            getById: () => undefined,
            getRelated: () => [],
            loading: () => false,
            searchQuery: () => '',
            selectedCategory: () => ''
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});