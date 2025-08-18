// Native modules
import * as fs from 'fs';

// Third party modules
import { Observable, Subscriber } from 'rxjs';
import { is } from 'ramda';

// Adapted from @philhosoft/rx-node-fs
interface RxFsFile {
  name: string;
  fullPath: string;
  content?: string;
  stat?: fs.Stats;
}

type RxFsPath = RxFsFile | string;

function toPath(file: RxFsPath): string {
  return is(String, file) ? file : file.fullPath;
}

export function readFile(file: RxFsPath, options: any): Observable<string> {
  const filePath = toPath(file);

  return new Observable(
    (observer: Subscriber<string>) => {
      fs.readFile(filePath,
        options,
        (error: NodeJS.ErrnoException | null, data: any) => {

          if (error) {
            observer.error(error);
            return;
          }

          observer.next(data);
          observer.complete();
        },
      );
    },
  );
}

export function writeFile(file: RxFsPath, data: string | NodeJS.ArrayBufferView, _options: fs.WriteFileOptions | null = null): Observable<void> {
  const filePath = toPath(file);
  return new Observable(
    (observer: Subscriber<void>) => {
      fs.writeFile(filePath, data,
        (error: NodeJS.ErrnoException | null) => {

          if (error) {
            observer.error(error);
            return;
          }

          observer.next(undefined);
          observer.complete();
        },
      );
    },
  );
}

export function stat(file: RxFsPath): Observable<fs.Stats> {
  const filePath = toPath(file);
  return new Observable(
    (observer: Subscriber<fs.Stats>) => {
      fs.stat(filePath, (error: NodeJS.ErrnoException | null, stats: fs.Stats) => {

          if (error) {
            observer.error(error);
            return;
          }

          observer.next(stats);
          observer.complete();
        },
      );
    },
  );
}



export function deleteFile(file: RxFsPath) {
  const filePath = toPath(file);
  return new Observable(
    (observer) => {
      fs.rm(filePath,
        (error) => {

          if (error) {
            observer.error(error);
            return;
          }

          observer.next(undefined);
          observer.complete();
        },
      );
    },
  );
}

export function copyFile(file: RxFsPath, dest: string | fs.PathLike, options?: number): Observable<void> {
  const filePath = toPath(file);
  return new Observable(
    (observer: Subscriber<void>) => {
      fs.copyFile(filePath, dest,
        (error: NodeJS.ErrnoException | null) => {

          if (error) {
            observer.error(error);
            return;
          }

          observer.next(undefined);
          observer.complete();
        },
      );
    },
  );
}

export function mkdir(file: RxFsPath, options: fs.WriteFileOptions | null = {}): Observable<void> {
  const filePath = toPath(file);

  return new Observable(
    (observer: Subscriber<void>) => {
      fs.mkdir(filePath, options,
        (error: NodeJS.ErrnoException | null) => {

          if (error) {
            observer.error(error);
            return;
          }

          observer.next(undefined);
          observer.complete();
        },
      );
    },
  );
}