import * as path from 'path';
import * as fs from 'fs';
import { Names } from '@app-composer/types';
import { InvocationApi } from './invocation-api';

export function writeComposedJs(pkgName: string, directory: string, names: Names[]): string {
  const composedJs = path.join(directory, 'index.js');
  const invocation = new InvocationApi(pkgName);
  names.filter((n) => !!n.invocationJson).map((n) => {
    invocation.merge(InvocationApi.fill(n.invocationJson));
  });
  fs.writeFileSync(composedJs, invocation.build(invocation.jsGlobalRequires));
  return composedJs;
}
