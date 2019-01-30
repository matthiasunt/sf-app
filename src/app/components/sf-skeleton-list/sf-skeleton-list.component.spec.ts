import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SfSkeletonListComponent } from './sf-skeleton-list.component';

describe('SfSkeletonListComponent', () => {
  let component: SfSkeletonListComponent;
  let fixture: ComponentFixture<SfSkeletonListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfSkeletonListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfSkeletonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
