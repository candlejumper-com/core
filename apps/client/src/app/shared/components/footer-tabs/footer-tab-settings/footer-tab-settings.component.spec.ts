import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabSettingsComponent } from './footer-tab-settings.component';

describe('FooterTabSettingsComponent', () => {
  let component: FooterTabSettingsComponent;
  let fixture: ComponentFixture<FooterTabSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
