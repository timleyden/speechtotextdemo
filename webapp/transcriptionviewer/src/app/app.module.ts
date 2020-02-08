import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule, MatButtonModule, MatSnackBarModule, MatDialogModule, MatIcon, MatIconModule, MatTooltip, MatTooltipModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranscriptionModule } from './transcription/transcription.module';
import { NavigationComponent } from './navigation/navigation.component';
//import { UploadAudioComponent } from './transcription/containers/upload-audio/upload-audio.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    FlexLayoutModule,
    MatIconModule,
    MatTooltipModule,
  ],
entryComponents:[],
  providers: [],
  bootstrap: [AppComponent],

})
export class AppModule { }
