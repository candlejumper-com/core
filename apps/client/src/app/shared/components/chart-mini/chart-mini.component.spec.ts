/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChartMiniComponent } from './chart-mini.component';

describe('ChartMiniComponent', () => {
  let component: ChartMiniComponent;
  let fixture: ComponentFixture<ChartMiniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ChartMiniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
