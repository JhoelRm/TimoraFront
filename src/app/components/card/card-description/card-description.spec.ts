import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDescription } from './card-description';

describe('CardDescription', () => {
  let component: CardDescription;
  let fixture: ComponentFixture<CardDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDescription],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDescription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
