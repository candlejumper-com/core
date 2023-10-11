import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabBacktestComponent } from './footer-tab-backtest.component';
import { NgxsModule } from '@ngxs/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('FooterTabBacktestComponent', () => {
  let component: FooterTabBacktestComponent;
  let fixture: ComponentFixture<FooterTabBacktestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        FooterTabBacktestComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        NgxsModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabBacktestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
