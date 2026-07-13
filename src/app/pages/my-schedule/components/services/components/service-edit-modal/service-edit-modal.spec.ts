import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceEditModal } from './service-edit-modal';

describe('ServiceEditModal', () => {
  let component: ServiceEditModal;
  let fixture: ComponentFixture<ServiceEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceEditModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceEditModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
