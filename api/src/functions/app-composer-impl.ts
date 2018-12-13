import * as core from 'express-serve-static-core';
import * as express from 'express';

import { ServerConfig, AppComposer } from '@app-composer/types';

export class AppComposerImpl implements AppComposer {
  public readonly config: ServerConfig;
  public readonly baseUrl: string;
  public readonly express: core.Express;

  public constructor(baseUrl: string, config: ServerConfig) {
    this.baseUrl = baseUrl;
    this.express = express();
    this.config = config;
  }
}

// export default AppComposer;
