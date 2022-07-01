// Native modules
import * as path from 'path';

// Third party modules
import { concat, Observable, BehaviorSubject, of } from 'rxjs';
import { share, scan, takeLast, skipWhile, mergeMap, map, filter } from 'rxjs/operators';
import { mkdir, writeFile } from '@utilities/rxjs-fs';
import { match, __ } from 'ts-pattern';

// Library modules
import { GenerateStructureOutline } from './generate-structure';
import { fileContentObservable } from './generate-file-content-map';

interface GenerateStructure extends ReadStructure {
  projectName: string;
}

interface ReadStructure {
  parentFolder$: Observable<void>;
  parentFolderPath: string;
  content: ContentProperties;
  structureCreationCountSubject: BehaviorSubject<number>;
}

interface CountStructure {
  count?: number;
  content: ContentProperties;
}

interface FileContentProperties {
  name: string;
  fileContent?: string;
  data?: any;
}

interface InnerContentProperties {
  name: string;
  content: ContentProperties;
}

interface ContentProperties {
  folders?: Array<InnerContentProperties>;
  files?: Array<FileContentProperties>;
}

class GenerateContent implements GenerateStructure {
  content: ContentProperties;

  structureCreationCountSubject: BehaviorSubject<number>;

  fullProjectFolderExists$: Observable<boolean> = of(false)

  constructor(
    public projectName: string,
    public parentFolder$: Observable<void>,
    public parentFolderPath: string,
  ) {
    this.content = new GenerateStructureOutline(projectName);

    // Start at 1 because the project folder has already been created
    this.structureCreationCountSubject = new BehaviorSubject(1);
  }

  private readTotalStructureCount = (
    folderStructure: CountStructure
  ): number => {
    const { content, count } = folderStructure;

    // Count the initial folder as one item
    let structureCount = typeof count === 'undefined' ? 1 : count;

    structureCount = content?.folders?.length ?
      structureCount + content?.folders.length :
      structureCount;

    structureCount = content?.files?.length ?
      structureCount + content?.files.length :
      structureCount;

    content?.folders?.forEach((element: InnerContentProperties) => {
      if (element.content)
        structureCount = this.readTotalStructureCount({
          content: element.content,
          count: structureCount,
        });
    });

    return structureCount;
  };

  private fileContentType = (fileContent: string | undefined) => {
    return match(fileContent)
      .with(undefined, () => {
        return '';
      })
      .with(__.string, () => {
        return fileContent as string;
      })
      .run();
  }

  private createStructureObservable = (folderStructure: ReadStructure) => {
    const { content, parentFolder$, parentFolderPath } = folderStructure;

    // Generate the folders
    content?.folders?.forEach((element: InnerContentProperties) => {
      const newFolderName = path.join(parentFolderPath, element.name);
      const createFolder$ = mkdir(newFolderName)
        .pipe(takeLast(1), share());

      const countStructureNonExistFolders$ = concat(parentFolder$, createFolder$);

      createFolder$
        .subscribe({
          error: (e) => {
            console.log("Error", e);
          }
        });

      countStructureNonExistFolders$
        .subscribe({
          next: () => {
            folderStructure.structureCreationCountSubject.next(1);
            if (element.content)
              this.createStructureObservable({
                parentFolder$: createFolder$,
                parentFolderPath: newFolderName,
                content: element.content,
                structureCreationCountSubject:
                  folderStructure.structureCreationCountSubject,
              });
          },
          error: (_err) => {
            // Ignore the error
          }
        });
    });

    // Generate the files
    content?.files?.forEach((element: FileContentProperties) => {
      const fileContent = element.fileContent ? element.fileContent : '',
        newFileName = path.join(parentFolderPath, element.name),
        fileNameKey = this.fileContentType(fileContent),
        fileContent$ = fileContentObservable(fileNameKey, element.data);

      const createFile$ = fileContent$
        .pipe(
          map(fileContent => {
            return fileContent;
          }),
          mergeMap((fileContent) => {
            return writeFile(newFileName, fileContent);
          }));

      concat(parentFolder$, createFile$)
        .pipe(takeLast(1))
        .subscribe(() => {
          folderStructure.structureCreationCountSubject.next(1);
        });
    });
  };

  public generateStructure = (fullProjectFolderExists$: Observable<boolean>): {
    structureCreationCount$: Observable<number>;
  } => {
    const structureCount = this.readTotalStructureCount(this);

    // Turn on the '--force' flag when present
    this.fullProjectFolderExists$ = fullProjectFolderExists$;

    // Start reading the structure and generate the folders
    // and files inside the main project folder
    this.createStructureObservable(this);

    // Keep a running count of the folder and files created
    // until it reaches to the total count of the folder and files
    // as to indicate later on the whole project generation completion
    const structureCreationCount$ = this.structureCreationCountSubject
      .asObservable()
      .pipe(
        scan((acc, curr: number) => acc + curr, 0),
        skipWhile(structureCreationCount => {
          return structureCreationCount !== structureCount;
        })
      );

    return {
      structureCreationCount$,
    };
  };
}

export { GenerateContent };
