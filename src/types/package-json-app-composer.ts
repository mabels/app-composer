import * as path from 'path';

function snakeToCamel(s: string): string {
  return s.replace(/(\-\w)/g, (m) => m[1].toUpperCase());
}

export interface TargetEntryPoint {
  public readonly entryPointFile: string;
  public readonly entryPoint: string;
  public readonly appName: string;
  public readonly compose: string;
}

export class TargetEntryPointImplementation implements TargetEntryPoint {
    public readonly entryPointFile: string;
    public readonly entryPoint: string;
    public readonly appName: string;
    public readonly compose: string;

    public static createFromJson(json: any): TargetEntryPoint {
        const entryPointFile = json['entryPointFile'];
        const compose = json['compose'] || json['entryPoint'];
        const entryPoint = json['entryPoint'];
        const appName = json['appName'];
        return new TargetEntryPointImplementation(appName, compose, entryPoint, entryPointFile);
    }
    
    public constructor(appName: string, compose: string, entryPoint: string, entryPointFile: string) {
        this.appName = appName;
        this.compose = compose;
        this.entryPoint = entryPoint;
        this.entryPointFile = entryPointFile;
    }

    public jsEntryPoint(): string {
        return snakeToCamel(path.basename(this.entryPoint));
    }

    public jsAppName(): string {
        return snakeToCamel(path.basename(this.appName));
    }
}

export interface InvocationEntryPoint {
    moduleName: string;
    entryPoint?: string;
}

export class InvocationEntryPointImplementation implements InvocationEntryPoint {
    public readonly moduleName: string;
    public readonly entryPoint?: string;

    public static createFromJson(json: any): InvocationEntryPoint {
        return new InvocationEntryPointImplementation();
    }

    public constructor() {

    }
}

export interface PackageJsonAppComposerParams {
    targets: { [id: string]: TargetEntryPoint };
    invocationParams: InvocationEntryPoint[];
}

export class PackageJsonAppComposer implements PackageJsonAppComposerParams {
    public readonly params: InvocationEntryPoint[];
    public readonly targets: { [id: string]: TargetEntryPoint };

    public static createFromJson(json: any): PackageJsonAppComposer {
        const params = json['invocation-params'].map(param => )
        return new PackageJsonAppComposer(moduleName, entryPoint);
    }

    public constructor(invocationParams: InvocationEntryPoint[], targets: { [id: string]: TargetEntryPoint }) {
        this.moduleName = moduleName;
        this.entryPoint = entryPoint;
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
  /*