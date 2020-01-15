import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageaccountDetailComponent } from './storageaccount-detail.component';

describe('StorageaccountDetailComponent', () => {
  let component: StorageaccountDetailComponent;
  let fixture: ComponentFixture<StorageaccountDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageaccountDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageaccountDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
