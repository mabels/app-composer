import * as yargs from 'yargs';

import { HoistConfig } from './hoist';
import { GenerateConfig } from './generate';
import { GetPackageJsons } from './get-package-jsons';
import { ProjectRoot } from './project-root';
import { StdIo } from './std-io';

interface Commands {
  generate(config: GenerateConfig): Promise<void>;
  hoist(config: HoistConfig): Promise<void>;
}

export function buildDepCli(commands: Commands): void {
  const y0 = yargs.usage('$0 <cmd> [args]');
  y0.command(
    'generate',
    'generate dependency package',
    (y: yargs.Argv) => {
      y.option('outputDirectory', {
        alias: 'o',
        require: true
      });

      y.option('cmdInstallPackages', {
        alias: 'I',
        default: 'yarn install --pure-lockfile'
      });

      GetPackageJsons.applyArgs(y);
      ProjectRoot.applyArgs(y);

      y.option('lockFile', {
        alias: 'L',
        default: 'yarn.lock'
      });

      y.option('yarnOfflineMirror', {
        alias: 'O',
        default: undefined
      });
      return y;
    },
    (args: yargs.Arguments) => {
      commands
        .generate({
          ...GetPackageJsons.fromArgs(args),
          io: StdIo.create(),
          cmdInstallPackages: args.cmdInstallPackages,
          outputDirectory: args.outputDirectory,
          lockFile: args.lockFile,
          yarnOfflineMirror: args.yarnOfflineMirror
        })
        .then()
        .catch();
    }
  );
  y0.command(
    'hoist',
    'hoist links into node_modules',
    (y: yargs.Argv) => {
      GetPackageJsons.applyArgs(y);
      ProjectRoot.applyArgs(y);
      return y;
    },
    (args: yargs.Arguments) => {
      commands
        .hoist({
          ...GetPackageJsons.fromArgs(args),
          io: StdIo.create()
        })
        .then()
        .catch();
    }
  );
  y0.help().parse();
}
