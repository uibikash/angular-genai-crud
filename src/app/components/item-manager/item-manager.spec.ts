import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemManager } from './item-manager';

describe('ItemManager', () => {
  let component: ItemManager;
  let fixture: ComponentFixture<ItemManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemManager],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
