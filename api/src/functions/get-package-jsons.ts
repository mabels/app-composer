import * as yargs from 'yargs';
import { ProjectRoot } from './project-root';

export namespace GetPackageJsons {
  export interface Type extends ProjectRoot {
    readonly cmdGetPackageJsons: string;
  }

  export function applyArgs(y: yargs.Argv): yargs.Argv {
    return y.option('cmdGetPackageJsons', {
      alias: 'C',
      default: "yarn run lerna exec 'echo $(pwd)/package.json'"
    });
  }

  export function fromArgs(args: yargs.Arguments): GetPackageJsons.Type {
    return {
      ...ProjectRoot.fromArgs(args),
      cmdGetPackageJsons: args.cmdGetPackageJsons
    };
  }
}
