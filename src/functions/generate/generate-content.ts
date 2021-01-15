// Native modules
const path = require("path");

// Third party modules
import { concat, Observable } from "rxjs";
import { writeFile, mkdir } from "@rxnode/fs";
import { share } from "rxjs/operators";

// Library modules
import { GenerateStructureOutline } from "./generate-structure";

interface GenerateStructure extends ReadStructure {
  projectName: string;
}

interface ReadStructure {
  parentFolder$: Observable<any>;
  parentFolderPath: string;
  content: ContentProperties;
}

interface CountStructure {
  count?: number;
  content: ContentProperties;
}

interface FileContentProperties {
  name: string;
  fileContent?: string;
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

  constructor(
    public projectName: string,
    public parentFolder$: Observable<any>,
    public parentFolderPath: string
  ) {
    this.content = new GenerateStructureOutline(projectName);
  }

  private readTotalStructureCount = (
    folderStructure: CountStructure
  ): number => {
    const { content, count } = folderStructure;

    // Count the initial folder as one item
    let structureCount = typeof count === "undefined" ? 1 : count;

    structureCount = content?.folders?.length
      ? structureCount + content?.folders.length
      : structureCount;

    structureCount = content?.files?.length
      ? structureCount + content?.files.length
      : structureCount;

    content?.folders?.forEach((element: InnerContentProperties) => {
      if (element.content)
        structureCount = this.readTotalStructureCount({
          content: element.content,
          count: structureCount,
        });
    });

    return structureCount;
  };

  private createStructureObservable = (folderStructure: ReadStructure) => {
    const { content, parentFolder$, parentFolderPath } = folderStructure;

    // Generate the files
    content?.files?.forEach((element: FileContentProperties) => {
      const newFileName = path.join(parentFolderPath, element.name),
        createFile$ = writeFile(newFileName, "").pipe(share());

      concat(parentFolder$, createFile$).subscribe(() => {});
    });

    // Generate the folders
    content?.folders?.forEach((element: InnerContentProperties) => {
      const newFolderName = path.join(parentFolderPath, element.name),
        createFolder$ = mkdir(newFolderName).pipe(share());

      concat(parentFolder$, createFolder$).subscribe(() => {});

      if (element.content)
        this.createStructureObservable({
          parentFolder$: createFolder$,
          parentFolderPath: newFolderName,
          content: element.content,
        });
    });
  };

  public generateStructure = () => {
    const structureCount = this.readTotalStructureCount(this);

    this.createStructureObservable(this);
  };
}

export { GenerateContent };
