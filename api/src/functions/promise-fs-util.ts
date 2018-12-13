import * as fs from 'fs';
import { FileString } from '@app-composer/types';

export function promiseCb<T>(
  rs: (val: T) => void,
  rj: (e?: any) => void,
  val: any = () => ({})
): (err: any, data?: any) => void {
  return (err: any, data?: any) => {
    if (err) {
      // tslint:disable-next-line:no-console
      console.error(err);
      rj(err);
    } else {
      rs(val(data));
    }
  };
}

export function copyFile(src: string, dst: string): Promise<void> {
  return new Promise((rs, rj) => {
    fs.copyFile(src, dst, promiseCb(rs, rj));
  });
}

export function readFileString(fname: string): Promise<FileString> {
  return new Promise<FileString>((rs, rj) => {
    fs.readFile(
      fname,
      promiseCb(
        rs,
        rj,
        (data: any): FileString => ({
          fname,
          content: data.toString()
        })
      )
    );
  });
}
