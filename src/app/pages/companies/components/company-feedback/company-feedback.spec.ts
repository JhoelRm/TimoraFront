import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyFeedback } from './company-feedback';

describe('CompanyFeedback', () => {
  let component: CompanyFeedback;
  let fixture: ComponentFixture<CompanyFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyFeedback],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyFeedback);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
