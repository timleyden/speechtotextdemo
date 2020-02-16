import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  NavTitle: string
  readonly DefaultTitle: string
  MenuIcons: MenuIcon[]
  readonly DefaultMenuIcons: MenuIcon[] = [{ "toolTip": "Create Transcription", "icon": "create", "path": "/transcription/new" }, { "toolTip": "List Transcriptions", "icon": "list", "path": "/transcription" }]
  constructor() {
    this.DefaultTitle =  "Transcription Viewer"
  }

}
export class MenuIcon {
  toolTip: string;
  icon: string;
  order?:number=100;
  path?: string;
  click?: (icon:MenuIcon)=>void;
}
