import { TestBed } from '@angular/core/testing';

import { ShuttlesService } from './shuttles.service';

describe('ShuttlesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShuttlesService = TestBed.get(ShuttlesService);
    expect(service).toBeTruthy();
  });
});
