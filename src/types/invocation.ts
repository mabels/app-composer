import { EntryPoint } from './entry-point';
import { Invokeable } from './invokeable';
import { InvocationParams } from './invocation-params';

export class Invocation {
  public readonly packageName: string;
  public readonly jsEntryPoints: string[];
  public readonly jsLocalRequires: string[];
  public readonly jsGlobalRequires: string[];
  public readonly invocationParams: InvocationParams[];

  // tslint:disable-next-line: no-any
  public static fill(obj: any): Invocation {
    return new Invocation(obj.packageName, obj.jsEntryPoints,
      obj.jsLocalRequires, obj.jsGlobalRequires, InvocationParams.fill(obj["app-composer"]));
  }

  // tslint:disable-next-line: no-any
  private static resolverTemplate(jse: any, appSrv: any, merge: (x: any) => void): void {
    const obj: Invokeable = jse.factory();
    appSrv.addController(obj.apiController);
    merge(obj.serverConfig || {});
  }

  public constructor(packageName: string,
    jeps: string[] = [], jlrs: string[] = [], jgrs: string[] = [], obj: ) {
    this.packageName = packageName;
    this.jsEntryPoints = jeps;
    this.jsLocalRequires = jlrs;
    this.jsGlobalRequires = jgrs;
    this.invocationParams = invocationParams;
  }

  public merge(other: Invocation): void {
    this.jsEntryPoints.push.apply(this.jsEntryPoints, other.jsEntryPoints);
    this.jsLocalRequires.push.apply(this.jsLocalRequires, other.jsLocalRequires);
    this.jsGlobalRequires.push.apply(this.jsGlobalRequires, other.jsGlobalRequires);
  }

  private createApiServer(): string[] {
    return [
      `const { AppServer } = require('@myaudi/common/lib/app-server');`,
      'const appServer = new AppServer();',
      'const appServerConfig = {};',
      'function appServerMerge(cfg) { Object.assign(appServerConfig, cfg || {}); };',
      // tslint:disable-next-line: no-any
      `function ${Invocation.resolverTemplate as any}`
    ];
  }

  public add(entryPoint: EntryPoint): void {
    // console.log(`XXX:${JSON.stringify(entryPoint, null, 2)}`);
    if (entryPoint.entryPointFile) {
      const jsEntryPoint = `entryPoint${entryPoint.jsAppName()}`;
      this.jsLocalRequires.push(`const ${jsEntryPoint} = require('${entryPoint.entryPointFile}');`);
      this.jsGlobalRequires.push(
        `const ${jsEntryPoint} = require('${entryPoint.packageJson.name}/${entryPoint.entryPointFile}');`);
      this.jsEntryPoints.push(`resolverTemplate(${jsEntryPoint}, appServer, appServerMerge)`);
    }
  }

  private startApiServer(): string[] {
    return [`appServer.start(appServerConfig);`];
  }

  private preamble(): string[] {
    return [
      '// hello world'
    ];
  }

  public build(reqs: string[]): string {
    const js = this.preamble()
      .concat(reqs)
      .concat(this.createApiServer())
      .concat(this.jsEntryPoints)
      .concat(this.startApiServer());
    return js.join('\n');
  }

}
