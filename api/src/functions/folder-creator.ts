import * as fs from 'fs';
import * as mkdirp2 from 'mkdirp';

export interface MkdirP {
  (
    dir: string,
    opts: mkdirp2.Mode | mkdirp2.Options,
    cb: (err: NodeJS.ErrnoException, made: mkdirp2.Made) => void
  ): void;
  sync(dir: string, opts?: mkdirp2.Mode | mkdirp2.OptionsSync): mkdirp2.Made;
}

function Fnmkdirp(
  dir: string,
  opts: mkdirp2.Mode | mkdirp2.Options,
  cb: (err: NodeJS.ErrnoException, made?: mkdirp2.Made) => void
): void {
  if (opts) {
    return mkdirp2(dir, opts, (err, made) => {
      if (err) {
        handleExistingError(err);
        return mkdirp2(dir, opts, cb);
      } else {
        cb(err, made);
      }
    });
  } else {
    return mkdirp2(dir, (err, made) => {
      if (err) {
        handleExistingError(err);
        return mkdirp2(dir, cb);
      } else {
        cb(err, made);
      }
    });
  }
}

function handleExistingError(e: NodeJS.ErrnoException): void {
  if (e.code === 'EEXIST') {
    console.error('path already exists ', e.path);
    const stats = fs.lstatSync(e.path);
    if (stats.isSymbolicLink()) {
      console.warn('assuming link! try to unlink', e.path);
      fs.unlinkSync(e.path);
    } else {
      throw e;
    }
  }
}

Fnmkdirp.sync = function(
  dir: string,
  opts?: mkdirp2.Mode | mkdirp2.OptionsSync
): mkdirp2.Made {
  // console.log('WWWWW');
  try {
    return mkdirp2.sync(dir, opts);
  } catch (e) {
    handleExistingError(e);
    return mkdirp2.sync(dir, opts);
  }
};

export const mkdirp: MkdirP = Fnmkdirp as MkdirP;
