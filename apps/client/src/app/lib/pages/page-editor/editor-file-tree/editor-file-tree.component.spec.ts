import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTreeComponent } from './editor-file-tree.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('FileTreeComponent', () => {
  let component: FileTreeComponent;
  let fixture: ComponentFixture<FileTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        FileTreeComponent,
        HttpClientTestingModule,
        MatSnackBarModule
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
