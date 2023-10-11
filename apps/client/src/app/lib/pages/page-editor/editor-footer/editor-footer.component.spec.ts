import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorFooterComponent } from './editor-footer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('EditorFooterComponent', () => {
  let component: EditorFooterComponent;
  let fixture: ComponentFixture<EditorFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        EditorFooterComponent,
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
