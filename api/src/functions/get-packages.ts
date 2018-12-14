import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

import * as execa from 'execa';
import * as shellQuote from 'shell-quote';

import { GetPackageJsons } from './get-package-jsons';
import { readFileString, promiseCb } from './promise-fs-util';

export async function getPackages(
  config: GetPackageJsons.Type
): Promise<string[]> {
  const pkgListFile = path.resolve(
    path.join(config.projectRoot, `package.json.list.${uuid.v4()}`)
  );
  const execCmd = shellQuote.quote([`${config.cmdPwdCmd} ${pkgListFile}`]);
  const cmd = `${config.cmdLernaExec} ${execCmd}`;
  config.io.cmd(cmd);
  await execa.shell(cmd, { cwd: config.projectRoot });
  const ret = (await readFileString(pkgListFile)).content.split(/[\n\r]+/);
  await new Promise((rs, rj) => fs.unlink(pkgListFile, promiseCb(rs, rj)));
  return ret.map(i => path.resolve(i));
}
