import { TestBed } from '@angular/core/testing';
import { WSService } from './ws.service';

describe('WsService', () => {
  let service: WSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
