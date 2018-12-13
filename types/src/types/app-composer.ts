import * as core from 'express-serve-static-core';
import { ServerConfig } from './server-config';

export interface AppComposer {
  readonly config: ServerConfig;
  readonly baseUrl: string;
  readonly express: core.Express;
}

// export default AppComposer;
