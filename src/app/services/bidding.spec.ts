import { TestBed } from '@angular/core/testing';

import { Bidding } from './bidding';

describe('Bidding', () => {
  let service: Bidding;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bidding);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
