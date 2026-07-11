import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEditModal } from './customer-edit-modal';

describe('CustomerEditModal', () => {
  let component: CustomerEditModal;
  let fixture: ComponentFixture<CustomerEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerEditModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerEditModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
