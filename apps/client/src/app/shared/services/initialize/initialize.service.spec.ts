import { TestBed } from '@angular/core/testing';

import { InitializeService } from './initialize.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';

describe('InitializeService', () => {
  let service: InitializeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule
      ],
      providers: [
        InitializeService
      ]
    });
    service = TestBed.inject(InitializeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
