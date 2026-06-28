import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTitle } from './card-title';

describe('CardTitle', () => {
  let component: CardTitle;
  let fixture: ComponentFixture<CardTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardTitle],
    }).compileComponents();

    fixture = TestBed.createComponent(CardTitle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
