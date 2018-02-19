import * as express from 'express';
import * as core from 'express-serve-static-core';

export class AppComposer {
  public readonly baseUrl: string;
  public readonly express: core.Express;
  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.express = express();
  }
}

export default AppComposer;
