import { ComponentFixture, TestBed } from '@angular/core/testing';
// 1. Corrigimos o nome para importar o PostDetailComponent corretamente
import { PostDetailComponent } from './post-detail';
import { ActivatedRoute } from '@angular/router';
import { PostsStoreService } from '../../../../core/services/posts-store';

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailComponent],
      providers: [
        // 2. Simulamos a rota para o teste não quebrar ao procurar o ID
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '61' } }
          }
        },
        // 3. Simulamos o seu Cérebro (Store) devolvendo uma lista vazia
        {
          provide: PostsStoreService,
          useValue: { posts: () => [] }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    // await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});