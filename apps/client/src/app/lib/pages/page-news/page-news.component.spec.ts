/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PageNewsComponent } from './page-news.component';

describe('PageNewsComponent', () => {
  let component: PageNewsComponent;
  let fixture: ComponentFixture<PageNewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ PageNewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
