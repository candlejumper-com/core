import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabBacktestComponent } from './footer-tab-backtest.component';

describe('FooterTabBacktestComponent', () => {
  let component: FooterTabBacktestComponent;
  let fixture: ComponentFixture<FooterTabBacktestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabBacktestComponent ]
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
