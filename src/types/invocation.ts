import { EntryPoint } from './entry-point';
import { Invokeable } from './invokeable';
import { InvokationArgs } from './invokation-args';
import { loadConfig } from '../functions/config-loader';

export class Invocation {
  public readonly packageName: string;
  public readonly jsEntryPoints: string[];
  public readonly jsLocalRequires: string[];
  public readonly jsGlobalRequires: string[];
  private invokationArgs: InvokationArgs;

  // tslint:disable-next-line: no-any
  public static fill(obj: any): Invocation {
    return new Invocation(obj.packageName, obj.jsEntryPoints,
      obj.jsLocalRequires, obj.jsGlobalRequires);
  }

  // tslint:disable-next-line
  private static resolverTemplate(jse: any, appSrv: any, merge: (x: any) => void): void {
    const obj: Invokeable = jse.factory();
    appSrv.addController(obj.apiController);
    merge(obj.serverConfig || {});
  }

  public constructor(packageName: string,
    jeps: string[] = [], jlrs: string[] = [], jgrs: string[] = []) {
    this.packageName = packageName;
    this.jsEntryPoints = jeps;
    this.jsLocalRequires = jlrs;
    this.jsGlobalRequires = jgrs;
  }

  public merge(other: Invocation): void {
    this.jsEntryPoints.push.apply(this.jsEntryPoints, other.jsEntryPoints);
    this.jsLocalRequires.push.apply(this.jsLocalRequires, other.jsLocalRequires);
    this.jsGlobalRequires.push.apply(this.jsGlobalRequires, other.jsGlobalRequires);
  }

  private getInvokationArgs(): InvokationArgs {
    if (!this.invokationArgs) {
      try {
        this.invokationArgs = loadConfig(process.cwd()).invokationArgs;
      } catch (e) {
        console.warn('could not load invokation args. Using stub args.');
        this.invokationArgs = {
          preamble: () => ['// preamble'],
          createServer: () => ['// create server'],
          startServer: () => ['// start server']
        };
      }
    }
    return this.invokationArgs;
  }

  private createServer(): string[] {
    return this.getInvokationArgs().createServer();
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

  private startServer(): string[] {
    return this.getInvokationArgs().startServer();
  }

  private preamble(): string[] {
    return this.getInvokationArgs().preamble();
  }

  public build(reqs: string[]): string {
    const js = this.preamble()
      .concat(reqs)
      .concat(this.createServer())
      .concat(this.jsEntryPoints)
      .concat(this.startServer());
    return js.join('\n');
  }

}
