export interface EntryPointSchema {
  moduleName: string; // string to require
  entryPoint?: string; // function name to export
}

export class EntryPoint implements EntryPointSchema {
  public readonly moduleName: string;
  public readonly entryPoint?: string;

  // public static create(json: EntryPointSchema, defEntryPoint = 'default'): EntryPoint {
  //   return new EntryPoint(json, defEntryPoint);
  // }

  public constructor(eps: EntryPointSchema, defEntryPoint = 'default') {
    this.moduleName = eps.moduleName;
    this.entryPoint = eps.entryPoint || defEntryPoint;
  }
}
