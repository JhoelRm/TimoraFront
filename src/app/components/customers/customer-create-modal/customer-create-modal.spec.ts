import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCreateModal } from './customer-create-modal';

describe('CustomerCreateModal', () => {
  let component: CustomerCreateModal;
  let fixture: ComponentFixture<CustomerCreateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCreateModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerCreateModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
