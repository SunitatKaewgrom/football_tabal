import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityExpertsComponent } from './community-experts.component';

describe('CommunityExpertsComponent', () => {
  let component: CommunityExpertsComponent;
  let fixture: ComponentFixture<CommunityExpertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityExpertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityExpertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
