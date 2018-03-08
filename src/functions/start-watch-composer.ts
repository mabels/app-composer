import * as path from 'path';
import * as fs from 'fs';
import * as execa from 'execa';
import * as uuid from 'uuid';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as chokidar from 'chokidar';
import { Names } from '../types/names';
import { Watcher } from '../types/watcher';

// tslint:disable-next-line: no-var-requires no-require-imports
const globby = require('globby');

export function startWatchComposer(baseDir: string = __dirname): void {
  const watchDir = path.join(baseDir, 'compose');
  const watcher = new Watcher(path.basename(baseDir), baseDir, watchDir);
  console.log(`composer starts in ${baseDir} watches: ${watchDir}`);
  const choki = chokidar.watch(watchDir, {
    ignoreInitial: true
  });
  choki.on('all', () => watcher.dog('watch'));
  choki.on('ready', () => watcher.dog('ready'));
}
