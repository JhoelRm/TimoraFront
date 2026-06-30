import { TestBed } from '@angular/core/testing';

import { Companies } from './companies';

describe('Companies', () => {
  let service: Companies;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Companies);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
