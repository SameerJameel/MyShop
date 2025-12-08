import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtsList } from './debts-list';

describe('DebtsList', () => {
  let component: DebtsList;
  let fixture: ComponentFixture<DebtsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
