import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrdersList } from './purchase-orders-list';

describe('PurchaseOrdersList', () => {
  let component: PurchaseOrdersList;
  let fixture: ComponentFixture<PurchaseOrdersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrdersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrdersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
