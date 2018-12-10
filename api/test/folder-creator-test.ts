import * as fs from 'fs';

import * as assert from 'assert';
import { mkdirp } from '../src/functions/folder-creator';

import * as mock from 'mock-fs';

// let xxx = 0;
beforeEach(
  (): void => {
    console.log('https://github.com/tschaub/mock-fs/issues/234');
    mock({
      'path/to/file.txt': 'file content here'
    });
  }
);

afterEach(
  (): void => {
    mock.restore();
  }
);

describe('FolderCreation', () => {
  test('should create a new folder', () => {
    const dir = 'test';
    mkdirp.sync(dir);
    assert.doesNotThrow(function(): void {
      mkdirp.sync(dir);
    }, 'Error was thrown on directory creation!');
    assert.equal(fs.existsSync(dir), true, 'file should exist');
    const fileStats: fs.Stats = fs.lstatSync(dir);
    assert.equal(fileStats.isFile(), false, `${dir} unexpectedly is a file`);
    assert.equal(
      fileStats.isSymbolicLink(),
      false,
      `${dir} unexpectedly is a symbolic link`
    );
    assert.equal(
      fileStats.isDirectory(),
      true,
      `${dir} unexpectedly is not a directory`
    );
  });

  test('should do nothing on already existing folder', () => {
    const dir = 'path/to';
    mkdirp.sync(dir);
    assert.doesNotThrow(function(): void {
      mkdirp.sync(dir);
    }, 'Error was thrown on directory creation!');
    assert.equal(fs.existsSync(dir), true, 'file should exist');
    const fileStats: fs.Stats = fs.lstatSync(dir);
    assert.equal(fileStats.isFile(), false, `${dir} unexpectedly is a file`);
    assert.equal(
      fileStats.isSymbolicLink(),
      false,
      `${dir} unexpectedly is a symbolic link`
    );
    assert.equal(
      fileStats.isDirectory(),
      true,
      `${dir} unexpectedly is not a directory`
    );
  });

  test('should throw an exception if a file with the name of the folder already exists', () => {
    mock({
      file: 'file content here'
    });
    const file = 'file';
    assert.throws(function(): void {
      mkdirp.sync(file);
    }, 'No error was thrown on directory creation!');
    assert.equal(fs.existsSync(file), true, `${file} should exist`);
    const fileStats: fs.Stats = fs.lstatSync(file);
    assert.equal(fileStats.isFile(), true, `${file} should be of type file`);
    assert.equal(
      fileStats.isSymbolicLink(),
      false,
      `${file} unexpectedly is a symbolic link`
    );
    assert.equal(
      fileStats.isDirectory(),
      false,
      `${file} unexpectedly ia a directory`
    );
  });

  test('should synchronously remove a symlink with identical name and create a folder', () => {
    // console.log('xxx1', mkdirp);
    mock({
      dir: {
        file: 'file contents',
        symlink: mock.symlink({
          path: 'file'
        })
      }
    });
    // console.log('xxx2', mkdirp);
    const directory = 'dir/symlink';
    const initialStats: fs.Stats = fs.lstatSync(directory);
    // console.log('xxx3', mkdirp);
    assert.equal(
      initialStats.isSymbolicLink(),
      true,
      `initially ${directory} should be a symlink`
    );
    // console.log('xxx4', mkdirp);
    assert.doesNotThrow(function(): void {
      mkdirp.sync(directory);
    }, 'Error was thrown on directory creation!');
    assert.equal(fs.existsSync(directory), true, `${directory} should exist`);
    const fileStats: fs.Stats = fs.lstatSync(directory);
    assert.equal(
      fileStats.isFile(),
      false,
      `${directory} unexpectedly is a file`
    );
    assert.equal(
      fileStats.isSymbolicLink(),
      false,
      `${directory} unexpectedly is a symbolic link`
    );
    assert.equal(
      fileStats.isDirectory(),
      true,
      `${directory} unexpectedly is not a directory`
    );
    mock.restore();
  });

  test('should asynchronously remove a symlink with identical name and create a folder', async () => {
    // console.log('xxxx', mkdirp);
    mock({
      dir: {
        file: 'file contents',
        symlink: mock.symlink({
          path: 'file'
        })
      }
    });
    const directory = 'dir/symlink';
    const initialStats: fs.Stats = fs.lstatSync(directory);
    assert.equal(
      initialStats.isSymbolicLink(),
      true,
      `initially ${directory} should be a symlink`
    );

    return new Promise((rs, rj) => {
      mkdirp(directory, undefined, err => {
        try {
          if (err) {
            assert.fail('mkdrip not allowed to fail');
            return;
          }
          assert.equal(
            fs.existsSync(directory),
            true,
            `${directory} should exist`
          );
          const fileStats: fs.Stats = fs.lstatSync(directory);
          assert.equal(
            fileStats.isFile(),
            false,
            `${directory} unexpectedly is a file`
          );
          assert.equal(
            fileStats.isSymbolicLink(),
            false,
            `${directory} unexpectedly is a symbolic link`
          );
          assert.equal(
            fileStats.isDirectory(),
            true,
            `${directory} unexpectedly is not a directory`
          );
          rs();
        } catch (e) {
          rj(e);
        }
      });
    });
  });
});
