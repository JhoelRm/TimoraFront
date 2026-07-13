import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCompanyModal } from './create-company-modal';

describe('CreateCompanyModal', () => {
  let component: CreateCompanyModal;
  let fixture: ComponentFixture<CreateCompanyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCompanyModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCompanyModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
