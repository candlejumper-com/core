import { TestBed } from '@angular/core/testing';
import { AIService } from './ai.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('AIService', () => {
  let service: AIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule
      ],
    });
    service = TestBed.inject(AIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
