import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MySfPage } from './my-sf.page';

describe('MySfPage', () => {
  let component: MySfPage;
  let fixture: ComponentFixture<MySfPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySfPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MySfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
