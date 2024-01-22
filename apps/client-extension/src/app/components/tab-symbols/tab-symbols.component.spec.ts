/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabSymbolsComponent } from './tab-symbols.component';

describe('TabSymbolsComponent', () => {
  let component: TabSymbolsComponent;
  let fixture: ComponentFixture<TabSymbolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabSymbolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSymbolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
