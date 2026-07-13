import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilitiesComponent } from './availabilities';

describe('AvailabilitiesComponent', () => {
  let component: AvailabilitiesComponent;
  let fixture: ComponentFixture<AvailabilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilitiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailabilitiesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
