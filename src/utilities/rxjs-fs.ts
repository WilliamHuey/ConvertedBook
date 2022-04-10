import { Observable, Subscriber } from 'rxjs';
import { is } from 'ramda';

import * as fs from 'fs';

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

export function readFile(file: RxFsPath, data: string | Buffer, options: fs.WriteFileOptions | null = null): Observable<string> {
  const filePath = toPath(file);
  return new Observable(
    (observer: Subscriber<string>) => {
      fs.readFile(filePath, options,
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

export function writeFile(file: RxFsPath, data: string | NodeJS.ArrayBufferView, options: fs.WriteFileOptions | null = null): Observable<void> {
  const filePath = toPath(file);
  return new Observable(
    (observer: Subscriber<void>) => {
      fs.writeFile(filePath, data, options,
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

export function mkdir(file: RxFsPath, options: fs.WriteFileOptions | null = null): Observable<void> {
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