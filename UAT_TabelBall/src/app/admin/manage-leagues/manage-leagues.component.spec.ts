import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLeaguesComponent } from './manage-leagues.component';

describe('ManageLeaguesComponent', () => {
  let component: ManageLeaguesComponent;
  let fixture: ComponentFixture<ManageLeaguesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLeaguesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageLeaguesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
