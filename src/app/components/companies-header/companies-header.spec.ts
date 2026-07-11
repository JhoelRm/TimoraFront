import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesHeader } from './companies-header';

describe('CompaniesHeader', () => {
  let component: CompaniesHeader;
  let fixture: ComponentFixture<CompaniesHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompaniesHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(CompaniesHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
