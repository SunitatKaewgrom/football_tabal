import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipsTableComponent } from './tips-table.component';

describe('TipsTableComponent', () => {
  let component: TipsTableComponent;
  let fixture: ComponentFixture<TipsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
