import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabStatusComponent } from './footer-tab-status.component';

describe('FooterTabStatusComponent', () => {
  let component: FooterTabStatusComponent;
  let fixture: ComponentFixture<FooterTabStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
