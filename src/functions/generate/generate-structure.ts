export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        /build
        /src
          /config
            /templates
              default.html5
          /styles
            global.js
            project.js
          helper.ts
          index.tex
        .gitignore
        package.json
        server.js
        tsconfig.json
        vite.config.js
    */
    Object.assign(this, {
      files: [
        {
          name: 'package.json',
          fileContent: 'packageJson',
          data: { projectName }
        },
        {
          name: 'server.js',
          fileContent: 'server'
        },
        {
          name: 'vite.config.js',
          fileContent: 'viteConfig'
        },
        {
          name: 'tsconfig.json',
          fileContent: 'tsConfig'
        }
      ],
      folders: [
        {
          name: 'build'
        },
        {
          name: 'src',
          content: {
            files: [
              {
                name: 'helper.ts',
                fileContent: 'helperTs'
              },
              {
                name: 'index.tex',
                fileContent: 'indexTex'
              }
            ],
            folders: [
              {
                name: 'config',
                content: {
                  folders: [
                    {
                      name: 'templates',
                      content: {
                        files: [{
                          name: 'default.html5',
                          fileContent: 'texHtml5Template'
                        }]
                      }
                    }
                  ]
                }
              },
              {
                name: 'styles',
                content: {
                  files: [
                    {
                      name: 'vendor.css',
                      fileContent: 'configStylesIndex'
                    },
                    {
                      name: 'global.js',
                      fileContent: 'globalJs'
                    },
                    {
                      name: 'project.js',
                      fileContent: 'projectJs'
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    });
  }
}