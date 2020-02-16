import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionSaveBottomsheetComponent } from './transcription-save-bottomsheet.component';

describe('TranscriptionSaveBottomshetComponent', () => {
  let component: TranscriptionSaveBottomsheetComponent;
  let fixture: ComponentFixture<TranscriptionSaveBottomsheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranscriptionSaveBottomsheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranscriptionSaveBottomsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
