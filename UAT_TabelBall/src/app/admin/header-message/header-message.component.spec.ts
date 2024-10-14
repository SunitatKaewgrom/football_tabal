import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMessageComponent } from './header-message.component';

describe('HeaderMessageComponent', () => {
  let component: HeaderMessageComponent;
  let fixture: ComponentFixture<HeaderMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
