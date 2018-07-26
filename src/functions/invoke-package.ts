import * as path from 'path';
import { Invocation } from '../types/invocation';
import { InvokePackage } from '../types/invoke-package';
import { EntryPoint } from '../types/entry-point';
import { InvocationParams } from '../types/invocation-params';
import { TargetEntryPoint } from '../types/target-entry-point';

export function entryPointToInvokationParam(pn: string, ep: EntryPoint): InvocationParams {
  let mod: any;
  try {
    try {
      mod = require(ep.moduleName);
    } catch (e) {
      mod = require(path.join(pn, ep.moduleName));
    }
    const factory: () => InvocationParams = mod[ep.entryPoint];
    if (typeof(factory) != 'function') {
      throw new Error(`can not find endpoint:${ep.entryPoint} in module`);
    }
    return factory();
  } catch (e) {
    console.error(`Invocation not possible for ${pn}${JSON.stringify(ep)}`);
    return null;
  }

}

export function invokePackage(ips: EntryPoint[], basePath: string,
  packageName: string, entryPoints: TargetEntryPoint[]): InvokePackage {
  // console.log(`invoke ${packageName} for ${JSON.stringify(entryPoints.map((ep) => ep.appName))}`);
  const invocation = new Invocation(ips.map(ep => entryPointToInvokationParam(packageName, ep)), packageName);
  entryPoints.forEach((ep) => invocation.add(ep));
  const invokeJsFname = path.join(basePath, `.invoke.${packageName}.js`);
  const localJs = invocation.build(invocation.jsLocalRequires);
  const globalJs = invocation.build(invocation.jsGlobalRequires);
  return { name: invokeJsFname, invocation, localJs, globalJs };
}
