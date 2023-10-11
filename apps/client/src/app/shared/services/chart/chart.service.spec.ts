import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';
import { WSService } from '../ws/ws.service';

describe('ChartService', () => {
  let service: ChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule
      ],
      providers: [
        {
           provide: WSService,
           useValue: {
              socket: {}
           }
        }
     ]
    });
    service = TestBed.inject(ChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
