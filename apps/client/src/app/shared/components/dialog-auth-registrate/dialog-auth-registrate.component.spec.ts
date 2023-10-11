import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuthRegistrateComponent } from './dialog-auth-registrate.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DialogAuthRegistrateComponent', () => {
  let component: DialogAuthRegistrateComponent;
  let fixture: ComponentFixture<DialogAuthRegistrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot(),
        NoopAnimationsModule,
        DialogAuthRegistrateComponent,
        MatDialogModule,
        HttpClientTestingModule
       ],
       providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAuthRegistrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
