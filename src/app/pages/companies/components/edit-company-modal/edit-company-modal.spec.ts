import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompanyModal } from './edit-company-modal';

describe('EditCompanyModal', () => {
  let component: EditCompanyModal;
  let fixture: ComponentFixture<EditCompanyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompanyModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCompanyModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
