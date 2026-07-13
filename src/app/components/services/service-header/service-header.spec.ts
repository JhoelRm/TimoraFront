import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceHeader } from './service-header';

describe('ServiceHeader', () => {
  let component: ServiceHeader;
  let fixture: ComponentFixture<ServiceHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
