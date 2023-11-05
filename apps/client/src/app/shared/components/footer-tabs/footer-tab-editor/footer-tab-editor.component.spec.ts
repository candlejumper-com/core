import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterTabEditorComponent } from './footer-tab-editor.component';

describe('FooterTabsEditorComponent', () => {
  let component: FooterTabEditorComponent;
  let fixture: ComponentFixture<FooterTabEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FooterTabEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
