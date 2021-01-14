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
  parentFolderPath: string;
  content: Record<any, any>;
}

interface ReadStructure {
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

  constructor(public projectName: string, public parentFolderPath: string) {
    this.projectName = projectName;

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

  static readTotalStructureCount = (folderStructure: ReadStructure): number => {
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

  static generateStructure = (folderStructure: ReadStructure) => {
    const structureCount = GenerateContent.readTotalStructureCount(
      folderStructure
    );
  };
}

export { GenerateContent };
