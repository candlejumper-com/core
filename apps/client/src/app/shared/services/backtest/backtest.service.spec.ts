import { TestBed } from '@angular/core/testing';
import { BacktestService } from './backtest.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';

describe('BacktestService', () => {
  let service: BacktestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        MatSnackBarModule
      ]
    });
    service = TestBed.inject(BacktestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
