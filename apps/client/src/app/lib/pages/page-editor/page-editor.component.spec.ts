import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEditorComponent } from './page-editor.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';

describe('PageEditorComponent', () => {
  let component: PageEditorComponent;
  let fixture: ComponentFixture<PageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        PageEditorComponent,
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
