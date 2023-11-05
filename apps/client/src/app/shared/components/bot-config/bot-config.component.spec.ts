import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotConfigComponent } from './bot-config.component';
import { ResizableModule } from 'angular-resizable-element';

describe('BotConfigComponent', () => {
  let component: BotConfigComponent;
  let fixture: ComponentFixture<BotConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResizableModule
      ],
      declarations: [ BotConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
