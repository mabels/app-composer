
export interface ServerConfig {
  port: number;
  authPassword?: string;
  authUser?: string;
  baseUrl?: string;
  cors?: RegExp[];
  crsfCookieDomain?: string;
  name?: string;
}
