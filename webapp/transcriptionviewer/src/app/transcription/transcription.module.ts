import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TrancriptListComponent } from './containers/trancript-list/trancript-list.component';
import { TranscriptionDetailComponent } from './containers/transcription-detail/transcription-detail.component';
import { UploadAudioComponent } from './containers/upload-audio/upload-audio.component';
import { TranscriptionNewComponent } from './containers/transcription-new/transcription-new.component';
import { StorageaccountDetailComponent } from './components/storageaccount-detail/storageaccount-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatCheckboxModule, MatDialogModule, MatTableModule, MatDividerModule, MatStepperModule, MatToolbarModule, MatIconModule, MatTooltipModule, MatBottomSheetModule, MatSidenavModule, MatListModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranscriptionSaveBottomsheetComponent } from './components/transcription-save-bottomsheet/transcription-save-bottomsheet.component';


@NgModule({
  declarations: [
    TrancriptListComponent,
    TranscriptionDetailComponent,
    TranscriptionNewComponent,
    StorageaccountDetailComponent,
    UploadAudioComponent,
    TranscriptionSaveBottomsheetComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    FlexLayoutModule,
    MatDialogModule,
    MatTableModule,
    MatStepperModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatListModule,
    RouterModule.forChild([
      { path: '', component: TrancriptListComponent },
      { path: 'detail/:transcriptId', component: TranscriptionDetailComponent },
      { path: 'new', component: TranscriptionNewComponent }

    ])
  ],
  exports: [UploadAudioComponent],
  entryComponents: [UploadAudioComponent,TranscriptionSaveBottomsheetComponent]
})
export class TranscriptionModule { }
