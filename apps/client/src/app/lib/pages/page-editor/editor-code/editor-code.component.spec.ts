import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorCodeComponent } from './editor-code.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('EditorCodeComponent', () => {
  let component: EditorCodeComponent;
  let fixture: ComponentFixture<EditorCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        EditorCodeComponent,
        HttpClientTestingModule,
        MatSnackBarModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
