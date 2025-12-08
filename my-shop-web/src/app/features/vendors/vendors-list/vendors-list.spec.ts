import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsList } from './vendors-list';

describe('VendorsList', () => {
  let component: VendorsList;
  let fixture: ComponentFixture<VendorsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
