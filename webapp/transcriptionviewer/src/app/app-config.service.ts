import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from './app-config.model';
import { environment } from '../environments/environment';

import { ApplicationInsights} from '@microsoft/applicationinsights-web';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
public AppInsights:ApplicationInsights
  static settings: IAppConfig;
  constructor(private http: HttpClient) {}
  load() {
      const jsonFile = `assets/config/config.${environment.name}.json`;
      return new Promise<void>((resolve, reject) => {
          this.http.get(jsonFile).toPromise().then((response : IAppConfig) => {
             AppConfigService.settings = <IAppConfig>response;
             this.AppInsights = new ApplicationInsights({ config: {
              instrumentationKey: AppConfigService.settings.appInsights.instrumentationKey,
              enableAutoRouteTracking: true
            } });
            this.AppInsights.loadAppInsights();
            this.AppInsights.trackPageView(); // Manually call trackPageView to establish the current user/session/pageview
             resolve();
          }).catch((response: any) => {
             reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
          });
      });


  }
}
