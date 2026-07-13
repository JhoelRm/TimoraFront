import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCompanyModal } from './delete-company-modal';

describe('DeleteCompanyModal', () => {
  let component: DeleteCompanyModal;
  let fixture: ComponentFixture<DeleteCompanyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCompanyModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteCompanyModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
