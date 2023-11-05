import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabBotsComponent } from './footer-tab-bots.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';

describe('FooterTabBotsComponent', () => {
  let component: FooterTabBotsComponent;
  let fixture: ComponentFixture<FooterTabBotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        HttpClientTestingModule,
        MatSnackBarModule,
        NgxsModule.forRoot([]),
        FooterTabBotsComponent
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
