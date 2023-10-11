import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuthComponent } from './dialog-auth.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DialogAuthComponent', () => {
  let component: DialogAuthComponent;
  let fixture: ComponentFixture<DialogAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot(),
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        DialogAuthComponent 
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
