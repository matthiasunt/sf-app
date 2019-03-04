import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShuttlePopoverPage } from './shuttle-popover.page';

describe('ShuttlePopoverPage', () => {
  let component: ShuttlePopoverPage;
  let fixture: ComponentFixture<ShuttlePopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuttlePopoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuttlePopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
