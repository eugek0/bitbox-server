export interface IConfig {
  port: number;
  mongoUri: string;
  origin: string;
  accessSecret: string;
  accessExpires: string;
  refreshSecret: string;
  refreshExpires: string;
  adminLogin: string;
  adminEmail: string;
  adminPassword: string;
}

interface IConfigurationReturns {
  app: IConfig;
}

export type Configuration = () => IConfigurationReturns;
