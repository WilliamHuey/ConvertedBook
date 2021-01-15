// Native modules
const path = require("path");

// Third party modules
import { concat, Observable } from "rxjs";
import { writeFile } from "@rxnode/fs";

class ProjectPackageJson {
  constructor(name: string) {
    Object.assign(this, {
      name: name || "<from cli input name>",
      version: "1.0.0",
      description: "",
      main: "index.js",
      author: "",
      license: "ISC",
      dependencies: {
        snowpack: "^2.17.1",
      },
      scripts: {
        start: "snowpack dev",
      },
    });
  }
}

interface GenerateStructure {
  projectName: string;
  parentFolder$: Observable<any>;
  parentFolderPath: string;
  content: Record<any, any>;
}

interface ReadStructure {
  parentFolder$: Observable<any>;
  parentFolderPath: string;
  content: Record<any, any>;
}

interface CountStructure {
  count?: number;
  content: Record<any, any>;
}

interface FileContentProperties {
  name: string;
  fileContent?: string;
}

interface InnerContentProperties {
  name: string;
  content: {
    folders?: Array<InnerContentProperties>;
    files?: Array<FileContentProperties>;
  };
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
    // Create project folder
    /*

    /project-name
        .gitignore
        /config
          /latex
            .gitkeep
        /content
          /site
            index.html
            favicon.ico
            package.json
            snowpack.config.js
    */
    this.content = {
      folders: [
        {
          name: "config",
          content: {
            folders: [
              {
                name: "latex",
                content: {
                  files: [
                    {
                      name: ".gitkeep",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          name: "content",
          content: {
            folders: [
              {
                name: "site",
                content: {
                  files: [
                    {
                      name: "index.html",
                    },
                  ],
                },
              },
            ],
            files: [
              {
                name: "favicon.ico",
              },
              {
                name: "package.json",
                fileContent: JSON.stringify(
                  new ProjectPackageJson(projectName),
                  null,
                  4
                ),
              },
              {
                name: "snowpack.config.js",
              },
            ],
          },
        },
      ],
      files: [
        {
          name: ".gitignore",
        },
      ],
    };
  }

  static readTotalStructureCount = (
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
        structureCount = GenerateContent.readTotalStructureCount({
          content: element.content,
          count: structureCount,
        });
    });

    return structureCount;
  };

  static createStructureObservable = (folderStructure: ReadStructure) => {
    const { content, parentFolder$, parentFolderPath } = folderStructure;
    console.log("folderStructure", folderStructure);
    console.log("content", content);

    content?.files.forEach((element: InnerContentProperties) => {
      console.log("element", element);

      const newFileName = path.join(parentFolderPath, element.name);
      const createFile$ = writeFile(newFileName, "");

      concat(parentFolder$, createFile$).subscribe((data) => {
        console.log("created file becaue parent folder is ready", data);
      });
    });
  };

  static generateStructure = (folderStructure: ReadStructure) => {
    const structureCount = GenerateContent.readTotalStructureCount(
      folderStructure
    );

    GenerateContent.createStructureObservable(folderStructure);
  };
}

export { GenerateContent };
