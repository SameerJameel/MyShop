import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderEdit } from './purchase-order-edit';

describe('PurchaseOrderEdit', () => {
  let component: PurchaseOrderEdit;
  let fixture: ComponentFixture<PurchaseOrderEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
