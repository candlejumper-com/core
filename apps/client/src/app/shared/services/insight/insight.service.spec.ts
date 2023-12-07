/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InsightService } from './insight.service';

describe('Service: Insight', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InsightService]
    });
  });

  it('should ...', inject([InsightService], (service: InsightService) => {
    expect(service).toBeTruthy();
  }));
});
