import { TestBed } from '@angular/core/testing';

import { MyScheduleService } from './my-schedule';

describe('MyScheduleService', () => {
  let service: MyScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
