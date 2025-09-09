import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrengthsComponent } from './strengths.component';

describe('StrengthsComponent', () => {
  let component: StrengthsComponent;
  let fixture: ComponentFixture<StrengthsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StrengthsComponent]
    });
    fixture = TestBed.createComponent(StrengthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
