import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolOverviewComponent } from './symbol-overview.component';

describe('SymbolOverviewComponent', () => {
  let component: SymbolOverviewComponent;
  let fixture: ComponentFixture<SymbolOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SymbolOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymbolOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
