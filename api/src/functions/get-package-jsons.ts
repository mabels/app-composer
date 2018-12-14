import * as yargs from 'yargs';
import { ProjectRoot } from './project-root';
import { Io } from '@app-composer/types';
import { StdIo } from './std-io';

export namespace GetPackageJsons {
  export interface Type extends ProjectRoot {
    readonly io: Io;
    readonly cmdLernaExec: string;
    readonly cmdPwdCmd: string;
  }

  export function applyArgs(y: yargs.Argv): yargs.Argv {
    y.option('cmdLernaExec', {
      alias: 'C',
      default: 'npx lerna exec'
    });
    y.option('cmdPwdCmd', {
      alias: 'W',
      default:
        "node -e \"require('fs').appendFileSync(process.argv[1], process.cwd()+'\\n')\""
    });
    return y;
  }

  export function fromArgs(args: yargs.Arguments): GetPackageJsons.Type {
    return {
      ...ProjectRoot.fromArgs(args),
      io: StdIo.create(),
      cmdLernaExec: args.cmdLernaExec,
      cmdPwdCmd: args.cmdPwdCmd
    };
  }
}
