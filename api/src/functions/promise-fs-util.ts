function promiseCb<T>(
  rs: (val: T) => void,
  rj: (e?: any) => void,
  val: any = () => {}
) {
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

function copyFile(src: string, dst: string): Promise<void> {
  return new Promise((rs, rj) => {
    fs.copyFile(src, dst, promiseCb(rs, rj));
  });
}

function readFileString(fname: string): Promise<FileString> {
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
