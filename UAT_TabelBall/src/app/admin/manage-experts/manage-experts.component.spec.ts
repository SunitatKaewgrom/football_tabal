import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExpertsComponent } from './manage-experts.component';

describe('ManageExpertsComponent', () => {
  let component: ManageExpertsComponent;
  let fixture: ComponentFixture<ManageExpertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageExpertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageExpertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
