
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabOrdersComponent } from './footer-tab-orders.component';

describe('FooterTabOrdersComponent', () => {
  let component: FooterTabOrdersComponent;
  let fixture: ComponentFixture<FooterTabOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabOrdersComponent ]
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
