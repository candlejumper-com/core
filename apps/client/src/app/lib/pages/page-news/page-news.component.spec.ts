/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PageNewsComponent } from './page-news.component';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '../../../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PageNewsComponent', () => {
  let component: PageNewsComponent;
  let fixture: ComponentFixture<PageNewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        NgxsModule.forRoot([]),
        SharedModule,
        PageNewsComponent 
      ],
      providers: [
        CalendarService
      ]
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
