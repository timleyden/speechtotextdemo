import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionNewComponent } from './transcription-new.component';

describe('TranscriptionNewComponent', () => {
  let component: TranscriptionNewComponent;
  let fixture: ComponentFixture<TranscriptionNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranscriptionNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranscriptionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
