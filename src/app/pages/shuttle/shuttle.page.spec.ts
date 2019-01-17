import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShuttlePage } from './shuttle.page';

describe('ShuttlePage', () => {
  let component: ShuttlePage;
  let fixture: ComponentFixture<ShuttlePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuttlePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuttlePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
