import * as path from 'path';
import * as crypto from 'crypto';

import * as execa from 'execa';
import * as uuid from 'uuid';

import * as shell from 'shelljs';

import { Io } from '@app-composer/types';
import { ProjectRoot } from './project-root';
import { PackageLock } from './package-lock';
import { readFileString } from './promise-fs-util';

export interface PublishConfig extends ProjectRoot, PackageLock {
  readonly io: Io;
  readonly gitUrl: string;
  readonly printVersion: boolean;
}

export async function version(config: PublishConfig): Promise<string> {
  const shasum = crypto.createHash('sha1');
  const files = await Promise.all(
    ['package.json', config.packageLock].map(fname => readFileString(fname))
  );
  files.forEach(f => {
    shasum.update(f.content);
  });
  return shasum.digest('base64');
}

export async function publishAction(config: PublishConfig): Promise<void> {
  const ver = `V-${await version(config)}`;
  if (config.printVersion) {
    config.io.out(ver);
    return;
  }
  const transaction = path.join(config.projectRoot, uuid.v4());
  const gitClone = `git clone ${config.gitUrl} ${transaction}`;
  config.io.cmd(`${gitClone}`);
  await execa.shell(gitClone);
  shell.mv(path.join(transaction, '.git'), config.projectRoot);
  shell.rm('-rf', transaction);

  const gitCheckout = `git checkout ${ver}`;
  config.io.cmd(gitCheckout);
  try {
    await execa.shell(gitCheckout, { cwd: config.projectRoot });
    config.io.out(`version ${ver} exists`);
    return;
  } catch (e) {
    /* */
  }

  const gitAdd = `git add .`;
  config.io.cmd(gitAdd);
  await execa.shell(gitAdd, { cwd: config.projectRoot });

  const gitCommit = `git commit -a -m '${ver}'`;
  config.io.cmd(gitCommit);
  await execa.shell(gitCommit, { cwd: config.projectRoot });

  const gitTag = `git tag '${ver}'`;
  config.io.cmd(gitTag);
  await execa.shell(gitTag, { cwd: config.projectRoot });

  const gitPush = `git push --follow-tags`;
  config.io.cmd(gitPush);
  const o = await execa.shell(gitPush, { cwd: config.projectRoot });
  config.io.out(o.stdout);
  config.io.err(o.stderr);

  return;
}
