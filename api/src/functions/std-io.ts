import { Io } from '@app-composer/types';

export class StdIo implements Io {
  public static create(): Io {
    return new StdIo();
  }
  private constructor() {}
  public out(s: string): void {
    // tslint:disable-next-line:no-console
    console.log(s);
  }
  public err(s: string): void {
    // tslint:disable-next-line:no-console
    console.error(s);
  }
}
