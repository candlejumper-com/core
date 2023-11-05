import { TestBed } from '@angular/core/testing';
import { WSService } from './ws.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('WsService', () => {
  let service: WSService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule
      ],
    });
    service = TestBed.inject(WSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
