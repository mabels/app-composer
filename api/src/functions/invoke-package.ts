import * as path from 'path';
import { InvokePackage, EntryPoint } from '@app-composer/types';
import { InvocationApi } from './invocation-api';

export function invokePackage(basePath: string, packageName: string, entryPoints: EntryPoint[]): InvokePackage {
  console.log(`invoke ${packageName} for ${JSON.stringify(entryPoints.map((ep) => ep.appName))}`);
  const invocation = new InvocationApi(packageName);
  entryPoints.forEach((ep) => invocation.add(ep));
  const invokeJsFname = path.join(basePath, `.invoke.${packageName}.js`);
  const localJs = invocation.build(invocation.jsLocalRequires);
  const globalJs = invocation.build(invocation.jsGlobalRequires);
  return { name: invokeJsFname, invocation, localJs, globalJs };
}
