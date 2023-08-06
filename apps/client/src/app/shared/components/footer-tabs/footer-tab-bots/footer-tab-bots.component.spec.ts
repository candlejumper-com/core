import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabBotsComponent } from './footer-tab-bots.component';

describe('FooterTabBotsComponent', () => {
  let component: FooterTabBotsComponent;
  let fixture: ComponentFixture<FooterTabBotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabBotsComponent ]
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
