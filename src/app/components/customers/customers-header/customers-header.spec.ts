import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersHeader } from './customers-header';

describe('CustomersHeader', () => {
  let component: CustomersHeader;
  let fixture: ComponentFixture<CustomersHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
