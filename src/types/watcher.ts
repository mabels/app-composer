import * as execa from 'execa';
import { WatcherState } from './watcher-state';
import { extractFromCompose } from '../functions/extract-from-compose';
import { PackageJson } from '../types/package-json';
import { writeComposedJs } from '../functions/write-composed-js';
import { lstEqual } from '../functions/lst-equal';

export class Watcher {
  public prevPkgs: string[] = [];
  public started?: execa.ExecaChildProcess;
  public watcherState: WatcherState;
  public watcherSrc: string;
  public readonly watchDir: string;
  public readonly baseDir: string;
  public readonly pkgName: string;

  public constructor(pkgName: string, baseDir: string, watchDir: string) {
    this.pkgName = pkgName;
    this.baseDir = baseDir;
    this.watchDir = watchDir;
    this.watcherState = WatcherState.COULDSTARTED;
    this.dog = this.dog.bind(this);
  }

  private run(fname: string): void {
    const exec = execa('node', [fname]);
    console.log(`starting node ${fname}:${exec.pid}`);
    exec.stdout.pipe(process.stdout);
    exec.stderr.pipe(process.stderr);
    exec.catch(() => {
      console.log(`abort node got killed ${exec.pid}`);
    }).then(() => {
      console.log(`node got killed ${exec.pid} restarting`);
      this.run(fname);
    });
    this.started = exec;
  }

  private restartComposeJs(fname: string): void {
    if (this.started) {
      const started = this.started;
      // started.on('close', () => {
      //   console.log(`got close ${started.pid}`);
      //   this.run(fname);
      // });
      console.log(`doing kill node ${started.pid}`);
      started.kill();
    } else {
      this.run(fname);
    }
  }

  public restartDog(src: string): void {
    if (this.watcherState === WatcherState.RESTART) {
      this.dog(src);
      return;
    }
    this.watcherState = WatcherState.COULDSTARTED;
  }

  public dog(src: string): void {
    console.log(`source: ${src}:${this.watcherState}`);
    if (this.watcherState === WatcherState.RESTART) {
      this.watcherSrc = src;
      return;
    }
    this.watcherState = WatcherState.RESTART;
    extractFromCompose(this.baseDir, this.watchDir, this.prevPkgs).then((pkgs) => {
      // packageJson
      PackageJson.writeDummy(this.pkgName, this.baseDir, pkgs);
      const composeJsFname = writeComposedJs(this.pkgName, this.baseDir, this.watchDir, pkgs);
      console.log(`ComposedFname:${composeJsFname}`);
      // composeJs
      const pkgsNames = pkgs.map((p) => p.package);
      if (!lstEqual(pkgsNames, this.prevPkgs)) {
        this.prevPkgs = pkgsNames;
        console.log(`Yarn Setup needed`);
        const yarnExec = execa('yarn', []);
        yarnExec.stdout.pipe(process.stdout);
        yarnExec.stderr.pipe(process.stderr);
        yarnExec.on('close', () => {
          console.log(`From-Yarn to StartComposedJS`);
          this.restartComposeJs(composeJsFname);
          this.watcherState = WatcherState.COULDSTARTED;
          this.restartDog(this.watcherSrc);
        });
        return;
      } else {
        console.log(`Simple StartComposedJS`);
        this.restartComposeJs(composeJsFname);
        this.watcherState = WatcherState.COULDSTARTED;
        this.restartDog(this.watcherSrc);
      }
    }).catch((e) => {
      console.error(e);
    });
  }

}
