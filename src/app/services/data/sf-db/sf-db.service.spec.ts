import { TestBed } from '@angular/core/testing';

import { SfDbService } from './sf-db.service';

describe('SfDbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SfDbService = TestBed.get(SfDbService);
    expect(service).toBeTruthy();
  });
});
