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

export class GenerateStructureOutline {
  constructor(projectName: string) {
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
    });
  }
}
