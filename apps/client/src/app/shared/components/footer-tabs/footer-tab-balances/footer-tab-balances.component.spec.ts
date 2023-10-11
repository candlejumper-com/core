import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabBalancesComponent } from './footer-tab-balances.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FooterTabBalancesComponent', () => {
  let component: FooterTabBalancesComponent;
  let fixture: ComponentFixture<FooterTabBalancesComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [ 
        FooterTabBalancesComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        NgxsModule.forRoot(),
       ],
       schemas: [
         NO_ERRORS_SCHEMA
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabBalancesComponent);
    component = fixture.componentInstance;
    Object.defineProperty(component, 'user$', { writable: true });  
    component.user$ = new BehaviorSubject({
      balances: []
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
