import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabsEditorComponent } from './footer-tab-editor.component';

describe('FooterTabsEditorComponent', () => {
  let component: FooterTabsEditorComponent;
  let fixture: ComponentFixture<FooterTabsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTabsEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
