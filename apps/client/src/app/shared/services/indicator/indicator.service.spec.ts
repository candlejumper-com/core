import { TestBed } from '@angular/core/testing';
import { IndicatorService } from './indicator.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('IndicatorService', () => {
  let service: IndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule      ]
    });
    service = TestBed.inject(IndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
