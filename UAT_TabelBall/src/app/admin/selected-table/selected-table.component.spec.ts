import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTableComponent } from './selected-table.component';

describe('SelectedTableComponent', () => {
  let component: SelectedTableComponent;
  let fixture: ComponentFixture<SelectedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
