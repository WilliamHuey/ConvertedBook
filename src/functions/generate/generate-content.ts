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
  content: Record<any, any>;
}

class GenerateContent {
  constructor(projectName: string) {
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
    Object.assign(this, {
      projectName,
      content: {
        folders: [
          {
            name: "config",
            content: [
              {
                folders: [
                  {
                    name: "latex",
                    content: [
                      {
                        files: [
                          {
                            name: ".gitkeep",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "content",
            content: [
              {
                folders: [
                  {
                    name: "site",
                    content: [
                      {
                        files: [
                          {
                            name: "index.html",
                          },
                        ],
                      },
                    ],
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
            ],
          },
        ],
      },
    });
  }

  static totalStructureCount = (folderStructure: GenerateStructure) => {
    console.log("generate structure", folderStructure);
    const { projectName, content } = folderStructure;
  };

  static generateStructure = (folderStructure: GenerateStructure) => {
    GenerateContent.totalStructureCount(folderStructure);
  };
}

export { GenerateContent };
