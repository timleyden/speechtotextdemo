import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  NavTitle: string
  readonly DefaultTitle: string = "Transcription Viewer"
  MenuIcons: MenuIcon[]
  readonly DefaultMenuIcons: MenuIcon[] = [{ "toolTip": "Create Transcription", "icon": "create", "path": "/transcription/new" }, { "toolTip": "List Transcriptions", "icon": "list", "path": "/transcription" }]
  constructor() {
    this.NavTitle = this.DefaultTitle
    this.MenuIcons = this.DefaultMenuIcons
  }

}
export class MenuIcon {
  toolTip: string;
  icon: string;
  path?: string
  click?: Function
}
