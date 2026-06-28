import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMessage } from './form-message';

describe('FormMessage', () => {
  let component: FormMessage;
  let fixture: ComponentFixture<FormMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(FormMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
