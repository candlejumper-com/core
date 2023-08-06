import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabLogsComponent } from './footer-tab-logs.component';

describe('FooterTabLogsComponent', () => {
  let component: FooterTabLogsComponent;
  let fixture: ComponentFixture<FooterTabLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
