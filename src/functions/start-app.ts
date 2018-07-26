import * as fs from 'fs';
import * as path from 'path';
import { PackageJson } from '../types/package-json';
import { transformToCompose } from './transform-to-compose';
import { AppComposerImpl } from '../types/app-composer-schema';
import { invokePackage } from './invoke-package';

export function startApp(basePath: string = './'): void {
  const packageJson = PackageJson.read(PackageJson.findPathTo(basePath));
  if (!packageJson) {
    console.error(`can not read package.json from ${basePath}`);
    return;
  }
  if (!packageJson['app-composer']) {
    console.error(`package.json must contain app-composer from ${basePath}`);
    return;
  }
  const appComposer = AppComposerImpl.from(packageJson.name, packageJson['app-composer']);
  transformToCompose(appComposer.targets).forEach((entryPoints, packageName) => {
    const ip = invokePackage(appComposer.plugins, basePath, path.basename(packageName), entryPoints);
    fs.writeFileSync(ip.name, ip.localJs);
    require(ip.name);
  });
}
