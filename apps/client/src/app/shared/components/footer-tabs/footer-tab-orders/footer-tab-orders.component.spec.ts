
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabOrdersComponent } from './footer-tab-orders.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';

describe('FooterTabOrdersComponent', () => {
  let component: FooterTabOrdersComponent;
  let fixture: ComponentFixture<FooterTabOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot([]),
        HttpClientTestingModule,
        MatSnackBarModule,
        FooterTabOrdersComponent
      ],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
