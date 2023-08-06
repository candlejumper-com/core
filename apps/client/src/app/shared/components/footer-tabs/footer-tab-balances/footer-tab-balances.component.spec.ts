import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabBalancesComponent } from './footer-tab-balances.component';

describe('FooterTabBalancesComponent', () => {
  let component: FooterTabBalancesComponent;
  let fixture: ComponentFixture<FooterTabBalancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabBalancesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
