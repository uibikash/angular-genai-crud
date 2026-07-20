import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ItemService } from './item.service';

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemService);
  });
  

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
