import * as path from 'path';

import { EntryPoint, EntryPointSchema } from './entry-point';
import { TargetEntryPointSchema } from './target-entry-point';

export interface AppComposerSchema {
    targets: { [id: string]: (TargetEntryPointSchema | TargetEntryPointSchema[]) };
    plugins: EntryPointSchema[];
}

export class AppComposerImpl {
    public readonly plugins: EntryPoint[];
    public readonly targets: TargetEntryPoint[];

    public static from(pname: string, json: AppComposerSchema): AppComposerImpl {
        const ieps = (json.plugins || []).map(param => new EntryPoint(param, 'template'));
        const targets: TargetEntryPoint[] = [];
        for (let key in json.targets) {
          const valOrArray = json.targets[key];
          let val: TargetEntryPointSchema[];
          if (Array.isArray(valOrArray)) {
            val = valOrArray;
          } else {
            val = [valOrArray];
          }
          val.forEach(teps => {
            targets.push(new TargetEntryPoint(pname, key, teps));
          });
        }
        return new AppComposerImpl(ieps, targets);
    }

    public constructor(invocationParams: EntryPoint[], targets: TargetEntryPoint[]) {
        this.invocationParams = invocationParams;
        this.targets = targets;
    }
}

/*
  "appComposer": {
    "invocation-params": [{
        moduleName: @myaudi/common/lib/invocation-params.js',
        entryPoint: ip
    }],
    "targets": {
      "appServer": {
        "entryPointFile": "./lib/api-controller",
        "compose": "../../.composed/app-server"
      }
    }
  },
*/
