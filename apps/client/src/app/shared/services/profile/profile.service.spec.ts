import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { NgxsModule } from '@ngxs/store';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot()
      ],
    });
    service = TestBed.inject(ProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
