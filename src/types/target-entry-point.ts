import * as path from 'path';
import { EntryPoint, EntryPointSchema } from './entry-point';
import { snakeToCamel } from '../functions/snake-to-camel';

export interface TargetEntryPointSchema {
  composeDirectory: string;
  entryPoints: EntryPointSchema | EntryPointSchema[];
}

export class TargetEntryPoint implements TargetEntryPointSchema {
    // public readonly packageName: string;
    // public readonly composeName: string;
    public readonly composeDirectory: string;
    public readonly entryPoints: EntryPointSchema[];

    public constructor(packageName: string, key: string, teps: TargetEntryPointSchema) {
      // super(teps, 'factory');
      // this.composeName = key;
      // this.packageName = teps.packageName;
      this.composeDirectory = teps.composeDirectory;
    }

    // public jsEntryPoint(): string {
    //     return snakeToCamel(path.basename(this.entryPoint));
    // }

    // public jsAppName(): string {
    //     return snakeToCamel(path.basename(this.composeName));
    // }
}
