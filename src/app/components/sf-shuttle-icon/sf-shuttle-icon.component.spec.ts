import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SfShuttleIconComponent } from './sf-shuttle-icon.component';

describe('SfShuttleIconComponent', () => {
  let component: SfShuttleIconComponent;
  let fixture: ComponentFixture<SfShuttleIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SfShuttleIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfShuttleIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
