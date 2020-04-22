export interface IAppConfig {
  env: {
    name: string;
};
  appInsights: AppInsights;
  configUrl: string;
}

interface AppInsights {
  instrumentationKey: string;
}


