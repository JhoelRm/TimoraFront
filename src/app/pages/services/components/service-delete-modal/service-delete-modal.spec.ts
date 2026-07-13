import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDeleteModal } from './service-delete-modal';

describe('ServiceDeleteModal', () => {
  let component: ServiceDeleteModal;
  let fixture: ComponentFixture<ServiceDeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDeleteModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceDeleteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
