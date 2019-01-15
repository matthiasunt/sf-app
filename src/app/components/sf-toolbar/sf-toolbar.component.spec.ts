import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SfToolbarComponent } from './sf-toolbar.component';

describe('SfToolbarComponent', () => {
  let component: SfToolbarComponent;
  let fixture: ComponentFixture<SfToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
