export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /plugins
          latex.js
        /content
          /config
            /templates
              default.html5
          /styles
            project.js
            global.js
            vendor.module.css
          /javascript
            helper.ts
          index.tex
        index.html
        package.json
        server.js
        snowpack.config.js
        postcss.config.js
    */
    Object.assign(this, {
      folders: [
        {
          name: 'plugins',
          content: {
            files: [
              {
                name: 'latex.js',
                fileContent: 'latexSnowpackPlugin'
              }
            ]
          }
        },
        {
          name: 'content',
          content: {
            folders: [
              {
                name: 'config',
                content: {
                  folders: [
                    {
                      name: 'templates',
                      content: {
                        files: [
                          {
                            name: 'default.html5',
                            fileContent: 'texHtml5Template'
                          }
                        ],
                      }
                    }
                  ]
                },
              },
              {
                name: 'javascript',
                content: {
                  files: [
                    {
                      name: 'helper.ts',
                      fileContent: 'helperTs'
                    }
                  ]
                }
              },
              {
                name: 'styles',
                content: {
                  files: [
                    {
                      name: 'vendor.module.css',
                      fileContent: 'configStylesIndex'
                    },
                    {
                      name: 'project.js',
                      fileContent: 'projectJs'
                    },
                    {
                      name: 'global.js',
                      fileContent: 'globalJs'
                    }
                  ]
                }
              }
            ],
            files: [
              {
                name: 'index.tex',
                fileContent: 'indexTex',
              },
              {
                name: 'index.html',
                fileContent: 'indexHtml'
              }
            ],
          },
        }
      ],
      files: [
        {
          name: '.gitignore',
          fileContent: 'gitignore',
        },
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
          name: 'snowpack.config.js',
          fileContent: 'snowpack'
        },
        {
          name: 'tsconfig.json',
          fileContent: 'tsconfig'
        },
        {
          name: 'postcss.config.js',
          fileContent: 'postcss'
        },
      ],
    });
  }
}
