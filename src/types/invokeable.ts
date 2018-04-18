import { ServerConfig } from './server-config';
import { AppComposer } from './app-composer';

export interface Invokeable {
  config: ServerConfig;
  create: () => AppComposer;
}
