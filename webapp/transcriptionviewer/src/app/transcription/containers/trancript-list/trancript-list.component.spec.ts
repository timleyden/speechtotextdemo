import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrancriptListComponent } from './trancript-list.component';

describe('TrancriptListComponent', () => {
  let component: TrancriptListComponent;
  let fixture: ComponentFixture<TrancriptListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrancriptListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrancriptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
