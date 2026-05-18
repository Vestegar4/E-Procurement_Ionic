import { TestBed } from '@angular/core/testing';

import { Tender } from './tender.service';

describe('Tender', () => {
  let service: Tender;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tender);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
