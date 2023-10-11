window.URL.createObjectURL = jest.fn();
(window as any).HTMLCanvasElement.prototype.getContext = () => {
  //
};

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TrainingViewComponent } from './training-view.component'
import { PlotlyModule } from 'angular-plotly.js'
import * as PlotlyJS from 'plotly.js-dist-min';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { TensorflowInstance } from '../../../shared/services/tensorflow/instance/tensorflow.instance';
import { TENSORFLOW_HARDWARE } from '../../../shared/services/tensorflow/tensorflow.util';

PlotlyModule.plotlyjs = PlotlyJS;

describe('TrainingViewComponent', () => {
  let component: TrainingViewComponent
  let fixture: ComponentFixture<TrainingViewComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        TrainingViewComponent
      ],
      providers: []
    })
    fixture = TestBed.createComponent(TrainingViewComponent)
    component = fixture.componentInstance
    component.instance = new TensorflowInstance(null, { hardware: TENSORFLOW_HARDWARE.CPU}, null)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
