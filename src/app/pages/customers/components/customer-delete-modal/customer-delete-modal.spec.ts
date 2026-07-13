import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDeleteModal } from './customer-delete-modal';

describe('CustomerDeleteModal', () => {
  let component: CustomerDeleteModal;
  let fixture: ComponentFixture<CustomerDeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDeleteModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDeleteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
