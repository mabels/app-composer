import * as fs from 'fs';
import * as mkdirp2 from 'mkdirp';

function mkdirp(
  dir: string,
  opts: mkdirp2.Mode | mkdirp2.Options,
  cb: (err: NodeJS.ErrnoException, made: mkdirp2.Made) => void): void {
  return mkdirp2(dir, opts, (err) => {
    if (err) {
      handleExistingError(err);
      return mkdirp2(dir, opts, cb);
    }
  });
}

function handleExistingError(e: NodeJS.ErrnoException): void {
  if (e.code === 'EEXIST') {
    const stats = fs.lstatSync(e.path);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(e.path);
    } else {
      throw e;
    }
  }
}

namespace mkdirp {
  export function sync(dir: string, opts?: mkdirp2.Mode | mkdirp2.OptionsSync): mkdirp2.Made {
    try {
      return mkdirp2.sync(dir, opts);
    } catch (e) {
      handleExistingError(e);
      return mkdirp2.sync(dir, opts);
    }
  }
}
export = mkdirp;
