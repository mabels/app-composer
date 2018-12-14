import * as path from 'path';

import { buildDepCli } from './functions/build-dep-cli';
import {
  GenerateConfig,
  mergeDependencies,
  filterOwnDependencies,
  buildDependencyProject
} from './functions/generate';
import { hoistOwnPackage, HoistConfig } from './functions/hoist';
import { collectAllPackageJson } from './functions/collect-all-package-json';
import { readPackageJson } from './functions/read-package-json';
import { PublishConfig, publishAction } from './functions/publish';

export function startBuildDepCli(): void {
  buildDepCli({
    async generate(config: GenerateConfig): Promise<void> {
      console.log('1');
      const pjsons = await collectAllPackageJson(config);
      console.log('2');
      const withOwnDependencies = mergeDependencies(
        config,
        pjsons,
        (await readPackageJson(path.join(config.projectRoot, 'package.json')))
          .data
      );
      console.log('3');
      const depends = filterOwnDependencies(
        config,
        pjsons,
        withOwnDependencies
      );
      console.log('4');
      await buildDependencyProject(config, depends);
      console.log('5');
    },
    async hoist(config: HoistConfig): Promise<void> {
      const pjsons = await collectAllPackageJson(config);
      hoistOwnPackage(config, pjsons);
    },
    publish(config: PublishConfig): Promise<void> {
      return publishAction(config);
    }
  });
}
