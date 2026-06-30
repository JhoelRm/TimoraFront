import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBody } from './modal-body';

describe('ModalBody', () => {
  let component: ModalBody;
  let fixture: ComponentFixture<ModalBody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBody],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalBody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
