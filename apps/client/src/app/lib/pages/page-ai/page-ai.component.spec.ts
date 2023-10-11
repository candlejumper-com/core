window.URL.createObjectURL = jest.fn();
(window as any).HTMLCanvasElement.prototype.getContext = () => {
  //
};

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageAIComponent } from './page-ai.component';
import { PlotlyModule } from 'angular-plotly.js'
import * as PlotlyJS from 'plotly.js-dist-min';
import { NgxsModule } from '@ngxs/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

PlotlyModule.plotlyjs = PlotlyJS;

describe('PageHomeComponent', () => {
  let component: PageAIComponent;
  let fixture: ComponentFixture<PageAIComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        PageAIComponent
      ]
    });
    fixture = TestBed.createComponent(PageAIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
