
export interface ServerConfig {
  baseUrl?: string;
  cors?: RegExp[];
  port: number;
  crsfCookieDomain?: string;
  authUser?: string;
  authPassword?: string;
}

